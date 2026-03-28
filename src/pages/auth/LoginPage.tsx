import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './auth.css'

export function LoginPage() {
  const OAUTH_STATE_KEY = 'google_oauth_state'
  const OAUTH_STATE_TS_KEY = 'google_oauth_state_ts'
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email, password })
      navigate('/home')
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Đăng nhập thất bại'
      setError(message)
    }
  }

  const onGoogleLogin = () => {
    if (!googleClientId) {
      setError('Thiếu cấu hình Google Client ID ở frontend')
      return
    }
    setError('')
    const redirectUri = (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ?? `${window.location.origin}/auth/google/callback`
    const state = crypto.randomUUID()
    const now = Date.now().toString()
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
    sessionStorage.setItem(OAUTH_STATE_TS_KEY, now)
    localStorage.setItem(OAUTH_STATE_KEY, state)
    localStorage.setItem(OAUTH_STATE_TS_KEY, now)

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  return (
    <main className="auth-shell">
      <section className="auth-left">
        <div className="floating-brand reveal">
          <img className="brand-logo" src="/logo.jpg" alt="HikariGo logo" />
          <span className="brand-name">HikariGo</span>
        </div>
        <div className="auth-left-content reveal reveal-delay-1">
          <h2 className="jp-title reveal reveal-delay-1">日本語を学ぼう</h2>
          <div className="left-figure reveal reveal-delay-2">
            <img
              src="/logo.jpg"
              alt="HikariGo logo"
            />
            <div className="left-blob-a" />
            <div className="left-blob-b" />
          </div>
          <p className="left-subtitle reveal reveal-delay-3">Chinh phục ngôn ngữ xứ sở mặt trời mọc.</p>
          <p className="left-copy reveal reveal-delay-4">Tham gia cộng đồng học tiếng Nhật với trải nghiệm hiện đại, đơn giản và tập trung.</p>
        </div>
        <div className="stamp reveal reveal-delay-5">第一</div>
      </section>

      <section className="auth-right">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="brand-strip reveal">
            <img className="brand-logo" src="/logo.jpg" alt="HikariGo logo" />
            <span className="brand-name">HikariGo</span>
          </div>
          <h1 className="auth-title reveal reveal-delay-1">Đăng nhập tài khoản</h1>
          <p className="auth-subtitle reveal reveal-delay-2">Tiếp tục hành trình học tiếng Nhật của bạn.</p>
          {error && <div className="auth-error">{error}</div>}

          <div className="field reveal reveal-delay-2">
            <label>メール / Email</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@nihongo.jp" required />
            </div>
          </div>
          <div className="field reveal reveal-delay-3">
            <label>パスワード / Mật khẩu</label>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="field-action">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </div>

          <button className="auth-button reveal reveal-delay-4" disabled={loading} type="submit">
            {loading ? 'Đang xử lý...' : 'Đăng nhập / ログイン'}
          </button>

          <div className="auth-divider reveal reveal-delay-4">または / OR</div>
          <button className="google-btn reveal reveal-delay-5" type="button" onClick={onGoogleLogin}>
            <img className="google-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Tiếp tục với Google
          </button>

          <div className="auth-footer reveal reveal-delay-5">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
