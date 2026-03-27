import { useEffect, useRef } from 'react'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
const FONT_SIZE = 14
const FALL_SPEED = 1.2
const MOUSE_INFLUENCE = 80
const MOUSE_REPEL = 0.4

class Drop {
  constructor(canvas, x) {
    this.canvas = canvas
    this.x = x
    this.y = Math.random() * -200
    this.speed = FALL_SPEED + Math.random() * 1.5
    this.char = CHARS[Math.floor(Math.random() * CHARS.length)]
    this.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
    this.switchTimer = 0
    this.length = Math.floor(8 + Math.random() * 14)
    this.opacity = 0.3 + Math.random() * 0.7
    this.mouseVx = 0
    this.mouseVy = 0
  }

  update(mouse) {
    this.switchTimer++
    if (this.switchTimer > 3 + Math.random() * 6) {
      this.char = this.nextChar
      this.nextChar = CHARS[Math.floor(Math.random() * CHARS.length)]
      this.switchTimer = 0
    }

    // Mouse repulsion
    if (mouse.x !== null) {
      const dx = this.canvas.width / 2 - this.x
      const dy = this.canvas.height / 2 - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MOUSE_INFLUENCE) {
        const force = (1 - dist / MOUSE_INFLUENCE) * MOUSE_REPEL * 60
        this.mouseVx += (dx / dist) * force
        this.mouseVy += (dy / dist) * force
      }
    }

    this.mouseVx *= 0.92
    this.mouseVy *= 0.92
    this.x += this.mouseVx
    this.y += this.speed

    // Wrap x within canvas
    if (this.x < 0) this.x = this.canvas.width
    if (this.x > this.canvas.width) this.x = 0
  }

  draw(ctx) {
    const cols = Math.floor(this.canvas.width / FONT_SIZE)
    const col = Math.floor(this.x / FONT_SIZE)
    for (let i = 0; i < this.length; i++) {
      const y = this.y - i * FONT_SIZE
      if (y < 0 || y > this.canvas.height) continue
      const fade = 1 - i / this.length
      const alpha = this.opacity * fade * 0.85
      const char = i === 0 ? this.nextChar : this.char
      // Leading bright character
      if (i === 0) {
        ctx.fillStyle = `rgba(200,255,210,${alpha})`
        ctx.font = `bold ${FONT_SIZE}px 'JetBrains Mono', monospace`
        ctx.fillText(char, this.x, y)
      } else {
        ctx.fillStyle = `rgba(74,222,128,${alpha})`
        ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`
        ctx.fillText(this.char, this.x, y)
      }
    }
  }
}

export default function MatrixBg() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: null, y: null, canvasX: null, canvasY: null })

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
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    // Init drops
    const drops = []
    const initDrops = () => {
      const count = Math.floor((canvas.width * canvas.height) / (FONT_SIZE * FONT_SIZE * 1.8))
      while (drops.length < count) {
        drops.push(new Drop(canvas, Math.random() * canvas.width))
      }
    }
    initDrops()

    let raf
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.12)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update drops
      for (const drop of drops) {
        drop.update(mouse.current)
        drop.draw(ctx)
        // Reset if off screen
        if (drop.y - drop.length * FONT_SIZE > canvas.height) {
          drop.y = Math.random() * -100
          drop.x = Math.random() * canvas.width
          drop.length = Math.floor(8 + Math.random() * 14)
          drop.speed = FALL_SPEED + Math.random() * 1.5
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
        opacity: 0.65,
      }}
    />
  )
}
