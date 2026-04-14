# Progress Log

Updated by the AI before every break or session end.
Do not edit manually.

## Status: Supabase-ready

### 2026-04-12 — Project Init
- Installed deps: react-router-dom, recharts, date-fns, @supabase/supabase-js
- Set up dark dashboard theme with Inter font
- Created layout shell: Sidebar, Header, Layout wrapper
- Created 5 pages: Dashboard, Compose, Analytics, Trend Analyzer, Settings
- Build succeeds, no errors

### 2026-04-12 — Supabase Integration
- Added Supabase client (`src/lib/supabase.js`) with env config
- Added AuthProvider + useAuth context, wraps app in main.jsx
- Added ProtectedRoute guard — falls back to mock data if Supabase not configured
- Added Login page (email/password signup + signin)
- Added `useSocialConnections` hook + `initiateFacebookOAuth` helper
- Wired Settings page to real connection state (reads from social_connections, triggers FB OAuth, disconnect works)
- Updated Sidebar to show real user name + working sign out
- Created SQL migration: profiles, social_connections, posts tables with RLS policies and auth triggers
- Created Deno edge function `facebook-oauth-callback`:
  - Exchanges code for long-lived user token
  - Fetches user's FB Pages + linked IG Business accounts
  - Stores connection with page-level access token (non-expiring)
- Created Deno edge function `publish-post`:
  - Verifies JWT from frontend
  - Publishes to FB via /page_id/feed endpoint
  - Publishes to IG via 2-step container + media_publish flow
  - Updates posts table with platform_post_ids and status
- Wrote full setup guide at `supabase/README.md` covering:
  - Supabase project creation + env vars
  - Running the SQL migration
  - Creating a Facebook developer app
  - Adding alt account as Tester (for private testing in Dev Mode)
  - Deploying edge functions via CLI
  - Common issues + going to production checklist

### Files added
- `.env.example`
- `src/lib/supabase.js`
- `src/contexts/AuthContext.jsx`
- `src/components/auth/ProtectedRoute.jsx`
- `src/pages/Login.jsx`
- `src/hooks/useSocialConnections.js`
- `supabase/README.md`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/functions/facebook-oauth-callback/index.ts`
- `supabase/functions/publish-post/index.ts`

### 2026-04-14 — First End-to-End Facebook Post
- Ran SQL migrations in Supabase: profiles, social_connections, posts tables + post-media storage bucket
- Deployed `facebook-oauth-callback` edge function (Verify JWT **off** — FB redirects without a JWT)
- Deployed `publish-post` edge function (Verify JWT **off** — project uses new ES256 key format; runtime verifier rejects, so auth is checked in-code via `admin.auth.getUser(token)`)
- Added storage migration `002_storage.sql` (public `post-media` bucket, per-user RLS)
- Connected real Facebook Page via OAuth → stored Page access token (non-expiring)
- Published first real text post to Facebook from Compose page ✅

### Bug fixes
- **OAuth callback silently swallowed DB errors** → rewrote to check `.error` on every upsert and throw explicitly with the Supabase error message
- **"Failed to send a request to the Edge Function"** → missing CORS. Added OPTIONS handler + `Access-Control-Allow-*` headers to every response in `publish-post`
- **401 from publish-post even with valid JWT** → new-format projects use ES256 JWTs; edge runtime's built-in Verify JWT rejects them. Fix: disable Verify JWT on the function, use `admin.auth.getUser(token)` in code instead of an anon-key client
- **"Table not found: public.social_connections"** → SQL migration had never been run; ran it in SQL Editor

### Files updated
- `supabase/functions/publish-post/index.ts` — CORS handling, JWT verified via admin client, Facebook image posting (single photo → `/photos`, multi-photo → unpublished uploads + `attached_media`)
- `supabase/functions/facebook-oauth-callback/index.ts` — explicit error surfacing on DB upsert failures
- `supabase/migrations/002_storage.sql` — added

### 2026-04-14 — Trend Analyzer: Gemini integration (paste-URL MVP)
- Replaced the mock Vision/topic-search flow with a real Gemini-powered pipeline
- New FastAPI backend at `backend/trend-analyzer/`:
  - `POST /analyze` downloads the video with yt-dlp, scrapes top comments, uploads to Gemini via `google-genai` File API, returns a structured content brief (summary, hook, format, audio, why_it_works, how_to_recreate, what_you_need, caption_tips, comment_analysis)
  - CORS-enabled, reads `GEMINI_API_KEY` from env, defaults to `gemini-2.5-flash`
  - Uses `tempfile.TemporaryDirectory` so downloaded videos are auto-cleaned
- New Supabase migration `003_trend_briefs.sql`: stores brief JSON + video metadata per user with RLS
- New hook `src/hooks/useTrendAnalyzer.js`: calls backend, persists result to `trend_briefs`, exposes history + delete
- Rewrote `src/pages/TrendAnalyzer.jsx`: paste-URL form, live loading state, brief view (platform badge, thumbnail, metadata, summary, hook/format/audio cards, why-it-works, how-to-recreate steps, caption tips, viewer insights), history grid with delete
- Added `VITE_TREND_ANALYZER_URL` to `.env` (defaults to `http://localhost:8000`)

### Important clarification (Vision vs. Gemini)
- `claude.md` and earlier docs referred to "Google Cloud Vision" — that API only returns structured image data (labels, OCR, dominant colors). It cannot write prose like "open with a relatable hook". The real integration uses **Gemini 2.5 Flash**, which accepts video files natively and writes the strategic brief in one call. Vision was a misdirection; Gemini is the correct tool.

### To run the backend locally
```
cd backend/trend-analyzer
cp .env.example .env   # paste GEMINI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### To deploy the backend (Render free tier)
1. Push `backend/trend-analyzer/` to a GitHub repo (or the existing one as a monorepo)
2. On render.com → New → Web Service → connect the repo, set root dir to `backend/trend-analyzer`
3. Build: `pip install -r requirements.txt` — Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env var `GEMINI_API_KEY`, optionally `CORS_ORIGINS=https://your-app-domain`
5. Update `VITE_TREND_ANALYZER_URL` in the frontend `.env` to the Render URL

### Next Steps
- [ ] Run `003_trend_briefs.sql` in Supabase SQL editor
- [ ] Install backend deps + start uvicorn, test with a real TikTok URL end-to-end
- [ ] Deploy backend to Render (or Fly.io) — free tier fine for MVP scale
- [ ] Redeploy `publish-post` with image-posting branch and test single-photo post to FB
- [ ] Safety guardrails before onboarding a real client:
  - [ ] Confirmation modal on Publish Now (target Page, content preview, type-to-confirm)
  - [ ] Draft-first flow (remove Publish Now from main compose, add Review → Publish screen)
  - [ ] Per-connection "Test Mode" flag + red banner
  - [ ] Audit log of publish attempts
- [ ] Add second business via Tester role on FB app (Dev Mode, up to 100 testers — no App Review needed yet)
- [ ] Connect Instagram (requires IG Business/Creator account linked to a managed FB Page; auto-detected by existing OAuth flow)
- [ ] Wire Dashboard/Analytics pages to read from real posts table
- [ ] Add scheduled post cron (edge function on pg_cron trigger)
- [ ] TikTok OAuth + publish flow (separate system)
- [ ] Integrate real Google Cloud Vision API in Trend Analyzer
- [ ] Code-split with React.lazy for smaller bundle
