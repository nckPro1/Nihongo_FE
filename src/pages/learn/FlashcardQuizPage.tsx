import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useSoundEffects } from '../../hooks/useSoundEffects'
import { listLearningProjects, submitQuizResults } from '../../api/services/learningProjectService'
import { listFlashcards } from '../../api/services/flashcardService'
import {
  buildQuizPlan,
  enabledFormatList,
  gradeKeyboardAnswerDetailed,
  type GradeResult,
  minCardsForQuizFormats,
  type FlashcardQuizMode,
  type QuizPlanItem,
  type QuizQuestionFormat,
  type QuizSessionFormats,
  quizJaPromptLines,
  quizOptionLabel,
} from '../../lib/flashcardQuiz'
import { isValidUuid } from '../../lib/uuid'
import type { FlashcardItem } from '../../types/flashcard'
import '../flashcards/flashcards.css'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import { AnimatedButton } from '../../components/animated/AnimatedButton'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type Phase = 'pick-mode' | 'quiz' | 'summary'

type SessionConfig = {
  mode: FlashcardQuizMode
  formats: QuizSessionFormats
  mixFormatsPerQuestion: boolean
  fixedFormat: QuizQuestionFormat
  questionCount: number
}

function formatBadgeVi(f: QuizQuestionFormat): string {
  if (f === 'mcq') return 'Trắc nghiệm'
  if (f === 'keyboard') return 'Gõ đáp án'
  return 'Đúng / Sai'
}

