import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HoloVisualizer() {
  const mountRef = useRef(null)
  const frameRef = useRef(null)
  const freqDataRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Audio setup
    let analyser = null
    let audioCtx = null
    let dataArray = null

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        source.connect(analyser)
        dataArray = new Uint8Array(analyser.frequencyBinCount)
        freqDataRef.current = { analyser, data: dataArray }
        mount.querySelector('.hud-init').style.display = 'none'
        mount.querySelector('.hud-status').style.display = 'block'
        mount.querySelector('.hud-status span').textContent = 'SYS.AUDIO // ONLINE'
      } catch (e) {
        mount.querySelector('.hud-init span:last-child').textContent = 'mic access denied'
      }
    }

    // Get frequency 0-1
    const getFreq = () => {
      if (!analyser || !dataArray) return 0
      analyser.getByteFrequencyData(dataArray)
      let bass = 0
      for (let i = 0; i < 8; i++) bass += dataArray[i]
      return (bass / 8) / 255
    }

    // ── 1. Central Energy Core ──
    const coreGeo = new THREE.IcosahedronGeometry(0.3, 2)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x4ade80,
      emissiveIntensity: 1,
      metalness: 0.8,
      roughness: 0.2,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    scene.add(core)

    // Outer wireframe shell
    const shellGeo = new THREE.IcosahedronGeometry(0.5, 1)
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true, transparent: true, opacity: 0.15 })
    const shell = new THREE.Mesh(shellGeo, shellMat)
    scene.add(shell)

    // Core point light
    const coreLight = new THREE.PointLight(0x4ade80, 2, 6)
    core.add(coreLight)

    // ── 2. Glowing Rings ──
    const rings = []
    const ringDefs = [
      { radius: 1.2, tube: 0.012, color: 0x4ade80, speed: 0.4, rotX: 0.3, rotZ: 1 },
      { radius: 1.6, tube: 0.008, color: 0x60a5fa, speed: -0.3, rotX: -0.5, rotZ: -0.5 },
      { radius: 2.1, tube: 0.006, color: 0xa78bfa, speed: 0.2, rotX: 0.8, rotZ: 0.3 },
    ]
    ringDefs.forEach(({ radius, tube, color, speed, rotX, rotZ }) => {
      const geo = new THREE.TorusGeometry(radius, tube, 12, 80)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
      const ring = new THREE.Mesh(geo, mat)
      ring.rotation.x = rotX
      ring.rotation.z = rotZ
      ring.userData = { speed }
      scene.add(ring)

      // Glow ring
      const glowGeo = new THREE.TorusGeometry(radius, tube * 3, 12, 80)
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 })
      const glowRing = new THREE.Mesh(glowGeo, glowMat)
      glowRing.rotation.x = rotX
      glowRing.rotation.z = rotZ
      scene.add(glowRing)

      rings.push({ ring, glowRing })
    })

    // ── 3. Floating Particles ──
    const PARTICLE_COUNT = 600
    const pPositions = new Float32Array(PARTICLE_COUNT * 3)
    const pSpeeds = new Float32Array(PARTICLE_COUNT)
    const pOffsets = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.2 + Math.random() * 1.8
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pPositions[i * 3 + 2] = r * Math.cos(phi)
      pSpeeds[i] = 0.2 + Math.random() * 0.6
      pOffsets[i] = Math.random() * Math.PI * 2
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    const pMat = new THREE.PointsMaterial({ color: 0x4ade80, size: 0.025, transparent: true, opacity: 0.75 })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── 4. Bass Shockwave Rings ──
    const shockwaves = []
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.TorusGeometry(0.1, 0.006, 8, 64)
      const mat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0 })
      const wave = new THREE.Mesh(geo, mat)
      wave.userData = { age: i * 0.35 }
      scene.add(wave)
      shockwaves.push(wave)
    }

    // ── 5. Grid Floor ──
    const gridGeo = new THREE.PlaneGeometry(20, 20, 40, 40)
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.08, wireframe: true })
    const grid = new THREE.Mesh(gridGeo, gridMat)
    grid.rotation.x = -Math.PI / 2
    grid.position.y = -2
    scene.add(grid)

    // Ambient
    scene.add(new THREE.AmbientLight(0x4ade80, 0.1))

    // ── Animation Loop ──
    const clock = new THREE.Clock()
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const freq = getFreq()

      // Core
      core.rotation.x = t * 1.5
      core.rotation.y = t * 2
      core.material.emissiveIntensity = 1 + freq * 4
      coreLight.intensity = 1 + freq * 4
      shell.rotation.x = -t * 0.8
      shell.rotation.y = t * 1.2
      const coreScale = 1 + freq * 0.5
      shell.scale.setScalar(coreScale)
      shell.material.opacity = 0.08 + freq * 0.3

      // Rings
      rings.forEach(({ ring, glowRing }) => {
        const speed = ring.userData.speed
        ring.rotation.z = t * speed
        ring.rotation.x = t * speed * 0.3
        glowRing.rotation.z = ring.rotation.z
        glowRing.rotation.x = ring.rotation.x
        const scale = 1 + freq * 0.4
        ring.scale.set(scale, scale, scale)
        glowRing.scale.set(scale, scale, scale)
        glowRing.material.opacity = 0.06 + freq * 0.25
      })

      // Particles orbit
      const pPos = pGeo.attributes.position
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const speed = pSpeeds[i]
        const offset = pOffsets[i]
        const baseR = 2.5 + freq * 1
        const angle = t * speed + offset
        pPos.setX(i, Math.cos(angle + pPositions[i * 3]) * baseR * 0.8)
        pPos.setY(i, Math.sin(t * speed * 0.4 + pPositions[i * 3 + 1] * 3) * baseR * 0.4)
        pPos.setZ(i, Math.sin(angle + pPositions[i * 3 + 2]) * baseR * 0.8)
      }
      pPos.needsUpdate = true
      particles.material.size = 0.02 + freq * 0.025

      // Bass shockwaves
      shockwaves.forEach((wave) => {
        wave.userData.age += 0.016
        if (wave.userData.age > 1.6) wave.userData.age = 0
        const prog = wave.userData.age / 1.6
        const scale = 0.1 + prog * 4
        wave.scale.setScalar(scale)
        wave.material.opacity = Math.max(0, (1 - prog) * freq * 1.5)
      })

      // Grid pulse
      grid.material.opacity = 0.04 + freq * 0.2
      grid.position.y = -2 - freq * 0.3

      // Camera breathe
      camera.position.z = 5 + Math.sin(t * 0.5) * 0.3

      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}
      onClick={(e) => {
        if (e.currentTarget.querySelector('.hud-status').style.display !== 'none') return
        const btn = e.currentTarget.querySelector('.hud-init button')
        if (btn) initAudio()
      }}
    >
      {/* HUD — Init */}
      <div className="hud-init" style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 14,
        background: 'rgba(0,0,0,0.88)',
      }}>
        <div style={{ fontSize: 22, filter: 'drop-shadow(0 0 12px rgba(74,222,128,0.6))' }}>🎙</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: '#4ade80', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 2,
        }}>
          <div>HOLOGRAPHIC AUDIO VISUALIZER</div>
          <div style={{ color: '#555' }}>requires microphone access</div>
          <span style={{ color: '#f87171', display: 'none' }} />
        </div>
        <button style={{
          padding: '9px 28px',
          background: 'transparent',
          border: '1px solid #4ade80',
          color: '#4ade80',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          borderRadius: 3,
        }}>
          INITIALIZE
        </button>
      </div>

      {/* HUD — Active */}
      <div className="hud-status" style={{ display: 'none', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: 10, left: 12,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(74,222,128,0.5)', letterSpacing: '0.08em', lineHeight: 2,
        }}>
          <div><span>--</span></div>
          <div>FPS: 60</div>
        </div>
        <div style={{
          position: 'absolute', bottom: 10, right: 12,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(74,222,128,0.35)', letterSpacing: '0.08em', lineHeight: 2,
          textAlign: 'right',
        }}>
          <div>RINGS: 3</div>
          <div>PARTICLES: 600</div>
          <div>SHOCKWAVES: 4</div>
        </div>
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(74,222,128,0.35)', letterSpacing: '0.08em',
        }}>
          <div>tap anywhere to activate</div>
        </div>
      </div>
    </div>
  )
}
