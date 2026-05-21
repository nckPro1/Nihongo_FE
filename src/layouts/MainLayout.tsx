import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BRAND_LOGO_URL } from '../constants/brandAssets'
import { useAuthStore } from '../store/authStore'
import { SakuraBackground } from '../components/ui/SakuraBackground'
import '../pages/home/home.css'

export function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const learnNavActive = location.pathname === '/learn' || location.pathname.startsWith('/learn/')
  const grammarNavActive = location.pathname === '/grammar' || location.pathname.startsWith('/grammar/')

  const displayName = user?.name?.trim() || 'Học viên'
  const jlpt = user?.jlptLevel ?? 'N5'
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'H'

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="hg-home">
      <SakuraBackground />
      <div className="hg-layout">
        <aside className="hg-sidebar">
          <div className="hg-sidebar-top">
            <Link to="/home" className="hg-sidebar-brand-row">
              <img src={BRAND_LOGO_URL} alt="" className="hg-brand-logo" width={40} height={40} />
              <span className="hg-sidebar-brand">Zenigo</span>
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

          <div className="hg-sidebar-body">
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
              <NavLink
                className={() => `hg-nav-item${grammarNavActive ? ' hg-nav-item--active' : ''}`}
                to="/grammar"
              >
                <span className="material-symbols-outlined">menu_book</span>
                Ngữ pháp
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `hg-nav-item${isActive ? ' hg-nav-item--active' : ''}`
                }
                to="/blog"
              >
                <span className="material-symbols-outlined">article</span>
                Blog
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
