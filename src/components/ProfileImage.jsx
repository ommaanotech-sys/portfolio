import { useState, useRef, useEffect, useCallback } from 'react'

export default function ProfileImage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState([])
  const containerRef = useRef(null)
  const lastMouse = useRef({ x: 0, y: 0 })
  const smoothTilt = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  const imgUrl = `https://raw.githubusercontent.com/ommaanotech-sys/portfolio/main/High_DA20975-080.jpg`

  // ── Smooth 4D tilt with inertia ──
  useEffect(() => {
    let raf
    const loop = () => {
      const tx = smoothTilt.current.x
      const ty = smoothTilt.current.y
      setTilt(prev => ({
        x: prev.x + (tx - prev.x) * 0.06,
        y: prev.y + (ty - prev.y) * 0.06,
      }))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)

    // Velocity for momentum
    velRef.current = {
      x: e.clientX - lastMouse.current.x,
      y: e.clientY - lastMouse.current.y,
    }
    lastMouse.current = { x: e.clientX, y: e.clientY }

    // Target tilt — smoothTilt drives the RAF loop above
    smoothTilt.current = { x: dx * 22, y: -dy * 22 }

    if (!isDragging) {
      setMouse({ x: e.clientX, y: e.clientY })
      setPosition(p => ({
        x: p.x + velRef.current.x * 0.3,
        y: p.y + velRef.current.y * 0.3,
      }))
    }
  }, [isDragging])

  // Inertia on mouse leave
  const handleMouseLeave = useCallback(() => {
    smoothTilt.current = { x: 0, y: 0 }
    velRef.current = { x: 0, y: 0 }
  }, [])

  // ── Scroll to zoom ──
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.25 : 0.25
    setScale(s => Math.min(Math.max(s + delta, 0.4), 6))
    if (scale > 1) {
      setPosition(p => ({
        x: p.x - e.deltaX * 0.4,
        y: p.y - e.deltaY * 0.4,
      }))
    }
  }, [scale])

  // ── Drag to pan ──
  const handleMouseDown = useCallback((e) => {
    if (scale > 1) {
      setIsDragging(true)
    } else {
      // Click ripple
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const id = Date.now()
      setRipples(prev => [...prev, { id, x, y }])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800)
    }
  }, [scale])

  const handleMouseMoveDrag = useCallback((e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - lastMouse.current.x,
      y: e.clientY - lastMouse.current.y,
    })
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])
  const handleDoubleClick = useCallback(() => {
    setScale(1); setPosition({ x: 0, y: 0 })
    smoothTilt.current = { x: 0, y: 0 }
  }, [])

  // Mouse in viewport for displacement
  const rect = containerRef.current?.getBoundingClientRect()
  const relX = rect ? ((mouse.x - rect.left) / rect.width - 0.5) * 2 : 0
  const relY = rect ? ((mouse.y - rect.top) / rect.height - 0.5) * 2 : 0

  const cursorInside = rect
    && mouse.x > rect.left && mouse.x < rect.right
    && mouse.y > rect.top && mouse.y < rect.bottom

  return (
    <div className="p4-wrap">

      {/* Header */}
      <div className="p4-header">
        <div className="p4-dots"><span /><span /><span /></div>
        <div className="p4-title">IMG_SPECIMEN_v2.4</div>
        <div className="p4-live">
          <span className="p4-blink" />LIVE
        </div>
      </div>

      {/* Holographic viewport */}
      <div
        ref={containerRef}
        className="p4-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveDrag}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >

        {/* 4D Image Container */}
        <div
          className="p4-img-container"
          style={{
            transform: `
              perspective(600px)
              rotateX(${tilt.y * 0.7}deg)
              rotateY(${tilt.x * 0.7}deg)
              scale(${scale})
              translate(${(position.x / scale) * 0.3}px, ${(position.y / scale) * 0.3}px)
            `,
            transition: isDragging ? 'none' : 'transform 0.05s linear',
          }}
        >
          <img
            src={imgUrl}
            alt="SPECIMEN"
            className="p4-img"
            draggable={false}
            style={{
              transform: `
                translate(${relX * -12}px, ${relY * -12}px)
                scale(${1 + Math.abs(relX) * 0.04})
                scaleY(${1 + Math.abs(relY) * 0.02})
              `,
              filter: `
                saturate(0.3)
                contrast(1.3)
                brightness(0.85)
                hue-rotate(${relX * 15}deg)
              `,
              transition: 'filter 0.1s',
            }}
          />

          {/* Green phosphor tint */}
          <div className="p4-phosphor" />

          {/* Light leak from cursor */}
          {cursorInside && (
            <div
              className="p4-light-leak"
              style={{
                background: `radial-gradient(circle 120px at ${relX * 50 + 50}% ${relY * 50 + 50}%, rgba(74,222,128,0.18) 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Chromatic aberration edges */}
          <img
            src={imgUrl}
            alt=""
            className="p4-img p4-chromatic-r"
            draggable={false}
            style={{
              transform: `translate(${relX * -8 + (position.x / scale) * 0.3}px, ${relY * -8 + (position.y / scale) * 0.3}px) scale(${scale * (1 + Math.abs(relX) * 0.04)})`,
              filter: 'saturate(0.1) contrast(1.5) brightness(0.9) hue-rotate(90deg)',
              clipPath: 'inset(0 50% 0 0)',
              opacity: 0.4,
            }}
          />
          <img
            src={imgUrl}
            alt=""
            className="p4-img p4-chromatic-b"
            draggable={false}
            style={{
              transform: `translate(${relX * 8 + (position.x / scale) * 0.3}px, ${relY * 8 + (position.y / scale) * 0.3}px) scale(${scale * (1 + Math.abs(relX) * 0.04)})`,
              filter: 'saturate(0.1) contrast(1.5) brightness(0.9) hue-rotate(-90deg)',
              clipPath: 'inset(0 0 0 50%)',
              opacity: 0.4,
            }}
          />

          {/* Scanlines */}
          <div className="p4-scanlines" />

          {/* Ripple effects */}
          {ripples.map(r => (
            <div
              key={r.id}
              className="p4-ripple"
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
              }}
            />
          ))}

          {/* Noise grain overlay */}
          <div className="p4-noise" />
        </div>

        {/* Holographic reflection */}
        <div
          className="p4-reflection"
          style={{
            transform: `perspective(600px) rotateX(${tilt.y * 0.3}deg) scaleY(-0.3)`,
            opacity: 0.08 + Math.abs(relY) * 0.06,
            filter: `blur(3px) brightness(0.5) hue-rotate(${relX * 20}deg)`,
          }}
        >
          <img src={imgUrl} alt="" className="p4-img" draggable={false} />
        </div>

        {/* Corner brackets */}
        {['tl','tr','bl','br'].map(c => (
          <div key={c} className={`p4-corner p4-corner-${c}`} />
        ))}

        {/* Data readout */}
        <div className="p4-data">
          <span>YAW <em>{tilt.x.toFixed(1)}°</em></span>
          <span>PITCH <em>{tilt.y.toFixed(1)}°</em></span>
          <span>ZOOM <em>{Math.round(scale * 100)}%</em></span>
        </div>

        {/* Crosshair */}
        <div className="p4-crosshair">
          <div className="p4-ch-h" style={{ opacity: 0.15 + Math.abs(relX) * 0.1 }} />
          <div className="p4-ch-v" style={{ opacity: 0.15 + Math.abs(relY) * 0.1 }} />
        </div>

        {/* CRT vignette */}
        <div className="p4-vignette" />
      </div>

      {/* Footer */}
      <div className="p4-footer">
        <div className="p4-stat">
          <span className="p4-sl">MODE</span><span className="p4-sv">4D_HOLO</span>
        </div>
        <div className="p4-stat">
          <span className="p4-sl">DISP</span><span className="p4-sv">{cursorInside ? 'ACTIVE' : 'IDLE'}</span>
        </div>
        <div className="p4-stat">
          <span className="p4-sl">SYS</span>
          <span className="p4-sv p4-sys">{`${Math.floor(Math.random()*40)+80}MHz`}</span>
        </div>
      </div>

      <div className="p4-hint">MOVE: TILT · SCROLL: ZOOM · CLICK: RIPPLE · DBL: RESET</div>
    </div>
  )
}