export function FlashcardQuizPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { playSuccess, playError } = useSoundEffects()

  const [projectName, setProjectName] = useState('')
  const [cards, setCards] = useState<FlashcardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [phase, setPhase] = useState<Phase>('pick-mode')
  const [dirMode, setDirMode] = useState<FlashcardQuizMode>('ja-vi')
  const [fmtMcq, setFmtMcq] = useState(true)
  const [fmtKb, setFmtKb] = useState(true)
  const [fmtTf, setFmtTf] = useState(true)
  const [mixRandom, setMixRandom] = useState(true)
  const [fixedFormat, setFixedFormat] = useState<QuizQuestionFormat>('mcq')
  /** 0 = chưa đồng bộ với bộ thẻ; sau khi load sẽ gán = số thẻ */
  const [questionCount, setQuestionCount] = useState(0)

  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null)
  const [plan, setPlan] = useState<QuizPlanItem[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)

  const [selectedMcqId, setSelectedMcqId] = useState<string | null>(null)
  const [kbInput, setKbInput] = useState('')
  const [kbDone, setKbDone] = useState(false)
  const [kbResult, setKbResult] = useState<GradeResult | null>(null)
  const [isOverridden, setIsOverridden] = useState(false)
  const [tfPick, setTfPick] = useState<boolean | null>(null)

  const sessionResultsRef = useRef<{ flashcardId: string; correct: boolean }[]>([])
  const kbInputRef = useRef<HTMLTextAreaElement>(null)
  const [progressSync, setProgressSync] = useState<'idle' | 'ok' | 'err'>('idle')

  const formats: QuizSessionFormats = useMemo(
    () => ({ mcq: fmtMcq, keyboard: fmtKb, truefalse: fmtTf }),
    [fmtMcq, fmtKb, fmtTf],
  )

  const enabledFormats = useMemo(() => enabledFormatList(formats), [formats])
  const minNeed = minCardsForQuizFormats(formats)
  const resolvedQuestionCount =
    cards.length === 0
      ? 0
      : Math.max(1, Math.min(questionCount <= 0 ? cards.length : questionCount, cards.length))
  const canStart =
    enabledFormats.length > 0 &&
    cards.length >= minNeed &&
    resolvedQuestionCount >= 1 &&
    resolvedQuestionCount <= cards.length

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
    if (!enabledFormats.includes(fixedFormat) && enabledFormats.length > 0) {
      setFixedFormat(enabledFormats[0]!)
    }
  }, [enabledFormats, fixedFormat])

  useEffect(() => {
    if (cards.length === 0) return
    setQuestionCount((c) => {
      if (c <= 0) return cards.length
      return Math.min(c, cards.length)
    })
  }, [cards.length])

  const current = plan[qIndex] ?? null
  const totalQ = plan.length

  const answered = useMemo(() => {
    if (!current) return false
    if (current.format === 'mcq') return selectedMcqId !== null
    if (current.format === 'keyboard') return kbDone
    return tfPick !== null
  }, [current, selectedMcqId, kbDone, tfPick])

  const progressPct =
    totalQ > 0 ? ((qIndex + (answered ? 1 : 0)) / totalQ) * 100 : 0

  const resetQuestionState = () => {
    setSelectedMcqId(null)
    setKbInput('')
    setKbDone(false)
    setKbResult(null)
    setIsOverridden(false)
    setTfPick(null)
  }

  const beginQuiz = (cfg: SessionConfig) => {
    if (cards.length < minCardsForQuizFormats(cfg.formats)) return
    const enabled = enabledFormatList(cfg.formats)
    if (enabled.length === 0) return
    const fix = enabled.includes(cfg.fixedFormat) ? cfg.fixedFormat : enabled[0]!
    const nextPlan = buildQuizPlan({
      cards,
      mode: cfg.mode,
      formats: cfg.formats,
      mixFormatsPerQuestion: cfg.mixFormatsPerQuestion && enabled.length > 1,
      fixedFormat: fix,
      questionCount: cfg.questionCount,
    })
    sessionResultsRef.current = []
    setProgressSync('idle')
    setSessionConfig(cfg)
    setPlan(nextPlan)
    setQIndex(0)
    setScore(0)
    resetQuestionState()
    setPhase('quiz')
  }

  const onClickStart = () => {
    if (!canStart) return
    const enabled = enabledFormats
    const mix = mixRandom && enabled.length > 1
    const fix = enabled.includes(fixedFormat) ? fixedFormat : enabled[0]!
    beginQuiz({
      mode: dirMode,
      formats,
      mixFormatsPerQuestion: mix,
      fixedFormat: fix,
      questionCount: resolvedQuestionCount,
    })
  }

  const resetToPicker = () => {
    sessionResultsRef.current = []
    setProgressSync('idle')
    setPhase('pick-mode')
    setPlan([])
    setSessionConfig(null)
    setQIndex(0)
    setScore(0)
    resetQuestionState()
  }

  const onChooseMcq = useCallback((choiceId: string) => {
    if (!current || current.format !== 'mcq' || selectedMcqId !== null) return
    setSelectedMcqId(choiceId)
    if (choiceId === current.target.id) {
      setScore((s) => s + 1)
      playSuccess()
    } else {
      playError()
    }
  }, [current, selectedMcqId, playSuccess, playError])

  const submitKeyboard = useCallback(() => {
    if (!current || current.format !== 'keyboard' || kbDone) return
    const result = gradeKeyboardAnswerDetailed(kbInput, current.target, current.mode)
    setKbResult(result)
    setKbDone(true)
    if (result.isCorrect) {
      setScore((s) => s + 1)
      playSuccess()
    } else {
      playError()
    }
  }, [current, kbInput, kbDone, playSuccess, playError])

  const onChooseTf = useCallback((userSaysTrue: boolean) => {
    if (!current || current.format !== 'truefalse' || tfPick !== null) return
    setTfPick(userSaysTrue)
    const ok = userSaysTrue === current.statementTrue
    if (ok) {
      setScore((s) => s + 1)
      playSuccess()
    } else {
      playError()
    }
  }, [current, tfPick, playSuccess, playError])

  const handleOverrideCorrect = () => {
    if (!kbResult || kbResult.isCorrect || isOverridden) return
    setIsOverridden(true)
    setKbResult({
      ...kbResult,
      isCorrect: true,
      feedbackType: 'override'
    })
    setScore((s) => s + 1)
    playSuccess()
  }

  const goNext = useCallback(() => {
    if (!current) return
    const ok =
      current.format === 'mcq'
        ? selectedMcqId === current.target.id
        : current.format === 'keyboard'
          ? (kbResult?.isCorrect ?? false)
          : tfPick === current.statementTrue
    sessionResultsRef.current.push({ flashcardId: current.target.id, correct: ok })
    if (qIndex + 1 >= plan.length) {
      setPhase('summary')
      return
    }
    setQIndex((i) => i + 1)
    resetQuestionState()
  }, [current, selectedMcqId, kbResult, tfPick, qIndex, plan.length])

  // Tự động focus vào ô gõ chữ khi chuyển câu hỏi
  useEffect(() => {
    if (current && current.format === 'keyboard' && !kbDone) {
      setTimeout(() => {
        kbInputRef.current?.focus()
      }, 50)
    }
  }, [qIndex, current, kbDone])

  // Phím tắt toàn cục cho phiên kiểm tra
  useEffect(() => {
    if (phase !== 'quiz' || !current) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      
      if (e.key === 'Enter') {
        if (current.format === 'keyboard') {
          if (kbDone) {
            e.preventDefault()
            goNext()
          } else if (!isTyping) {
            e.preventDefault()
            submitKeyboard()
          }
        } else if (current.format === 'mcq' && selectedMcqId !== null) {
          e.preventDefault()
          goNext()
        } else if (current.format === 'truefalse' && tfPick !== null) {
          e.preventDefault()
          goNext()
        }
      } else if (!isTyping) {
        if (current.format === 'truefalse' && tfPick === null) {
          if (e.key === '1' || e.key === 'y' || e.key === 't' || e.key === 'ArrowLeft') {
            e.preventDefault()
            onChooseTf(true)
          } else if (e.key === '2' || e.key === 'n' || e.key === 'f' || e.key === 'ArrowRight') {
            e.preventDefault()
            onChooseTf(false)
          }
        } else if (current.format === 'mcq' && selectedMcqId === null) {
          if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key, 10) - 1
            if (current.choices[idx]) {
              e.preventDefault()
              onChooseMcq(current.choices[idx]!.id)
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [phase, current, kbDone, selectedMcqId, tfPick, goNext, submitKeyboard, onChooseTf, onChooseMcq])

  useEffect(() => {
    if (phase === 'summary' && score > 0) {
      const duration = 2 * 1000
      const end = Date.now() + duration

      const frame = () => {
        void confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.85 },
          colors: ['#ffd1dc', '#fbcfe8', '#f472b6', '#db2777'],
        })
        void confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.85 },
          colors: ['#ffd1dc', '#fbcfe8', '#f472b6', '#db2777'],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [phase, score])

  useEffect(() => {
    if (phase !== 'summary' || !projectId) return
    const rows = sessionResultsRef.current
    if (rows.length === 0) return
    let cancelled = false
    void (async () => {
      try {
        const res = await submitQuizResults(projectId, rows)
        if (!cancelled) setProgressSync(res.success ? 'ok' : 'err')
      } catch {
        if (!cancelled) setProgressSync('err')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [phase, projectId])

  const repeatSession = () => {
    if (sessionConfig) beginQuiz(sessionConfig)
  }

  useEffect(() => {
    const prev = document.title
    document.title =
      projectName && phase === 'quiz'
        ? `Quiz · ${projectName} — Zenigo`
        : projectName
          ? `Kiểm tra · ${projectName} — Zenigo`
          : 'Kiểm tra — Zenigo'
    return () => {
      document.title = prev
    }
  }, [projectName, phase])

  const promptMcqOrKb = useMemo(() => {
    if (!current || (current.format !== 'mcq' && current.format !== 'keyboard')) return null
    if (current.mode === 'ja-vi') {
      const { main, reading } = quizJaPromptLines(current.target)
      return (
        <div className="hg-quiz-prompt" lang="ja">
          <span className="hg-quiz-prompt-kicker">
            {current.format === 'mcq' ? 'Chọn nghĩa đúng' : 'Gõ nghĩa tiếng Việt'}
          </span>
          <p className="hg-quiz-prompt-main">{main}</p>
          {reading ? <p className="hg-quiz-prompt-sub">{reading}</p> : null}
        </div>
      )
    }
    return (
      <div className="hg-quiz-prompt" lang="vi">
        <span className="hg-quiz-prompt-kicker">
          {current.format === 'mcq' ? 'Chọn tiếng Nhật đúng' : 'Gõ từ / kanji (có thể thêm đọc: kanji · đọc)'}
        </span>
        <p className="hg-quiz-prompt-main hg-quiz-prompt-main--vi">{current.target.meaning}</p>
      </div>
    )
  }, [current])

  const tfBlock = useMemo(() => {
    if (!current || current.format !== 'truefalse') return null
    return (
      <div className="hg-quiz-tf-pair" role="group" aria-label="Cặp từ cần đánh giá">
        <p className="hg-quiz-tf-q">Cặp dưới đây có khớp với nhau không?</p>
        <div className="hg-quiz-tf-cols">
          <div className="hg-quiz-tf-box" lang="ja">
            <span className="hg-quiz-tf-label">Tiếng Nhật</span>
            <p className="hg-quiz-tf-text">{current.showJa}</p>
          </div>
          <div className="hg-quiz-tf-box" lang="vi">
            <span className="hg-quiz-tf-label">Tiếng Việt</span>
            <p className="hg-quiz-tf-text">{current.showVi}</p>
          </div>
        </div>
      </div>
    )
  }, [current])

  if (!projectId || !isValidUuid(projectId)) {
    return null
  }

  const mcqCorrect =
    current?.format === 'mcq' && selectedMcqId !== null
      ? selectedMcqId === current.target.id
      : null
  const tfCorrect =
    current?.format === 'truefalse' && tfPick !== null
      ? tfPick === current.statementTrue
      : null

  return (
    <AnimatedPage>
      <div className="hg-flash-page hg-quiz-page">
        <nav className="hg-flash-breadcrumb" aria-label="Điều hướng">
          <Link to="/learn">Zenigo</Link>
          <span aria-hidden> / </span>
          <Link to={`/learn/${projectId}`}>{projectName || '…'}</Link>
          <span aria-hidden> / </span>
          <span>Kiểm tra</span>
        </nav>

        <header className="hg-flash-header">
          <h1>{projectName ? `Kiểm tra · ${projectName}` : 'Kiểm tra'}</h1>
          <p className="hg-flash-lead">
            Chọn hướng và định dạng câu hỏi: trắc nghiệm, gõ đáp án, hoặc đúng / sai. Có thể bật nhiều loại và xáo ngẫu
            nhiên từng câu. Kết thúc phiên, hệ thống lưu từng câu đúng/sai để tính tiến độ nắm từ (%) cho cả bộ thẻ.
          </p>
        </header>

        {error ? <p className="hg-flash-err">{error}</p> : null}

        {loading ? (
          <section className="hg-quiz-setup" style={{ pointerEvents: 'none' }}>
            <h2 className="hg-quiz-setup-title">
              <Skeleton width="40%" height={24} />
            </h2>

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">
                <Skeleton width="20%" height={16} />
              </legend>
              <div className="hg-quiz-mode-grid hg-quiz-mode-grid--compact">
                <div className="hg-quiz-mode-card" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                  <Skeleton width="60%" height={18} style={{ marginBottom: '6px' }} />
                  <Skeleton width="90%" height={14} />
                </div>
                <div className="hg-quiz-mode-card" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                  <Skeleton width="60%" height={18} style={{ marginBottom: '6px' }} />
                  <Skeleton width="90%" height={14} />
                </div>
              </div>
            </fieldset>

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">
                <Skeleton width="30%" height={16} />
              </legend>
              <div className="hg-quiz-check-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="50%" height={20} />
                <Skeleton width="40%" height={20} />
                <Skeleton width="45%" height={20} />
              </div>
            </fieldset>

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">
                <Skeleton width="15%" height={16} />
              </legend>
              <div className="hg-quiz-count-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <Skeleton width="100%" height={12} />
                </div>
                <Skeleton width={60} height={24} />
              </div>
            </fieldset>

            <Skeleton width={120} height={38} style={{ borderRadius: '6px', marginTop: '1rem' }} />
          </section>
        ) : null}

        {!loading && !error && cards.length === 0 ? (
          <div className="hg-flash-empty hg-quiz-empty">
            <p>
              Chưa có thẻ trong Zenigo.{' '}
              <Link to={`/learn/${projectId}`}>Quay lại flashcard</Link> để thêm thẻ.
            </p>
          </div>
        ) : null}

        {!loading && !error && cards.length > 0 && phase === 'pick-mode' ? (
          <section className="hg-quiz-setup" aria-labelledby="hg-quiz-setup-title">
            <h2 id="hg-quiz-setup-title" className="hg-quiz-setup-title">
              Cài đặt phiên kiểm tra
            </h2>

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">Hướng câu hỏi</legend>
              <div className="hg-quiz-mode-grid hg-quiz-mode-grid--compact">
                <button
                  type="button"
                  className={`hg-quiz-mode-card${dirMode === 'ja-vi' ? ' hg-quiz-mode-card--active' : ''}`}
                  onClick={() => setDirMode('ja-vi')}
                >
                  <span className="hg-quiz-mode-name">Tiếng Nhật → Tiếng Việt</span>
                  <span className="hg-quiz-mode-desc">Hỏi từ / kanji, đáp nghĩa.</span>
                </button>
                <button
                  type="button"
                  className={`hg-quiz-mode-card${dirMode === 'vi-ja' ? ' hg-quiz-mode-card--active' : ''}`}
                  onClick={() => setDirMode('vi-ja')}
                >
                  <span className="hg-quiz-mode-name">Tiếng Việt → Tiếng Nhật</span>
                  <span className="hg-quiz-mode-desc">Hỏi nghĩa, đáp từ (có đọc).</span>
                </button>
              </div>
            </fieldset>

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">Định dạng câu hỏi (chọn một hoặc nhiều)</legend>
              <div className="hg-quiz-check-grid">
                <label className="hg-quiz-check">
                  <input type="checkbox" checked={fmtMcq} onChange={(e) => setFmtMcq(e.target.checked)} />
                  <span>Trắc nghiệm (4 lựa chọn khi đủ thẻ)</span>
                </label>
                <label className="hg-quiz-check">
                  <input type="checkbox" checked={fmtKb} onChange={(e) => setFmtKb(e.target.checked)} />
                  <span>Gõ đáp án</span>
                </label>
                <label className="hg-quiz-check">
                  <input type="checkbox" checked={fmtTf} onChange={(e) => setFmtTf(e.target.checked)} />
                  <span>Đúng / Sai (cặp Nhật – Việt)</span>
                </label>
              </div>
              {enabledFormats.length === 0 ? (
                <p className="hg-quiz-setup-warn">Chọn ít nhất một định dạng.</p>
              ) : null}
            </fieldset>

            {enabledFormats.length > 1 ? (
              <fieldset className="hg-quiz-fieldset">
                <legend className="hg-quiz-legend">Cách gán định dạng</legend>
                <label className="hg-quiz-radio-line">
                  <input
                    type="radio"
                    name="mixfmt"
                    checked={mixRandom}
                    onChange={() => setMixRandom(true)}
                  />
                  <span>Ngẫu nhiên mỗi câu (trong các loại đã bật)</span>
                </label>
                <label className="hg-quiz-radio-line">
                  <input
                    type="radio"
                    name="mixfmt"
                    checked={!mixRandom}
                    onChange={() => setMixRandom(false)}
                  />
                  <span>Một định dạng cả phiên:</span>
                  <select
                    className="hg-quiz-format-select"
                    value={fixedFormat}
                    onChange={(e) => setFixedFormat(e.target.value as QuizQuestionFormat)}
                    disabled={mixRandom}
                  >
                    {fmtMcq ? <option value="mcq">Trắc nghiệm</option> : null}
                    {fmtKb ? <option value="keyboard">Gõ đáp án</option> : null}
                    {fmtTf ? <option value="truefalse">Đúng / Sai</option> : null}
                  </select>
                </label>
              </fieldset>
            ) : null}

            <fieldset className="hg-quiz-fieldset">
              <legend className="hg-quiz-legend">Số câu hỏi</legend>
              <div className="hg-quiz-count-row">
                <input
                  type="range"
                  className="hg-quiz-count-range"
                  min={1}
                  max={Math.max(1, cards.length)}
                  value={resolvedQuestionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  aria-valuetext={`${resolvedQuestionCount} câu`}
                />
                <div className="hg-quiz-count-readout" aria-live="polite">
                  <strong>{resolvedQuestionCount}</strong>
                  <span className="hg-quiz-count-readout-sep">/</span>
                  <span>{cards.length}</span>
                  <span className="hg-quiz-count-readout-unit"> câu</span>
                </div>
              </div>
              <p className="hg-quiz-setup-meta hg-quiz-setup-meta--tight">
                Zenigo có {cards.length} thẻ. Xáo ngẫu nhiên rồi lấy {resolvedQuestionCount} thẻ làm {resolvedQuestionCount}{' '}
                câu (mỗi thẻ tối đa một lần trong phiên).
              </p>
            </fieldset>
            {!canStart && enabledFormats.length > 0 ? (
              <p className="hg-quiz-setup-warn">
                Cần ít nhất {minNeed} thẻ cho các định dạng đã bật (trắc nghiệm và đúng/sai cần ≥2). Bỏ bớt loại hoặc thêm
                thẻ.
              </p>
            ) : null}
            <AnimatedButton type="button" className="hg-flash-btn" disabled={!canStart} onClick={onClickStart} liftOnHover>
              Bắt đầu
            </AnimatedButton>
          </section>
        ) : null}

        {!loading && !error && phase === 'quiz' && current ? (
          <section className="hg-quiz-session" aria-labelledby="hg-quiz-session-title">
            <h2 id="hg-quiz-session-title" className="hg-visually-hidden">
              Câu hỏi
            </h2>
            <div className="hg-quiz-session-head">
              <div className="hg-quiz-session-badges">
                <span className="hg-quiz-session-mode">
                  {current.mode === 'ja-vi' ? 'Nhật → Việt' : 'Việt → Nhật'}
                </span>
                <span className="hg-quiz-session-format">{formatBadgeVi(current.format)}</span>
              </div>
              <span className="hg-quiz-session-count">
                {qIndex + 1} / {totalQ}
              </span>
            </div>
            <div className="hg-flash-progress-track" aria-hidden>
              <div className="hg-flash-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {current.format === 'truefalse' ? tfBlock : promptMcqOrKb}

            {current.format === 'mcq' ? (
              <div className="hg-quiz-options" role="group" aria-label="Lựa chọn">
                {current.choices.map((c) => {
                  const label = quizOptionLabel(c, current.mode)
                  const isSelected = selectedMcqId === c.id
                  const isCorrect = c.id === current.target.id
                  let tone = ''
                  if (selectedMcqId !== null) {
                    if (isCorrect) tone = ' hg-quiz-opt--correct'
                    else if (isSelected) tone = ' hg-quiz-opt--wrong'
                  }
                  return (
                    <AnimatedButton
                      key={c.id}
                      type="button"
                      className={`hg-quiz-opt${tone}`}
                      disabled={selectedMcqId !== null}
                      onClick={() => onChooseMcq(c.id)}
                      lang={current.mode === 'vi-ja' ? 'ja' : 'vi'}
                    >
                      <span className="hg-quiz-opt-text">{label}</span>
                    </AnimatedButton>
                  )
                })}
              </div>
            ) : null}

            {current.format === 'keyboard' ? (
              <div className="hg-quiz-keyboard">
                <label className="hg-quiz-keyboard-label" htmlFor="hg-quiz-kb-input">
                  Đáp án của bạn
                </label>
                <textarea
                  ref={kbInputRef}
                  id="hg-quiz-kb-input"
                  className="hg-quiz-keyboard-input"
                  rows={2}
                  value={kbInput}
                  disabled={kbDone}
                  onChange={(e) => setKbInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault()
                        submitKeyboard()
                      }
                    }
                  }}
                  lang={current.mode === 'ja-vi' ? 'vi' : 'ja'}
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="hg-quiz-keyboard-hint">
                  Ấn <kbd>Enter</kbd> để nộp đáp án
                </p>
                {!kbDone ? (
                  <AnimatedButton type="button" className="hg-flash-btn" onClick={submitKeyboard} liftOnHover>
                    Kiểm tra đáp án
                  </AnimatedButton>
                ) : null}
              </div>
            ) : null}

            {current.format === 'truefalse' && tfPick === null ? (
              <div className="hg-quiz-tf-actions" role="group" aria-label="Đúng hay sai">
                <AnimatedButton type="button" className="hg-quiz-tf-btn hg-quiz-tf-btn--true" onClick={() => onChooseTf(true)}>
                  Đúng
                </AnimatedButton>
                <AnimatedButton type="button" className="hg-quiz-tf-btn hg-quiz-tf-btn--false" onClick={() => onChooseTf(false)}>
                  Sai
                </AnimatedButton>
              </div>
            ) : null}

            {current.format === 'mcq' && selectedMcqId !== null ? (
              <div className="hg-quiz-feedback">
                <p
                  className={mcqCorrect ? 'hg-quiz-feedback-ok' : 'hg-quiz-feedback-bad'}
                  role="status"
                >
                  {mcqCorrect ? 'Đúng rồi.' : 'Chưa đúng.'}
                </p>
                <AnimatedButton type="button" className="hg-flash-btn" onClick={goNext} liftOnHover>
                  {qIndex + 1 >= plan.length ? 'Xem kết quả' : 'Câu tiếp'}
                </AnimatedButton>
              </div>
            ) : null}

            {current.format === 'keyboard' && kbDone && kbResult ? (
              <div className="hg-quiz-feedback">
                {kbResult.feedbackType === 'exact' && (
                  <p className="hg-quiz-feedback-ok" role="status">
                    🎉 Chính xác! Bạn trả lời hoàn toàn đúng.
                  </p>
                )}
                {kbResult.feedbackType === 'accentless' && (
                  <p className="hg-quiz-feedback-ok" style={{ color: '#0d9488' }} role="status">
                    ✍️ Đúng! (Chấp nhận đáp án không dấu).
                  </p>
                )}
                {kbResult.feedbackType === 'close' && (
                  <p className="hg-quiz-feedback-ok" style={{ color: '#ca8a04' }} role="status">
                    👍 Gần đúng! (Sai sót chính tả nhỏ: {Math.round((kbResult.similarity || 0) * 100)}% khớp).
                  </p>
                )}
                {kbResult.feedbackType === 'override' && (
                  <p className="hg-quiz-feedback-ok" style={{ color: '#2563eb' }} role="status">
                    💙 Đã ghi nhận! Vẫn tính là trả lời đúng.
                  </p>
                )}
                {kbResult.feedbackType === 'wrong' && (
                  <p className="hg-quiz-feedback-bad" role="status">
                    😢 Chưa chính xác.
                  </p>
                )}

                {/* Show the target card details for better learning */}
                <div className="hg-quiz-feedback-answer-wrap" style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Đáp án chuẩn:</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {current.target.meaning}
                  </p>
                  {current.target.reading && (
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.95rem', color: '#4f46e5' }} lang="ja">
                      Cách đọc: {current.target.reading} ({current.target.kanji})
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <AnimatedButton type="button" className="hg-flash-btn" onClick={goNext} liftOnHover>
                    {qIndex + 1 >= plan.length ? 'Xem kết quả' : 'Câu tiếp (Enter)'}
                  </AnimatedButton>
                  
                  {!kbResult.isCorrect && !isOverridden && (
                    <AnimatedButton 
                      type="button" 
                      className="hg-flash-btn hg-flash-btn--ghost" 
                      onClick={handleOverrideCorrect} 
                      style={{ borderColor: '#2563eb', color: '#2563eb' }}
                      liftOnHover
                    >
                      Tôi đã trả lời đúng (Vẫn tính điểm)
                    </AnimatedButton>
                  )}
                </div>
              </div>
            ) : null}

            {current.format === 'truefalse' && tfPick !== null ? (
              <div className="hg-quiz-feedback">
                <p
                  className={tfCorrect ? 'hg-quiz-feedback-ok' : 'hg-quiz-feedback-bad'}
                  role="status"
                >
                  {tfCorrect ? 'Chính xác.' : 'Chưa đúng.'}
                </p>
                <p className="hg-quiz-feedback-answer hg-quiz-tf-reveal">
                  {current.statementTrue ? 'Cặp này khớp với thẻ trong bộ.' : 'Cặp này không khớp (đã tráo nghĩa hoặc từ).'}
                </p>
                <AnimatedButton type="button" className="hg-flash-btn" onClick={goNext} liftOnHover>
                  {qIndex + 1 >= plan.length ? 'Xem kết quả' : 'Câu tiếp'}
                </AnimatedButton>
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading && !error && phase === 'summary' ? (
          <section className="hg-quiz-summary" aria-labelledby="hg-quiz-summary-title">
            <h2 id="hg-quiz-summary-title" className="hg-quiz-summary-title">
              Kết quả
            </h2>
            <p className="hg-quiz-summary-score">
              <strong>{score}</strong> / {plan.length} câu đúng
            </p>
            <p className="hg-quiz-summary-pct">
              {plan.length > 0 ? Math.round((score / plan.length) * 100) : 0}% chính xác
            </p>
            {progressSync === 'ok' ? (
              <p className="hg-quiz-progress-sync hg-quiz-progress-sync--ok" role="status">
                Đã cập nhật tiến độ lộ trình (từng thẻ) cho Zenigo này.
              </p>
            ) : null}
            {progressSync === 'err' ? (
              <p className="hg-quiz-progress-sync hg-quiz-progress-sync--err" role="status">
                Không lưu được tiến độ lên máy chủ. Bạn vẫn có thể làm quiz lại sau.
              </p>
            ) : null}
            <div className="hg-quiz-summary-actions">
              <AnimatedButton type="button" className="hg-flash-btn" onClick={repeatSession} liftOnHover>
                Làm lại cùng cài đặt
              </AnimatedButton>
              <AnimatedButton type="button" className="hg-flash-btn hg-flash-btn--ghost" onClick={resetToPicker} liftOnHover>
                Đổi cài đặt
              </AnimatedButton>
              <Link to={`/learn/${projectId}`} className="hg-flash-btn hg-flash-btn--ghost hg-quiz-link-btn">
                Về flashcard
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </AnimatedPage>
  )
}

