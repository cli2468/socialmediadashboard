import { NavLink, useNavigate } from "react-router-dom"
import {
  ChartBar,
  PencilSimple,
  ChartLine,
  TrendUp,
  Gear,
  SignOut,
  Lightning,
} from "@phosphor-icons/react"
import { appConfig } from "../../data/siteData"
import { useAuth } from "../../contexts/AuthContext"

const iconMap = {
  ChartBar,
  PencilSimple,
  ChartLine,
  TrendUp,
  Gear,
}

const navItems = [
  { path: "/", label: "Dashboard", icon: "ChartBar" },
  { path: "/compose", label: "Compose", icon: "PencilSimple" },
  { path: "/analytics", label: "Analytics", icon: "ChartLine" },
  { path: "/trends", label: "Trend Analyzer", icon: "TrendUp" },
  { path: "/settings", label: "Settings", icon: "Gear" },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.user_metadata?.business_name || user?.email?.split("@")[0] || "Business Name"
  const initial = displayName[0]?.toUpperCase() || "B"

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-raised border-r border-surface-overlay flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-surface-overlay">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center">
            <Lightning weight="fill" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">{appConfig.name}</h1>
            <p className="text-xs text-text-muted">Business Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand/15 text-brand-light border border-brand/20"
                    : "text-text-body hover:bg-surface-overlay/50 hover:text-text-primary"
                }`
              }
            >
              <Icon weight="duotone" className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-surface-overlay">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-light">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-muted">Free Plan</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-text-muted hover:text-danger transition-colors"
            title="Sign out"
          >
            <SignOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
