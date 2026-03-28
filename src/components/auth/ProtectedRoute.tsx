import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute() {
  const { token, initialized } = useAuthStore()

  if (!initialized) {
    return <div className="auth-shell"><div className="auth-card">Loading...</div></div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
