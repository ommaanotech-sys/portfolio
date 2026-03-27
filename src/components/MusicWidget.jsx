import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

// ─── YouTube IFrame API ───
let ytApiReady = false
let ytApiQueue = []

function loadYouTubeAPI() {
  if (document.getElementById('youtube-iframe-api')) return
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  tag.id = 'youtube-iframe-api'
  const first = document.getElementsByTagName('script')[0]
  first.parentNode.insertBefore(tag, first)
}

function onYouTubeIframeAPIReady() {
  ytApiReady = true
  ytApiQueue.forEach(cb => cb())
  ytApiQueue = []
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

function whenYtReady(cb) {
  ytApiReady ? cb() : ytApiQueue.push(cb)
}

// ─── Playlist ───
const YOUTUBE_PLAYLIST_ID = 'PLfvvdsuspW5JsE94MWUya5zZRsZTRy8qM'
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY

async function fetchPlaylistTracks() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_PLAYLIST_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
    )
    const data = await res.json()
    if (data.items) {
      return data.items.map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title || 'Untitled',
        thumbnail: item.snippet.thumbnails?.default?.url || '',
      }))
    }
  } catch (e) {
    console.warn('Could not fetch playlist:', e)
  }
  return null
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Main Widget ───
export default function MusicWidget() {
  const [playlist, setPlaylist] = useState([])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [iframeReady, setIframeReady] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const barRef = useRef(null)

  // Close playlist when clicking outside
  useEffect(() => {
    if (!expanded) return
    const handleClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [expanded])
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const progressRef = useRef(null)
  const startProgressLoop = useCallback(() => {
    cancelAnimationFrame(progressRef.current)
    const tick = () => {
      try {
        if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
          setProgress(playerRef.current.getCurrentTime())
          setDuration(playerRef.current.getDuration())
        }
      } catch (_) {}
      progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Init YouTube player on mount ──
  useEffect(() => {
    loadYouTubeAPI()
    fetchPlaylistTracks().then(tracks => {
      if (tracks?.length) setPlaylist(tracks)
    })

    whenYtReady(() => {
      if (playerRef.current) return
      if (!playerContainerRef.current) return

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        playerVars: {
          listType: 'playlist',
          list: YOUTUBE_PLAYLIST_ID,
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          loop: 1,
          mute: 1,
        },
        events: {
          onReady: (e) => {
            setIframeReady(true)
            e.target.setVolume(muted ? 0 : 80)
            e.target.playVideo()
            setPlaying(true)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true)
              startProgressLoop()
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false)
              cancelAnimationFrame(progressRef.current)
            }
          },
        },
      })
    })

    return () => cancelAnimationFrame(progressRef.current)
  }, [])

  // ── Sync muted state with player ──
  useEffect(() => {
    if (!playerRef.current || !iframeReady) return
    try {
      playerRef.current.setVolume(muted ? 0 : 80)
      if (muted) playerRef.current.mute()
      else playerRef.current.unMute()
    } catch (_) {}
  }, [muted, iframeReady])

  // ── Cancel progress loop when paused ──
  useEffect(() => {
    if (!playing) cancelAnimationFrame(progressRef.current)
    else startProgressLoop()
    return () => cancelAnimationFrame(progressRef.current)
  }, [playing, startProgressLoop])

  const handlePlayPause = () => {
    if (!playerRef.current) return
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo()
    setPlaying(p => !p)
  }

  const handlePrev = () => {
    if (!playerRef.current) return
    playerRef.current.previousVideo()
    setPlaying(true)
  }

  const handleNext = () => {
    if (!playerRef.current) return
    playerRef.current.nextVideo()
    setPlaying(true)
  }

  const handleMuteToggle = () => setMuted(m => !m)

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    playerRef.current.seekTo(ratio * duration, true)
    setProgress(ratio * duration)
  }

  const handleTrackSelect = (i) => {
    if (!playerRef.current) { setCurrent(i); setPlaying(true); return }
    try { playerRef.current.playVideoAt(i) } catch (_) {}
    setCurrent(i)
    setPlaying(true)
  }

  const track = playlist[current] || { title: 'Loading...' }

  return (
    <>
      {/* Hidden YouTube player */}
      <div ref={playerContainerRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} />

      {/* ── Top-right music bar ── */}
      <div className="mw-bar" ref={barRef}>

        {/* Progress bar — full width at top */}
        <div className="mw-bar-progress" onClick={handleSeek}>
          <div
            className="mw-bar-progress-fill"
            style={{ width: `${duration && progress ? (progress / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Controls row */}
        <div className="mw-bar-controls">

          {/* Track info */}
          <div className="mw-bar-track">
            <span className={`mw-bar-playing-dot${playing ? ' active' : ''}`} />
            <span className="mw-bar-title">{track.title}</span>
            {muted && <span className="mw-bar-muted-badge">MUTED</span>}
          </div>

          {/* Buttons */}
          <div className="mw-bar-btns">
            <button className="mw-bar-btn" onClick={handlePrev} title="Previous">⏮</button>
            <button className="mw-bar-btn mw-bar-play" onClick={handlePlayPause} title={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>
            <button className="mw-bar-btn" onClick={handleNext} title="Next">⏭</button>
          </div>

          {/* Right side: volume + expand */}
          <div className="mw-bar-right">
            {/* Mute/Unmute */}
            <button className="mw-bar-btn" onClick={handleMuteToggle} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🔊'}
            </button>

            {/* Time */}
            <span className="mw-bar-time">{formatTime(progress)} / {formatTime(duration)}</span>

            {/* Expand toggle */}
            <button
              className="mw-bar-btn mw-bar-expand"
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Collapse' : 'Expand playlist'}
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* ── Expanded: track list ── */}
        {expanded && (
          <motion.div
            class="mw-bar-playlist"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {playlist.map((t, i) => (
              <button
                key={`${t.id}-${i}`}
                className={`mw-bar-list-item${i === current ? ' active' : ''}`}
                onClick={() => handleTrackSelect(i)}
              >
                <img
                  className="mw-bar-list-thumb"
                  src={t.thumbnail || `https://img.youtube.com/vi/${t.id}/1.jpg`}
                  alt={t.title}
                  onError={e => { e.target.src = '' }}
                />
                <span className="mw-bar-list-title">{t.title}</span>
                {i === current && playing && <span className="mw-bar-now">▶</span>}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
