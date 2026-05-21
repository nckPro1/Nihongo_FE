import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_LOGO_URL } from '../../constants/brandAssets'
import { authService } from '../../api/services/authService'
import './auth.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await authService.forgotPassword({ email })
      setSuccess(response.message || 'Nếu email tồn tại, hệ thống đã gửi link đặt lại mật khẩu.')
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Không thể gửi email đặt lại mật khẩu'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-right auth-right--full">
        <form className="auth-card" onSubmit={onSubmit}>
          <div className="brand-strip reveal">
            <img className="brand-logo" src={BRAND_LOGO_URL} alt="Zenigo logo" />
            <span className="brand-name">Zenigo</span>
          </div>
          <h1 className="auth-title reveal reveal-delay-1">Quên mật khẩu</h1>
          <p className="auth-subtitle reveal reveal-delay-2">Nhập email để nhận link đặt lại mật khẩu qua mail.</p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="field reveal reveal-delay-2">
            <label>メール / Email</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@nihongo.jp" required />
            </div>
          </div>

          <button className="auth-button reveal reveal-delay-3" disabled={loading} type="submit">
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>

          <div className="auth-footer reveal reveal-delay-4">
            Quay lại <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
