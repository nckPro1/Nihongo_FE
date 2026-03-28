import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listLearningProjects } from '../../api/services/learningProjectService'
import { createFlashcard, listFlashcards } from '../../api/services/flashcardService'
import { isValidUuid } from '../../lib/uuid'
import type { FlashcardItem } from '../../types/flashcard'
import './flashcards.css'

function shuffleIndices(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [projectName, setProjectName] = useState('')
  const [cards, setCards] = useState<FlashcardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studyIdx, setStudyIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [orderKey, setOrderKey] = useState(0)

  const [manualJa, setManualJa] = useState('')
  const [manualReading, setManualReading] = useState('')
  const [manualMeaning, setManualMeaning] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const [manualMsg, setManualMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!projectId || !isValidUuid(projectId)) {
      navigate('/learn', { replace: true })
    }
  }, [projectId, navigate])

  useEffect(() => {
    if (!projectId || !isValidUuid(projectId)) return
    void (async () => {
      const res = await listLearningProjects()
      const p = res.success ? res.data?.find((x) => x.id === projectId) : undefined
      setProjectName(p?.name ?? '')
    })()
  }, [projectId])

  const cardKey = useMemo(() => cards.map((c) => c.id).join('|'), [cards])

  const order = useMemo(() => {
    if (cards.length === 0) return []
    return shuffleIndices(cards.length)
  }, [cardKey, orderKey, cards.length])

  const load = useCallback(async () => {
    if (!projectId || !isValidUuid(projectId)) return
    setError(null)
    setLoading(true)
    try {
      const res = await listFlashcards(projectId)
      if (res.success && res.data) {
        setCards(res.data)
      } else {
        setCards([])
        setError(res.message || 'Không tải được danh sách.')
      }
    } catch {
      setCards([])
      setError('Không tải được danh sách. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setStudyIdx(0)
    setFlipped(false)
  }, [cardKey, orderKey])

  const current =
    cards.length > 0 && order.length === cards.length ? cards[order[studyIdx] ?? 0] : null

  const goNext = useCallback(() => {
    if (cards.length === 0) return
    setFlipped(false)
    setStudyIdx((i) => (i + 1 >= cards.length ? 0 : i + 1))
  }, [cards.length])

  const goPrev = useCallback(() => {
    if (cards.length === 0) return
    setFlipped(false)
    setStudyIdx((i) => (i <= 0 ? cards.length - 1 : i - 1))
  }, [cards.length])

  const toggleFlip = useCallback(() => {
    setFlipped((f) => !f)
  }, [])

  const reshuffle = () => setOrderKey((k) => k + 1)

  useEffect(() => {
    if (!current || cards.length === 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggleFlip()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, cards.length, toggleFlip, goNext, goPrev])

  const submitManual = async (e: FormEvent) => {
    e.preventDefault()
    if (!projectId || !isValidUuid(projectId)) return
    const ja = manualJa.trim()
    const mean = manualMeaning.trim()
    if (!ja || !mean) {
      setManualMsg({ type: 'err', text: 'Điền ít nhất từ/cụm tiếng Nhật và nghĩa tiếng Việt.' })
      return
    }
    setManualMsg(null)
    setManualSaving(true)
    try {
      const res = await createFlashcard({
        projectId,
        kanji: ja,
        reading: manualReading.trim() || undefined,
        meaning: mean,
        sourceQuery: undefined,
      })
      if (res.success) {
        setManualJa('')
        setManualReading('')
        setManualMeaning('')
        setManualMsg({ type: 'ok', text: res.message || 'Đã thêm thẻ.' })
        await load()
      } else {
        setManualMsg({ type: 'err', text: res.message || 'Không thêm được.' })
      }
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thêm được. Thử lại sau.'
      setManualMsg({ type: 'err', text: m })
    } finally {
      setManualSaving(false)
    }
  }

  useEffect(() => {
    const prev = document.title
    document.title = projectName ? `${projectName} — Flashcard` : 'Flashcard — HikariGo'
    return () => {
      document.title = prev
    }
  }, [projectName])

  const progressPct = cards.length > 0 ? ((studyIdx + 1) / cards.length) * 100 : 0

  if (!projectId || !isValidUuid(projectId)) {
    return null
  }

  return (
    <div className="hg-flash-page">
      <nav className="hg-flash-breadcrumb" aria-label="Điều hướng">
        <Link to="/learn">Dự án học tập</Link>
        <span aria-hidden> / </span>
        <span>{projectName || '…'}</span>
      </nav>

      <header className="hg-flash-header">
        <h1>{projectName ? `Flashcard · ${projectName}` : 'Flashcard'}</h1>
        <p className="hg-flash-lead">
          Nhấp vào thẻ để lật · phím Space lật · ← → chuyển thẻ.
        </p>
      </header>

      {loading ? <p className="hg-flash-lead">Đang tải…</p> : null}
      {error ? <p className="hg-flash-err">{error}</p> : null}

      {!loading && cards.length > 0 && current ? (
        <section className="hg-flash-learn" aria-labelledby="hg-flash-learn-title">
          <div className="hg-flash-learn-head">
            <h2 id="hg-flash-learn-title" className="hg-flash-learn-title">
              Ôn tập
            </h2>
            <div className="hg-flash-learn-meta">
              <span className="hg-flash-count">
                {studyIdx + 1} / {cards.length}
              </span>
              <button
                type="button"
                className="hg-flash-icon-btn"
                onClick={reshuffle}
                title="Xáo thứ tự"
                aria-label="Xáo thứ tự"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  shuffle
                </span>
              </button>
            </div>
          </div>

          <div className="hg-flash-progress-track" aria-hidden>
            <div className="hg-flash-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="hg-flash-card-row">
            <button
              type="button"
              className="hg-flash-nav-btn"
              onClick={goPrev}
              aria-label="Thẻ trước"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="hg-flip-scene-wrap">
              <button
                type="button"
                className={`hg-flip-scene${flipped ? ' hg-flip-scene--show-back' : ''}`}
                onClick={toggleFlip}
                aria-pressed={flipped}
                aria-label={flipped ? 'Đang xem nghĩa, nhấp để xem tiếng Nhật' : 'Đang xem tiếng Nhật, nhấp để lật xem nghĩa'}
              >
                <div className="hg-flip-card">
                  <div className="hg-flip-face hg-flip-face--front" lang="ja">
                    <span className="hg-flip-kicker">Thuật ngữ</span>
                    <p className="hg-flip-main">{current.kanji}</p>
                    {current.reading ? <p className="hg-flip-sub">{current.reading}</p> : null}
                    <span className="hg-flip-hint">Nhấp để lật</span>
                  </div>
                  <div className="hg-flip-face hg-flip-face--back" lang="vi">
                    <span className="hg-flip-kicker">Định nghĩa</span>
                    <p className="hg-flip-main hg-flip-main--back">{current.meaning}</p>
                    <span className="hg-flip-hint">Nhấp để lật</span>
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              className="hg-flash-nav-btn"
              onClick={goNext}
              aria-label="Thẻ sau"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <p className="hg-flash-keyboard-hint">
            <kbd>Space</kbd> lật thẻ · <kbd>←</kbd> <kbd>→</kbd> chuyển thẻ
          </p>
        </section>
      ) : null}

      <section className="hg-flash-manual" aria-labelledby="hg-flash-manual-title">
        <h2 id="hg-flash-manual-title">Thêm thẻ thủ công</h2>
        <form className="hg-flash-manual-form" onSubmit={(e) => void submitManual(e)}>
          <label className="hg-flash-field">
            <span>Tiếng Nhật (từ / cụm / kanji)</span>
            <input
              type="text"
              lang="ja"
              maxLength={2000}
              value={manualJa}
              onChange={(e) => setManualJa(e.target.value)}
              placeholder="VD: 頑張る、仕事をする…"
              autoComplete="off"
            />
          </label>
          <label className="hg-flash-field">
            <span>Đọc (hiragana / romaji, tùy chọn)</span>
            <input
              type="text"
              lang="ja"
              maxLength={1000}
              value={manualReading}
              onChange={(e) => setManualReading(e.target.value)}
              placeholder="VD: がんばる"
              autoComplete="off"
            />
          </label>
          <label className="hg-flash-field hg-flash-field--block">
            <span>Nghĩa tiếng Việt</span>
            <textarea
              rows={3}
              maxLength={4000}
              value={manualMeaning}
              onChange={(e) => setManualMeaning(e.target.value)}
              placeholder="VD: cố gắng, nỗ lực"
            />
          </label>
          <div className="hg-flash-manual-actions">
            <button type="submit" className="hg-flash-btn" disabled={manualSaving}>
              {manualSaving ? 'Đang thêm…' : 'Thêm vào dự án'}
            </button>
            {manualMsg ? (
              <p
                className={`hg-flash-manual-msg hg-flash-manual-msg--${manualMsg.type === 'ok' ? 'ok' : 'err'}`}
                role="status"
              >
                {manualMsg.text}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="hg-flash-list" aria-labelledby="hg-flash-list-title">
        <h2 id="hg-flash-list-title">Danh sách ({cards.length})</h2>
        {!loading && cards.length === 0 ? (
          <div className="hg-flash-empty">
            Chưa có thẻ trong dự án này. Thêm thủ công ở trên hoặc dùng{' '}
            <Link to="/home">tra cứu nhanh</Link> rồi chọn thêm vào flashcard (chọn đúng dự án trên trang chủ).
          </div>
        ) : null}
        <div className="hg-flash-rows">
          {cards.map((c) => (
            <article key={c.id} className="hg-flash-row" lang="ja">
              <div className="hg-flash-ja">{c.kanji}</div>
              {c.reading ? <div className="hg-flash-reading">{c.reading}</div> : null}
              <div className="hg-flash-meaning">{c.meaning}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
