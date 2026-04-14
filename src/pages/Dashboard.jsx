import { Link } from "react-router-dom"
import {
  ArrowUp, ArrowDown, Heart, ChatCircle, ShareNetwork,
  PencilSimple, Trash, PaperPlaneTilt,
} from "@phosphor-icons/react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { overviewStats, platformStats, engagementData, platforms } from "../data/siteData"
import { useAuth } from "../contexts/AuthContext"
import { useSocialConnections } from "../hooks/useSocialConnections"
import { usePosts, deletePost } from "../hooks/usePosts"
import { isSupabaseConfigured } from "../lib/supabase"

function StatCard({ stat, index }) {
  const isUp = stat.trend === "up"
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
    >
      <p className="text-sm text-text-muted mb-1">{stat.label}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
        {stat.change && (
          <span className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-success" : "text-danger"}`}>
            {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {stat.change}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function PlatformCard({ platform, stats, connected }) {
  const platformInfo = platforms.find((p) => p.id === platform)
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: platformInfo.color + "20" }}>
          <span className="text-xs font-bold" style={{ color: platformInfo.color }}>
            {platformInfo.name[0]}
          </span>
        </div>
        <h3 className="font-semibold text-text-primary flex-1">{platformInfo.name}</h3>
        {!connected && (
          <span className="text-[10px] bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium">
            Not connected
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-text-muted">Followers</p>
          <p className="text-lg font-bold text-text-primary">{connected ? stats.followers : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Engagement</p>
          <p className="text-lg font-bold text-text-primary">{connected ? stats.engagement : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Posts/Week</p>
          <p className="text-lg font-bold text-text-primary">{connected ? stats.postsThisWeek : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Top Reach</p>
          <p className="text-lg font-bold text-text-primary">{connected ? stats.topPostReach : "—"}</p>
        </div>
      </div>
    </div>
  )
}

function PostRow({ post, onDelete }) {
  const statusStyles = {
    published: "bg-success/15 text-success",
    scheduled: "bg-warning/15 text-warning",
    publishing: "bg-brand/15 text-brand-light",
    draft: "bg-text-muted/15 text-text-muted",
    failed: "bg-danger/15 text-danger",
  }

  const timestamp =
    post.published_at ||
    post.scheduled_for ||
    post.created_at

  return (
    <div className="flex items-start gap-4 p-4 border-b border-surface-overlay last:border-0 hover:bg-surface-overlay/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary line-clamp-1">{post.content}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[post.status] || statusStyles.draft}`}>
            {post.status}
          </span>
          <div className="flex gap-1.5">
            {post.platforms.map((p) => {
              const pl = platforms.find((x) => x.id === p)
              if (!pl) return null
              return (
                <span key={p} className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: pl.color + "20", color: pl.color }}>
                  {pl.name[0]}
                </span>
              )
            })}
          </div>
          {timestamp && (
            <span className="text-xs text-text-muted">
              {new Date(timestamp).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
      {post.engagement && Object.keys(post.engagement).length > 0 && (
        <div className="flex items-center gap-4 text-xs text-text-muted shrink-0 hidden md:flex">
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.engagement.likes || 0}</span>
          <span className="flex items-center gap-1"><ChatCircle className="w-3.5 h-3.5" /> {post.engagement.comments || 0}</span>
          <span className="flex items-center gap-1"><ShareNetwork className="w-3.5 h-3.5" /> {post.engagement.shares || 0}</span>
        </div>
      )}
      <button
        onClick={() => onDelete(post.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-danger p-1"
        title="Delete post"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-brand/10 flex items-center justify-center mb-4">
        <PaperPlaneTilt weight="duotone" className="w-8 h-8 text-brand-light" />
      </div>
      <h4 className="text-lg font-semibold text-text-primary mb-1">No posts yet</h4>
      <p className="text-sm text-text-muted mb-5">Create your first post to get started</p>
      <Link
        to="/compose"
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <PencilSimple weight="bold" className="w-4 h-4" />
        Compose Post
      </Link>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-text-primary mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { getConnection, connections } = useSocialConnections()
  const { posts, loading, refresh } = usePosts({ limit: 8 })

  // Derive real stats from the posts table (fallback to mock if not configured)
  const hasRealData = isSupabaseConfigured && user
  const realStats = hasRealData
    ? [
        { label: "Total Posts", value: String(posts.length), change: null },
        { label: "Published", value: String(posts.filter((p) => p.status === "published").length), change: null },
        { label: "Scheduled", value: String(posts.filter((p) => p.status === "scheduled").length), change: null },
        { label: "Drafts", value: String(posts.filter((p) => p.status === "draft").length), change: null },
      ]
    : overviewStats

  const handleDelete = async (postId) => {
    if (!confirm("Delete this post?")) return
    await deletePost(postId)
    refresh()
  }

  const hasAnyConnection = connections.length > 0

  return (
    <div className="space-y-8">
      {/* Onboarding banner when no platforms connected */}
      {hasRealData && !hasAnyConnection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand/10 border border-brand/30 rounded-xl p-5 flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-text-primary">Connect a social account to get started</p>
            <p className="text-sm text-text-muted mt-1">Link Facebook or Instagram to start posting and tracking real analytics.</p>
          </div>
          <Link
            to="/settings"
            className="shrink-0 bg-brand hover:bg-brand-dark text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Go to Settings
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {realStats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Engagement Chart + Platform Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-surface-raised border border-surface-overlay rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-text-primary">Engagement Overview</h3>
              {hasRealData && !hasAnyConnection && (
                <p className="text-xs text-text-muted mt-1">Sample data — connect an account to see real metrics</p>
              )}
            </div>
            <span className="text-xs text-text-muted">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1877F2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E4405F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#69C9D0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#69C9D0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Area type="monotone" dataKey="facebook" name="Facebook" stroke="#1877F2" fillOpacity={1} fill="url(#fbGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#E4405F" fillOpacity={1} fill="url(#igGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="tiktok" name="TikTok" stroke="#69C9D0" fillOpacity={1} fill="url(#ttGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="space-y-4">
          {Object.entries(platformStats).map(([platform, stats]) => (
            <PlatformCard
              key={platform}
              platform={platform}
              stats={stats}
              connected={Boolean(getConnection(platform))}
            />
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-surface-raised border border-surface-overlay rounded-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-overlay">
          <h3 className="font-semibold text-text-primary">Recent Posts</h3>
          <Link to="/compose" className="text-sm text-brand-light hover:text-brand transition-colors">
            + New Post
          </Link>
        </div>
        <div>
          {!hasRealData ? (
            <div className="p-6 text-center text-sm text-text-muted">
              Sign in to see your posts
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-sm text-text-muted">Loading posts...</div>
          ) : posts.length === 0 ? (
            <EmptyState />
          ) : (
            posts.map((post) => <PostRow key={post.id} post={post} onDelete={handleDelete} />)
          )}
        </div>
      </motion.div>
    </div>
  )
}
