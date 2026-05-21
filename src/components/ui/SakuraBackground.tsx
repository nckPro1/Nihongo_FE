import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface SakuraBackgroundProps {
  petalCount?: number
  opacity?: number
}

interface Petal {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  opacity: number
  sway: number
  swaySpeed: number
}

export function SakuraBackground({ petalCount = 30, opacity = 0.55 }: SakuraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // If reduced motion is preferred, use fewer petals and make them drift extremely slowly
    const actualPetalCount = shouldReduceMotion ? 8 : petalCount
    const speedMultiplier = shouldReduceMotion ? 0.25 : 1.0

    // Generate initial petals
    const petals: Petal[] = []
    for (let i = 0; i < actualPetalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6, // size between 6px and 14px
        speedX: (Math.random() * 1.5 - 0.5) * speedMultiplier,
        speedY: (Math.random() * 1.2 + 0.8) * speedMultiplier,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
        opacity: Math.random() * 0.5 + 0.3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: (Math.random() * 0.02 + 0.01) * speedMultiplier
      })
    }

    // Function to draw a sakura petal
    const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
      ctx.save()
      ctx.translate(petal.x, petal.y)
      ctx.rotate(petal.rotation)
      ctx.scale(petal.size / 10, petal.size / 10)

      ctx.beginPath()
      // Draw a classic beautiful heart-shaped sakura petal
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(-5, -5, -10, 5, 0, 15)
      ctx.bezierCurveTo(10, 5, 5, -5, 0, 0)

      // Gradient for realistic shading
      const gradient = ctx.createLinearGradient(0, -5, 0, 15)
      gradient.addColorStop(0, `rgba(255, 209, 220, ${petal.opacity})`) // pastel pink
      gradient.addColorStop(0.6, `rgba(251, 182, 196, ${petal.opacity})`) // deeper blossom pink
      gradient.addColorStop(1, `rgba(244, 143, 177, ${petal.opacity * 0.8})`) // soft edges

      ctx.fillStyle = gradient
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      petals.forEach((petal) => {
        // Move petal
        petal.y += petal.speedY
        petal.sway += petal.swaySpeed
        // Sway movement (horizontal sine wave)
        petal.x += petal.speedX + Math.sin(petal.sway) * 0.4
        petal.rotation += petal.rotationSpeed

        // Wrap around bottom / left / right
        if (petal.y > height + 20) {
          petal.y = -20
          petal.x = Math.random() * width
          petal.speedY = (Math.random() * 1.2 + 0.8) * speedMultiplier
          petal.opacity = Math.random() * 0.5 + 0.3
        }
        if (petal.x > width + 20) {
          petal.x = -20
        } else if (petal.x < -20) {
          petal.x = width + 20
        }

        drawPetal(ctx, petal)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [petalCount, shouldReduceMotion])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5, // Render above standard page background/cards but below sidebar/modals
        pointerEvents: 'none',
        opacity: opacity
      }}
    />
  )
}
