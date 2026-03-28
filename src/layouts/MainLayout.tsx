import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import '../pages/home/home.css'

export function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const learnNavActive = location.pathname === '/learn' || location.pathname.startsWith('/learn/')

  const displayName = user?.name?.trim() || 'Học viên'
  const jlpt = user?.jlptLevel ?? 'N5'
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'H'

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="hg-home">
      <div className="hg-layout">
        <aside className="hg-sidebar">
          <div>
            <Link to="/home" className="hg-sidebar-brand-row">
              <img src="/logo.jpg" alt="" className="hg-brand-logo" width={40} height={40} />
              <span className="hg-sidebar-brand">HikariGo</span>
            </Link>
            <Link to="/profile" className="hg-sidebar-user-link">
              <div className="hg-sidebar-avatar" aria-hidden>
                {user?.avatar ? <img src={user.avatar} alt="" /> : initial}
              </div>
              <div>
                <p className="hg-sidebar-user-title">{displayName}</p>
                <p className="hg-sidebar-user-sub">
                  JLPT {jlpt} · Tiếng Nhật
                </p>
              </div>
            </Link>
          </div>

          <nav className="hg-nav" aria-label="Điều hướng chính">
            <NavLink
              className={({ isActive }) =>
                `hg-nav-item${isActive ? ' hg-nav-item--active' : ''}`
              }
              to="/home"
              end
            >
              <span className="material-symbols-outlined">home</span>
              Trang chủ
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `hg-nav-item${isActive ? ' hg-nav-item--active' : ''}`
              }
              to="/profile"
            >
              <span className="material-symbols-outlined">person</span>
              Hồ sơ
            </NavLink>
            <NavLink
              className={() => `hg-nav-item${learnNavActive ? ' hg-nav-item--active' : ''}`}
              to="/learn"
            >
              <span className="material-symbols-outlined">style</span>
              Học tập
            </NavLink>
            <a className="hg-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">edit_note</span>
              Luyện JLPT
            </a>
            <a className="hg-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined">notifications</span>
              Thông báo
            </a>
          </nav>

          <div className="hg-quick">
            <p className="hg-quick-label">Lối tắt</p>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined hg-icon-sm">folder</span>
              Ôn JLPT
            </a>
            <Link to="/learn">
              <span className="material-symbols-outlined hg-icon-sm">folder</span>
              Học tập
            </Link>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined hg-icon-sm">folder</span>
              Ngữ pháp
            </a>
          </div>

          <div className="hg-sidebar-footer">
            <button type="button" className="hg-btn-logout" onClick={onLogout}>
              Đăng xuất
            </button>
          </div>
        </aside>

        <main className="hg-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
