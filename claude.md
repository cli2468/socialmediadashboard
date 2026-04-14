# ===== PERMANENT (do not modify or remove) =====

## Startup Instructions
1. Check if this is a new project or a returning session:
   - If progress.md says "not started" → run npm install and wait for instructions
   - If progress.md has actual content → read design-system.md and progress.md, then summarize where we are before proceeding

## Tech Stack (do not ask, just install)
- React 19
- Vite 7
- Tailwind CSS 4 (with @tailwindcss/vite plugin)
- React Router DOM (client-side routing)
- Recharts (analytics charts)
- date-fns (date formatting)
- Framer Motion
- Phosphor Icons (@phosphor-icons/react)
- ESLint

## Vite Config Requirements
- Network hosting enabled: `server: { host: true }`
- Base path: `"/"` (adjust only when deploying to GitHub Pages subdirectory)

## Project Structure
src/
  components/
    layout/
      Sidebar.jsx     → Persistent sidebar navigation
      Header.jsx      → Top header with search & notifications
      Layout.jsx      → Layout shell wrapping Outlet
  pages/
    Dashboard.jsx     → Overview: stats, engagement chart, platform cards, recent posts
    Compose.jsx       → Cross-post composer (FB, IG, TikTok) with media upload & scheduling
    Analytics.jsx     → Charts: growth, content performance, follower distribution, top posts
    TrendAnalyzer.jsx → AI video analyzer: paste URL → Gemini returns content brief
    Settings.jsx      → Business profile, connected accounts, API keys, notification prefs
  data/siteData.js    → Mock data for all views, platform config, settings defaults
  assets/images/
  assets/logos/
  assets/fonts/
  index.css           → Tailwind import + @theme block with dark dashboard theme
public/
  favicon.png
  robots.txt
  sitemap.xml

## App Architecture
- This is a SaaS-style dashboard app, NOT a marketing site
- Dark theme (slate/indigo color system)
- React Router for page navigation (BrowserRouter in main.jsx)
- Layout component wraps all routes with persistent Sidebar + Header
- All mock data lives in siteData.js — components import from there

## Rules
- Always build mobile and desktop responsiveness simultaneously
- Do not ask about dependencies or tech stack — they are listed above, just install them
- When a bug is fixed, add a one-line note to progress.md explaining what went wrong
- When updating claude.md active zone, also update progress.md (and vice versa)
- All data goes in siteData.js — never hardcode in components
- Platform colors: Facebook #1877F2, Instagram #E4405F, TikTok #69C9D0 (accent for dark bg)

## External APIs
- Google Gemini (2.5 Flash) — powers Trend Analyzer. Accepts video files natively and returns a full content brief in one call. Free tier via AI Studio (15 rpm, 1M tokens/day).
  - Docs: https://ai.google.dev/
  - Key lives in the FastAPI backend ONLY (`backend/trend-analyzer/.env`), never in frontend code
  - NOTE: earlier docs referenced "Google Cloud Vision" — that was a misdirection. Vision only returns structured image data (labels/OCR/colors); it cannot write prose briefs. We use Gemini instead.
- Trend Analyzer backend: FastAPI + yt-dlp + google-genai at `backend/trend-analyzer/`
  - Frontend calls via `VITE_TREND_ANALYZER_URL` (default `http://localhost:8000`)
- Social Media APIs (Facebook Graph, Instagram Graph, TikTok) — for cross-posting & analytics
  - OAuth flow needed for each platform
  - Connected accounts managed in Settings

# ===== ACTIVE ZONE (update between phases) =====

## Current Phase: First FB post live + Trend Analyzer Gemini integration — hardening before real clients
## Completed: Project init, layout, all 5 pages, Supabase auth + DB, FB OAuth, real text post to FB, Trend Analyzer paste-URL flow with Gemini backend
## Next Up: Run 003 migration in Supabase, deploy trend-analyzer backend to Render, safety guardrails (confirm modal, draft-first flow, test-mode flag), IG connection, redeploy publish-post with image support

## Brand
- Colors: Indigo brand (#6366f1), Cyan accent (#06b6d4), Slate surfaces
- Display Font: Inter
- Body Font: Inter

## Site Structure
- Pages: Dashboard, Compose, Analytics, Trend Analyzer, Settings
- Layout: Sidebar (fixed left 256px) + Header (sticky top) + Main content

## Session Notes
- 2026-04-12: Full project initialized with 5 pages, dark dashboard theme, mock data.
  All pages functional with Recharts analytics, cross-post composer, AI trend analyzer
  with Google Cloud Vision mock integration, and settings page.
  Build succeeds. Ready for real API integration and auth.
- 2026-04-14: First real Facebook post published end-to-end. Supabase DB migrated,
  OAuth flow working, publish-post edge function returning 2xx. Known gotchas:
  both edge functions must have "Verify JWT" UNCHECKED — the OAuth callback because
  FB redirects without a JWT, and publish-post because this project uses the new
  ES256 key format which the runtime's built-in verifier rejects (auth is checked
  in-code via `admin.auth.getUser(token)` instead). publish-post must return
  explicit CORS headers on every Response (incl. OPTIONS preflight) or the
  browser blocks it with "Failed to send a request to the Edge Function".
