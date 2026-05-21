import { useEffect, useMemo, useState } from 'react'
import { BRAND_LOGO_URL } from '../../constants/brandAssets'
import './ZenigoPanelSlideLoader.css'

type ZenigoPanelSlideLoaderProps = {
  isLoading: boolean
  onLoadingComplete?: () => void
}

const TOTAL_LOAD_MS = 5000
const PANEL_COUNT = 4

export function ZenigoPanelSlideLoader({ isLoading, onLoadingComplete }: ZenigoPanelSlideLoaderProps) {
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
    <div className="zenigo-loader-overlay" role="status" aria-live="polite" aria-label="Zenigo is loading">
      <div className="zenigo-loader-panels">
        {panels.slice(0, PANEL_COUNT).map((panel) => (
          <div
            key={panel.key}
            className={`zenigo-loader-panel ${panel.className} ${panel.direction} ${animateIn ? 'settled' : ''}`}
            style={{ transitionDelay: `${panel.delayMs}ms` }}
          />
        ))}
      </div>

      <div className={`zenigo-loader-center ${showCenter ? 'visible' : ''}`}>
        <div className="zenigo-logo-wrap">
          <img src={BRAND_LOGO_URL} alt="Zenigo logo" className="zenigo-logo-image" />
          <div className="zenigo-logo-text">Zenigo</div>
        </div>
        <div className="zenigo-chibi" aria-hidden>
          <span className="chibi-face">( ^ - ^ )</span>
          <span className="chibi-wave">ﾉ</span>
        </div>
        <div className="zenigo-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
