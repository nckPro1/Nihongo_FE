import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createLearningProject, listLearningProjects } from '../../api/services/learningProjectService'
import type { LearningProjectItem } from '../../types/learningProject'
import '../flashcards/flashcards.css'

export function LearningProjectsPage() {
  const [projects, setProjects] = useState<LearningProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await listLearningProjects()
      if (res.success && res.data) {
        setProjects(res.data)
      } else {
        setProjects([])
        setError(res.message || 'Không tải được danh sách dự án.')
      }
    } catch {
      setProjects([])
      setError('Không tải được danh sách dự án.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const prev = document.title
    document.title = 'Dự án học tập — HikariGo'
    return () => {
      document.title = prev
    }
  }, [])

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
        setCreateMsg('Đã tạo dự án.')
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
    <div className="hg-flash-page">
      <header className="hg-flash-header">
        <h1>Dự án học tập</h1>
        <p className="hg-flash-lead">
          Mỗi dự án là một &quot;folder&quot; chứa bộ flashcard riêng. Chọn dự án để ôn thẻ hoặc tạo dự án mới (ví dụ:
          JLPT N3, Từ vựng sách X).
        </p>
      </header>

      <section className="hg-learn-create" aria-labelledby="hg-learn-create-title">
        <h2 id="hg-learn-create-title" className="hg-learn-create-title">
          Tạo dự án mới
        </h2>
        <form className="hg-learn-create-form" onSubmit={(e) => void onCreate(e)}>
          <input
            type="text"
            className="hg-learn-create-input"
            placeholder="Tên dự án (vd: Ôn từ N3)"
            maxLength={200}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Tên dự án"
          />
          <button type="submit" className="hg-flash-btn" disabled={creating || !newName.trim()}>
            {creating ? 'Đang tạo…' : 'Tạo dự án'}
          </button>
        </form>
        {createMsg ? <p className="hg-learn-create-msg">{createMsg}</p> : null}
      </section>

      {loading ? <p className="hg-flash-lead">Đang tải…</p> : null}
      {error ? <p className="hg-flash-err">{error}</p> : null}

      <section className="hg-learn-grid-section" aria-labelledby="hg-learn-grid-title">
        <h2 id="hg-learn-grid-title" className="hg-learn-grid-heading">
          Danh sách ({projects.length})
        </h2>
        <div className="hg-learn-grid">
          {projects.map((p) => (
            <Link key={p.id} to={`/learn/${p.id}`} className="hg-learn-card">
              <span className="hg-learn-card-name">{p.name}</span>
              {p.description ? <span className="hg-learn-card-desc">{p.description}</span> : null}
              <span className="hg-learn-card-meta">{p.cardCount} thẻ</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
