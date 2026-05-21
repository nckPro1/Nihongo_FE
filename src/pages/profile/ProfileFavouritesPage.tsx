import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listFavourites, removeFavourite } from '../../api/services/favouriteService'
import { FAVOURITE_TARGET_GRAMMAR } from '../../types/grammar'
import type { FavouriteItem } from '../../types/favourite'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './profile.css'

function formatSavedAt(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export function ProfileFavouritesPage() {
  const [items, setItems] = useState<FavouriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listFavourites()
      if (!res.success) {
        setItems([])
        setError(res.message || 'Không tải được danh sách.')
        return
      }
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (err: unknown) {
      setItems([])
      const ax = err as {
        response?: { status?: number; data?: { message?: string } }
        message?: string
      }
      const serverMsg = ax.response?.data?.message
      const hint404 =
        ax.response?.status === 404
          ? 'Không thấy API /api/favourites (GET). Hãy chạy lại backend bản mới nhất sau khi pull code.'
          : null
      setError(serverMsg || hint404 || ax.message || 'Không tải được. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const prev = document.title
    document.title = 'Yêu thích — Zenigo'
    return () => {
      document.title = prev
    }
  }, [])

  const onRemove = async (it: FavouriteItem) => {
    setRemovingId(it.targetId)
    try {
      const res = await removeFavourite(it.targetType, it.targetId)
      if (res.success) {
        setItems((rows) => rows.filter((x) => x.targetId !== it.targetId))
      }
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <AnimatedPage variant="fadeOnly">
      <div className="profile-card">
        <h3>Đã đánh dấu</h3>
        <p className="profile-fav-intro">
          Các mục bạn bấm &quot;Yêu thích&quot; ở ngữ pháp (and sau này blog) hiển thị tại đây.
        </p>

        {loading ? (
          <ul className="profile-fav-list" style={{ pointerEvents: 'none' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="profile-fav-item">
                <div className="profile-fav-main" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <Skeleton width={60} height={18} style={{ borderRadius: '0.25rem' }} />
                    <Skeleton width={150} height={20} />
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <Skeleton width="85%" height={14} />
                  </div>
                  <div>
                    <Skeleton width="30%" height={12} />
                  </div>
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <Skeleton width={36} height={28} style={{ borderRadius: '0.35rem' }} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {error ? <p className="profile-fav-err">{error}</p> : null}

        {!loading && !error && items.length === 0 ? (
          <p className="profile-muted">Chưa có mục yêu thích nào.</p>
        ) : null}

        {!loading && items.length > 0 ? (
          <ul className="profile-fav-list">
            {items.map((it) => {
              const canOpenGrammar =
                it.targetType === FAVOURITE_TARGET_GRAMMAR &&
                !it.resourceMissing &&
                it.grammarJlptLevel
              const href =
                canOpenGrammar && it.grammarJlptLevel
                  ? `/grammar/${it.grammarJlptLevel}/${it.targetId}`
                  : null

              return (
                <li key={`${it.targetType}-${it.targetId}`} className="profile-fav-item">
                  <div className="profile-fav-main">
                    <span className="profile-fav-badge">{it.targetType}</span>
                    {href ? (
                      <Link to={href} className="profile-fav-title" lang={it.targetType === 'GRAMMAR' ? 'ja' : undefined}>
                        {it.title}
                      </Link>
                    ) : (
                      <span className="profile-fav-title profile-fav-title--static">{it.title}</span>
                    )}
                    {it.detail ? <p className="profile-fav-detail">{it.detail}</p> : null}
                    <p className="profile-fav-meta">Đã lưu · {formatSavedAt(it.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="profile-fav-remove"
                    disabled={removingId === it.targetId}
                    onClick={() => void onRemove(it)}
                  >
                    {removingId === it.targetId ? '…' : 'Bỏ'}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </AnimatedPage>
  )
}
