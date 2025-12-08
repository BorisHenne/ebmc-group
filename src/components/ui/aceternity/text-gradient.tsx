'use client'

import { motion } from 'framer-motion'

interface TextGradientProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
}

export function TextGradient({ children, className = '', animate = true }: TextGradientProps) {
  if (animate) {
    return (
      <motion.span
        className={`inline-block bg-gradient-to-r from-ebmc-turquoise via-cyan-400 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
        animate={{
          backgroundPosition: ['0% center', '200% center'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {children}
      </motion.span>
    )
  }

  return (
    <span className={`bg-gradient-to-r from-ebmc-turquoise via-cyan-400 to-blue-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}
