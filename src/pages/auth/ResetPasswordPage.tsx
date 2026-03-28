import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../api/services/authService'
import './auth.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/

  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') ?? '', [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ')
      return
    }
    if (!passwordRule.test(password)) {
      setError('Mật khẩu tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa và 1 số.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp')
      return
    }

    setLoading(true)
    try {
      const response = await authService.resetPassword({ token, password, confirmPassword })
      setSuccess(response.message || 'Đặt lại mật khẩu thành công')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Không thể đặt lại mật khẩu'
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
            <img className="brand-logo" src="/logo.jpg" alt="HikariGo logo" />
            <span className="brand-name">HikariGo</span>
          </div>
          <h1 className="auth-title reveal reveal-delay-1">Đặt lại mật khẩu</h1>
          <p className="auth-subtitle reveal reveal-delay-2">Nhập mật khẩu mới cho tài khoản của bạn.</p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="field reveal reveal-delay-2">
            <label>パスワード / Mật khẩu mới</label>
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
            {loading ? 'Đang xử lý...' : 'Xác nhận mật khẩu mới'}
          </button>

          <div className="auth-footer reveal reveal-delay-5">
            Quay lại <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </section>
    </main>
  )
}
