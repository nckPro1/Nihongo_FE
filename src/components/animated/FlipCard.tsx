import { motion, useReducedMotion } from 'framer-motion'
import { type KeyboardEvent } from 'react'
import { useSoundEffects } from '../../hooks/useSoundEffects'

interface FlipCardProps {
  front: React.ReactNode
  back: React.ReactNode
  isFlipped: boolean
  onFlip: () => void
  className?: string
}

export function FlipCard({ front, back, isFlipped, onFlip, className = '' }: FlipCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const { playFlip } = useSoundEffects()

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      playFlip()
      onFlip()
    }
  }

  const handleClick = () => {
    playFlip()
    onFlip()
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? 'Mặt sau: nhấn để xem mặt trước (Kanji)'
            : 'Mặt trước: nhấn để lật xem nghĩa và cách đọc'
        }
        style={{
          width: '100%',
          border: 'none',
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
          display: 'block',
          borderRadius: '1rem',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          perspective: 1400,
          transformStyle: 'preserve-3d'
        }}
        className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <div className="aspect-[5/3] w-full max-h-[min(52vh,22rem)] relative">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 180, damping: 20 }
            }
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              position: 'relative'
            }}
          >
            {/* Front Face */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                position: 'absolute',
                inset: 0,
                borderRadius: '1rem'
              }}
            >
              {front}
            </div>

            {/* Back Face */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                position: 'absolute',
                inset: 0,
                borderRadius: '1rem'
              }}
            >
              {back}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
