import type { Variants } from 'framer-motion'

export const pageTransitions: Record<string, Variants> = {
  slideScale: {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' }
    }
  },
  fadeOnly: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  }
}
