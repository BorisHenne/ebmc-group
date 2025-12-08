'use client'

import { useEffect, useRef } from 'react'

interface AnimatedBeamProps {
  className?: string
}

export function AnimatedBeam({ className = '' }: AnimatedBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationId: number
    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      const centerX = canvas.offsetWidth / 2
      const centerY = canvas.offsetHeight / 2

      // Draw multiple animated beams
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + time * 0.5
        const length = 150 + Math.sin(time * 2 + i) * 30

        const endX = centerX + Math.cos(angle) * length
        const endY = centerY + Math.sin(angle) * length

        const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY)
        gradient.addColorStop(0, 'rgba(45, 181, 181, 0.8)')
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)')
        gradient.addColorStop(1, 'rgba(45, 181, 181, 0)')

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()

        // Draw glow dot at end
        ctx.beginPath()
        ctx.arc(endX, endY, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(45, 181, 181, 0.6)'
        ctx.fill()
      }

      // Center glow
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 50
      )
      centerGradient.addColorStop(0, 'rgba(45, 181, 181, 0.3)')
      centerGradient.addColorStop(1, 'rgba(45, 181, 181, 0)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
      ctx.fillStyle = centerGradient
      ctx.fill()

      time += 0.01
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
