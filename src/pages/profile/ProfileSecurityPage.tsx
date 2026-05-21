import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../api/services/authService'
import { useAuthStore } from '../../store/authStore'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import './profile.css'

export function ProfileSecurityPage() {
  const hasPassword = useAuthStore((s) => s.user?.hasPassword)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      await authService.changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMsg({ type: 'ok', text: 'Đã đổi mật khẩu.' })
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể đổi mật khẩu.'
      setMsg({ type: 'err', text: m })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatedPage variant="fadeOnly">
      <div className="profile-card">
        <h3>Đổi mật khẩu</h3>
        {!hasPassword ? (
          <p className="profile-lead" style={{ marginBottom: '1rem' }}>
            Tài khoản đăng nhập bằng Google — không có mật khẩu trên Zenigo. Bạn có thể dùng{' '}
            <Link to="/forgot-password" className="profile-link">
              quên mật khẩu
            </Link>{' '}
            với email đã đăng ký để đặt mật khẩu mới (nếu cần).
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="profile-field">
              <label htmlFor="cur-pw">Mật khẩu hiện tại</label>
              <input
                id="cur-pw"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="profile-field">
              <label htmlFor="new-pw">Mật khẩu mới</label>
              <input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--hg-outline)', marginTop: '0.35rem' }}>
                Ít nhất 8 ký tự, có chữ hoa và số.
              </p>
            </div>
            <div className="profile-field">
              <label htmlFor="cf-pw">Nhập lại mật khẩu mới</label>
              <input
                id="cf-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="profile-btn profile-btn--primary" disabled={busy}>
              {busy ? 'Đang xử lý…' : 'Cập nhật mật khẩu'}
            </button>
            {msg && (
              <p className={`profile-msg ${msg.type === 'err' ? 'profile-msg--err' : 'profile-msg--ok'}`}>{msg.text}</p>
            )}
          </form>
        )}
      </div>
    </AnimatedPage>
  )
}
