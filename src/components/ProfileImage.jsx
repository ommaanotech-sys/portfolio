import { useState, useRef } from 'react'

export default function ProfileImage() {
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const lastTouch = useRef({ x: 0, y: 0 })
  const imgRef = useRef(null)

  // Scroll to zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.15 : 0.15
    setScale(s => Math.min(Math.max(s + delta, 0.5), 4))
  }

  // Touch/mouse drag to pan when zoomed
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true)
      lastTouch.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }
  }

  const handleMouseMove = (e) => {
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
  }

  return (
    <div className="pimg-wrap">
      <div className="pimg-label">SCROLL TO ZOOM · DRAG TO PAN</div>
      <div
        className="pimg-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      >
        <img
          ref={imgRef}
          src={`https://raw.githubusercontent.com/ommaanotech-sys/portfolio/main/High_DA20975-080.jpg`}
          alt="Profile"
          className="pimg"
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          onError={(e) => {
            // Fallback to raw filename if PUBLIC_URL approach fails
            e.target.src = './High_DA20975-080.jpg'
          }}
        />
      </div>
      <div className="pimg-zoom-level">{Math.round(scale * 100)}%</div>
    </div>
  )
}
