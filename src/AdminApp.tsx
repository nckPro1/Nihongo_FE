import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AdminProtectedRoute } from './components/auth/AdminProtectedRoute'
import { PageTransitionOverlay } from './components/transition/PageTransitionOverlay'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminBlogPage } from './pages/admin/AdminBlogPage'
import { AdminBlogEditPage } from './pages/admin/AdminBlogEditPage'

/**
 * Admin-only app for admin.zenigo.com subdomain
 * Routes are at root level (/ instead of /admin/*)
 */
export function AdminApp() {
  const location = useLocation()

  return (
    <>
      <PageTransitionOverlay />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public admin login */}
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected admin routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<AdminDashboardPage />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/blog" element={<AdminBlogPage />} />
              <Route path="/blog/new" element={<AdminBlogEditPage />} />
              <Route path="/blog/edit/:id" element={<AdminBlogEditPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
