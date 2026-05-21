import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BRAND_LOGO_URL } from '../../constants/brandAssets'
import { useAuthStore } from '../../store/authStore'
import './auth.css'

export function RegisterPage() {
  const OAUTH_STATE_KEY = 'google_oauth_state'
  const OAUTH_STATE_TS_KEY = 'google_oauth_state_ts'
  const register = useAuthStore((s) => s.register)
  const loading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!passwordRule.test(password)) {
      setError('Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa và 1 số.')
      return
    }
    try {
      await register({ name, email, password, confirmPassword })
      setSuccess('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Đăng ký thất bại'
      setError(message)
    }
  }

  const onGoogleLogin = () => {
    if (!googleClientId) {
      setError('Thiếu cấu hình Google Client ID ở frontend')
      return
    }
    setError('')
    setSuccess('')
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
          <img className="brand-logo" src={BRAND_LOGO_URL} alt="Zenigo logo" />
          <span className="brand-name">Zenigo</span>
        </div>
        <div className="auth-left-content reveal reveal-delay-1">
          <h2 className="jp-title reveal reveal-delay-1">日本語を学ぼう</h2>
          <div className="left-figure reveal reveal-delay-2">
            <img
              src={BRAND_LOGO_URL}
              alt="Zenigo logo"
            />
            <div className="left-blob-a" />
            <div className="left-blob-b" />
          </div>
          <p className="left-subtitle reveal reveal-delay-3">Bắt đầu hành trình học tiếng Nhật ngay hôm nay.</p>
          <p className="left-copy reveal reveal-delay-4">Đăng ký tài khoản để theo dõi tiến độ học, lưu bài học yêu thích và thực hành mỗi ngày.</p>
        </div>
        <div className="stamp reveal reveal-delay-5">登録</div>
      </section>

      <section className="auth-right">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="brand-strip reveal">
            <img className="brand-logo" src={BRAND_LOGO_URL} alt="Zenigo logo" />
            <span className="brand-name">Zenigo</span>
          </div>
          <h1 className="auth-title reveal reveal-delay-1">Tạo tài khoản của bạn</h1>
          <p className="auth-subtitle reveal reveal-delay-2">Học tiếng Nhật với luồng học tập thông minh.</p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="field reveal reveal-delay-2">
            <label>お名前 / Họ và tên</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tanaka Taro" required />
            </div>
          </div>
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
            <small className="field-help">Tối thiểu 8 ký tự, có chữ hoa và số.</small>
          </div>
          <div className="field reveal reveal-delay-3">
            <label>再入力 / Xác nhận mật khẩu</label>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>

          <button className="auth-button reveal reveal-delay-4" disabled={loading} type="submit">
            {loading ? 'Đang xử lý...' : 'Đăng ký / 登録'}
          </button>

          <div className="auth-divider reveal reveal-delay-4">または / OR</div>
          <button className="google-btn reveal reveal-delay-5" type="button" onClick={onGoogleLogin}>
            <img className="google-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Đăng ký với Google
          </button>

          <div className="auth-footer reveal reveal-delay-5">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
