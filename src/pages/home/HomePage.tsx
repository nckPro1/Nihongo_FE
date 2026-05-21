import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createFlashcard } from '../../api/services/flashcardService'
import { listLearningProjects } from '../../api/services/learningProjectService'
import { pickDefaultProjectId } from '../../lib/learningProjectUtils'
import type { LearningProjectItem } from '../../types/learningProject'
import { quickTranslate } from '../../api/services/vocabularyService'
import { useAuthStore } from '../../store/authStore'
import type { QuickTranslateData } from '../../types/vocabulary'
import { PassageTranslateSection } from './PassageTranslateSection'
import { useSpeech } from '../../hooks/useSpeech'
import './home.css'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import { AnimatedCard } from '../../components/animated/AnimatedCard'
import { AnimatedButton } from '../../components/animated/AnimatedButton'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const DECOR_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAgJFBm1E2y8bU_x5bCM6YY1nmEkWGMW0jOVjzeMfc_D395TyCZ9z96hq2xyREiC0LX7XeJ4G7Jqp10zhYbyxbujBe5Uaq6t_DO8mXtu4z3WABWytp517GHUNDMza1aZnpfUTAJZxe_--_TrI8IopKHZYsZpVI1wFmZ7Z392gLIzBlh3wbts66VbaOEvpkTB1-nVQn9fs9uAdqfUsTYWzE3GSc869bP1FpngqCudpZlgzVwk58uBzdk3ivj5fW9z2KzZBHzSDban2rY'

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { speak } = useSpeech()
  const sessionCache = useState(() => new Map<string, QuickTranslateData>())[0]
  const [vocabQuery, setVocabQuery] = useState('')
  const [vocabLoading, setVocabLoading] = useState(false)
  const [vocabError, setVocabError] = useState<string | null>(null)
  const [vocabResult, setVocabResult] = useState<QuickTranslateData | null>(null)
  const [flashcardSaving, setFlashcardSaving] = useState(false)
  const [flashcardMsg, setFlashcardMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [learningProjects, setLearningProjects] = useState<LearningProjectItem[]>([])
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null)

  const runVocabLookup = async () => {
    const q = vocabQuery.trim()
    if (!q) return
    setVocabError(null)

    // Session cache: cùng từ trong tab không gọi lại API
    const cached = sessionCache.get(q.toLowerCase())
    if (cached) {
      setFlashcardMsg(null)
      setVocabResult(cached)
      return
    }

    setVocabLoading(true)
    try {
      const res = await quickTranslate(q)
      if (res.success && res.data) {
        setFlashcardMsg(null)
        setVocabResult(res.data)
        sessionCache.set(q.toLowerCase(), res.data)
      } else {
        setFlashcardMsg(null)
        setVocabResult(null)
        setVocabError(res.message || 'Không tra được.')
      }
    } catch (err: unknown) {
      setFlashcardMsg(null)
      setVocabResult(null)
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thể tra cứu. Kiểm tra mạng hoặc thử lại sau.'
      setVocabError(m)
    } finally {
      setVocabLoading(false)
    }
  }

  useEffect(() => {
    const prev = document.title
    document.title = 'Zenigo — Trang chủ'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    if (!user) return
    void (async () => {
      const res = await listLearningProjects()
      if (res.success && res.data) {
        setLearningProjects(res.data)
        setTargetProjectId((prev) => {
          if (prev && res.data!.some((p) => p.id === prev)) return prev
          return pickDefaultProjectId(res.data!)
        })
      }
    })()
  }, [user])

  const displayName = user?.name?.trim() || 'bạn học'

  const monthYear = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const hasFlashcardPayload =
    !!vocabResult?.kanji?.trim() && !!vocabResult?.meaning?.trim()
  const showFlashcardRow = hasFlashcardPayload || !!flashcardMsg
  const canAddFlashcard = hasFlashcardPayload && !flashcardSaving && !!targetProjectId

  const addVocabToFlashcards = async () => {
    if (!vocabResult?.kanji?.trim() || !vocabResult?.meaning?.trim() || !targetProjectId) return
    setFlashcardMsg(null)
    setFlashcardSaving(true)
    try {
      const res = await createFlashcard({
        projectId: targetProjectId,
        kanji: vocabResult.kanji.trim(),
        reading: vocabResult.romaji?.trim() || undefined,
        meaning: vocabResult.meaning.trim(),
        direction: vocabResult.direction ?? undefined,
        sourceQuery: vocabQuery.trim() || undefined,
      })
      if (res.success) {
        setFlashcardMsg({ type: 'ok', text: res.message || 'Đã thêm thẻ vào Zenigo đã chọn.' })
        const pr = await listLearningProjects()
        if (pr.success && pr.data) {
          setLearningProjects(pr.data)
        }
      } else {
        setFlashcardMsg({ type: 'err', text: res.message || 'Không thêm được.' })
      }
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Không thêm được. Thử lại sau.'
      setFlashcardMsg({ type: 'err', text: m })
    } finally {
      setFlashcardSaving(false)
    }
  }

  const vocabDirection = vocabResult?.direction === 'vi_jp' ? 'vi_jp' : 'jp_vi'
  const vocabLabels =
    vocabDirection === 'vi_jp'
      ? {
          badge: 'Việt → Nhật',
          main: 'Tiếng Nhật (dịch)',
          reading: 'Hiragana (đọc)',
          extra: 'Từ gốc (Việt)',
        }
      : {
          badge: 'Nhật → Việt',
          main: 'Từ / kanji (Nhật)',
          reading: 'Hiragana (đọc)',
          extra: 'Nghĩa + đọc',
        }

  return (
    <AnimatedPage>
      <header className="hg-header">
        <div>
          <p className="hg-kicker">光へ (HIKARI E)</p>
          <h1 className="hg-title">
            Chào mừng trở lại,
            <br />
            <span className="hg-title-accent">{displayName}</span>
          </h1>
          <p className="hg-lead">
            Zenigo giúp bạn học tiếng Nhật có lộ trình: từ vựng, ngữ pháp và luyện đề JLPT — từng bước, đều đặn mỗi
            ngày.
          </p>
        </div>
        <div className="hg-pill">
          <span className="hg-pill-dot" />
          <span className="hg-pill-text">HÔM NAY: ÔN 15 PHÚT</span>
        </div>
      </header>

      <div className="hg-bento">
        <AnimatedCard className="hg-card hg-bento-card--sm">
          <span className="material-symbols-outlined hg-icon-xl" aria-hidden>
            style
          </span>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hg-card-icon-wrap">
              <span className="material-symbols-outlined">flip</span>
            </div>
            <h3>Ôn tập từ vựng</h3>
            <p>
              Học theo chủ đề và cấp độ JLPT (N5–N1), kèm ví dụ câu — phù hợp người Việt luyện đọc và ghi nhớ.
            </p>
            <Link to="/learn" className="hg-card-cta">
              VÀO HỌC <span className="material-symbols-outlined hg-icon-sm">arrow_forward</span>
            </Link>
          </div>
        </AnimatedCard>

        <AnimatedCard className="hg-card hg-card--border hg-bento-card--lg" noHover>
          <div className="hg-search-row">
            <div style={{ flex: 1 }}>
              <span className="hg-tag">Tra cứu nhanh</span>
              <h3 className="hg-h3-lg">Từ điển &amp; ngữ cảnh</h3>
              <div className="hg-search-input-wrap">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="search"
                  placeholder="VD: ăn cơm, nhật bản — hoặc 木漏れ日, 頑張る…"
                  autoComplete="off"
                  maxLength={50}
                  value={vocabQuery}
                  onChange={(e) => setVocabQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void runVocabLookup()
                    }
                  }}
                />
                {vocabQuery.length > 30 && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '90px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.75rem',
                      color: vocabQuery.length >= 50 ? '#ef4444' : '#f59e0b',
                      fontWeight: 600,
                    }}
                  >
                    {vocabQuery.length}/50
                  </span>
                )}
                <AnimatedButton
                  type="button"
                  className="hg-search-btn"
                  disabled={vocabLoading || !vocabQuery.trim()}
                  onClick={() => void runVocabLookup()}
                >
                  {vocabLoading ? '…' : 'Tra cứu'}
                </AnimatedButton>
              </div>
              {vocabError ? <p className="hg-vocab-error">{vocabError}</p> : null}
              
              {vocabLoading ? (
                <div className="hg-vocab-result" style={{ marginTop: '1.5rem' }}>
                  <p className="hg-vocab-direction">
                    <Skeleton width={100} height={16} />
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <Skeleton width={80} height={14} style={{ marginBottom: '0.25rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Skeleton width={180} height={28} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Skeleton width={100} height={14} style={{ marginBottom: '0.25rem' }} />
                    <Skeleton width={140} height={20} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Skeleton width={100} height={14} style={{ marginBottom: '0.25rem' }} />
                    <Skeleton width="90%" height={20} />
                  </div>
                  <div className="hg-vocab-flashcard-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Skeleton width={200} height={38} style={{ borderRadius: '0.5rem' }} />
                    <Skeleton width={130} height={38} style={{ borderRadius: '0.5rem' }} />
                  </div>
                </div>
              ) : vocabResult ? (
                <div className="hg-vocab-result">
                  <p className="hg-vocab-direction" aria-label="Hướng tra cứu">
                    {vocabLabels.badge}
                  </p>
                  {vocabResult.kanji ? (
                    <>
                      <h4>{vocabLabels.main}</h4>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {vocabResult.kanji}
                        <button
                          type="button"
                          aria-label="Phát âm"
                          onClick={() => vocabResult.kanji && speak(vocabResult.kanji)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1, color: '#4f46e5' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>volume_up</span>
                        </button>
                      </p>
                    </>
                  ) : null}
                  {vocabResult.romaji ? (
                    <>
                      <h4>{vocabLabels.reading}</h4>
                      <p>{vocabResult.romaji}</p>
                    </>
                  ) : null}
                  {vocabResult.meaning ? (
                    <>
                      <h4>{vocabLabels.extra}</h4>
                      <p>{vocabResult.meaning}</p>
                    </>
                  ) : null}
                  {showFlashcardRow ? (
                    <div className="hg-vocab-flashcard-row">
                      {learningProjects.length > 0 ? (
                        <div className="hg-vocab-project-row">
                          <label htmlFor="hg-vocab-target-project">Thêm vào Zenigo</label>
                          <select
                            id="hg-vocab-target-project"
                            className="hg-vocab-project-select"
                            value={targetProjectId ?? ''}
                            onChange={(e) => setTargetProjectId(e.target.value || null)}
                          >
                            {learningProjects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.cardCount} thẻ)
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                      <AnimatedButton
                        type="button"
                        className="hg-vocab-flashcard-btn"
                        disabled={!canAddFlashcard}
                        onClick={() => void addVocabToFlashcards()}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }} aria-hidden>
                          bookmark_add
                        </span>
                        {flashcardSaving ? 'Đang thêm…' : 'Thêm vào Zenigo'}
                      </AnimatedButton>
                      <Link to="/learn" className="hg-sidebar-user-sub" style={{ fontWeight: 600 }}>
                        Mở học tập →
                      </Link>
                      {flashcardMsg ? (
                        <p
                          className={`hg-vocab-flashcard-msg hg-vocab-flashcard-msg--${flashcardMsg.type === 'ok' ? 'ok' : 'err'}`}
                        >
                          {flashcardMsg.text}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="hg-kanji-box">
              <img src={DECOR_IMG} alt="" />
              <span>辞書</span>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="hg-card hg-bento-card--wide">
          <div className="hg-progress-head">
            <h4>Tiến độ lộ trình</h4>
            <span>{monthYear}</span>
          </div>
          <div
            className={`hg-progress-rows${learningProjects.length > 4 ? ' hg-progress-rows--scroll' : ''}`}
          >
            {!user ? (
              <p className="hg-progress-empty">
                <Link to="/login">Đăng nhập</Link> để xem tiến độ quiz theo tên Zenigo.
              </p>
            ) : learningProjects.length === 0 ? (
              <p className="hg-progress-empty">
                Chưa có Zenigo.{' '}
                <Link to="/learn">Mở Học tập</Link> để tạo Zenigo và làm quiz — tiến độ sẽ hiện tại đây.
              </p>
            ) : (
              learningProjects.map((p) => {
                const pct = Math.min(100, Math.max(0, p.progressPercent ?? 0))
                return (
                  <div key={p.id} className="hg-progress-row">
                    <div className="hg-progress-labels">
                      <span className="hg-progress-folder" title={p.name}>
                        {p.name}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="hg-bar">
                      <div className="hg-bar-fill" style={{ width: `${pct}%` }} />
                      <div className="hg-bar-knob" style={{ left: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {user && learningProjects.length > 0 ? (
            <Link to="/learn" className="hg-progress-foot-link">
              Quản lý Zenigo &amp; quiz →
            </Link>
          ) : null}
        </AnimatedCard>

        <AnimatedCard className="hg-pro-card hg-bento-card--side">
          <div>
            <div className="hg-pro-head">
              <span>Gói học</span>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", color: 'var(--hg-tertiary-fixed-dim)' }}
              >
                stars
              </span>
            </div>
            <h3>Zenigo Pro</h3>
            <p>Mở khóa bộ đề luyện JLPT đầy đủ và nội dung nâng cao (khi tính năng được bật trên tài khoản).</p>
          </div>
          <div>
            <p className="hg-pro-status-label">Trạng thái</p>
            <p className="hg-pro-status-value">{user?.isPro ? 'Zenigo Pro — đang hoạt động' : 'Gói miễn phí'}</p>
            <AnimatedButton type="button" className="hg-pro-btn" liftOnHover>
              {user?.isPro ? 'Quản lý gói' : 'Tìm hiểu Pro'}
            </AnimatedButton>
          </div>
        </AnimatedCard>
      </div>

      <PassageTranslateSection />

      <footer className="hg-footer">
        <div className="hg-footer-links">
          <span>Zenigo © {new Date().getFullYear()}</span>
          <span>Bảo mật</span>
          <span>Điều khoản</span>
        </div>
        <div className="hg-footer-motto">光へ、一歩ずつ</div>
      </footer>
    </AnimatedPage>
  )
}
