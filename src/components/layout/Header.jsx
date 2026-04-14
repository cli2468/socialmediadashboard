import { MagnifyingGlass, Bell, CaretDown } from "@phosphor-icons/react"
import { useLocation } from "react-router-dom"

const pageTitles = {
  "/": "Dashboard",
  "/compose": "Compose Post",
  "/analytics": "Analytics",
  "/trends": "Trend Analyzer",
  "/settings": "Settings",
}

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || "Dashboard"

  return (
    <header className="h-16 border-b border-surface-overlay bg-surface-raised/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-surface-overlay/50 border border-surface-overlay text-text-body text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 placeholder:text-text-muted"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay/50 transition-colors">
          <Bell weight="duotone" className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-overlay/50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <CaretDown className="w-3 h-3 text-text-muted" />
        </button>
      </div>
    </header>
  )
}
