import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Lightning, Envelope, Lock, User, Warning } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { isSupabaseConfigured } from "../lib/supabase"

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = mode === "signup"
      ? await signUp(email, password, businessName)
      : await signIn(email, password)

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
    } else if (mode === "signup" && !result.data.session) {
      setError("Check your email to confirm your account.")
    } else {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-lg bg-brand flex items-center justify-center">
            <Lightning weight="fill" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">SocialHub</h1>
            <p className="text-xs text-text-muted">Business Dashboard</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-raised border border-surface-overlay rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {mode === "signin" ? "Sign in to manage your social presence" : "Start managing your social media in one place"}
          </p>

          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2 bg-warning/15 border border-warning/30 text-warning rounded-lg p-3 mb-4 text-sm">
              <Warning weight="fill" className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Supabase not configured</p>
                <p className="text-xs mt-1 text-warning/90">Copy .env.example to .env and add your Supabase credentials to enable auth.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm text-text-muted block mb-1.5">Business Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business"
                    className="w-full bg-surface border border-surface-overlay rounded-lg pl-10 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-text-muted block mb-1.5">Email</label>
              <div className="relative">
                <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full bg-surface border border-surface-overlay rounded-lg pl-10 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-surface-overlay rounded-lg pl-10 pr-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError("") }}
              className="text-sm text-text-muted hover:text-brand-light transition-colors"
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
