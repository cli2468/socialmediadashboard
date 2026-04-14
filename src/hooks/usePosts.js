import { useCallback, useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"

export function usePosts({ limit = null } = {}) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (limit) query = query.limit(limit)
    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }, [user, limit])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, refresh: fetchPosts }
}

export async function createPost({
  userId,
  content,
  hashtags,
  platforms,
  mediaUrls = [],
  status = "draft",
  scheduledFor = null,
}) {
  return supabase
    .from("posts")
    .insert({
      user_id: userId,
      content,
      hashtags: hashtags || null,
      platforms,
      media_urls: mediaUrls.length ? mediaUrls : null,
      status,
      scheduled_for: scheduledFor,
    })
    .select()
    .single()
}

export async function uploadPostMedia(userId, files) {
  const uploadedUrls = []
  for (const file of files) {
    const ext = file.name.split(".").pop()
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`
    const { data, error } = await supabase.storage
      .from("post-media")
      .upload(path, file, { cacheControl: "3600", upsert: false })
    if (error) throw error
    const { data: pub } = supabase.storage.from("post-media").getPublicUrl(data.path)
    uploadedUrls.push(pub.publicUrl)
  }
  return uploadedUrls
}

export async function publishPostNow(postId) {
  const { data, error } = await supabase.functions.invoke("publish-post", {
    body: { postId },
  })
  if (error) throw error
  return data
}

export async function deletePost(postId) {
  return supabase.from("posts").delete().eq("id", postId)
}
