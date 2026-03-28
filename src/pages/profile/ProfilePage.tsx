import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './profile.css'

export function ProfilePage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'HikariGo — Hồ sơ'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="profile-shell">
      <h1 className="profile-title">Hồ sơ</h1>
      <p className="profile-lead">Quản lý thông tin tài khoản, bảo mật và lịch sử giao dịch.</p>

      <nav className="profile-tabs" aria-label="Mục hồ sơ">
        <NavLink
          to="/profile"
          end
          className={({ isActive }) => (isActive ? 'profile-tab--active' : '')}
        >
          Thông tin cơ bản
        </NavLink>
        <NavLink
          to="/profile/security"
          className={({ isActive }) => (isActive ? 'profile-tab--active' : '')}
        >
          Bảo mật
        </NavLink>
        <NavLink
          to="/profile/transactions"
          className={({ isActive }) => (isActive ? 'profile-tab--active' : '')}
        >
          Lịch sử giao dịch
        </NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
