import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeSwitcher from './components/ThemeSwitcher'
import Terminal from './themes/Terminal'
import Editorial from './themes/Editorial'
import Glass from './themes/Glass'
import './styles.css'

export default function App() {
  const [theme, setTheme] = useState('terminal')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showCursor, setShowCursor] = useState(false)
  const [cursorTheme, setCursorTheme] = useState('terminal')
  const cursorRef = useRef(null)
  const trailRef = useRef(null)
  const cursorPos = useRef({ x: -100, y: -100 })
  const trailPos = useRef({ x: -100, y: -100 })
  const animFrame = useRef(null)

  // Update cursor theme whenever theme changes
  useEffect(() => {
    setCursorTheme(theme)
  }, [theme])

  // Scroll progress + back-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Custom cursor tracking
  useEffect(() => {
    const onMove = (e) => {
      cursorPos.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }
    const onEnter = () => setShowCursor(true)
    const onLeave = () => setShowCursor(false)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mouseleave', onLeave)

    // Smooth trail animation loop
    const animate = () => {
      const { x, y } = cursorPos.current
      const { x: tx, y: ty } = trailPos.current
      trailPos.current = {
        x: tx + (x - tx) * 0.12,
        y: ty + (y - ty) * 0.12,
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px)`
      }
      animFrame.current = requestAnimationFrame(animate)
    }
    animFrame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(animFrame.current)
    }
  }, [])

  const cursorColors = {
    terminal: '#4ade80',
    editorial: '#e63946',
    glass: '#a78bfa',
  }
  const cursorColor = cursorColors[cursorTheme]

  return (
    <div className="app">
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{
          width: `${scrollProgress}%`,
          background: cursorColor,
          boxShadow: `0 0 8px ${cursorColor}`,
        }}
        animate={{ opacity: scrollProgress > 0 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Custom Cursor — hidden on touch devices */}
      <div
        ref={cursorRef}
        className="cursor-dot"
        style={{
          background: cursorColor,
          boxShadow: `0 0 6px ${cursorColor}`,
          opacity: showCursor ? 1 : 0,
        }}
      />
      <div
        ref={trailRef}
        className="cursor-trail"
        style={{
          borderColor: cursorColor,
          opacity: showCursor ? 0.4 : 0,
        }}
      />

      <ThemeSwitcher current={theme} onChange={setTheme} />

      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {theme === 'terminal' && <Terminal onThemeChange={setTheme} />}
          {theme === 'editorial' && <Editorial onThemeChange={setTheme} />}
          {theme === 'glass' && <Glass onThemeChange={setTheme} />}
        </motion.div>
      </AnimatePresence>

      {/* Back to Top */}
      <AnimatePresence>
        {scrollProgress > 12 && (
          <motion.button
            className="back-to-top"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ '--c': cursorColor }}
            aria-label="Back to top"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
