import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { addFavourite, removeFavourite } from '../../api/services/favouriteService'
import { listGrammarGroups, listGrammarPoints } from '../../api/services/grammarService'
import {
  FAVOURITE_TARGET_GRAMMAR,
  GRAMMAR_JLPT_LEVELS,
  type GrammarGroupSummary,
  type GrammarPointListItem,
} from '../../types/grammar'
import { AnimatedPage } from '../../components/animated/AnimatedPage'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import './grammar.css'

function isJlptLevel(s: string): boolean {
  return GRAMMAR_JLPT_LEVELS.includes(s.toUpperCase() as (typeof GRAMMAR_JLPT_LEVELS)[number])
}

export function GrammarListPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const level = levelParam?.toUpperCase() ?? ''
  const qUrl = searchParams.get('q') ?? ''
  const groupIdFromUrl = searchParams.get('groupId') ?? ''

  const [groups, setGroups] = useState<GrammarGroupSummary[]>([])
  const [points, setPoints] = useState<GrammarPointListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchDraft, setSearchDraft] = useState(qUrl)
  const shouldReduceMotion = useReducedMotion()


  useEffect(() => {
    if (!levelParam || !isJlptLevel(levelParam)) {
      navigate('/grammar', { replace: true })
    }
  }, [levelParam, navigate])

  const load = useCallback(async () => {
    if (!level || !isJlptLevel(level)) return
    setLoading(true)
    setError(null)
    try {
      const [gRes, pRes] = await Promise.all([
        listGrammarGroups(level),
        listGrammarPoints({
          level,
          groupId: groupIdFromUrl || undefined,
          q: qUrl.trim() || undefined,
        }),
      ])
      if (gRes.success && gRes.data) setGroups(gRes.data)
      else setGroups([])
      if (pRes.success && pRes.data) setPoints(pRes.data)
      else {
        setPoints([])
        setError(pRes.message || 'Không tải được danh sách.')
      }
    } catch {
      setPoints([])
      setError('Không tải được. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }, [level, groupIdFromUrl, qUrl])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const prev = document.title
    document.title = `Ngữ pháp ${level} — Zenigo`
    return () => {
      document.title = prev
    }
  }, [level])

  useEffect(() => {
    setSearchDraft(qUrl)
  }, [qUrl])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchDraft.trim()) next.set('q', searchDraft.trim())
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const setGroupFilter = (gid: string) => {
    const next = new URLSearchParams(searchParams)
    if (gid) next.set('groupId', gid)
    else next.delete('groupId')
    setSearchParams(next, { replace: true })
  }

  const toggleStar = async (e: React.MouseEvent, p: GrammarPointListItem) => {
    e.stopPropagation()
    try {
      if (p.favourite) {
        const res = await removeFavourite(FAVOURITE_TARGET_GRAMMAR, p.id)
        if (res.success) {
          setPoints((rows) => rows.map((x) => (x.id === p.id ? { ...x, favourite: false } : x)))
        }
      } else {
        const res = await addFavourite(FAVOURITE_TARGET_GRAMMAR, p.id)
        if (res.success) {
          setPoints((rows) => rows.map((x) => (x.id === p.id ? { ...x, favourite: true } : x)))
        }
      }
    } catch {
      /* ignore */
    }
  }

  const groupSelectValue = useMemo(() => groupIdFromUrl, [groupIdFromUrl])

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
          <span>{level}</span>
        </nav>

        <header>
          <h1>Mẫu ngữ pháp · {level}</h1>
          <p className="hg-grammar-lead">
            Các mục đánh dấu sao hiển thị trước. Tìm theo tên mẫu hoặc nghĩa tiếng Việt.
          </p>
        </header>

        <form onSubmit={onSearchSubmit}>
          <input
            type="search"
            className="hg-grammar-search"
            placeholder="Tìm theo mẫu hoặc nghĩa (tiếng Việt)…"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            aria-label="Tìm kiếm"
          />
        </form>

        <div className="hg-grammar-filter-row">
          <label htmlFor="hg-grammar-group-filter">Nhóm</label>
          <select
            id="hg-grammar-group-filter"
            className="hg-grammar-group-select"
            value={groupSelectValue}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="">Tất cả nhóm</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.pointCount})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="hg-grammar-rows">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="hg-grammar-row" style={{ pointerEvents: 'none', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <Skeleton width="30%" height={16} />
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <Skeleton width="60%" height={12} />
                  </div>
                  <div>
                    <Skeleton width="15%" height={10} />
                  </div>
                </div>
                <div>
                  <Skeleton circle width={24} height={24} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="hg-grammar-err">{error}</p> : null}

        {!loading && !error && points.length === 0 ? (
          <div className="hg-grammar-empty">Chưa có mẫu nào ở cấp độ này (hoặc không khớp bộ lọc).</div>
        ) : null}

        {!loading && points.length > 0 ? (
          <div className="hg-grammar-rows">
            {points.map((p) => (
              <motion.div
                key={p.id}
                className={`hg-grammar-row${p.favourite ? ' hg-grammar-row--fav' : ''}`}
                whileHover={shouldReduceMotion ? {} : { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                transition={{ duration: 0.15 }}
              >
                <Link className="hg-grammar-row-link" to={`/grammar/${level}/${p.id}`}>
                  <p className="hg-grammar-row-title" lang="ja">
                    {p.title}
                  </p>
                  <p className="hg-grammar-row-mean">{p.meaningSummary}</p>
                  <div className="hg-grammar-row-group">{p.groupName}</div>
                </Link>
                <button
                  type="button"
                  className="hg-grammar-star-btn"
                  title={p.favourite ? 'Bỏ yêu thích' : 'Yêu thích'}
                  aria-label={p.favourite ? 'Bỏ yêu thích' : 'Yêu thích'}
                  onClick={(e) => void toggleStar(e, p)}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    {p.favourite ? 'star' : 'star_border'}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </AnimatedPage>
  )
}
