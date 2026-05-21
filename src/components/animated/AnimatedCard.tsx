import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedCardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode
  noHover?: boolean
}

export function AnimatedCard({ children, noHover = false, ...props }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion || noHover ? {} : { y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
