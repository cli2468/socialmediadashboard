import { useState } from "react"
import {
  Link as LinkIcon, Eye, Heart, ChatCircle, Lightning,
  ListNumbers, Timer, CircleNotch, Robot, Sparkle, Star,
  Trash, Warning, Tag, Megaphone, Wrench, Users, Image as ImageIcon,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { useTrendAnalyzer } from "../hooks/useTrendAnalyzer"
import { platforms } from "../data/siteData"

function formatCount(n) {
  if (n == null) return "—"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDuration(seconds) {
  if (!seconds) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function platformMeta(platform) {
  const known = platforms.find((p) => p.id === platform)
  if (known) return { name: known.name, color: known.color }
  if (platform === "youtube") return { name: "YouTube", color: "#FF0000" }
  return { name: "Video", color: "#9ca3af" }
}

function UrlForm({ onAnalyze, analyzing, error }) {
  const [url, setUrl] = useState("")
  const submit = (e) => {
    e?.preventDefault()
    if (!url.trim() || analyzing) return
    onAnalyze(url.trim()).catch(() => {}) // error surfaced via hook state
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-raised border border-surface-overlay rounded-xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <Robot weight="duotone" className="w-7 h-7 text-brand-light" />
        <h2 className="text-xl font-bold text-text-primary">AI Trend Analyzer</h2>
        <span className="ml-auto text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
          Gemini 2.5 Flash
        </span>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Paste a TikTok, Instagram Reel, or YouTube Short URL. Gemini watches the video and returns a
        plain-English content brief — hook, format, why it works, and how to recreate it.
      </p>
      <form onSubmit={submit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@user/video/..."
            disabled={analyzing}
            className="w-full bg-surface border border-surface-overlay rounded-xl pl-12 pr-4 py-4 text-text-primary focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 placeholder:text-text-muted disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={analyzing || !url.trim()}
          className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <CircleNotch className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Lightning weight="fill" className="w-5 h-5" />
              Analyze
            </>
          )}
        </button>
      </form>
      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
          <Warning className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </motion.div>
  )
}

function LoadingState({ url }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative">
        <CircleNotch className="w-12 h-12 text-brand animate-spin" />
        <Robot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-brand-light" />
      </div>
      <p className="text-text-primary font-medium mt-4 break-all text-center max-w-md px-4">
        Analyzing {url}
      </p>
      <div className="space-y-1.5 mt-3 text-center">
        <p className="text-xs text-text-muted">Downloading the video...</p>
        <p className="text-xs text-text-muted">Uploading to Gemini...</p>
        <p className="text-xs text-text-muted">Generating content brief...</p>
      </div>
      <p className="text-[11px] text-text-muted mt-4">This can take 30–60 seconds.</p>
    </motion.div>
  )
}

function BriefHeader({ brief, onClose }) {
  const p = platformMeta(brief.platform)
  const meta = brief.metadata || brief
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="w-24 h-24 rounded-lg bg-surface-overlay overflow-hidden shrink-0 flex items-center justify-center">
            {brief.thumbnail || meta?.thumbnail ? (
              <img src={brief.thumbnail || meta.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: p.color + "30", color: p.color }}
              >
                {p.name}
              </span>
              {brief.analysis?.category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-overlay text-text-muted">
                  {brief.analysis.category}
                </span>
              )}
            </div>
            <h3 className="font-bold text-text-primary truncate">
              {brief.title || meta?.title || "Untitled"}
            </h3>
            {(brief.uploader || meta?.uploader) && (
              <p className="text-xs text-text-muted mt-0.5">@{brief.uploader || meta.uploader}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatCount(brief.view_count ?? meta?.view_count)} views</span>
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {formatCount(brief.like_count ?? meta?.like_count)} likes</span>
              <span className="flex items-center gap-1"><ChatCircle className="w-3.5 h-3.5" /> {formatCount(brief.comment_count ?? meta?.comment_count)} comments</span>
              <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {formatDuration(brief.duration ?? meta?.duration)}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-brand-light hover:text-brand transition-colors shrink-0"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

function BriefBody({ brief }) {
  const a = brief.analysis || {}
  if (a.parse_error) {
    return (
      <div className="bg-surface-raised border border-warning/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Warning className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-text-primary">Raw response</h3>
        </div>
        <p className="text-xs text-text-muted mb-3">Gemini didn't return valid JSON. Full text below:</p>
        <pre className="text-xs text-text-body whitespace-pre-wrap break-words">{a.raw_response}</pre>
      </div>
    )
  }

  const ca = a.comment_analysis

  return (
    <div className="space-y-6">
      {/* Summary */}
      {a.summary && (
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkle weight="fill" className="w-5 h-5 text-brand-light" />
            <h3 className="font-semibold text-text-primary">Summary</h3>
          </div>
          <p className="text-sm text-text-body leading-relaxed">{a.summary}</p>
        </div>
      )}

      {/* Quick facts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {a.hook && (
          <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightning className="w-4 h-4 text-warning" />
              <p className="text-xs font-medium text-text-muted">Hook</p>
            </div>
            <p className="text-sm text-text-body">{a.hook}</p>
          </div>
        )}
        {a.format && (
          <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-4 h-4 text-brand-light" />
              <p className="text-xs font-medium text-text-muted">Format</p>
            </div>
            <p className="text-sm text-text-body">{a.format}</p>
          </div>
        )}
        {a.audio && (
          <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Megaphone className="w-4 h-4 text-accent" />
              <p className="text-xs font-medium text-text-muted">Audio</p>
            </div>
            <p className="text-sm text-text-body">{a.audio}</p>
          </div>
        )}
      </div>

      {/* Why it works */}
      {a.why_it_works?.length > 0 && (
        <div className="bg-surface-raised border border-brand/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star weight="fill" className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-text-primary">Why It Works</h3>
          </div>
          <ul className="space-y-2">
            {a.why_it_works.map((reason, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-body">
                <span className="text-brand-light mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* How to recreate */}
      {a.how_to_recreate?.length > 0 && (
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListNumbers className="w-5 h-5 text-brand-light" />
            <h3 className="font-semibold text-text-primary">How to Recreate</h3>
          </div>
          {a.what_you_need && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-surface/50 rounded-lg border border-surface-overlay">
              <Wrench className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
              <p className="text-xs text-text-body">
                <span className="text-text-muted font-medium">You'll need: </span>
                {a.what_you_need}
              </p>
            </div>
          )}
          <div className="space-y-3">
            {a.how_to_recreate.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center text-xs font-bold text-brand-light">
                  {i + 1}
                </span>
                <p className="text-sm text-text-body pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caption tips */}
      {a.caption_tips && (
        <div className="bg-surface-raised border border-surface-overlay rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <ChatCircle className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-text-primary">Caption Tips</h3>
          </div>
          <p className="text-sm text-text-body leading-relaxed">{a.caption_tips}</p>
        </div>
      )}

      {/* Comment analysis */}
      {ca && (
        <div className="bg-surface-raised border border-accent/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-text-primary">What Viewers Said</h3>
            <span className="text-xs text-text-muted ml-auto">{brief.comments_scraped} comments analyzed</span>
          </div>
          {ca.audience_type && (
            <p className="text-sm text-text-body mb-4">
              <span className="text-text-muted">Audience: </span>{ca.audience_type}
            </p>
          )}
          {ca.what_viewers_loved?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-text-muted mb-2">Viewers loved</p>
              <ul className="space-y-1.5">
                {ca.what_viewers_loved.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-body">
                    <Heart className="w-3.5 h-3.5 text-accent mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ca.ideas_from_comments?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Content ideas from comments</p>
              <ul className="space-y-1.5">
                {ca.ideas_from_comments.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-body">
                    <Sparkle className="w-3.5 h-3.5 text-brand-light mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryCard({ brief, onSelect, onDelete }) {
  const p = platformMeta(brief.platform)
  return (
    <motion.div
      layout
      onClick={() => onSelect(brief)}
      className="bg-surface-raised border border-surface-overlay rounded-xl p-4 cursor-pointer hover:border-brand/30 transition-colors group"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-lg bg-surface-overlay overflow-hidden shrink-0 flex items-center justify-center">
          {brief.thumbnail ? (
            <img src={brief.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: p.color + "30", color: p.color }}
            >
              {p.name}
            </span>
            {brief.analysis?.category && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-surface-overlay text-text-muted truncate">
                {brief.analysis.category}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-text-primary truncate">{brief.title || "Untitled"}</p>
          <p className="text-xs text-text-muted truncate">
            {brief.uploader ? `@${brief.uploader} · ` : ""}
            {formatCount(brief.view_count)} views
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(brief.id) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger p-1"
          aria-label="Delete brief"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function TrendAnalyzer() {
  const { briefs, loading, analyzing, error, analyze, remove } = useTrendAnalyzer()
  const [selected, setSelected] = useState(null)
  const [pendingUrl, setPendingUrl] = useState("")

  const handleAnalyze = async (url) => {
    setPendingUrl(url)
    const result = await analyze(url)
    setSelected(result)
    setPendingUrl("")
    return result
  }

  const handleSelect = (brief) => setSelected(brief)
  const handleClose = () => setSelected(null)

  return (
    <div className="space-y-8">
      <UrlForm onAnalyze={handleAnalyze} analyzing={analyzing} error={error} />

      <AnimatePresence mode="wait">
        {analyzing && <LoadingState key="loading" url={pendingUrl} />}
      </AnimatePresence>

      {!analyzing && selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <BriefHeader brief={selected} onClose={handleClose} />
          <BriefBody brief={selected} />
        </motion.div>
      )}

      {!analyzing && !selected && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">
              History <span className="text-text-muted font-normal">({briefs.length})</span>
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <CircleNotch className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : briefs.length === 0 ? (
            <div className="bg-surface-raised border border-surface-overlay rounded-xl p-12 text-center">
              <Robot className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-text-primary font-medium">No briefs yet</p>
              <p className="text-sm text-text-muted mt-1">
                Paste a TikTok, Instagram Reel, or YouTube Short URL above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {briefs.map((b) => (
                <HistoryCard key={b.id} brief={b} onSelect={handleSelect} onDelete={remove} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
