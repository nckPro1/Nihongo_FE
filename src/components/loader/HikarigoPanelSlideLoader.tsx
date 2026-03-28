import { useEffect, useMemo, useState } from 'react'
import './HikarigoPanelSlideLoader.css'

type HikarigoPanelSlideLoaderProps = {
  isLoading: boolean
  onLoadingComplete?: () => void
}

const TOTAL_LOAD_MS = 5000
const PANEL_COUNT = 4

export function HikarigoPanelSlideLoader({ isLoading, onLoadingComplete }: HikarigoPanelSlideLoaderProps) {
  const [animateIn, setAnimateIn] = useState(false)
  const [showCenter, setShowCenter] = useState(false)

  const panels = useMemo(
    () => [
      { key: 'sakura', direction: 'from-top', delayMs: 0, className: 'panel-sakura' },
      { key: 'bamboo', direction: 'from-bottom', delayMs: 140, className: 'panel-bamboo' },
      { key: 'ocean', direction: 'from-top', delayMs: 280, className: 'panel-ocean' },
      { key: 'sunset', direction: 'from-bottom', delayMs: 420, className: 'panel-sunset' },
    ],
    [],
  )

  useEffect(() => {
    if (!isLoading) {
      setAnimateIn(false)
      setShowCenter(false)
      return
    }

    const raf = requestAnimationFrame(() => setAnimateIn(true))
    const centerTimer = window.setTimeout(() => setShowCenter(true), 1550)
    const doneTimer = window.setTimeout(() => onLoadingComplete?.(), TOTAL_LOAD_MS)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(centerTimer)
      window.clearTimeout(doneTimer)
    }
  }, [isLoading, onLoadingComplete])

  if (!isLoading) {
    return null
  }

  return (
    <div className="hikarigo-loader-overlay" role="status" aria-live="polite" aria-label="Hikarigo is loading">
      <div className="hikarigo-loader-panels">
        {panels.slice(0, PANEL_COUNT).map((panel) => (
          <div
            key={panel.key}
            className={`hikarigo-loader-panel ${panel.className} ${panel.direction} ${animateIn ? 'settled' : ''}`}
            style={{ transitionDelay: `${panel.delayMs}ms` }}
          />
        ))}
      </div>

      <div className={`hikarigo-loader-center ${showCenter ? 'visible' : ''}`}>
        <div className="hikarigo-logo-wrap">
          <img src="/logo.jpg" alt="Hikarigo logo" className="hikarigo-logo-image" />
          <div className="hikarigo-logo-text">Hikarigo</div>
        </div>
        <div className="hikarigo-chibi" aria-hidden>
          <span className="chibi-face">( ^ - ^ )</span>
          <span className="chibi-wave">ﾉ</span>
        </div>
        <div className="hikarigo-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
