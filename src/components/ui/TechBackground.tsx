'use client'

import { useEffect, useRef, useState } from 'react'

interface TechBackgroundProps {
  children?: React.ReactNode
  variant?: 'dark' | 'light' | 'semi-light' | 'auto'
}

// Subtle grid pattern
function TechGrid({ light = false }: { light?: boolean }) {
  const color = light ? 'rgba(43, 163, 173, 0.06)' : 'rgba(43, 163, 173, 0.04)'
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

// Floating dots animation
function FloatingDots({ light = false }: { light?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Fewer particles for cleaner look
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * (light ? 0.4 : 0.3) + 0.1,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const connectionColor = light ? 'rgba(43, 163, 173, 0.1)' : 'rgba(43, 163, 173, 0.06)'
      ctx.strokeStyle = connectionColor
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 180) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.globalAlpha = (1 - distance / 180) * (light ? 0.2 : 0.15)
            ctx.stroke()
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(43, 163, 173, ${p.opacity})`
        ctx.globalAlpha = 1
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [light])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: light ? 0.6 : 0.5 }}
    />
  )
}

// Gradient orbs for light mode
function GradientOrbs({ darker = false }: { darker?: boolean }) {
  const opacity = darker ? 0.25 : 0.2
  const opacity2 = darker ? 0.2 : 0.15
  const opacity3 = darker ? 0.15 : 0.1
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: `linear-gradient(to bottom right, rgba(43, 163, 173, ${opacity}), rgba(34, 211, 238, ${opacity3}))` }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: `linear-gradient(to top right, rgba(34, 211, 238, ${opacity2}), rgba(59, 130, 246, ${opacity3}))` }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full blur-3xl"
        style={{ background: `linear-gradient(to right, rgba(43, 163, 173, ${opacity3}), transparent)` }}
      />
    </div>
  )
}

// Gradient overlays
function GradientOverlay({ light = false, semiLight = false }: { light?: boolean; semiLight?: boolean }) {
  if (light) {
    const topOpacity = semiLight ? 0.4 : 0.5
    const bottomOpacity = semiLight ? 0.2 : 0.3
    return (
      <>
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, rgba(255, 255, 255, ${topOpacity}), transparent)` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{ background: `linear-gradient(to top, rgba(255, 255, 255, ${bottomOpacity}), transparent)` }}
        />
      </>
    )
  }
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
    </>
  )
}

export function TechBackground({ children, variant = 'auto' }: TechBackgroundProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  // Determine effective variant based on auto mode
  const effectiveVariant = variant === 'auto'
    ? (isDarkMode ? 'dark' : 'semi-light')
    : variant

  const isLight = effectiveVariant === 'light' || effectiveVariant === 'semi-light'
  const isSemiLight = effectiveVariant === 'semi-light'

  const bgClass = effectiveVariant === 'dark'
    ? 'bg-[#0d1117]'
    : effectiveVariant === 'semi-light'
    ? 'bg-gradient-to-br from-slate-100 via-cyan-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'
    : 'bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${bgClass}`}>
      {/* Gradient orbs for light modes */}
      {isLight && !isDarkMode && <GradientOrbs darker={isSemiLight} />}
      {isDarkMode && <GradientOrbsDark />}

      {/* Subtle grid */}
      <TechGrid light={isLight && !isDarkMode} />

      {/* Floating dots */}
      <FloatingDots light={isLight && !isDarkMode} />

      {/* Gradient overlays */}
      <GradientOverlay light={isLight && !isDarkMode} semiLight={isSemiLight && !isDarkMode} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Dark mode gradient orbs
function GradientOrbsDark() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: 'linear-gradient(to bottom right, rgba(43, 163, 173, 0.15), rgba(34, 211, 238, 0.05))' }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'linear-gradient(to top right, rgba(34, 211, 238, 0.1), rgba(59, 130, 246, 0.05))' }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full blur-3xl"
        style={{ background: 'linear-gradient(to right, rgba(43, 163, 173, 0.08), transparent)' }}
      />
    </div>
  )
}

// Light background for admin/dashboard
export function LightBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/20 to-white">
      <GradientOrbs />
      <TechGrid light />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Section wrapper
export function TechSection({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="relative z-10">{children}</div>
    </section>
  )
}
