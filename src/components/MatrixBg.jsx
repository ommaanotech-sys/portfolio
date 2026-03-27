import { useEffect, useRef } from 'react'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
const FONT_SIZE = 14
const FALL_SPEED_BASE = 0.8
const MOUSE_INFLUENCE = 120
const MOUSE_ATTRACT = 0.15
const CLICK_RADIUS = 160

class Drop {
  constructor(canvas, x) {
    this.canvas = canvas
    this.baseX = x
    this.x = x
    this.y = Math.random() * -300
    this.baseSpeed = FALL_SPEED_BASE + Math.random() * 2.5
    this.speed = this.baseSpeed
    this.char = CHARS[Math.floor(Math.random() * CHARS.length)]
    this.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
    this.switchTimer = 0
    this.length = Math.floor(10 + Math.random() * 18)
    this.baseOpacity = 0.55 + Math.random() * 0.45
    this.opacity = this.baseOpacity
    this.glow = 0
    this.mouseVx = 0
    this.mouseVy = 0
  }

  update(mouse, clickPoint) {
    this.switchTimer++
    if (this.switchTimer > 2 + Math.random() * 5) {
      this.char = this.nextChar
      this.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
      this.switchTimer = 0
    }

    // Mouse attraction toward cursor + gentle glow boost
    if (mouse.x !== null) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < MOUSE_INFLUENCE) {
        // Gentle pull toward cursor
        const force = (1 - dist / MOUSE_INFLUENCE) * MOUSE_ATTRACT * 2
        this.mouseVx += (dx / dist) * force
        this.mouseVy += (dy / dist) * force
        // Boost glow near cursor
        this.glow = Math.min(1, this.glow + 0.08)
      } else {
        this.glow = Math.max(0, this.glow - 0.04)
      }
    } else {
      this.glow = Math.max(0, this.glow - 0.03)
    }

    // Click ripple — burst away from click point
    if (clickPoint) {
      const dx = this.x - clickPoint.x
      const dy = this.y - clickPoint.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CLICK_RADIUS) {
        const force = (1 - dist / CLICK_RADIUS) * 3.5
        this.mouseVx += (dx / dist) * force
        this.mouseVy += (dy / dist) * force
      }
    }

    // Dampen and apply
    this.mouseVx *= 0.88
    this.mouseVy *= 0.88
    this.x += this.mouseVx
    this.y += this.speed

    // Soft clamp x within canvas
    this.x = Math.max(0, Math.min(this.canvas.width, this.x))
    if (this.x <= 0 || this.x >= this.canvas.width) {
      this.mouseVx = 0
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.length; i++) {
      const y = this.y - i * FONT_SIZE
      if (y < -FONT_SIZE || y > this.canvas.height + FONT_SIZE) continue
      const fade = 1 - i / this.length
      const alpha = this.baseOpacity * fade

      // Leading char — extra bright when glowing
      if (i === 0) {
        const bright = 180 + this.glow * 75
        const g = 255 - this.glow * 60
        ctx.fillStyle = `rgba(${bright},${g},${bright},${alpha})`
        ctx.font = `bold ${FONT_SIZE}px 'JetBrains Mono', monospace`
        ctx.fillText(this.nextChar, this.x, y)

        // Glow halo when near mouse
        if (this.glow > 0.3) {
          ctx.shadowColor = '#4ade80'
          ctx.shadowBlur = 12 * this.glow
          ctx.fillText(this.nextChar, this.x, y)
          ctx.shadowBlur = 0
        }
      } else {
        const trailAlpha = alpha * 0.8
        ctx.fillStyle = `rgba(74,222,128,${trailAlpha})`
        ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`
        ctx.fillText(this.char, this.x, y)
      }
    }
  }
}

export default function MatrixBg() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: null, y: null })
  const clickPoint = useRef(null)
  const clickFade = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }
    const onMouseLeave = () => {
      mouse.current.x = null
      mouse.current.y = null
    }
    const onClick = (e) => {
      clickPoint.current = { x: e.clientX, y: e.clientY }
      clickFade.current = 1
      setTimeout(() => { clickPoint.current = null }, 400)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('click', onClick)

    const drops = []
    const initDrops = () => {
      const count = Math.floor((canvas.width * canvas.height) / (FONT_SIZE * FONT_SIZE * 1.5))
      while (drops.length < count) {
        drops.push(new Drop(canvas, Math.random() * canvas.width))
      }
    }
    initDrops()

    let raf
    const draw = () => {
      // Slower fade for more persistent trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const drop of drops) {
        drop.update(mouse.current, clickPoint.current)
        drop.draw(ctx)
        if (drop.y > canvas.height + drop.length * FONT_SIZE) {
          drop.y = Math.random() * -150
          drop.x = drop.baseX = Math.random() * canvas.width
          drop.length = Math.floor(10 + Math.random() * 18)
          drop.speed = FALL_SPEED_BASE + Math.random() * 2.5
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
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
