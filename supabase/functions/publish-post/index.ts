// Supabase Edge Function: publish-post
// Publishes a post to Facebook and/or Instagram using stored access tokens.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return new Response("Unauthorized: missing auth header", { status: 401, headers: CORS })

  const token = authHeader.replace(/^Bearer\s+/i, "")
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData.user) {
    return new Response(`Unauthorized: ${userErr?.message || "no user"}`, { status: 401, headers: CORS })
  }

  const { postId } = await req.json()

  const { data: post } = await admin.from("posts").select("*").eq("id", postId).single()
  if (!post || post.user_id !== userData.user.id) {
    return new Response("Not found", { status: 404, headers: CORS })
  }

  const { data: connections } = await admin
    .from("social_connections")
    .select("*")
    .eq("user_id", userData.user.id)
    .in("platform", post.platforms)

  await admin.from("posts").update({ status: "publishing" }).eq("id", postId)

  const platformPostIds: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const conn of connections || []) {
    try {
      if (conn.platform === "facebook") {
        const message = post.content + (post.hashtags ? "\n\n" + post.hashtags : "")
        const mediaUrls: string[] = post.media_urls || []

        if (mediaUrls.length === 0) {
          // Text only
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${conn.page_id}/feed`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message, access_token: conn.access_token }),
            }
          )
          const json = await res.json()
          if (json.id) platformPostIds.facebook = json.id
          else errors.facebook = json.error?.message || "Unknown error"
        } else if (mediaUrls.length === 1) {
          // Single photo
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${conn.page_id}/photos`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: mediaUrls[0],
                caption: message,
                access_token: conn.access_token,
              }),
            }
          )
          const json = await res.json()
          if (json.id || json.post_id) platformPostIds.facebook = json.post_id || json.id
          else errors.facebook = json.error?.message || "Photo upload failed"
        } else {
          // Multiple photos: upload each unpublished, then attach to a feed post
          const attachedIds: string[] = []
          for (const url of mediaUrls) {
            const upRes = await fetch(
              `https://graph.facebook.com/v19.0/${conn.page_id}/photos`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  url,
                  published: false,
                  access_token: conn.access_token,
                }),
              }
            )
            const upJson = await upRes.json()
            if (upJson.id) attachedIds.push(upJson.id)
          }
          const feedRes = await fetch(
            `https://graph.facebook.com/v19.0/${conn.page_id}/feed`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message,
                attached_media: attachedIds.map((id) => ({ media_fbid: id })),
                access_token: conn.access_token,
              }),
            }
          )
          const feedJson = await feedRes.json()
          if (feedJson.id) platformPostIds.facebook = feedJson.id
          else errors.facebook = feedJson.error?.message || "Multi-photo post failed"
        }
      }

      if (conn.platform === "instagram") {
        if (!post.media_urls || post.media_urls.length === 0) {
          errors.instagram = "Instagram posts require at least one image or video"
          continue
        }
        const createRes = await fetch(
          `https://graph.facebook.com/v19.0/${conn.platform_user_id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: post.media_urls[0],
              caption: post.content + (post.hashtags ? "\n\n" + post.hashtags : ""),
              access_token: conn.access_token,
            }),
          }
        )
        const createJson = await createRes.json()
        if (!createJson.id) {
          errors.instagram = createJson.error?.message || "Container creation failed"
          continue
        }
        const publishRes = await fetch(
          `https://graph.facebook.com/v19.0/${conn.platform_user_id}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: createJson.id,
              access_token: conn.access_token,
            }),
          }
        )
        const publishJson = await publishRes.json()
        if (publishJson.id) platformPostIds.instagram = publishJson.id
        else errors.instagram = publishJson.error?.message || "Publish failed"
      }
    } catch (e) {
      errors[conn.platform] = (e as Error).message
    }
  }

  const hasSuccess = Object.keys(platformPostIds).length > 0
  await admin
    .from("posts")
    .update({
      status: hasSuccess ? "published" : "failed",
      published_at: hasSuccess ? new Date().toISOString() : null,
      platform_post_ids: platformPostIds,
      error_message: Object.keys(errors).length ? JSON.stringify(errors) : null,
    })
    .eq("id", postId)

  return new Response(JSON.stringify({ platformPostIds, errors }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  })
})
