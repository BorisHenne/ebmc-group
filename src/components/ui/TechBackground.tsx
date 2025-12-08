'use client'

import { useEffect, useRef } from 'react'

interface TechBackgroundProps {
  children?: React.ReactNode
  variant?: 'dark' | 'light'
}

// Subtle grid pattern
function TechGrid({ light = false }: { light?: boolean }) {
  const color = light ? 'rgba(45, 181, 181, 0.08)' : 'rgba(45, 181, 181, 0.05)'
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

      const connectionColor = light ? 'rgba(45, 181, 181, 0.12)' : 'rgba(45, 181, 181, 0.08)'
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
        ctx.fillStyle = `rgba(45, 181, 181, ${p.opacity})`
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
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-ebmc-turquoise/20 to-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-400/15 to-blue-500/10 blur-3xl" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-ebmc-turquoise/10 to-transparent blur-3xl" />
    </div>
  )
}

// Gradient overlays
function GradientOverlay({ light = false }: { light?: boolean }) {
  if (light) {
    return (
      <>
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
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

export function TechBackground({ children, variant = 'dark' }: TechBackgroundProps) {
  const isLight = variant === 'light'

  return (
    <div
      className={`relative min-h-screen ${
        isLight
          ? 'bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white'
          : 'bg-[#0d1117]'
      }`}
    >
      {/* Gradient orbs for light mode */}
      {isLight && <GradientOrbs />}

      {/* Subtle grid */}
      <TechGrid light={isLight} />

      {/* Floating dots */}
      <FloatingDots light={isLight} />

      {/* Gradient overlays */}
      <GradientOverlay light={isLight} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
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
