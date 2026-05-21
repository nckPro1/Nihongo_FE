import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listLearningProjects } from '../../api/services/learningProjectService'
import { createFlashcard, createFlashcardsBatch, deleteFlashcard, listFlashcards } from '../../api/services/flashcardService'
import { parseBulkFlashcardLines } from '../../lib/parseBulkFlashcards'
import { isValidUuid } from '../../lib/uuid'
import type { FlashcardItem } from '../../types/flashcard'
import { useSpeech } from '../../hooks/useSpeech'
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal'
import './flashcards.css'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import { AnimatedButton } from '../../components/animated/AnimatedButton'
import { FlipCard } from '../../components/animated/FlipCard'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
  const { speak } = useSpeech()

  const [projectName, setProjectName] = useState('')
  const [deckProgressPct, setDeckProgressPct] = useState<number | null>(null)
  const [deckMastered, setDeckMastered] = useState<{ n: number; total: number } | null>(null)
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

  const [bulkPaste, setBulkPaste] = useState('')
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkMsg, setBulkMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; kanji: string } | null>(null)

  const bulkPreview = useMemo(() => parseBulkFlashcardLines(bulkPaste), [bulkPaste])

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
      if (p && p.cardCount > 0) {
        setDeckProgressPct(p.progressPercent ?? 0)
        setDeckMastered({
          n: p.masteredCardCount ?? 0,
          total: p.cardCount,
        })
      } else {
        setDeckProgressPct(null)
        setDeckMastered(null)
      }
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
      const resP = await listLearningProjects()
      const meta = resP.success ? resP.data?.find((x) => x.id === projectId) : undefined
      if (meta && meta.cardCount > 0) {
        setDeckProgressPct(meta.progressPercent ?? 0)
        setDeckMastered({ n: meta.masteredCardCount ?? 0, total: meta.cardCount })
      } else {
        setDeckProgressPct(null)
        setDeckMastered(null)
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

  const handleDeleteFlashcard = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await deleteFlashcard(confirmDelete.id)
      setCards((prev) => prev.filter((c) => c.id !== confirmDelete.id))
      setStudyIdx((prev) => Math.max(0, prev - 1))
      setConfirmDelete(null)
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const submitBulk = async () => {
    if (!projectId || !isValidUuid(projectId)) return
    const { items, invalidLineCount } = parseBulkFlashcardLines(bulkPaste)
    if (items.length === 0) {
      setBulkMsg({
        type: 'err',
        text:
          invalidLineCount > 0
            ? 'Không có dòng hợp lệ. Kiểm tra định dạng (tab, |, hoặc " - ").'
            : 'Dán ít nhất một dòng theo định dạng đã gợi ý.',
      })
      return
    }
    setBulkMsg(null)
    setBulkSaving(true)
    try {
      const res = await createFlashcardsBatch({ projectId, items })
      if (res.success && res.data) {
        const extra: string[] = []
        if (invalidLineCount > 0) extra.push(`${invalidLineCount} dòng bỏ qua khi đọc (sai định dạng)`)
        const base = res.message || `Đã thêm ${res.data.created} thẻ.`
        setBulkMsg({
          type: 'ok',
          text: extra.length ? `${base} ${extra.join(' · ')}` : base,
        })
        setBulkPaste('')
        await load()
      } else {
        setBulkMsg({ type: 'err', text: res.message || 'Không thêm được hàng loạt.' })
      }
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thêm được. Thử lại sau.'
      setBulkMsg({ type: 'err', text: m })
    } finally {
      setBulkSaving(false)
    }
  }

  useEffect(() => {
    const prev = document.title
    document.title = projectName ? `${projectName} — Flashcard` : 'Flashcard — Zenigo'
    return () => {
      document.title = prev
    }
  }, [projectName])

  const progressPct = cards.length > 0 ? ((studyIdx + 1) / cards.length) * 100 : 0

  if (!projectId || !isValidUuid(projectId)) {
    return null
  }

  return (
    <AnimatedPage>
      <div className="hg-flash-page">
        <nav className="hg-flash-breadcrumb" aria-label="Điều hướng">
          <Link to="/learn">Zenigo</Link>
          <span aria-hidden> / </span>
          <span>{projectName || '…'}</span>
          <span aria-hidden> · </span>
          <Link to={`/learn/${projectId}/quiz`}>Kiểm tra</Link>
        </nav>

        <header className="hg-flash-header">
          <h1>{projectName ? `Flashcard · ${projectName}` : 'Flashcard'}</h1>
          <p className="hg-flash-lead">
            Nhấp vào thẻ để lật · phím Space lật · ← → chuyển thẻ.{' '}
            <Link to={`/learn/${projectId}/quiz`} className="hg-flash-inline-link">
              Làm quiz trắc nghiệm
            </Link>
            {deckProgressPct !== null && deckMastered ? (
              <>
                {' '}
                · Lộ trình (quiz): <strong>{deckProgressPct}%</strong> — {deckMastered.n}/{deckMastered.total} thẻ đạt mức
                nắm chắc (≥80%).
              </>
            ) : null}
          </p>
          {deckProgressPct !== null ? (
            <div className="hg-flash-deck-progress-track" aria-label="Tiến độ lộ trình quiz">
              <div className="hg-flash-deck-progress-fill" style={{ width: `${deckProgressPct}%` }} />
            </div>
          ) : null}
        </header>

        {error ? <p className="hg-flash-err">{error}</p> : null}

        {loading ? (
          <section className="hg-flash-learn" style={{ pointerEvents: 'none' }}>
            <div className="hg-flash-learn-head">
              <h2 className="hg-flash-learn-title">Ôn tập</h2>
              <div className="hg-flash-learn-meta">
                <Skeleton width={60} height={20} />
              </div>
            </div>
            <div className="hg-flash-progress-track" style={{ background: '#f3f4f6' }}>
              <Skeleton width="100%" height={6} />
            </div>
            <div className="hg-flash-card-row">
              <div className="hg-flash-nav-btn" style={{ opacity: 0.5 }}>
                <span className="material-symbols-outlined">chevron_left</span>
              </div>
              <div className="hg-flip-scene-wrap" style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '220px', gap: '0.75rem' }}>
                <Skeleton width={120} height={16} />
                <Skeleton width={200} height={36} />
                <Skeleton width={140} height={20} />
              </div>
              <div className="hg-flash-nav-btn" style={{ opacity: 0.5 }}>
                <span className="material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </section>
        ) : cards.length > 0 && current ? (
          <section className="hg-flash-learn" aria-labelledby="hg-flash-learn-title">
            <div className="hg-flash-learn-head">
              <h2 id="hg-flash-learn-title" className="hg-flash-learn-title">
                Ôn tập
              </h2>
              <div className="hg-flash-learn-meta">
                <span className="hg-flash-count">
                  {studyIdx + 1} / {cards.length}
                </span>
                <AnimatedButton
                  type="button"
                  className="hg-flash-icon-btn"
                  onClick={reshuffle}
                  title="Xáo thứ tự"
                  aria-label="Xáo thứ tự"
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    shuffle
                  </span>
                </AnimatedButton>
              </div>
            </div>

            <div className="hg-flash-progress-track" aria-hidden>
              <div className="hg-flash-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="hg-flash-card-row">
              <AnimatedButton
                type="button"
                className="hg-flash-nav-btn"
                onClick={goPrev}
                aria-label="Thẻ trước"
                liftOnHover
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </AnimatedButton>

              <FlipCard
                className="hg-flip-scene-wrap"
                isFlipped={flipped}
                onFlip={toggleFlip}
                front={
                  <div className="hg-flip-face hg-flip-face--front" lang="ja" style={{ height: '100%' }}>
                    <span className="hg-flip-kicker">Thuật ngữ</span>
                    <p className="hg-flip-main">{current.kanji}</p>
                    {current.reading ? <p className="hg-flip-sub">{current.reading}</p> : null}
                    <span className="hg-flip-hint">Nhấp để lật</span>
                  </div>
                }
                back={
                  <div className="hg-flip-face hg-flip-face--back" lang="vi" style={{ height: '100%', transform: 'none' }}>
                    <span className="hg-flip-kicker">Định nghĩa</span>
                    <p className="hg-flip-main hg-flip-main--back">{current.meaning}</p>
                    <span className="hg-flip-hint">Nhấp để lật</span>
                  </div>
                }
              />

              <AnimatedButton
                type="button"
                className="hg-flash-nav-btn"
                onClick={goNext}
                aria-label="Thẻ sau"
                liftOnHover
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </AnimatedButton>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <AnimatedButton
                type="button"
                aria-label="Phát âm"
                onClick={() => speak(flipped ? (current.reading || current.kanji) : current.kanji)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: '1px solid #e0e0e8', borderRadius: '20px',
                  padding: '4px 14px', cursor: 'pointer', color: '#4f46e5', fontSize: '13px', fontWeight: 500,
                }}
                liftOnHover
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>volume_up</span>
                Phát âm
              </AnimatedButton>
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
              <AnimatedButton type="submit" className="hg-flash-btn" disabled={manualSaving} liftOnHover>
                {manualSaving ? 'Đang thêm…' : 'Thêm vào Zenigo'}
              </AnimatedButton>
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

        <section className="hg-flash-manual hg-flash-bulk" aria-labelledby="hg-flash-bulk-title">
          <h2 id="hg-flash-bulk-title">Thêm hàng loạt</h2>
          <p className="hg-flash-bulk-hint">
            Mỗi dòng một thẻ. Dùng <strong>tab</strong>, dấu <strong>|</strong>, hoặc <strong> - </strong> (có khoảng
            trắng hai bên) để tách cột.
          </p>
          <ul className="hg-flash-bulk-examples">
            <li>
              <code>頑張る	gần	cố gắng</code> — 3 cột: tiếng Nhật · đọc · nghĩa
            </li>
            <li>
              <code>仕事 | しごと | công việc</code>
            </li>
            <li>
              <code>猫 - con mèo</code> — 2 cột (không đọc)
            </li>
          </ul>
          <label className="hg-flash-field hg-flash-field--block">
            <span>Dán danh sách</span>
            <textarea
              rows={8}
              lang="ja"
              value={bulkPaste}
              onChange={(e) => setBulkPaste(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  void submitBulk()
                }
              }}
              placeholder={'頑張る\tgần\tcố gắng\n猫 - con mèo'}
              className="hg-flash-bulk-textarea"
              spellCheck={false}
            />
          </label>
          {bulkPaste.trim() ? (
            <p className="hg-flash-bulk-preview" role="status">
              Nhận diện <strong>{bulkPreview.items.length}</strong> thẻ
              {bulkPreview.invalidLineCount > 0 ? (
                <>
                  {' '}
                  · <strong>{bulkPreview.invalidLineCount}</strong> dòng không đúng định dạng (sẽ bỏ qua khi gửi)
                </>
              ) : null}
            </p>
          ) : null}
          <div className="hg-flash-manual-actions">
            <AnimatedButton type="button" className="hg-flash-btn" disabled={bulkSaving} onClick={() => void submitBulk()} liftOnHover>
              {bulkSaving ? 'Đang thêm…' : 'Thêm tất cả vào Zenigo'}
            </AnimatedButton>
            <span className="hg-flash-bulk-kbd-hint">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> gửi nhanh
            </span>
            {bulkMsg ? (
              <p
                className={`hg-flash-manual-msg hg-flash-manual-msg--${bulkMsg.type === 'ok' ? 'ok' : 'err'}`}
                role="status"
              >
                {bulkMsg.text}
              </p>
            ) : null}
          </div>
        </section>

        {confirmDelete ? (
          <ConfirmDeleteModal
            title="Xoá thẻ này?"
            target={confirmDelete.kanji}
            warning="Tiến độ quiz của thẻ cũng sẽ bị xoá. Hành động không thể hoàn tác."
            loading={deletingId === confirmDelete.id}
            onConfirm={() => void handleDeleteFlashcard()}
            onCancel={() => setConfirmDelete(null)}
          />
        ) : null}

        <section className="hg-flash-list" aria-labelledby="hg-flash-list-title">
          <h2 id="hg-flash-list-title">
            {loading ? 'Danh sách (đang tải…)' : `Danh sách (${cards.length})`}
          </h2>
          {!loading && cards.length === 0 ? (
            <div className="hg-flash-empty">
              Chưa có thẻ trong Zenigo này. Thêm từng thẻ, dán hàng loạt (mục trên), hoặc dùng{' '}
              <Link to="/home">tra cứu nhanh</Link> rồi chọn thêm vào flashcard (chọn đúng Zenigo trên trang chủ).
            </div>
          ) : null}
          <div className="hg-flash-rows">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="hg-flash-row" style={{ pointerEvents: 'none' }}>
                    <div className="hg-flash-row-main" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Skeleton width={120} height={20} />
                      <Skeleton width={80} height={14} />
                      <Skeleton width={180} height={16} />
                    </div>
                    <div className="hg-flash-row-mastery">
                      <Skeleton width={40} height={14} style={{ marginBottom: '4px' }} />
                      <Skeleton width="100%" height={8} />
                    </div>
                  </div>
                ))
              : cards.map((c) => (
                  <article key={c.id} className="hg-flash-row" lang="ja">
                    <div className="hg-flash-row-main">
                      <div className="hg-flash-ja">{c.kanji}</div>
                      {c.reading ? <div className="hg-flash-reading">{c.reading}</div> : null}
                      <div className="hg-flash-meaning">{c.meaning}</div>
                    </div>
                    <div className="hg-flash-row-mastery" title="Tiến độ nắm qua quiz (0–100)">
                      <span className="hg-flash-mastery-label">{c.masteryScore ?? 0}%</span>
                      <div className="hg-flash-mastery-bar" aria-hidden>
                        <div
                          className="hg-flash-mastery-fill"
                          style={{ width: `${Math.min(100, Math.max(0, c.masteryScore ?? 0))}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Xoá thẻ"
                      onClick={() => setConfirmDelete({ id: c.id, kanji: c.kanji })}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#e53935', padding: '4px', borderRadius: '4px', lineHeight: 1,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </article>
                ))}
          </div>
        </section>
      </div>
    </AnimatedPage>
  )
}

