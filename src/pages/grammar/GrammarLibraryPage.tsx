import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { listGrammarLevels } from '../../api/services/grammarService'
import type { GrammarLevelSummary } from '../../types/grammar'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './grammar.css'

const MotionLink = motion(Link)

export function GrammarLibraryPage() {
  const [levels, setLevels] = useState<GrammarLevelSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const prev = document.title
    document.title = 'Ngữ pháp — Zenigo'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listGrammarLevels()
        if (res.success && res.data) setLevels(res.data)
        else {
          setLevels([])
          setError(res.message || 'Không tải được.')
        }
      } catch {
        setLevels([])
        setError('Không tải được. Thử lại sau.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <AnimatedPage>
      <div className="hg-grammar-page">
        <nav className="hg-grammar-bc" aria-label="Điều hướng">
          <Link to="/home">Trang chủ</Link>
          <span aria-hidden> / </span>
          <span>Ngữ pháp</span>
        </nav>
        <header>
          <h1>Thư viện ngữ pháp</h1>
        </header>

        {error ? <p className="hg-grammar-err">{error}</p> : null}

        {loading ? (
          <div className="hg-grammar-level-grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="hg-grammar-level-card" style={{ pointerEvents: 'none' }}>
                <span className="hg-grammar-level-badge" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Skeleton width={50} height={28} />
                </span>
                <span className="hg-grammar-level-meta" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
                  <Skeleton width={110} height={14} />
                </span>
              </div>
            ))}
          </div>
        ) : !error ? (
          <div className="hg-grammar-level-grid">
            {levels.map((L) => (
              <MotionLink
                key={L.level}
                to={`/grammar/${L.level}`}
                className="hg-grammar-level-card"
                whileHover={shouldReduceMotion ? {} : { y: -4, boxShadow: '0 8px 24px rgba(53, 37, 205, 0.12)' }}
                transition={{ duration: 0.2 }}
              >
                <span className="hg-grammar-level-badge">{L.level}</span>
                <span className="hg-grammar-level-meta">
                  {L.grammarCount} mẫu · {L.groupCount} nhóm
                </span>
              </MotionLink>
            ))}
          </div>
        ) : null}
      </div>
    </AnimatedPage>
  )
}

