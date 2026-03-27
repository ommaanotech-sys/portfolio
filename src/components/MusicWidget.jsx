import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TRACKS = [
  {
    title: 'Midnight City',
    artist: 'M83',
    cover: 'https://picsum.photos/seed/m83/40/40',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    title: 'Intro',
    artist: 'The xx',
    cover: 'https://picsum.photos/seed/xx/40/40',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    title: 'Intro — Strings',
    artist: 'John Osborne',
    cover: 'https://picsum.photos/seed/strings/40/40',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    title: 'Kashmir',
    artist: 'Led Zeppelin',
    cover: 'https://picsum.photos/seed/ledzep/40/40',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    cover: 'https://picsum.photos/seed/einaudi/40/40',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
]

function formatTime(secs) {
  if (isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function MusicWidget() {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [open, setOpen] = useState(false)
  const audioRef = useRef(null)
  const track = TRACKS[current]

  // Keep audio in sync with state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    playing ? audio.play().catch(() => setPlaying(false)) : audio.pause()
  }, [playing, current])

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setProgress(audio.currentTime)
    setDuration(audio.duration || 0)
  }

  const handleEnded = () => {
    setCurrent(prev => (prev + 1) % TRACKS.length)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    audio.currentTime = ratio * duration
    setProgress(audio.currentTime)
  }

  const togglePlay = () => setPlaying(p => !p)

  const prev = () => {
    setCurrent(prev => (prev - 1 + TRACKS.length) % TRACKS.length)
    setPlaying(true)
  }

  const next = () => {
    setCurrent(prev => (prev + 1) % TRACKS.length)
    setPlaying(true)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        key={current}
      />

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mw-expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="mw-header">
              <div className="mw-label">
                <span className="mw-bullet" />
                NOW PLAYING
              </div>
              <button className="mw-close" onClick={() => setOpen(false)}>×</button>
            </div>

            {/* Cover + Info */}
            <div className="mw-info">
              <img
                className="mw-cover"
                src={track.cover}
                alt={track.title}
                onError={e => { e.target.src = 'https://picsum.photos/40/40' }}
              />
              <div className="mw-track">
                <div className="mw-title">{track.title}</div>
                <div className="mw-artist">{track.artist}</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mw-progress-wrap" onClick={handleSeek}>
              <div className="mw-progress-track">
                <motion.div
                  className="mw-progress-fill"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="mw-time">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mw-controls">
              <button className="mw-btn" onClick={prev}>⏮</button>
              <button className="mw-btn mw-play" onClick={togglePlay}>
                {playing ? '⏸' : '▶'}
              </button>
              <button className="mw-btn" onClick={next}>⏭</button>
            </div>

            {/* Track list */}
            <div className="mw-list">
              {TRACKS.map((t, i) => (
                <button
                  key={i}
                  className={`mw-list-item${i === current ? ' active' : ''}`}
                  onClick={() => { setCurrent(i); setPlaying(true) }}
                >
                  <span className="mw-list-num">{i + 1}</span>
                  <span className="mw-list-title">{t.title}</span>
                  <span className="mw-list-artist">{t.artist}</span>
                  {i === current && playing && <span className="mw-playing-dot" />}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            className="mw-collapsed"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {playing ? '♫' : '♩'}
            <span className="mw-collapsed-label">Music</span>
            {playing && <span className="mw-pulse" />}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
