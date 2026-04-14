// Supabase Edge Function: facebook-oauth-callback
// Handles the OAuth redirect from Facebook. Exchanges the auth code for a long-lived
// access token, then fetches the user's Facebook Pages + connected Instagram accounts
// and stores them in the social_connections table.
//
// Deploy with:
//   supabase functions deploy facebook-oauth-callback --no-verify-jwt
//
// Env vars to set in Supabase dashboard (Functions → Secrets):
//   FACEBOOK_APP_ID
//   FACEBOOK_APP_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const FB_APP_ID = Deno.env.get("FACEBOOK_APP_ID")!
const FB_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const stateParam = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error || !code || !stateParam) {
    return redirectWithError("Authorization failed or cancelled")
  }

  let userId: string
  let returnTo: string
  try {
    const state = JSON.parse(atob(stateParam))
    userId = state.userId
    returnTo = state.returnTo
  } catch {
    return redirectWithError("Invalid state")
  }

  try {
    // Step 1: Exchange code for short-lived user token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        })
    )
    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token) throw new Error(tokenJson.error?.message || "No token")

    // Step 2: Exchange for long-lived user token (60 days)
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: tokenJson.access_token,
        })
    )
    const longLivedJson = await longLivedRes.json()
    const userToken: string = longLivedJson.access_token
    const expiresIn: number = longLivedJson.expires_in || 5184000

    // Step 3: Get the user profile
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${userToken}`
    )
    const me = await meRes.json()

    // Step 4: Get the user's Pages (with page-specific tokens, which don't expire)
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${userToken}`
    )
    const pagesJson = await pagesRes.json()
    const pages = pagesJson.data || []

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    if (pages.length === 0) {
      throw new Error(
        "No Facebook Pages found on this account. Create a Page at facebook.com/pages/create, then reconnect."
      )
    }

    const page = pages[0]

    const fbInsert = await supabase.from("social_connections").upsert(
      {
        user_id: userId,
        platform: "facebook",
        platform_user_id: me.id,
        platform_username: page.name,
        page_id: page.id,
        access_token: page.access_token,
        token_expires_at: null,
        scopes: ["pages_manage_posts", "pages_read_engagement"],
      },
      { onConflict: "user_id,platform" }
    )
    if (fbInsert.error) throw new Error(`DB insert failed (facebook): ${fbInsert.error.message}`)

    if (page.instagram_business_account) {
      const igInsert = await supabase.from("social_connections").upsert(
        {
          user_id: userId,
          platform: "instagram",
          platform_user_id: page.instagram_business_account.id,
          platform_username: page.instagram_business_account.username,
          page_id: page.id,
          access_token: page.access_token,
          token_expires_at: null,
          scopes: ["instagram_basic", "instagram_content_publish"],
        },
        { onConflict: "user_id,platform" }
      )
      if (igInsert.error) console.error("IG insert failed:", igInsert.error.message)
    }

    return Response.redirect(`${returnTo}?connected=facebook`, 302)
  } catch (e) {
    console.error(e)
    return redirectWithError(
      (e as Error).message || "OAuth exchange failed",
      returnTo
    )
  }
})

function redirectWithError(msg: string, returnTo?: string) {
  const base = returnTo || "/"
  return Response.redirect(`${base}?error=${encodeURIComponent(msg)}`, 302)
}
