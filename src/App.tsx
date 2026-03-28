import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { GoogleCallbackPage } from './pages/auth/GoogleCallbackPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { HomePage } from './pages/home/HomePage'
import { FlashcardsPage } from './pages/flashcards/FlashcardsPage'
import { LearningProjectsPage } from './pages/learn/LearningProjectsPage'
import { MainLayout } from './layouts/MainLayout'
import { ProfilePage } from './pages/profile/ProfilePage'
import { ProfileInfoPage } from './pages/profile/ProfileInfoPage'
import { ProfileSecurityPage } from './pages/profile/ProfileSecurityPage'
import { ProfileTransactionsPage } from './pages/profile/ProfileTransactionsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PageTransitionOverlay } from './components/transition/PageTransitionOverlay'

function App() {
  return (
    <>
      <PageTransitionOverlay />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/learn" element={<LearningProjectsPage />} />
            <Route path="/learn/:projectId" element={<FlashcardsPage />} />
            <Route path="/flashcards" element={<Navigate to="/learn" replace />} />
            <Route path="/profile" element={<ProfilePage />}>
              <Route index element={<ProfileInfoPage />} />
              <Route path="security" element={<ProfileSecurityPage />} />
              <Route path="transactions" element={<ProfileTransactionsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
