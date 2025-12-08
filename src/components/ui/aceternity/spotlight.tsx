'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className = '', fill = 'white' }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return
      const rect = divRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }

    const div = divRef.current
    div?.addEventListener('mousemove', handleMouseMove)
    return () => div?.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div ref={divRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(45, 181, 181, 0.15), transparent 40%)`,
        }}
      />
    </div>
  )
}

export function SpotlightCard({
  children,
  className = '',
  variant = 'dark',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'light' | 'dark'
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const baseStyles = variant === 'light'
    ? 'bg-white/70 border-white/40 shadow-lg shadow-slate-200/50'
    : 'bg-slate-900/80 border-white/10 shadow-2xl'

  const textStyles = variant === 'light' ? 'text-slate-800' : 'text-white'

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl border backdrop-blur-xl p-6 ${baseStyles} ${textStyles} ${className}`}
    >
      {/* Spotlight glow effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(45, 181, 181, ${variant === 'light' ? '0.12' : '0.2'}), transparent 40%)`
            : 'none',
        }}
      />

      {/* Border gradient on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-ebmc-turquoise/20 via-cyan-400/20 to-blue-500/20" />
      </div>

      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
