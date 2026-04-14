import { useEffect, useState, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

export function useSocialConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConnections = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user.id)

    if (!error) setConnections(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  const disconnect = async (platform) => {
    if (!user) return
    await supabase
      .from("social_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform)
    await fetchConnections()
  }

  const getConnection = (platform) => connections.find((c) => c.platform === platform)

  return { connections, loading, disconnect, getConnection, refresh: fetchConnections }
}

export function initiateFacebookOAuth(userId) {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth-callback`

  if (!appId) {
    alert("Set VITE_FACEBOOK_APP_ID in your .env file first")
    return
  }

  const scopes = [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
    "business_management",
  ].join(",")

  // state param carries the user ID so the callback knows who to link the connection to
  const state = btoa(JSON.stringify({ userId, returnTo: window.location.origin + "/settings" }))

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&response_type=code`

  window.location.href = url
}
