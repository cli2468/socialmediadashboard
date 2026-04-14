import { Navigate } from "react-router-dom"
import { CircleNotch } from "@phosphor-icons/react"
import { useAuth } from "../../contexts/AuthContext"
import { isSupabaseConfigured } from "../../lib/supabase"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // If Supabase isn't configured yet, let them see the app with mock data
  if (!isSupabaseConfigured) return children

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <CircleNotch className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
