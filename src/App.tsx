import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { isAdminSubdomain } from './utils/subdomain'
import { AdminApp } from './AdminApp'
import { UserApp } from './UserApp'
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute'
import { PageTransitionOverlay } from './components/transition/PageTransitionOverlay'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminBlogPage } from './pages/admin/AdminBlogPage'
import { AdminBlogEditPage } from './pages/admin/AdminBlogEditPage'

/**
 * Main app component with subdomain routing
 *
 * Production deployment:
 * - zenigo.com → UserApp (regular user routes)
 * - admin.zenigo.com → AdminApp (admin routes at root)
 *
 * Development (localhost):
 * - localhost:5173/* → UserApp routes
 * - localhost:5173/admin/* → Admin routes (legacy paths for dev)
 * - admin.localhost:5173 → AdminApp (requires hosts file entry)
 */
function App() {
  const location = useLocation()

  // Check if running on admin subdomain
  const isAdmin = isAdminSubdomain()

  // Production: subdomain-based routing
  if (isAdmin) {
    return <AdminApp />
  }

  // Development: keep /admin/* routes for localhost
  const isDevAdminRoute = location.pathname.startsWith('/admin')

  if (isDevAdminRoute) {
    // Legacy /admin/* routes for development on localhost
    return (
      <>
        <PageTransitionOverlay />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="blog/new" element={<AdminBlogEditPage />} />
                <Route path="blog/edit/:id" element={<AdminBlogEditPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </AnimatePresence>
      </>
    )
  }

  // Regular user app
  return <UserApp />
}

export default App
