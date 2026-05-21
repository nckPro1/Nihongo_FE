import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuthStore } from '../store/adminAuthStore'
import '../pages/admin/admin.css'

export function AdminLayout() {
  const navigate = useNavigate()
  const logout = useAdminAuthStore((s) => s.logout)
  const user = useAdminAuthStore((s) => s.user)

  const onLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell admin-layout">
      <aside className="admin-side">
        <div className="admin-side-header">
          <div className="admin-side-logo">禅</div>
          <div className="admin-side-brand">
            <p className="admin-side-title">Zenigo Admin</p>
            <p className="admin-side-version">v2.0.4</p>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? 'admin-nav--active' : undefined)}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? 'admin-nav--active' : undefined)}
          >
            👥 Người dùng
          </NavLink>
          <NavLink
            to="/admin/blog"
            className={({ isActive }) => (isActive ? 'admin-nav--active' : undefined)}
          >
            📝 Blog
          </NavLink>
        </nav>
        <div className="admin-side-foot">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">{user?.name || 'Admin'}</p>
              <p className="admin-user-email">{user?.email}</p>
            </div>
          </div>
          <button type="button" className="admin-btn-ghost" onClick={onLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
