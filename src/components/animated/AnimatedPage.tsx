import { motion, useReducedMotion } from 'framer-motion'
import { pageTransitions } from '../../animations/pageTransitions'

interface AnimatedPageProps {
  children: React.ReactNode
  variant?: 'slideScale' | 'fadeOnly'
}

export function AnimatedPage({ children, variant = 'slideScale' }: AnimatedPageProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={shouldReduceMotion ? pageTransitions.fadeOnly : pageTransitions[variant]}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}
