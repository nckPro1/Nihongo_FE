import { useReducedMotion } from 'framer-motion'

export function useSoundEffects() {
  const shouldReduceMotion = useReducedMotion()

  const playFlip = () => {
    // If reduced motion is on, don't distract the user with too much sensory feedback
    if (shouldReduceMotion) return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      // Gentle mechanical pitch swoop down to mimic a physical card flip
      osc.frequency.setValueAtTime(160, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.12)
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime) // subtle, non-intrusive
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {
      // AudioContext could be blocked by browser autoplay policy before user gesture
    }
  }

  const playSuccess = () => {
    if (shouldReduceMotion) return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      // Beautiful harmonic chime (E6 -> B6)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'triangle' // soft, flute-like tone
      osc1.frequency.setValueAtTime(1318.51, ctx.currentTime)
      gain1.gain.setValueAtTime(0.04, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(ctx.currentTime + 0.25)
      
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(1975.53, ctx.currentTime + 0.07)
      gain2.gain.setValueAtTime(0, ctx.currentTime)
      gain2.gain.setValueAtTime(0.04, ctx.currentTime + 0.07)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start()
      osc2.stop(ctx.currentTime + 0.32)
    } catch {
      // Ignore autoplay errors
    }
  }

  const playError = () => {
    if (shouldReduceMotion) return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      // Subtle corrective tone (double low pulse)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08)
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.18)
    } catch {
      // Ignore autoplay errors
    }
  }

  return {
    playFlip,
    playSuccess,
    playError
  }
}
