import { useEffect, useRef } from 'react'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
const FONT_SIZE = 14
const MOUSE_RADIUS = 80
const MOUSE_FORCE = 0.08

function buildColumns(width, isMobile) {
  const cols = Math.floor(width / (isMobile ? FONT_SIZE * 2 : FONT_SIZE))
  return Array.from({ length: cols }, () => ({
    x: 0,
    y: Math.random() * -400,
    speed: 0.6 + Math.random() * 1.4,
    chars: Array.from({ length: isMobile ? 8 : 12 + Math.floor(Math.random() * 10) }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
    brightness: 0.4 + Math.random() * 0.6,
    mouseVelX: 0,
  }))
}

export default function MatrixBg() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const colsRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0, isMobile = false

    const resize = () => {
      isMobile = window.innerWidth < 768
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`
      ctx.textBaseline = 'top'
      colsRef.current = buildColumns(W, isMobile)
    }

    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    const onLeave = () => {
      mouse.current.x = -9999
      mouse.current.y = -9999
    }
    const onClick = (e) => {
      const cx = e.clientX
      const cy = e.clientY
      colsRef.current.forEach(col => {
        const dx = col.x - cx
        const dy = col.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (1 - dist / 120) * 6
          col.mouseVelX += (dx / (dist || 1)) * force
        }
      })
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('click', onClick)
    resize()

    let last = 0
    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop)
      const dt = Math.min((ts - last) / 16.67, 3) // cap delta to avoid spiral
      last = ts

      // Fade trail — single cheap fillRect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.18)'
      ctx.fillRect(0, 0, W, H)

      const mx = mouse.current.x
      const my = mouse.current.y

      colsRef.current.forEach(col => {
        // Mouse interaction
        const dx = col.x - mx
        const dy = col.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE * dt
          col.mouseVelX += (dx / (dist || 1)) * force
          col.mouseVelX = Math.max(-3, Math.min(3, col.mouseVelX))
        }
        col.mouseVelX *= 0.88
        col.x += col.mouseVelX * dt
        col.x = Math.max(0, Math.min(W, col.x))

        col.y += col.speed * dt

        const colIndex = Math.round(col.x / FONT_SIZE)
        const totalCols = Math.floor(W / FONT_SIZE)
        const proximity = 1 - (colIndex < 0 || colIndex >= totalCols ? 1 : 0)

        for (let i = 0; i < col.chars.length; i++) {
          const charY = col.y - i * FONT_SIZE
          if (charY < -FONT_SIZE || charY > H + FONT_SIZE) continue

          const fade = 1 - i / col.chars.length
          const baseBright = col.brightness * fade

          if (i === 0) {
            // Leading bright character
            ctx.fillStyle = `rgba(220,255,230,${baseBright})`
            ctx.fillText(col.chars[0], col.x, charY)
          } else if (i < 4) {
            // Mid trail — medium green
            ctx.fillStyle = `rgba(74,222,128,${baseBright * 0.8})`
            ctx.fillText(col.chars[i], col.x, charY)
          } else {
            // Dark tail
            ctx.fillStyle = `rgba(30,80,40,${baseBright * 0.5})`
            ctx.fillText(col.chars[i], col.x, charY)
          }
        }

        // Reset when fully off screen
        if (col.y - col.chars.length * FONT_SIZE > H + 50) {
          col.y = -col.chars.length * FONT_SIZE - Math.random() * 200
          col.x = Math.random() * W
          col.chars = Array.from({ length: isMobile ? 8 : 12 + Math.floor(Math.random() * 10) }, () => CHARS[Math.floor(Math.random() * CHARS.length)])
          col.speed = 0.6 + Math.random() * 1.4
          col.brightness = 0.4 + Math.random() * 0.6
          col.mouseVelX = 0
        }
      })
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
