import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { HikarigoPanelSlideLoader } from '../../components/loader/HikarigoPanelSlideLoader'
import './auth.css'

export function GoogleCallbackPage() {
  const OAUTH_STATE_KEY = 'google_oauth_state'
  const OAUTH_STATE_TS_KEY = 'google_oauth_state_ts'
  const OAUTH_CODE_LOCK_KEY = 'google_oauth_code_lock'
  const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000
  const navigate = useNavigate()
  const loginWithGoogleCode = useAuthStore((s) => s.loginWithGoogleCode)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const codeLock = localStorage.getItem(OAUTH_CODE_LOCK_KEY)
      const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY) ?? localStorage.getItem(OAUTH_STATE_KEY)
      const rawTs = sessionStorage.getItem(OAUTH_STATE_TS_KEY) ?? localStorage.getItem(OAUTH_STATE_TS_KEY)
      const stateTs = rawTs ? Number(rawTs) : NaN

      if (!code) {
        setError('Không nhận được mã xác thực Google')
        return
      }
      // Prevent duplicate callback handling (e.g. React StrictMode double-invoke in dev).
      if (codeLock === code) {
        return
      }
      if (!state || !expectedState || state !== expectedState) {
        setError('State OAuth không hợp lệ, vui lòng thử lại')
        return
      }
      if (Number.isNaN(stateTs) || Date.now() - stateTs > OAUTH_STATE_MAX_AGE_MS) {
        setError('State OAuth không hợp lệ, vui lòng thử lại')
        return
      }

      try {
        localStorage.setItem(OAUTH_CODE_LOCK_KEY, code)
        const redirectUri = (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ?? `${window.location.origin}/auth/google/callback`
        await loginWithGoogleCode({ code, redirectUri })
        sessionStorage.removeItem(OAUTH_STATE_KEY)
        sessionStorage.removeItem(OAUTH_STATE_TS_KEY)
        localStorage.removeItem(OAUTH_STATE_KEY)
        localStorage.removeItem(OAUTH_STATE_TS_KEY)
        localStorage.removeItem(OAUTH_CODE_LOCK_KEY)
        navigate('/home', { replace: true })
      } catch (err: any) {
        localStorage.removeItem(OAUTH_CODE_LOCK_KEY)
        const message = err?.response?.data?.message ?? 'Đăng nhập Google thất bại'
        setError(message)
      }
    }

    void run()
  }, [OAUTH_CODE_LOCK_KEY, OAUTH_STATE_KEY, OAUTH_STATE_MAX_AGE_MS, OAUTH_STATE_TS_KEY, loginWithGoogleCode, navigate])

  return (
    error ? (
      <main className="auth-shell">
        <section className="auth-right">
          <div className="auth-card">
            <h1 className="auth-title">Đăng nhập Google</h1>
            <div className="auth-error">{error}</div>
          </div>
        </section>
      </main>
    ) : <HikarigoPanelSlideLoader isLoading onLoadingComplete={() => {}} />
  )
}
