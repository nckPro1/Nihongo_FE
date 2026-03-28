import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransitionOverlay.css'

const OVERLAY_VISIBLE_MS = 240

export function PageTransitionOverlay() {
  const location = useLocation()
  const previousPathRef = useRef(location.pathname)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (location.pathname === previousPathRef.current) {
      return
    }
    previousPathRef.current = location.pathname
    setActive(true)
    const timer = window.setTimeout(() => setActive(false), OVERLAY_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  if (!active) return null

  return (
    <div className="page-transition-overlay" aria-hidden>
      <div className="page-transition-fade" />
    </div>
  )
}
