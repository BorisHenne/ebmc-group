'use client'

import { useEffect, useRef } from 'react'

// Circuit nodes animation
function CircuitLines() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Horizontal lines */}
          <line x1="0" y1="25" x2="40" y2="25" stroke="#2DB5B5" strokeWidth="1" />
          <line x1="60" y1="25" x2="100" y2="25" stroke="#2DB5B5" strokeWidth="1" />
          <line x1="0" y1="75" x2="30" y2="75" stroke="#2DB5B5" strokeWidth="1" />
          <line x1="70" y1="75" x2="100" y2="75" stroke="#2DB5B5" strokeWidth="1" />

          {/* Vertical lines */}
          <line x1="50" y1="0" x2="50" y2="20" stroke="#2DB5B5" strokeWidth="1" />
          <line x1="50" y1="30" x2="50" y2="70" stroke="#2DB5B5" strokeWidth="1" />
          <line x1="50" y1="80" x2="50" y2="100" stroke="#2DB5B5" strokeWidth="1" />

          {/* Nodes */}
          <circle cx="50" cy="25" r="3" fill="#2DB5B5" />
          <circle cx="50" cy="75" r="2" fill="#2DB5B5" />
          <circle cx="25" cy="50" r="2" fill="#2DB5B5" />
          <circle cx="75" cy="50" r="2" fill="#2DB5B5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
    </svg>
  )
}

// Animated data particles
function DataParticles() {
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

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.strokeStyle = 'rgba(45, 181, 181, 0.1)'
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.globalAlpha = (1 - distance / 150) * 0.3
            ctx.stroke()
          }
        }
      }

      // Draw and update particles
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
      style={{ opacity: 0.6 }}
    />
  )
}

// Grid overlay
function TechGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(45, 181, 181, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(45, 181, 181, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}

// Gradient overlay
function GradientOverlay() {
  return (
    <>
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-ebmc-turquoise/5 to-transparent pointer-events-none" />
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      {/* Side accents */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-ebmc-turquoise/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
    </>
  )
}

export function TechBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Base layer - subtle grid */}
      <TechGrid />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <CircuitLines />
      </div>

      {/* Animated particles */}
      <DataParticles />

      {/* Gradient overlays */}
      <GradientOverlay />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Simplified version for inner sections
export function TechSection({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(45, 181, 181, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(45, 181, 181, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  )
}
