import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { addFavourite, removeFavourite } from '../../api/services/favouriteService'
import { getGrammarPointDetail } from '../../api/services/grammarService'
import { isValidUuid } from '../../lib/uuid'
import { FAVOURITE_TARGET_GRAMMAR, GRAMMAR_JLPT_LEVELS, type GrammarPointDetail } from '../../types/grammar'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './grammar.css'

const MotionLink = motion(Link)
const MotionButton = motion.button

function isJlptLevel(s: string): boolean {
  return GRAMMAR_JLPT_LEVELS.includes(s.toUpperCase() as (typeof GRAMMAR_JLPT_LEVELS)[number])
}

export function GrammarDetailPage() {
  const { level: levelParam, pointId } = useParams<{ level: string; pointId: string }>()
  const navigate = useNavigate()
  const level = levelParam?.toUpperCase() ?? ''

  const [detail, setDetail] = useState<GrammarPointDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()


  useEffect(() => {
    if (!levelParam || !isJlptLevel(levelParam)) {
      navigate('/grammar', { replace: true })
      return
    }
    if (!pointId || !isValidUuid(pointId)) {
      navigate(`/grammar/${level}`, { replace: true })
    }
  }, [levelParam, pointId, navigate, level])

  const load = useCallback(async () => {
    if (!pointId || !isValidUuid(pointId)) return
    setLoading(true)
    setError(null)
    try {
      const res = await getGrammarPointDetail(pointId)
      if (res.success && res.data) {
        setDetail(res.data)
        if (res.data.jlptLevel.toUpperCase() !== level) {
          navigate(`/grammar/${res.data.jlptLevel}/${pointId}`, { replace: true })
        }
      } else {
        setDetail(null)
        setError(res.message || 'Không tải được.')
      }
    } catch {
      setDetail(null)
      setError('Không tải được. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [pointId, level, navigate])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const prev = document.title
    if (detail?.title) {
      document.title = `${detail.title} — Ngữ pháp — Zenigo`
    } else {
      document.title = 'Chi tiết ngữ pháp — Zenigo'
    }
    return () => {
      document.title = prev
    }
  }, [detail?.title])

  const toggleFav = async () => {
    if (!detail || !pointId) return
    try {
      if (detail.favourite) {
        const res = await removeFavourite(FAVOURITE_TARGET_GRAMMAR, pointId)
        if (res.success) setDetail({ ...detail, favourite: false })
      } else {
        const res = await addFavourite(FAVOURITE_TARGET_GRAMMAR, pointId)
        if (res.success) setDetail({ ...detail, favourite: true })
      }
    } catch {
      /* ignore */
    }
  }

  const lv = detail?.jlptLevel ?? level

  if (!isJlptLevel(level)) {
    return null
  }

  return (
    <AnimatedPage>
      <div className="hg-grammar-page">
        <nav className="hg-grammar-bc" aria-label="Điều hướng">
          <Link to="/home">Trang chủ</Link>
          <span aria-hidden> / </span>
          <Link to="/grammar">Ngữ pháp</Link>
          <span aria-hidden> / </span>
          <Link to={`/grammar/${lv}`}>{lv}</Link>
          <span aria-hidden> / </span>
          <span>Chi tiết</span>
        </nav>

        {loading ? (
          <>
            <div className="hg-grammar-detail-head" style={{ pointerEvents: 'none', marginBottom: '1.5rem' }}>
              <div style={{ width: '60%' }}>
                <Skeleton width="100%" height={32} />
              </div>
              <div className="hg-grammar-detail-actions">
                <Skeleton width={100} height={32} style={{ borderRadius: '0.45rem' }} />
              </div>
            </div>

            <p className="hg-grammar-lead" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <Skeleton width={180} height={16} />
            </p>

            <div className="hg-grammar-detail-actions" style={{ marginBottom: '1.5rem' }}>
              <Skeleton width={100} height={32} style={{ borderRadius: '0.45rem' }} />
              <Skeleton width={100} height={32} style={{ borderRadius: '0.45rem' }} />
            </div>

            <section className="hg-grammar-block" style={{ padding: '1rem 1.15rem' }}>
              <h2><Skeleton width={80} height={14} /></h2>
              <p style={{ marginTop: '0.5rem' }}><Skeleton count={2} height={16} /></p>
            </section>

            <section className="hg-grammar-block" style={{ padding: '1rem 1.15rem' }}>
              <h2><Skeleton width={60} height={14} /></h2>
              <p style={{ marginTop: '0.5rem' }}><Skeleton count={3} height={16} /></p>
            </section>
          </>
        ) : null}

        {error ? <p className="hg-grammar-err">{error}</p> : null}

        {!loading && detail ? (
          <>
            <div className="hg-grammar-detail-head">
              <h1 className="hg-grammar-detail-title" lang="ja">
                {detail.title}
              </h1>
              <div className="hg-grammar-detail-actions">
                <MotionButton
                  type="button"
                  className="hg-grammar-nav-btn"
                  onClick={() => void toggleFav()}
                  whileHover={shouldReduceMotion ? {} : { y: -2, backgroundColor: 'var(--hg-primary-fixed)' }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    {detail.favourite ? 'star' : 'star_border'}
                  </span>
                  {detail.favourite ? 'Đã lưu' : 'Yêu thích'}
                </MotionButton>
              </div>
            </div>

            <p className="hg-grammar-lead" style={{ marginTop: '-0.5rem' }}>
              {detail.groupName} · {detail.jlptLevel}
            </p>

            <div className="hg-grammar-detail-actions" style={{ marginBottom: '1.25rem' }}>
              <MotionLink
                className="hg-grammar-nav-btn"
                to={detail.previousId ? `/grammar/${lv}/${detail.previousId}` : '#'}
                aria-disabled={!detail.previousId}
                onClick={(e) => {
                  if (!detail.previousId) e.preventDefault()
                }}
                style={!detail.previousId ? { pointerEvents: 'none', opacity: 0.4 } : undefined}
                whileHover={detail.previousId && !shouldReduceMotion ? { y: -2, backgroundColor: 'var(--hg-primary-fixed)' } : {}}
                whileTap={detail.previousId && !shouldReduceMotion ? { scale: 0.96 } : {}}
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Mẫu trước
              </MotionLink>
              <MotionLink
                className="hg-grammar-nav-btn"
                to={detail.nextId ? `/grammar/${lv}/${detail.nextId}` : '#'}
                aria-disabled={!detail.nextId}
                onClick={(e) => {
                  if (!detail.nextId) e.preventDefault()
                }}
                style={!detail.nextId ? { pointerEvents: 'none', opacity: 0.4 } : undefined}
                whileHover={detail.nextId && !shouldReduceMotion ? { y: -2, backgroundColor: 'var(--hg-primary-fixed)' } : {}}
                whileTap={detail.nextId && !shouldReduceMotion ? { scale: 0.96 } : {}}
              >
                Mẫu sau
                <span className="material-symbols-outlined">chevron_right</span>
              </MotionLink>
            </div>

            {detail.formula ? (
              <section className="hg-grammar-block">
                <h2>Công thức</h2>
                <p className="hg-grammar-formula" lang="ja">
                  {detail.formula}
                </p>
              </section>
            ) : null}

            <section className="hg-grammar-block">
              <h2>Ý nghĩa</h2>
              <p lang="vi">{detail.meaning}</p>
            </section>

            {detail.context ? (
              <section className="hg-grammar-block">
                <h2>Ngữ cảnh / Cách dùng</h2>
                <p lang="vi">{detail.context}</p>
              </section>
            ) : null}

            {detail.examples.length > 0 ? (
              <section className="hg-grammar-block">
                <h2>Ví dụ</h2>
                <div className="hg-grammar-examples">
                  {detail.examples.map((ex, i) => (
                    <div key={`${ex.ja}-${i}`} className="hg-grammar-ex">
                      <p className="hg-grammar-ex-ja" lang="ja">
                        {ex.ja}
                      </p>
                      {ex.vi ? (
                        <p className="hg-grammar-ex-vi" lang="vi">
                          {ex.vi}
                        </p>
                      ) : null}
                      {ex.register ? (
                        <span className="hg-grammar-ex-reg">{ex.register}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {detail.note ? (
              <section className="hg-grammar-block">
                <h2>Ghi chú</h2>
                <p lang="vi">{detail.note}</p>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </AnimatedPage>
  )
}
