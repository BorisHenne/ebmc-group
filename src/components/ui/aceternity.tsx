'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

export function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm p-8 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(45,181,181,0.15), transparent 80%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

export function GlowingCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-ebmc-turquoise to-cyan-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
      <div className="relative bg-gray-900 rounded-2xl p-8 border border-white/10">
        {children}
      </div>
    </div>
  )
}

export function BorderBeam({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-2xl ${className}`}>
      <div className="absolute inset-0 rounded-2xl">
        <div
          className="absolute w-20 h-20 bg-gradient-to-r from-transparent via-ebmc-turquoise to-transparent opacity-50"
          style={{
            offsetPath: 'rect(0 100% 100% 0 round 1rem)',
            animation: 'border-beam 4s linear infinite',
          }}
        />
      </div>
    </div>
  )
}

export function Meteors({ number = 20 }: { number?: number }) {
  const meteors = new Array(number).fill(null)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-ebmc-turquoise shadow-[0_0_0_1px_#ffffff10]"
          style={{
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: Math.random() * 3 + 2 + 's',
          }}
        >
          <span className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-ebmc-turquoise to-transparent" />
        </span>
      ))}
    </div>
  )
}

export function GridBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      {children}
    </div>
  )
}

export function TextGradient({
  children,
  className = '',
  animate = true,
}: {
  children: React.ReactNode
  className?: string
  animate?: boolean
}) {
  if (animate) {
    return (
      <span className={`bg-gradient-to-r from-ebmc-turquoise via-cyan-400 to-ebmc-turquoise-light bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient ${className}`}>
        {children}
      </span>
    )
  }
  return (
    <span className={`bg-gradient-to-r from-ebmc-turquoise via-cyan-400 to-blue-500 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  )
}

export function ShimmerButton({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-ebmc-turquoise focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
      {...props}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#2DB5B5_0%,#1C1C1C_50%,#2DB5B5_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2 hover:bg-gray-800 transition">
        {children}
      </span>
    </button>
  )
}

export function MovingBorder({
  children,
  className = '',
  containerClassName = '',
  duration = 2000,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  duration?: number
}) {
  return (
    <div className={`relative p-[2px] overflow-hidden rounded-2xl ${containerClassName}`}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, #2DB5B5, transparent)`,
          animation: `spin ${duration}ms linear infinite`,
        }}
      />
      <div className={`relative bg-gray-900 rounded-2xl ${className}`}>
        {children}
      </div>
    </div>
  )
}

export function TypewriterEffect({ words }: { words: string[] }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.slice(0, currentText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 1500)
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words])

  return (
    <span className="text-ebmc-turquoise">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-ebmc-turquoise/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
        />
      ))}
    </div>
  )
}
