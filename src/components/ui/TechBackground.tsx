'use client'

import { useEffect, useRef } from 'react'

// Subtle grid pattern
function TechGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(45, 181, 181, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(45, 181, 181, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
  )
}

// Floating dots animation (lighter version)
function FloatingDots() {
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
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw subtle connections
      ctx.strokeStyle = 'rgba(45, 181, 181, 0.08)'
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.globalAlpha = (1 - distance / 200) * 0.15
            ctx.stroke()
          }
        }
      }

      // Draw particles
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  )
}

// Gradient accents
function GradientOverlay() {
  return (
    <>
      {/* Top gradient - turquoise accent */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-ebmc-turquoise/8 via-ebmc-turquoise/3 to-transparent pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
      {/* Subtle side glows */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-ebmc-turquoise/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-cyan-400/5 rounded-full blur-[150px] pointer-events-none" />
    </>
  )
}

export function TechBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0d1117]">
      {/* Subtle grid */}
      <TechGrid />

      {/* Floating dots */}
      <FloatingDots />

      {/* Gradient overlays */}
      <GradientOverlay />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Section wrapper
export function TechSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="relative z-10">{children}</div>
    </section>
  )
}
