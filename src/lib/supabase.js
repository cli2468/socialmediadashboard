import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const looksLikePlaceholder =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("your-project-ref") ||
  supabaseUrl === "https://placeholder.supabase.co" ||
  !supabaseUrl.startsWith("https://") ||
  !supabaseUrl.includes(".supabase.co")

export const isSupabaseConfigured = !looksLikePlaceholder

if (!isSupabaseConfigured) {
  console.warn(
    "%c[SocialHub] Supabase not configured correctly.",
    "color: #f59e0b; font-weight: bold;",
    `\n  VITE_SUPABASE_URL: ${supabaseUrl || "(missing)"}\n  VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "(set)" : "(missing)"}\n\nExpected format:\n  VITE_SUPABASE_URL=https://abcdefgh.supabase.co\n  VITE_SUPABASE_ANON_KEY=eyJhbGc...\n\nIMPORTANT: You must restart 'npm run dev' after editing .env.`
  )
} else {
  console.log(`%c[SocialHub] Supabase connected: ${supabaseUrl}`, "color: #22c55e")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
)
