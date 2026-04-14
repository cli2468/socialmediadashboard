# ===== PERMANENT (do not modify or remove) =====

## Startup Instructions
1. Check if this is a new project or a returning session:
   - If progress.md says "not started" → run npm install and wait for instructions
   - If progress.md has actual content → read design-system.md and product-marketing-context.md, then summarize where we are before proceeding

## Tech Stack (do not ask, just install)
- React 19
- Vite 7
- Tailwind CSS 4 (with @tailwindcss/vite plugin)
- Framer Motion
- Phosphor Icons (@phosphor-icons/react)
- ESLint

## Vite Config Requirements
- Network hosting enabled: `server: { host: true }`
- Base path: `"/"` (adjust only when deploying to GitHub Pages subdirectory)

## Project Structure
src/
  components/       → One file per section
  data/siteData.js  → Centralized business data — all components import from here
  assets/images/    → gallery/, before-after/, services/
  assets/logos/
  assets/fonts/
  index.css         → Tailwind import + @theme block with brand colors
public/
  favicon.png
  robots.txt
  sitemap.xml

## Rules
- Always compress images to under 200KB before adding to assets/
- Favicons must be under 50KB
- No spaces in file or folder names — use hyphens
- All business data goes in siteData.js — never hardcode in components
- When client-questionnaire.md is updated with client answers, automatically populate siteData.js from it
- Always build mobile and desktop responsiveness simultaneously
- Do not ask about dependencies or tech stack — they are listed above, just install them
- When a bug is fixed, add a one-line note to progress.md explaining what went wrong
- Infer what the site needs (sections, forms, galleries, etc.) from the product context — do not assume every site needs the same features
- - When updating agents.md active zone, also update claude.md active zone (and vice versa)

# ===== ACTIVE ZONE (update between phases) =====

## Current Phase: First FB post live — hardening before real clients
## Completed: Project init, layout, all 5 pages, Supabase auth + DB, FB OAuth, real text post published to FB
## Next Up: Safety guardrails (confirm modal, draft-first flow, test-mode flag), IG connection, redeploy publish-post with image support

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