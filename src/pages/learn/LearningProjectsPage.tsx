import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createLearningProject, deleteLearningProject, listLearningProjects } from '../../api/services/learningProjectService'
import type { LearningProjectItem } from '../../types/learningProject'
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal'
import '../flashcards/flashcards.css'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import { AnimatedCard } from '../../components/animated/AnimatedCard'
import { AnimatedButton } from '../../components/animated/AnimatedButton'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function LearningProjectsPage() {
  const [projects, setProjects] = useState<LearningProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await listLearningProjects()
      if (res.success && res.data) {
        setProjects(res.data)
      } else {
        setProjects([])
        setError(res.message || 'Không tải được danh sách Zenigo.')
      }
    } catch {
      setProjects([])
      setError('Không tải được danh sách Zenigo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const prev = document.title
    document.title = 'Zenigo — Học tập'
    return () => {
      document.title = prev
    }
  }, [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await deleteLearningProject(confirmDelete.id)
      setProjects((prev) => prev.filter((p) => p.id !== confirmDelete.id))
      setConfirmDelete(null)
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    const n = newName.trim()
    if (!n) return
    setCreateMsg(null)
    setCreating(true)
    try {
      const res = await createLearningProject({ name: n })
      if (res.success) {
        setNewName('')
        setCreateMsg('Đã tạo Zenigo.')
        await load()
      } else {
        setCreateMsg(res.message || 'Không tạo được.')
      }
    } catch {
      setCreateMsg('Không tạo được. Thử lại sau.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AnimatedPage>
      <div className="hg-flash-page">
        {confirmDelete ? (
          <ConfirmDeleteModal
            title="Xoá bộ thẻ này?"
            target={confirmDelete.name}
            warning="Toàn bộ thẻ và tiến độ quiz bên trong sẽ bị xoá vĩnh viễn. Hành động không thể hoàn tác."
            loading={deletingId === confirmDelete.id}
            onConfirm={() => void handleDelete()}
            onCancel={() => setConfirmDelete(null)}
          />
        ) : null}
        <header className="hg-flash-header">
          <h1>Zenigo</h1>
        </header>

        <section className="hg-learn-create" aria-labelledby="hg-learn-create-title">
          <h2 id="hg-learn-create-title" className="hg-learn-create-title">
            Tạo Zenigo mới
          </h2>
          <form className="hg-learn-create-form" onSubmit={(e) => void onCreate(e)}>
            <input
              type="text"
              className="hg-learn-create-input"
              placeholder="Tên Zenigo (vd: Ôn từ N3)"
              maxLength={200}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              aria-label="Tên Zenigo"
            />
            <AnimatedButton type="submit" className="hg-flash-btn" disabled={creating || !newName.trim()} liftOnHover>
              {creating ? 'Đang tạo…' : 'Tạo Zenigo'}
            </AnimatedButton>
          </form>
          {createMsg ? <p className="hg-learn-create-msg">{createMsg}</p> : null}
        </section>

        {error ? <p className="hg-flash-err">{error}</p> : null}

        <section className="hg-learn-grid-section" aria-labelledby="hg-learn-grid-title">
          <h2 id="hg-learn-grid-title" className="hg-learn-grid-heading">
            {loading ? 'Danh sách (đang tải…)' : `Danh sách (${projects.length})`}
          </h2>
          <div className="hg-learn-grid">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="hg-learn-card-wrap">
                    <div className="hg-learn-card" style={{ pointerEvents: 'none' }}>
                      <span className="hg-learn-card-name">
                        <Skeleton width="60%" height={24} />
                      </span>
                      <span className="hg-learn-card-meta" style={{ display: 'block', marginTop: '12px' }}>
                        <Skeleton width="40%" height={16} />
                      </span>
                      <div className="hg-learn-deck-bar" style={{ marginTop: '12px', background: 'transparent' }}>
                        <Skeleton width="100%" height={8} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                      <Skeleton width={110} height={32} borderRadius={6} />
                      <Skeleton width={60} height={32} borderRadius={6} />
                    </div>
                  </div>
                ))
              : projects.map((p) => (
                  <AnimatedCard key={p.id} className="hg-learn-card-wrap">
                    <Link to={`/learn/${p.id}`} className="hg-learn-card">
                      <span className="hg-learn-card-name">{p.name}</span>
                      {p.description ? <span className="hg-learn-card-desc">{p.description}</span> : null}
                      <span className="hg-learn-card-meta">
                        {p.cardCount} thẻ
                        {p.cardCount > 0 ? (
                          <>
                            {' · '}
                            <span className="hg-learn-card-mastery">
                              Lộ trình quiz: {p.progressPercent ?? 0}%
                              {typeof p.masteredCardCount === 'number'
                                ? ` · ${p.masteredCardCount}/${p.cardCount} đã nắm chắc`
                                : null}
                            </span>
                          </>
                        ) : null}
                      </span>
                      {p.cardCount > 0 ? (
                        <div className="hg-learn-deck-bar" aria-hidden>
                          <div
                            className="hg-learn-deck-bar-fill"
                            style={{ width: `${Math.min(100, Math.max(0, p.progressPercent ?? 0))}%` }}
                          />
                        </div>
                      ) : null}
                    </Link>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/learn/${p.id}/quiz`} className="hg-learn-quiz-cta">
                        Kiểm tra (quiz)
                      </Link>
                      <button
                        type="button"
                        aria-label={`Xoá ${p.name}`}
                        onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                        style={{
                          background: 'none', border: '1px solid #fca5a5', borderRadius: '6px',
                          cursor: 'pointer', color: '#e53935', padding: '4px 8px',
                          fontSize: '12px', fontWeight: 500, lineHeight: 1.4,
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                        Xoá
                      </button>
                    </div>
                  </AnimatedCard>
                ))}
          </div>
        </section>
      </div>
    </AnimatedPage>
  )
}

