import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '../../store/adminAuthStore'

export function AdminProtectedRoute() {
  const { token, initialized } = useAdminAuthStore()
  const location = useLocation()

  useEffect(() => {
    void useAdminAuthStore.getState().initialize()
  }, [])

  if (!initialized) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Đang tải…</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
