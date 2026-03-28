import { useState, useRef, useEffect, useCallback } from 'react'

export default function ProfileImage() {
  const wrapRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const lastTouch = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const smoothTilt = useRef({ x: 0, y: 0 })

  // Smooth 3D tilt tracking
  const updateTilt = useCallback((clientX, clientY) => {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (clientX - cx) / (rect.width / 2)
    const dy = (clientY - cy) / (rect.height / 2)
    // Target tilt: max ±15 degrees
    smoothTilt.current = {
      x: dx * 15,
      y: -dy * 15,
    }
  }, [])

  // RAF loop for silky smooth tilt
  useEffect(() => {
    let raf
    const loop = () => {
      const tx = smoothTilt.current.x
      const ty = smoothTilt.current.y
      setTilt(prev => ({
        x: prev.x + (tx - prev.x) * 0.08,
        y: prev.y + (ty - prev.y) * 0.08,
      }))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleMouseMove = (e) => {
    setMouse({ x: e.clientX, y: e.clientY })
    if (!isDragging) {
      updateTilt(e.clientX, e.clientY)
    }
  }

  const handleMouseLeave = () => {
    smoothTilt.current = { x: 0, y: 0 }
  }

  // Scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale(s => Math.min(Math.max(s + delta, 0.5), 5))
    if (isDragging) {
      setPosition(p => ({
        x: p.x + e.deltaX * 0.5,
        y: p.y + e.deltaY * 0.5,
      }))
    }
  }

  // Drag to pan
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      lastTouch.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }
  }

  const handleMouseMoveDrag = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - lastTouch.current.x,
      y: e.clientY - lastTouch.current.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true)
      lastTouch.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      }
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    e.preventDefault()
    setPosition({
      x: e.touches[0].clientX - lastTouch.current.x,
      y: e.touches[0].clientY - lastTouch.current.y,
    })
  }

  const handleTouchEnd = () => setIsDragging(false)

  const handleDoubleClick = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    smoothTilt.current = { x: 0, y: 0 }
  }

  const imgUrl = `https://raw.githubusercontent.com/ommaanotech-sys/portfolio/main/High_DA20975-080.jpg`

  // Generate corner markers
  const corners = ['tl', 'tr', 'bl', 'br']

  return (
    <div className="pwrap" ref={wrapRef}>
      {/* Scanlines overlay */}
      <div className="p-scanlines" />

      {/* Header */}
      <div className="p-header">
        <div className="p-dots">
          <span /><span /><span />
        </div>
        <div className="p-title">SPECIMEN // PHOTO.IMG</div>
        <div className="p-hash">#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</div>
      </div>

      {/* 3D Viewport */}
      <div
        className="p-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveDrag}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'crosshair' }}
      >
        {/* Corner decorations */}
        {corners.map(c => (
          <div key={c} className={`p-corner p-corner-${c}`}>
            <div className="p-corner-line" />
            <div className="p-corner-line" />
          </div>
        ))}

        {/* Crosshair */}
        <div className="p-crosshair">
          <div className="p-ch-h" />
          <div className="p-ch-v" />
          <div className="p-ch-dot" />
        </div>

        {/* Floating data labels */}
        <div className="p-label p-label-t" style={{ opacity: 0.4 + Math.abs(tilt.y) * 0.03 }}>
          YAW: {tilt.x.toFixed(1)}°
        </div>
        <div className="p-label p-label-b" style={{ opacity: 0.4 + Math.abs(tilt.y) * 0.03 }}>
          PITCH: {tilt.y.toFixed(1)}°
        </div>

        {/* Image with 3D transforms */}
        <div
          className="p-img-container"
          style={{
            transform: `
              perspective(800px)
              rotateX(${tilt.y}deg)
              rotateY(${tilt.x}deg)
              scale(${scale})
              translate(${position.x / scale}px, ${position.y / scale}px)
            `,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
          }}
        >
          <img
            src={imgUrl}
            alt="Profile"
            className="p-img"
            draggable={false}
          />
          {/* Green tint overlay */}
          <div className="p-tint" />
          {/* Glitch lines on movement */}
          {Math.abs(tilt.x) + Math.abs(tilt.y) > 3 && (
            <div className="p-glitch" />
          )}
        </div>

        {/* CRT vignette */}
        <div className="p-vignette" />
      </div>

      {/* Controls */}
      <div className="p-footer">
        <div className="p-stat">
          <span className="p-stat-label">ZOOM</span>
          <span className="p-stat-val">{Math.round(scale * 100)}%</span>
        </div>
        <div className="p-stat">
          <span className="p-stat-label">MODE</span>
          <span className="p-stat-val">LIVE_3D</span>
        </div>
        <div className="p-stat">
          <span className="p-stat-label">STATUS</span>
          <span className="p-stat-val p-live">● LIVE</span>
        </div>
      </div>

      <div className="p-hint">SCROLL: ZOOM · DRAG: PAN · DBLCLICK: RESET</div>
    </div>
  )
}
