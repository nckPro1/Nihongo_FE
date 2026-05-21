import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { passageTranslate, PASSAGE_MAX_CHARS } from '../../api/services/passageService'
import { useAuthStore } from '../../store/authStore'
import type { PassageCompound, PassageTranslateData } from '../../types/passage'
import { segmentJapaneseLine } from './passageSegmentUtils'
import { useSpeech } from '../../hooks/useSpeech'

type PopupState = { compound: PassageCompound; left: number; top: number }

export function PassageTranslateSection() {
  const token = useAuthStore((s) => s.token)
  const { speak } = useSpeech()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PassageTranslateData | null>(null)
  const [popup, setPopup] = useState<PopupState | null>(null)

  const japanese = result?.japanese?.trim() ?? ''
  const compounds = result?.compounds ?? []

  const parts = useMemo(() => segmentJapaneseLine(japanese, compounds), [japanese, compounds])

  const runTranslate = useCallback(async () => {
    const q = text.trim()
    if (!q || !token) return
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await passageTranslate(q)
      if (res.success && res.data) {
        setResult(res.data)
      } else {
        setError(res.message || 'Không dịch được.')
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (status === 401 ? 'Vui lòng đăng nhập để dịch câu / đoạn.' : null) ??
        'Không gọi được máy chủ. Thử lại sau.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [text, token])

  const directionLabel =
    result?.direction === 'vi_jp' ? 'Việt → Nhật' : result?.direction === 'jp_vi' ? 'Nhật → Việt' : null

  return (
    <section className="hg-example" aria-labelledby="hg-passage-title">
      <div className="hg-example-inner">
        <div className="hg-example-intro">
          <h2 id="hg-passage-title">Dịch câu &amp; đoạn văn</h2>
          <div className="hg-example-rule" />
        </div>

        <div className="hg-passage-form-wrap">
          {!token ? (
            <p className="hg-passage-login-hint">
              <Link to="/login">Đăng nhập</Link> để dùng dịch câu / đoạn (cần JWT).
            </p>
          ) : null}
          <label htmlFor="hg-passage-input" className="hg-passage-label">
            Nội dung
          </label>
          <textarea
            id="hg-passage-input"
            className="hg-passage-textarea"
            rows={5}
            maxLength={PASSAGE_MAX_CHARS}
            placeholder="VD: 秋の日は釣瓶落とし。 / Mặt trời mùa thu lặn nhanh như thả gàu xuống giếng."
            value={text}
            disabled={!token || loading}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="hg-passage-toolbar">
            <span className="hg-passage-counter">
              {text.length}/{PASSAGE_MAX_CHARS}
            </span>
            <button
              type="button"
              className="hg-btn-primary-lg hg-passage-submit"
              disabled={!token || loading || !text.trim()}
              onClick={() => void runTranslate()}
            >
              {loading ? 'Đang dịch…' : 'Dịch'}
            </button>
          </div>
          {error ? <p className="hg-vocab-error hg-passage-error">{error}</p> : null}
        </div>

        {result ? (
          <div className="hg-example-panel hg-passage-result-panel">
            <div className="hg-example-split">
              <div className="hg-example-col">
                {directionLabel ? (
                  <p className="hg-passage-direction" aria-label="Hướng">
                    {directionLabel}
                  </p>
                ) : null}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Câu tiếng Nhật
                  {japanese ? (
                    <button
                      type="button"
                      aria-label="Phát âm"
                      onClick={() => speak(japanese)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1, color: '#4f46e5' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>volume_up</span>
                    </button>
                  ) : null}
                </label>
                <div className="hg-example-jp hg-passage-jp-interactive" lang="ja">
                  {parts.map((p, idx) =>
                    p.kind === 'text' ? (
                      <span key={`t-${idx}`}>{p.text}</span>
                    ) : (
                      <span
                        key={`c-${idx}-${p.compound.surface}`}
                        className="hg-passage-compound"
                        tabIndex={0}
                        onMouseEnter={(e) => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setPopup({
                            compound: p.compound,
                            left: r.left + r.width / 2,
                            top: r.bottom + 6,
                          })
                        }}
                        onMouseLeave={() => setPopup(null)}
                        onFocus={(e) => {
                          const r = e.currentTarget.getBoundingClientRect()
                          setPopup({
                            compound: p.compound,
                            left: r.left + r.width / 2,
                            top: r.bottom + 6,
                          })
                        }}
                        onBlur={() => setPopup(null)}
                      >
                        {p.compound.surface}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="hg-example-col hg-example-col--right">
                <label className="hg-label-accent">Bản dịch tiếng Việt</label>
                <p className="hg-passage-vi">{result.vietnamese || '—'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {popup &&
        createPortal(
          <div
            className="hg-passage-popup"
            style={{
              position: 'fixed',
              left: popup.left,
              top: popup.top,
              transform: 'translateX(-50%)',
            }}
            role="tooltip"
          >
            <p className="hg-passage-popup-reading" lang="ja">
              {popup.compound.reading || '—'}
            </p>
            <p className="hg-passage-popup-gloss">{popup.compound.glossVi || '—'}</p>
          </div>,
          document.body,
        )}
    </section>
  )
}
