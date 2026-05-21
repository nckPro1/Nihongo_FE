import type { Variants } from 'framer-motion'

export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}

export const scaleOnTap: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.96,
    transition: { duration: 0.1, ease: 'easeInOut' }
  }
}

export const bentoStagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.25, ease: 'easeIn' }
  }
}

export const fadeIn: Variants = {
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
