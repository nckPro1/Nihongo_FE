import { useCallback, useState, type KeyboardEvent } from 'react'
import { useSpeech } from '../../hooks/useSpeech'
import './flashcard-3d.css'

/** Khớp cấu trúc từ backend (DictionaryResponse / tương đương). */
export type FlashcardDictionaryData = {
  kanji: string
  hiragana: string
  meaning: string
  romaji: string
  example: string
}

export type FlashcardProps = {
  data: FlashcardDictionaryData
  /** Chiều rộng tối đa vùng thẻ (Tailwind arbitrary hoặc class) */
  className?: string
}

function emptyFallback(s: string, dash = '—') {
  return s?.trim() ? s.trim() : dash
}

export function Flashcard({ data, className = '' }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { speak } = useSpeech()

  const toggle = useCallback(() => {
    setIsFlipped((v) => !v)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle],
  )

  return (
    <div
      className={`fc-perspective mx-auto w-full max-w-xl transition-transform duration-300 ease-out hover:scale-[1.02] ${className}`.trim()}
      style={{ position: 'relative' }}
    >
      {/* Nút phát âm — đặt ngoài flip button để không trigger lật */}
      <button
        type="button"
        aria-label="Phát âm"
        onClick={() => speak(isFlipped ? (data.hiragana || data.kanji) : data.kanji)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          background: 'rgba(255,255,255,0.85)',
          border: 'none',
          borderRadius: '50%',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4f46e5' }}>
          volume_up
        </span>
      </button>

      <button
        type="button"
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? 'Mặt sau: nhấn để xem mặt trước (Kanji)'
            : 'Mặt trước: nhấn để lật xem Hiragana và nghĩa'
        }
        className="w-full cursor-pointer select-none rounded-xl border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <div className="aspect-[5/3] w-full max-h-[min(52vh,22rem)]">
          <div className={`fc-flip-inner h-full ${isFlipped ? 'fc-flip-inner--flipped' : ''}`}>
            {/* Mặt trước */}
            <div className="fc-face flex flex-col rounded-xl bg-white px-6 py-6 text-center shadow-lg ring-1 ring-slate-200/80">
              <div className="min-h-[1.25rem] shrink-0 text-center">
                {data.romaji?.trim() ? (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {data.romaji.trim()}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col items-center justify-center px-1 py-2">
                <p
                  className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl"
                  lang="ja"
                >
                  {emptyFallback(data.kanji)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400">Nhấp để lật</span>
            </div>

            {/* Mặt sau */}
            <div className="fc-face fc-face--back flex flex-col items-stretch justify-center gap-4 overflow-y-auto rounded-xl bg-white px-6 py-7 text-left shadow-lg ring-1 ring-slate-200/80">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Hiragana
                </p>
                <p className="text-xl font-semibold text-slate-800" lang="ja">
                  {emptyFallback(data.hiragana)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Nghĩa
                </p>
                <p className="text-lg font-medium leading-snug text-slate-800" lang="vi">
                  {emptyFallback(data.meaning)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Ví dụ
                </p>
                <p className="text-sm leading-relaxed text-slate-600" lang="ja">
                  {emptyFallback(data.example, '—')}
                </p>
              </div>
              <span className="text-center text-xs font-medium text-slate-400">Nhấp để lật</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
