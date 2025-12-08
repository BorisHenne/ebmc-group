'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GlowingCardProps {
  children: React.ReactNode
  className?: string
}

export function GlowingCard({ children, className = '' }: GlowingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`relative group overflow-hidden rounded-2xl ${className}`}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-ebmc-turquoise via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isHovered
            ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(45, 181, 181, 0.15), transparent 40%)`
            : 'none',
        }}
      />

      {/* Card content */}
      <div className="relative glass-card-dark m-[1px] rounded-2xl p-8">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(45, 181, 181, 0.05), transparent)',
              transform: 'translateX(-100%)',
              animation: isHovered ? 'shimmer-slide 2s infinite' : 'none',
            }}
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>

      <style jsx>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  )
}
