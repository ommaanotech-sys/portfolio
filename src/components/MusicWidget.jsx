import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ──────────────────────────────────────────────
// YOUTUBE IFRAME API SETUP
// ──────────────────────────────────────────────
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

function whenYtReady(cb) {
  if (ytApiReady) cb()
  else ytApiQueue.push(cb)
}

// ──────────────────────────────────────────────
// YOUR PLAYLIST — loaded directly from YouTube Music
// ──────────────────────────────────────────────
const YOUTUBE_PLAYLIST_ID = 'PLfvvdsuspW5JsE94MWUya5zZRsZTRy8qM'
const YOUTUBE_API_KEY = 'AIzaSyCjE6ZvG8GErsU6Ic71nN92r7Z6Z2RG9Ww' // Public demo key — replace with your own

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

const DEFAULT_PLAYLIST = [
  { id: 'jfKfPfyJRdk', title: 'Loading your playlist...' },
]

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

// ──────────────────────────────────────────────
// TRACK LIST EDITOR (shown in expanded panel)
// ──────────────────────────────────────────────
function PlaylistEditor({ playlist, onSave }) {
  const [draft, setDraft] = useState(playlist.map(t => `${t.id} | ${t.title}`).join('\n'))
  const [editing, setEditing] = useState(false)

  const handleSave = () => {
    const lines = draft.split('\n').filter(l => l.trim())
    const parsed = lines.map(line => {
      const [id, ...rest] = line.split('|')
      return {
        id: id.trim(),
        title: rest.join('|').trim() || id.trim(),
        thumbnail: `https://img.youtube.com/vi/${id.trim()}/1.jpg`,
      }
    }).filter(t => t.id)
    if (parsed.length) { onSave(parsed); setEditing(false) }
  }

  return (
    <div className="mw-playlist-editor">
      <div className="mw-editor-header">
        <span className="mw-editor-label">PLAYLIST CONFIG</span>
        <button className="mw-editor-toggle" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <>
          <textarea
            className="mw-editor-textarea"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={Math.max(4, Math.min(playlist.length + 1, 8))}
            placeholder={"video_id | Track Title\nvideo_id | Track Title"}
          />
          <div className="mw-editor-hint">Paste as: <code>VIDEO_ID | Title</code> (one per line)</div>
          <button className="mw-editor-apply" onClick={handleSave}>Apply Playlist</button>
        </>
      ) : (
        <div className="mw-editor-hint">Click Edit to configure your playlist</div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// MUSIC WIDGET
// ──────────────────────────────────────────────
export default function MusicWidget() {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [playlist, setPlaylist] = useState(DEFAULT_PLAYLIST)
  const [playlistLoaded, setPlaylistLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [open, setOpen] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const playerRef = useRef(null)
  const playerContainerRef = useRef(null)
  const track = playlist[current]

  // Initialize YouTube player on page load (not on widget open)
  useEffect(() => {
    loadYouTubeAPI()
    fetchPlaylistTracks().then(tracks => {
      if (tracks && tracks.length > 0) setPlaylist(tracks)
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
        },
        events: {
          onReady: (e) => {
            setIframeReady(true)
            e.target.setVolume(80)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true)
              startProgressLoop()
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false)
            }
          },
        },
      })
    })
  }, [])
  useEffect(() => {
    if (!open) return
    loadYouTubeAPI()
    whenYtReady(() => {
      // Only init once
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
        },
        events: {
          onReady: (e) => {
            setIframeReady(true)
            e.target.setVolume(80)
            e.target.playVideo()
            setPlaying(true)
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true)
              startProgressLoop()
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false)
            }
          },
        },
      })
    })
  }, [open])

  const progressRef = useRef(null)
  const startProgressLoop = useCallback(() => {
    cancelAnimationFrame(progressRef.current)
    const tick = () => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        try {
          setProgress(playerRef.current.getCurrentTime())
          setDuration(playerRef.current.getDuration())
        } catch (_) {}
      }
      progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
  }, [])

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

  const handleSeek = (e) => {
    if (!playerRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    playerRef.current.seekTo(ratio * duration, true)
    setProgress(ratio * duration)
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const handlePlaylistSelect = (i) => {
    if (!playerRef.current || !iframeReady) { setCurrent(i); setPlaying(true); return }
    try {
      playerRef.current.playVideoAt(i)
    } catch (_) {
      // Fallback: load video directly
      const vid = playlist[i]?.id
      if (vid) playerRef.current.loadVideoById(vid)
    }
    setCurrent(i)
    setPlaying(true)
  }

  const trackThumb = track
    ? `https://img.youtube.com/vi/${track.id}/default.jpg`
    : 'https://picsum.photos/40/40'

  return (
    <>
      {/* Hidden YouTube player */}
      <div ref={playerContainerRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} />

      {/* Always-visible collapsed button */}
      {!open && (
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

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
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
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="mw-settings-btn"
                  onClick={() => setShowEditor(e => !e)}
                  title="Playlist settings"
                >⚙</button>
                <button className="mw-close" onClick={() => setOpen(false)}>×</button>
              </div>
            </div>

            {/* Track Info */}
            <div className="mw-info">
              <img
                className="mw-cover"
                src={trackThumb}
                alt={track?.title}
                onError={e => { e.target.src = 'https://picsum.photos/40/40' }}
              />
              <div className="mw-track">
                <div className="mw-title">{track?.title || 'Loading...'}</div>
                <div className="mw-artist">YouTube Music</div>
              </div>
            </div>

            {/* Progress */}
            <div className="mw-progress-wrap" onClick={handleSeek}>
              <div className="mw-progress-track">
                <div
                  className="mw-progress-fill"
                  style={{ width: `${duration && progress ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="mw-time">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mw-controls">
              <button className="mw-btn" onClick={handlePrev} title="Previous">⏮</button>
              <button
                className="mw-btn mw-play"
                onClick={handlePlayPause}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button className="mw-btn" onClick={handleNext} title="Next">⏭</button>
            </div>

            {/* Playlist Editor */}
            {showEditor && (
              <PlaylistEditor playlist={playlist} onSave={(newPl) => {
                setPlaylist(newPl)
                if (playerRef.current) {
                  try { playerRef.current.destroy() } catch (_) {}
                  playerRef.current = null
                  setIframeReady(false)
                }
              }} />
            )}

            {/* Track List */}
            <div className="mw-list">
              {playlist.map((t, i) => (
                <button
                  key={`${t.id}-${i}`}
                  className={`mw-list-item${i === current ? ' active' : ''}`}
                  onClick={() => handlePlaylistSelect(i)}
                >
                  <img
                    className="mw-list-thumb"
                    src={`https://img.youtube.com/vi/${t.id}/1.jpg`}
                    alt={t.title}
                    onError={e => { e.target.src = 'https://picsum.photos/40/40' }}
                  />
                  <span className="mw-list-title">{t.title}</span>
                  {i === current && playing && <span className="mw-playing-bar">▶</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
