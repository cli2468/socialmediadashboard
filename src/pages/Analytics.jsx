import { useState } from "react"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { ArrowUp, ArrowDown, Export, CalendarBlank } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { monthlyData, engagementData, platformStats, platforms } from "../data/siteData"

const timeRanges = ["7 Days", "30 Days", "90 Days", "12 Months"]

const pieData = [
  { name: "Facebook", value: 98200, color: "#1877F2" },
  { name: "Instagram", value: 142100, color: "#E4405F" },
  { name: "TikTok", value: 44200, color: "#69C9D0" },
]

const contentPerformance = [
  { type: "Reels/Shorts", engagement: 8400, reach: 45000 },
  { type: "Carousel", engagement: 5200, reach: 28000 },
  { type: "Single Image", engagement: 3100, reach: 18000 },
  { type: "Text Post", engagement: 1800, reach: 12000 },
  { type: "Story", engagement: 4200, reach: 32000 },
  { type: "Live", engagement: 6800, reach: 22000 },
]

const topPosts = [
  { content: "5 tips to boost morning productivity", platform: "instagram", reach: "38.2K", engagement: "6.8%", likes: 1204 },
  { content: "Behind the scenes of our creative process", platform: "tiktok", reach: "112K", engagement: "9.1%", likes: 892 },
  { content: "Customer spotlight: @janedoe's journey", platform: "facebook", reach: "24.5K", engagement: "4.2%", likes: 342 },
  { content: "Weekend giveaway announcement", platform: "instagram", reach: "28.1K", engagement: "7.2%", likes: 678 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-text-primary mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

function MetricCard({ label, value, change, trend }) {
  const isUp = trend === "up"
  return (
    <div className="bg-surface-raised border border-surface-overlay rounded-xl p-5">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <span className={`flex items-center gap-1 text-xs font-medium mt-1 ${isUp ? "text-success" : "text-danger"}`}>
        {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {change} vs last period
      </span>
    </div>
  )
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30 Days")

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-brand/15 text-brand-light border border-brand/20"
                  : "text-text-muted hover:text-text-body hover:bg-surface-overlay/50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-overlay text-text-body text-sm hover:bg-surface-overlay/50 transition-colors">
          <Export className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Total Reach" value="545K" change="+15.2%" trend="up" />
        <MetricCard label="Engagement Rate" value="6.4%" change="+0.8%" trend="up" />
        <MetricCard label="New Followers" value="+14.5K" change="+23.1%" trend="up" />
        <MetricCard label="Link Clicks" value="8.2K" change="-3.4%" trend="down" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-surface-raised border border-surface-overlay rounded-xl p-6"
        >
          <h3 className="font-semibold text-text-primary mb-6">Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="followGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Area type="monotone" dataKey="followers" name="Followers" stroke="#6366f1" fillOpacity={1} fill="url(#followGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="reach" name="Reach" stroke="#06b6d4" fillOpacity={1} fill="url(#reachGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
        >
          <h3 className="font-semibold text-text-primary mb-6">Follower Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-body">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-medium text-text-primary">{(entry.value / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
      >
        <h3 className="font-semibold text-text-primary mb-6">Content Type Performance</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={contentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="engagement" name="Engagement" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reach" name="Reach" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface-raised border border-surface-overlay rounded-xl"
      >
        <div className="p-6 border-b border-surface-overlay">
          <h3 className="font-semibold text-text-primary">Top Performing Posts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-overlay">
                <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Content</th>
                <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Platform</th>
                <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Reach</th>
                <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Engagement</th>
                <th className="text-left text-xs font-medium text-text-muted px-6 py-3">Likes</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((post, i) => {
                const pl = platforms.find((p) => p.id === post.platform)
                return (
                  <tr key={i} className="border-b border-surface-overlay last:border-0 hover:bg-surface-overlay/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary">{post.content}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: pl.color + "20", color: pl.color }}>
                        {pl.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-body">{post.reach}</td>
                    <td className="px-6 py-4 text-sm text-text-body">{post.engagement}</td>
                    <td className="px-6 py-4 text-sm text-text-body">{post.likes.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
