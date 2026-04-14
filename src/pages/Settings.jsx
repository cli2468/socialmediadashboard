import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Plugs, Bell, Gear, Eye, EyeSlash, CheckCircle, Warning,
  FacebookLogo, InstagramLogo, TiktokLogo, GoogleLogo, X,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { settingsDefaults, platforms } from "../data/siteData"
import { useAuth } from "../contexts/AuthContext"
import { supabase, isSupabaseConfigured } from "../lib/supabase"
import { useSocialConnections, initiateFacebookOAuth } from "../hooks/useSocialConnections"

const platformIcons = {
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  tiktok: TiktokLogo,
}

function SettingSection({ title, icon: Icon, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface-raised border border-surface-overlay rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Icon weight="duotone" className="w-5 h-5 text-brand-light" />
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-brand" : "bg-surface-overlay"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { connections, disconnect, getConnection, refresh } = useSocialConnections()
  const [searchParams, setSearchParams] = useSearchParams()
  const [banner, setBanner] = useState(null)

  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [apiKey, setApiKey] = useState(settingsDefaults.googleCloudVision.apiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState(settingsDefaults.notifications)
  const [preferences, setPreferences] = useState(settingsDefaults.postingPreferences)
  const [saved, setSaved] = useState(false)

  // Handle OAuth callback redirects
  useEffect(() => {
    const connected = searchParams.get("connected")
    const err = searchParams.get("error")
    if (connected) {
      setBanner({ type: "success", message: `Connected to ${connected}!` })
      refresh()
      setSearchParams({})
    } else if (err) {
      setBanner({ type: "error", message: err })
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, refresh])

  // Load profile
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from("profiles")
      .select("business_name, industry")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setBusinessName(data.business_name || "")
          setIndustry(data.industry || "")
        }
      })
  }, [user])

  const handleSave = async () => {
    if (user && isSupabaseConfigured) {
      await supabase
        .from("profiles")
        .update({ business_name: businessName, industry })
        .eq("id", user.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleConnect = (platformId) => {
    if (!isSupabaseConfigured || !user) {
      setBanner({ type: "error", message: "Set up Supabase first (see supabase/README.md)" })
      return
    }
    if (platformId === "facebook" || platformId === "instagram") {
      initiateFacebookOAuth(user.id)
    } else if (platformId === "tiktok") {
      setBanner({ type: "info", message: "TikTok integration coming soon" })
    }
  }

  const handleDisconnect = async (platformId) => {
    await disconnect(platformId)
    setBanner({ type: "success", message: `Disconnected from ${platformId}` })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between rounded-xl px-5 py-3 border ${
              banner.type === "success"
                ? "bg-success/10 border-success/30 text-success"
                : banner.type === "error"
                ? "bg-danger/10 border-danger/30 text-danger"
                : "bg-brand/10 border-brand/30 text-brand-light"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {banner.type === "success" ? <CheckCircle weight="fill" className="w-5 h-5" /> : <Warning weight="fill" className="w-5 h-5" />}
              {banner.message}
            </div>
            <button onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Business Profile */}
      <SettingSection title="Business Profile" icon={Gear} delay={0}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-muted block mb-1.5">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Business Name"
              className="w-full bg-surface border border-surface-overlay rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted block mb-1.5">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-surface border border-surface-overlay rounded-lg px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-brand/50"
            >
              <option value="">Select your industry</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="food">Food & Beverage</option>
              <option value="fitness">Fitness & Health</option>
              <option value="tech">Technology</option>
              <option value="beauty">Beauty & Fashion</option>
              <option value="real-estate">Real Estate</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </SettingSection>

      {/* Connected Accounts */}
      <SettingSection title="Connected Accounts" icon={Plugs} delay={0.1}>
        <div className="space-y-3">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform.id]
            const connection = getConnection(platform.id)
            const isConnected = Boolean(connection)
            return (
              <div key={platform.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-surface-overlay">
                <div className="flex items-center gap-3">
                  <Icon weight="fill" className="w-6 h-6" style={{ color: platform.color }} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{platform.name}</p>
                    <p className="text-xs text-text-muted">
                      {isConnected
                        ? <>Connected as <span className="text-text-body font-medium">@{connection.platform_username}</span></>
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-danger/30 text-danger bg-danger/5 hover:bg-danger/10 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                    style={{
                      borderColor: platform.color + "40",
                      color: platform.color,
                      backgroundColor: platform.color + "10",
                    }}
                  >
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
        {connections.length === 0 && (
          <p className="text-xs text-text-muted mt-4">
            Connecting Facebook will also detect and link any Instagram Business account attached to your Facebook Page.
          </p>
        )}
      </SettingSection>

      {/* Google Cloud Vision API */}
      <SettingSection title="Google Cloud Vision API" icon={GoogleLogo} delay={0.15}>
        <p className="text-sm text-text-muted mb-4">
          Connect your Google Cloud Vision API key to enable AI-powered video analysis in the Trend Analyzer.
          Get your API key from{" "}
          <a href="https://cloud.google.com/vision" target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline">
            cloud.google.com/vision
          </a>
        </p>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full bg-surface border border-surface-overlay rounded-lg px-4 py-2.5 pr-10 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {showApiKey ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </SettingSection>

      {/* Posting Preferences */}
      <SettingSection title="Posting Preferences" icon={Gear} delay={0.2}>
        <div className="divide-y divide-surface-overlay">
          <Toggle
            enabled={preferences.autoHashtags}
            onChange={(v) => setPreferences({ ...preferences, autoHashtags: v })}
            label="Auto-suggest Hashtags"
            description="AI will suggest relevant hashtags based on your content"
          />
          <Toggle
            enabled={preferences.watermark}
            onChange={(v) => setPreferences({ ...preferences, watermark: v })}
            label="Add Watermark"
            description="Automatically add your brand watermark to images"
          />
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={Bell} delay={0.25}>
        <div className="divide-y divide-surface-overlay">
          <Toggle
            enabled={notifications.postPublished}
            onChange={(v) => setNotifications({ ...notifications, postPublished: v })}
            label="Post Published"
            description="Get notified when a scheduled post is published"
          />
          <Toggle
            enabled={notifications.engagementSpike}
            onChange={(v) => setNotifications({ ...notifications, engagementSpike: v })}
            label="Engagement Spike"
            description="Alert when a post gets unusual engagement"
          />
          <Toggle
            enabled={notifications.trendAlert}
            onChange={(v) => setNotifications({ ...notifications, trendAlert: v })}
            label="Trend Alerts"
            description="Get notified about trending topics in your industry"
          />
          <Toggle
            enabled={notifications.weeklyReport}
            onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
            label="Weekly Report"
            description="Receive a weekly performance summary email"
          />
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {saved ? (
            <>
              <CheckCircle weight="fill" className="w-5 h-5" />
              Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  )
}
