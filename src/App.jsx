import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout/Layout"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Compose from "./pages/Compose"
import Analytics from "./pages/Analytics"
import TrendAnalyzer from "./pages/TrendAnalyzer"
import Settings from "./pages/Settings"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compose" element={<Compose />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/trends" element={<TrendAnalyzer />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
