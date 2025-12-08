'use client'

import { motion } from 'framer-motion'

interface ShimmerButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function ShimmerButton({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ShimmerButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative inline-flex items-center justify-center gap-2
        px-8 py-3 rounded-full
        bg-gradient-to-r from-ebmc-turquoise to-cyan-400
        text-white font-medium
        overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-shadow duration-300
        hover:shadow-lg hover:shadow-ebmc-turquoise/25
        ${className}
      `}
    >
      {/* Shimmer effect */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span
          className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animationDuration: '2s',
            animationIterationCount: 'infinite',
          }}
        />
      </span>

      {/* Border glow */}
      <span className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-ebmc-turquoise via-cyan-300 to-blue-400 blur-sm" />
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      <style jsx>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-slide {
          animation-name: shimmer-slide;
        }
      `}</style>
    </motion.button>
  )
}
