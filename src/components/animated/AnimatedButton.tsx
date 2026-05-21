import { motion, useReducedMotion } from 'framer-motion'

interface AnimatedButtonProps extends React.ComponentPropsWithoutRef<typeof motion.button> {
  children: React.ReactNode
  liftOnHover?: boolean
}

export function AnimatedButton({ children, liftOnHover = false, ...props }: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      whileHover={shouldReduceMotion || !liftOnHover ? {} : { y: -2, transition: { duration: 0.15 } }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
