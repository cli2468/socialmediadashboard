import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Image, VideoCamera, PaperPlaneTilt, X, Clock,
  Hash, Smiley, TextAa, CheckCircle, Warning, CircleNotch,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { platforms } from "../data/siteData"
import { useAuth } from "../contexts/AuthContext"
import { isSupabaseConfigured } from "../lib/supabase"
import { useSocialConnections } from "../hooks/useSocialConnections"
import { createPost, uploadPostMedia, publishPostNow } from "../hooks/usePosts"

const platformColors = {
  facebook: { bg: "bg-facebook/15", text: "text-facebook", border: "border-facebook/30", ring: "ring-facebook/25" },
  instagram: { bg: "bg-instagram/15", text: "text-instagram", border: "border-instagram/30", ring: "ring-instagram/25" },
  tiktok: { bg: "bg-surface-overlay", text: "text-accent", border: "border-accent/30", ring: "ring-accent/25" },
}

const charLimits = { facebook: 63206, instagram: 2200, tiktok: 2200 }

export default function Compose() {
  const { user } = useAuth()
  const { getConnection } = useSocialConnections()
  const navigate = useNavigate()

  const [content, setContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState(["facebook", "instagram", "tiktok"])
  const [mediaFiles, setMediaFiles] = useState([])
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const togglePlatform = (id) =>
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files)
    setMediaFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        preview: URL.createObjectURL(file),
      })),
    ])
  }

  const removeMedia = (id) => setMediaFiles((prev) => prev.filter((f) => f.id !== id))

  const minCharLimit = Math.min(...selectedPlatforms.map((p) => charLimits[p] || 2200))

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const needsMediaForIG = selectedPlatforms.includes("instagram") && mediaFiles.length === 0
  const missingConnections = selectedPlatforms.filter((p) => !getConnection(p))

  const submit = async (intent) => {
    if (!isSupabaseConfigured) {
      showToast("error", "Supabase not configured. Check .env and restart the dev server.")
      return
    }
    if (!user) {
      showToast("error", "You must be signed in.")
      return
    }
    if (intent === "publish" && needsMediaForIG) {
      showToast("error", "Instagram posts require at least one image or video.")
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload media (if any) to Supabase Storage
      let mediaUrls = []
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadPostMedia(user.id, mediaFiles.map((f) => f.file))
      }

      // 2. Figure out status + scheduled_for
      let status = "draft"
      let scheduledFor = null
      if (intent === "schedule") {
        if (!scheduleDate || !scheduleTime) {
          setSubmitting(false)
          showToast("error", "Pick a date and time to schedule.")
          return
        }
        status = "scheduled"
        scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      } else if (intent === "publish") {
        status = "publishing"
      }

      // 3. Insert into posts table
      const { data: post, error } = await createPost({
        userId: user.id,
        content,
        hashtags,
        platforms: selectedPlatforms,
        mediaUrls,
        status,
        scheduledFor,
      })
      if (error) throw error

      // 4. If publishing now, call edge function
      if (intent === "publish") {
        if (missingConnections.length > 0) {
          showToast(
            "error",
            `Saved as draft. Connect these platforms first: ${missingConnections.join(", ")}`
          )
          // downgrade to draft since we can't actually publish
          return
        }
        const result = await publishPostNow(post.id)
        const succeeded = Object.keys(result.platformPostIds || {})
        const failed = Object.keys(result.errors || {})
        if (succeeded.length) {
          showToast("success", `Published to ${succeeded.join(", ")}${failed.length ? ` (failed: ${failed.join(", ")})` : ""}`)
        } else {
          showToast("error", `Publish failed: ${Object.values(result.errors || {}).join("; ")}`)
          return
        }
      } else if (intent === "schedule") {
        showToast("success", `Scheduled for ${new Date(scheduledFor).toLocaleString()}`)
      } else {
        showToast("success", "Saved as draft")
      }

      // 5. Reset form on success
      setContent("")
      setHashtags("")
      setMediaFiles([])
      setIsScheduling(false)
      setScheduleDate("")
      setScheduleTime("")

      // Head to dashboard after successful publish to see it in the feed
      if (intent === "publish") setTimeout(() => navigate("/"), 1200)
    } catch (err) {
      console.error(err)
      showToast("error", err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-8 rounded-xl px-6 py-4 flex items-center gap-3 z-50 shadow-xl border ${
              toast.type === "success"
                ? "bg-success/15 border-success/30 text-success"
                : "bg-danger/15 border-danger/30 text-danger"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle weight="fill" className="w-5 h-5" />
            ) : (
              <Warning weight="fill" className="w-5 h-5" />
            )}
            <span className="font-medium max-w-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Compose Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Post To</h3>
            <div className="flex gap-3 flex-wrap">
              {platforms.map((platform) => {
                const active = selectedPlatforms.includes(platform.id)
                const connected = Boolean(getConnection(platform.id))
                const colors = platformColors[platform.id]
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      active
                        ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ${colors.ring}`
                        : "border-surface-overlay text-text-muted hover:text-text-body"
                    }`}
                  >
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: active ? platform.color : "#475569", color: "#fff" }}>
                      {platform.name[0]}
                    </span>
                    {platform.name}
                    {active && <CheckCircle weight="fill" className="w-4 h-4" />}
                    {active && !connected && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-warning border-2 border-surface-raised" title="Not connected" />
                    )}
                  </button>
                )
              })}
            </div>
            {missingConnections.length > 0 && (
              <p className="text-xs text-warning mt-3 flex items-center gap-1.5">
                <Warning weight="fill" className="w-3.5 h-3.5" />
                {missingConnections.join(", ")} not connected. You can still save as draft or schedule, but publishing will fail until connected.
              </p>
            )}
          </motion.div>

          {/* Text Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">Content</h3>
              <span className={`text-xs ${content.length > minCharLimit ? "text-danger" : "text-text-muted"}`}>
                {content.length} / {minCharLimit.toLocaleString()}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Write your post here..."
              rows={6}
              className="w-full bg-surface/50 border border-surface-overlay rounded-lg p-4 text-text-primary text-sm resize-none focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
            />
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-overlay">
              <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay/50 transition-colors" title="Add emoji">
                <Smiley className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay/50 transition-colors" title="Format text">
                <TextAa className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay/50 transition-colors" title="Add hashtags">
                <Hash className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Media Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Media</h3>
              {needsMediaForIG && (
                <span className="text-xs text-warning flex items-center gap-1">
                  <Warning weight="fill" className="w-3.5 h-3.5" />
                  Instagram requires media
                </span>
              )}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-overlay rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all group">
              <div className="flex flex-col items-center gap-2 text-text-muted group-hover:text-brand-light transition-colors">
                <div className="flex gap-2">
                  <Image className="w-6 h-6" />
                  <VideoCamera className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">Drop files here or click to upload</p>
                <p className="text-xs">Images (JPG, PNG, GIF) or Videos (MP4, MOV)</p>
              </div>
              <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
            </label>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="relative group rounded-lg overflow-hidden border border-surface-overlay">
                    {file.type.startsWith("image/") ? (
                      <img src={file.preview} alt={file.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-surface-overlay flex items-center justify-center">
                        <VideoCamera className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(file.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-danger/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                      <p className="text-[10px] text-white truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Hashtags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-3">Hashtags</h3>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketing #socialmedia #business"
              className="w-full bg-surface/50 border border-surface-overlay rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
            />
            <p className="text-xs text-text-muted mt-2">Separate hashtags with spaces. Appended to your post on publish.</p>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Preview</h3>
            <div className="bg-surface rounded-lg p-4 border border-surface-overlay min-h-[120px]">
              {content ? (
                <p className="text-sm text-text-body whitespace-pre-wrap">
                  {content}
                  {hashtags && <span className="text-brand-light block mt-2">{hashtags}</span>}
                </p>
              ) : (
                <p className="text-sm text-text-muted italic">Your post preview will appear here...</p>
              )}
              {mediaFiles.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-overlay">
                  <p className="text-xs text-text-muted">{mediaFiles.length} media file(s) attached</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Schedule</h3>
              <button
                onClick={() => setIsScheduling(!isScheduling)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isScheduling ? "bg-brand" : "bg-surface-overlay"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isScheduling ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {isScheduling && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Date</label>
                  <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full bg-surface/50 border border-surface-overlay rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand/50" />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Time</label>
                  <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full bg-surface/50 border border-surface-overlay rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand/50" />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={() => submit(isScheduling ? "schedule" : "publish")}
              disabled={!content.trim() || selectedPlatforms.length === 0 || submitting}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <CircleNotch className="w-5 h-5 animate-spin" />
                  {isScheduling ? "Scheduling..." : "Publishing..."}
                </>
              ) : isScheduling ? (
                <>
                  <Clock weight="bold" className="w-5 h-5" />
                  Schedule Post
                </>
              ) : (
                <>
                  <PaperPlaneTilt weight="fill" className="w-5 h-5" />
                  Publish Now
                </>
              )}
            </button>
            <button
              onClick={() => submit("draft")}
              disabled={!content.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 bg-surface-overlay/50 hover:bg-surface-overlay text-text-body font-medium py-3 rounded-xl transition-colors border border-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
          </motion.div>

          <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Platform Notes</h3>
            <div className="space-y-2 text-xs text-text-muted">
              {selectedPlatforms.includes("instagram") && (
                <p>Instagram: Max 2,200 chars. Requires at least one image or video.</p>
              )}
              {selectedPlatforms.includes("tiktok") && (
                <p>TikTok: Max 2,200 chars. Integration coming soon.</p>
              )}
              {selectedPlatforms.includes("facebook") && (
                <p>Facebook: Max 63,206 chars. Supports text-only, images, and videos.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
