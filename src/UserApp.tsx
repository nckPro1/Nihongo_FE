import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { GoogleCallbackPage } from './pages/auth/GoogleCallbackPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { HomePage } from './pages/home/HomePage'
import { FlashcardsPage } from './pages/flashcards/FlashcardsPage'
import { FlashcardQuizPage } from './pages/learn/FlashcardQuizPage'
import { LearningProjectsPage } from './pages/learn/LearningProjectsPage'
import { GrammarDetailPage } from './pages/grammar/GrammarDetailPage'
import { GrammarLibraryPage } from './pages/grammar/GrammarLibraryPage'
import { GrammarListPage } from './pages/grammar/GrammarListPage'
import { MainLayout } from './layouts/MainLayout'
import { ProfilePage } from './pages/profile/ProfilePage'
import { ProfileInfoPage } from './pages/profile/ProfileInfoPage'
import { ProfileSecurityPage } from './pages/profile/ProfileSecurityPage'
import { ProfileFavouritesPage } from './pages/profile/ProfileFavouritesPage'
import { ProfileTransactionsPage } from './pages/profile/ProfileTransactionsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PageTransitionOverlay } from './components/transition/PageTransitionOverlay'
import { BlogListPage } from './pages/blog/BlogListPage'
import { BlogDetailPage } from './pages/blog/BlogDetailPage'

/**
 * User app for zenigo.com main domain
 * Regular user routes (no admin access)
 */
export function UserApp() {
  const location = useLocation()

  return (
    <>
      <PageTransitionOverlay />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/learn" element={<LearningProjectsPage />} />
              <Route path="/learn/:projectId/quiz" element={<FlashcardQuizPage />} />
              <Route path="/learn/:projectId" element={<FlashcardsPage />} />
              <Route path="/grammar/:level/:pointId" element={<GrammarDetailPage />} />
              <Route path="/grammar/:level" element={<GrammarListPage />} />
              <Route path="/grammar" element={<GrammarLibraryPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/flashcards" element={<Navigate to="/learn" replace />} />
              <Route path="/profile" element={<ProfilePage />}>
                <Route index element={<ProfileInfoPage />} />
                <Route path="security" element={<ProfileSecurityPage />} />
                <Route path="favourites" element={<ProfileFavouritesPage />} />
                <Route path="transactions" element={<ProfileTransactionsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
