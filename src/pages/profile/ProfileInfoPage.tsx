import { useEffect, useRef, useState } from 'react'
import { authService } from '../../api/services/authService'
import { useAuthStore } from '../../store/authStore'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import './profile.css'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export function ProfileInfoPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [name, setName] = useState('')
  const [jlptLevel, setJlptLevel] = useState<string>('N5')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setJlptLevel(user.jlptLevel ?? 'N5')
    }
  }, [user])

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'H'

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    try {
      const res = await authService.updateProfile({
        name: name.trim(),
        jlptLevel,
      })
      setUser(res.data)
      setMsg({ type: 'ok', text: 'Đã lưu thông tin.' })
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể lưu. Thử lại sau.'
      setMsg({ type: 'err', text: m })
    } finally {
      setSaving(false)
    }
  }

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAvatarBusy(true)
    setMsg(null)
    try {
      const res = await authService.uploadAvatar(file)
      setUser(res.data)
      setMsg({ type: 'ok', text: 'Đã cập nhật ảnh đại diện.' })
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const apiMsg = ax.response?.data?.message
      if (import.meta.env.DEV) {
        console.error('[avatar upload]', ax.response?.status, apiMsg ?? ax.message, err)
      }
      setMsg({
        type: 'err',
        text:
          apiMsg ??
          (ax.response?.status === 401
            ? 'Phiên đăng nhập hết hạn — đăng nhập lại.'
            : 'Không thể tải ảnh. Kiểm tra Cloudinary (CLOUDINARY_*), backend và định dạng file.'),
      })
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <AnimatedPage variant="fadeOnly">
      <div className="profile-card">
        <h3>Ảnh đại diện</h3>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hg-avatar-input"
          aria-hidden
          tabIndex={-1}
          onChange={onAvatarFile}
        />
        <div className="profile-avatar-row">
          <div className="profile-avatar-preview">
            {user?.avatar ? <img src={user.avatar} alt="" /> : initial}
          </div>
          <div>
            <button
              type="button"
              className="profile-btn"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarBusy}
            >
              {avatarBusy ? 'Đang tải…' : 'Chọn ảnh mới'}
            </button>
            <p className="profile-msg" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--hg-outline)' }}>
              Chỉ tải ảnh tại đây. Định dạng: JPG, PNG, WebP…
            </p>
          </div>
        </div>
      </div>

      <form className="profile-card" onSubmit={onSave}>
        <h3>Thông tin cơ bản</h3>
        <div className="profile-field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" type="email" value={user?.email ?? ''} disabled autoComplete="email" />
        </div>
        <div className="profile-field">
          <label htmlFor="profile-name">Tên hiển thị</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            minLength={1}
            maxLength={255}
          />
        </div>
        <div className="profile-field">
          <label htmlFor="profile-jlpt">Trình độ JLPT mục tiêu</label>
          <select id="profile-jlpt" value={jlptLevel} onChange={(e) => setJlptLevel(e.target.value)}>
            {JLPT_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
          {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        {msg && (
          <p className={`profile-msg ${msg.type === 'err' ? 'profile-msg--err' : 'profile-msg--ok'}`}>{msg.text}</p>
        )}
      </form>
    </AnimatedPage>
  )
}
