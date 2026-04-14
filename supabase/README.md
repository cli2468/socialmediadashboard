# Supabase Setup Guide

This walks through everything you need to connect Facebook + Instagram accounts
and start testing with your alt account.

---

## Part 1 — Create the Supabase Project (5 min)

1. Go to https://supabase.com and create a new project (free tier is fine)
2. In the project dashboard, go to **Settings → API** and copy:
   - `Project URL` → this is `VITE_SUPABASE_URL`
   - `anon public` key → this is `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → keep this secret, you'll add it to edge functions later
3. In the project root, copy `.env.example` → `.env` and paste in the two public values

---

## Part 2 — Run the Database Migration (2 min)

1. In the Supabase dashboard, open the **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Click **New query** again, paste `supabase/migrations/002_storage.sql`, click **Run**
   (this creates a public storage bucket `post-media` for uploaded images/videos)

You should see tables `profiles`, `social_connections`, and `posts` under **Table Editor**,
and a bucket `post-media` under **Storage**.

> **Optional but recommended**: in **Authentication → Providers → Email**, disable
> "Confirm email" during local testing so you can sign up without verifying emails.
> Re-enable before going to production.

At this point you can run `npm run dev`, sign up, and log in. Social connections
won't work yet — that's Part 3.

---

## Part 3 — Create a Facebook Developer App (15 min)

This is the longest step but it's a one-time thing.

### 3a — Create the app

1. Go to https://developers.facebook.com/apps
2. Click **Create App**
3. Use case: **Other → Business**
4. App name: anything (e.g., "SocialHub Dev")
5. You'll land on your app's dashboard

### 3b — Add products

In the left sidebar, add these products (click **Set up** on each):
- **Facebook Login for Business**
- **Instagram Graph API** (optional — only needed if you also want Instagram)

### 3c — Get your credentials

1. **Settings → Basic** → copy **App ID** → paste into `.env` as `VITE_FACEBOOK_APP_ID`
2. Copy **App Secret** (click "Show") — you'll paste this into Supabase in Part 4

### 3d — Configure OAuth redirect URI

1. Go to **Facebook Login for Business → Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://YOUR-PROJECT-REF.supabase.co/functions/v1/facebook-oauth-callback
   ```
   (replace `YOUR-PROJECT-REF` with your actual Supabase project ref)
3. Save changes

### 3e — Add your alt account as a tester

This is the key step for private testing. Your app starts in **Development Mode**
— only people with roles on the app can use it.

1. Go to **App Roles → Roles** (left sidebar)
2. Click **Add People**
3. Select **Tester**
4. Enter your alt account's Facebook email or username
5. Log into that alt account on Facebook and accept the invite (check notifications)

That alt account can now go through the OAuth flow. Everyone else gets blocked
until you submit the app for review.

### 3f — (Optional) For Instagram

Your alt account's Instagram must be:
1. A **Business** or **Creator** account (switch in Instagram app settings)
2. Connected to a Facebook Page that the alt account manages

The OAuth flow auto-detects the IG account linked to the Page and stores both connections.

---

## Part 4 — Deploy the Edge Function (10 min)

### 4a — Install the Supabase CLI

```bash
npm install -g supabase
```

Then log in:
```bash
supabase login
```

### 4b — Link your project

From the project root:
```bash
supabase link --project-ref YOUR-PROJECT-REF
```

### 4c — Set the function secrets

These are the env vars the edge function needs at runtime. Set them in the Supabase
dashboard under **Edge Functions → Manage Secrets**, OR via CLI:

```bash
supabase secrets set FACEBOOK_APP_ID=your-app-id
supabase secrets set FACEBOOK_APP_SECRET=your-app-secret
```

Note: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically — you don't need to set those.

### 4d — Deploy

```bash
supabase functions deploy facebook-oauth-callback --no-verify-jwt
supabase functions deploy publish-post
```

`--no-verify-jwt` is needed on the OAuth callback because Facebook redirects to
it without a user JWT. `publish-post` does verify the JWT because the user is
calling it from the app.

---

## Part 5 — Test It (2 min)

1. Run the app: `npm run dev`
2. Sign up with your own email, or log in
3. Go to **Settings → Connected Accounts**
4. Click **Connect** on Facebook
5. You'll be redirected to Facebook → log in with your **alt account** (the tester)
6. Approve the permissions
7. You'll land back on the Settings page with a success banner
8. The Facebook row should show "Connected as @YourPageName"
9. If your alt IG was linked, Instagram will also show as connected

---

## Testing Posts

Once connected, go to **Compose**:
- Write a test post
- Select Facebook (and/or Instagram — Instagram requires at least one image)
- Click **Publish Now**

The frontend calls the `publish-post` edge function, which uses the stored tokens
to post on your behalf. Check your alt account's Facebook Page — the post should
appear.

> **Note**: while in Development Mode, only testers can see the posts if you're
> using `pages_manage_posts` with a restricted audience. For a page you own, posts
> are public. Just post to a page you don't mind seeing test content on.

---

## Common Issues

**"URL Blocked: This redirect failed because the redirect URI is not whitelisted"**
→ Step 3d: make sure the exact Supabase function URL is in the Valid OAuth Redirect URIs list.

**Function returns 401 or 500**
→ Check function logs: `supabase functions logs facebook-oauth-callback`. Usually the App Secret is missing or wrong.

**"Instagram posts require at least one image or video"**
→ IG doesn't allow text-only posts via the API. Add an image in Compose.

**Token expired**
→ Page access tokens don't expire, but user tokens do (60 days for long-lived). If a user
reconnects, the upsert replaces the old row.

---

## Going to Production (later)

When you're ready for real users beyond your testers:
1. Switch app to **Live** mode in the Facebook dashboard
2. Submit for **App Review** for each permission you use (takes ~1-2 weeks)
3. Required permissions:
   - `pages_manage_posts` — to publish
   - `pages_read_engagement` — to read analytics
   - `instagram_content_publish` — if using IG
   - `instagram_basic` — if using IG
4. Add a Privacy Policy URL and Terms of Service URL to your app settings
5. Complete the Business Verification process (Facebook will ask for business docs)
