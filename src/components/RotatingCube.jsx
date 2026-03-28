import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function RotatingCube() {
  const cubeRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastTouch = useRef({ x: 0, y: 0 })

  const springX = useSpring(x, { stiffness: 120, damping: 20 })
  const springY = useSpring(y, { stiffness: 120, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [18, -18])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-18, 18])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Mouse tracking on desktop
  useEffect(() => {
    if (isMobile) return
    const handleMouseMove = (e) => {
      if (!cubeRef.current) return
      const rect = cubeRef.current.getBoundingClientRect()
      x.set((e.clientX - (rect.left + rect.width / 2)) / rect.width)
      y.set((e.clientY - (rect.top + rect.height / 2)) / rect.height)
    }
    const handleMouseLeave = () => { x.set(0); y.set(0) }
    window.addEventListener('mousemove', handleMouseMove)
    cubeRef.current?.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMobile])

  // Touch tracking on mobile
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    lastTouch.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !cubeRef.current) return
    const touch = e.touches[0]
    const rect = cubeRef.current.getBoundingClientRect()
    x.set((touch.clientX - (rect.left + rect.width / 2)) / rect.width)
    y.set((touch.clientY - (rect.top + rect.height / 2)) / rect.height)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    x.set(0)
    y.set(0)
  }, [])

  const size = isMobile ? 90 : 120
  const half = isMobile ? 45 : 60

  const faceStyle = {
    position: 'absolute',
    width: size,
    height: size,
    border: '1.5px solid rgba(74,222,128,0.65)',
    background: 'rgba(74,222,128,0.06)',
    backdropFilter: 'blur(4px)',
    boxShadow: 'inset 0 0 20px rgba(74,222,128,0.08)',
  }

  return (
    <div
      ref={cubeRef}
      className="relative flex items-center justify-center select-none"
      style={{ perspective: 900 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: isMobile ? 130 : 180,
          height: isMobile ? 130 : 180,
          background: 'radial-gradient(circle, rgba(74,222,128,0.35) 0%, transparent 70%)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating + tilting cube */}
      <motion.div
        style={{
          rotateX: isMobile ? rotateX : undefined,
          rotateY: isMobile ? rotateY : undefined,
          transformStyle: 'preserve-3d',
          zIndex: 1,
        }}
        // Desktop: float + auto-rotate + mouse tilt
        animate={!isMobile ? {
          y: [0, -12, 0],
          rotateX: [0, 360],
          rotateY: [0, 360],
        } : {}}
        transition={!isMobile ? {
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotateX: { duration: 20, repeat: Infinity, ease: 'linear' },
          rotateY: { duration: 14, repeat: Infinity, ease: 'linear' },
        } : {}}
      >
        <div style={{ ...faceStyle, transform: `translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)` }} />
        <div style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
      </motion.div>

      {/* Glow line */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? -16 : -20,
        width: isMobile ? 60 : 80,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #4ade80, transparent)',
        boxShadow: '0 0 12px rgba(74,222,128,0.5)',
        borderRadius: 999,
      }} />

      {/* Mobile hint */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: -36,
          fontSize: 9,
          color: 'rgba(74,222,128,0.4)',
          letterSpacing: '0.08em',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
        }}>
          drag to tilt
        </div>
      )}
    </div>
  )
}
