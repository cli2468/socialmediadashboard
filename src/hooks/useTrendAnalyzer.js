import { useCallback, useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

const BACKEND_URL =
  import.meta.env.VITE_TREND_ANALYZER_URL || "http://localhost:8000"

export function useTrendAnalyzer() {
  const { user } = useAuth()
  const [briefs, setBriefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const fetchBriefs = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from("trend_briefs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (!err) setBriefs(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchBriefs()
  }, [fetchBriefs])

  const analyze = async (url) => {
    setError(null)
    setAnalyzing(true)
    try {
      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Backend returned ${res.status}`)
      }
      const result = await res.json()

      if (user && isSupabaseConfigured) {
        const row = {
          user_id: user.id,
          url: result.url,
          platform: result.platform,
          title: result.metadata?.title,
          uploader: result.metadata?.uploader,
          thumbnail: result.metadata?.thumbnail,
          view_count: result.metadata?.view_count ?? null,
          like_count: result.metadata?.like_count ?? null,
          comment_count: result.metadata?.comment_count ?? null,
          duration: result.metadata?.duration ?? null,
          upload_date: result.metadata?.upload_date ?? null,
          comments_scraped: result.comments_scraped ?? 0,
          analysis: result.analysis,
          model: "gemini-2.5-flash",
        }
        const { data, error: dbErr } = await supabase
          .from("trend_briefs")
          .insert(row)
          .select()
          .single()
        if (dbErr) throw dbErr
        setBriefs((prev) => [data, ...prev])
        return data
      }

      // Fallback when Supabase isn't configured — keep in memory only
      const local = { id: `local-${Date.now()}`, created_at: new Date().toISOString(), ...result }
      setBriefs((prev) => [local, ...prev])
      return local
    } catch (e) {
      setError(e.message || String(e))
      throw e
    } finally {
      setAnalyzing(false)
    }
  }

  const remove = async (id) => {
    if (!user || !isSupabaseConfigured) {
      setBriefs((prev) => prev.filter((b) => b.id !== id))
      return
    }
    await supabase.from("trend_briefs").delete().eq("id", id).eq("user_id", user.id)
    setBriefs((prev) => prev.filter((b) => b.id !== id))
  }

  return { briefs, loading, analyzing, error, analyze, remove, refresh: fetchBriefs }
}
