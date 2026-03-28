import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Torus, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   AUDIO ANALYZER HOOK
═══════════════════════════════════════════ */
function useAudio() {
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [micError, setMicError] = useState(false)

  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)
      setReady(true)
    } catch (e) {
      setMicError(true)
    }
  }

  const getFreq = () => {
    if (!analyserRef.current || !dataRef.current) return 0
    analyserRef.current.getByteFrequencyData(dataRef.current)
    const arr = dataRef.current
    // Bass: low frequencies
    let bass = 0
    for (let i = 0; i < 8; i++) bass += arr[i]
    bass /= 8
    return bass / 255
  }

  return { init, getFreq, ready, micError }
}

/* ═══════════════════════════════════════════
   GLOWING RINGS
═══════════════════════════════════════════ */
function GlowRing({ radius, thickness, speed, color, freqRef }) {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const freq = freqRef.current
    const t = state.clock.getElapsedTime()
    // Expand and contract with bass
    const scale = 1 + freq * 0.4
    meshRef.current.scale.set(scale, scale, scale)
    meshRef.current.rotation.x = t * speed * 0.3
    meshRef.current.rotation.z = t * speed
    // Opacity pulses with mid frequencies
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.15 + freq * 0.5
    }
  })

  return (
    <group ref={meshRef}>
      <Torus args={[radius, thickness, 16, 100]}>
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </Torus>
      <Torus ref={glowRef} args={[radius, thickness * 2.5, 16, 100]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </Torus>
    </group>
  )
}

/* ═══════════════════════════════════════════
   FLOATING PARTICLES
═══════════════════════════════════════════ */
function Particles({ count = 600, freqRef }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Generate random positions
  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 1.5
      arr.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        scale: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const freq = freqRef.current
    const t = state.clock.getElapsedTime()

    particles.forEach((p, i) => {
      const angle = t * p.speed + p.offset
      const radius = 2.5 + freq * 0.8
      dummy.position.set(
        Math.cos(angle + p.x) * radius * 0.8,
        Math.sin(t * p.speed * 0.5 + p.y * 3) * radius * 0.4,
        Math.sin(angle + p.z) * radius * 0.8
      )
      const s = p.scale * (1 + freq * 2)
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════
   BASS SHOCKWAVE — expanding rings from center
═══════════════════════════════════════════ */
function BassShockwave({ freqRef }) {
  const ringsRef = useRef([])
  const TIMING = 1.2 // seconds per ring

  useFrame((state) => {
    const freq = freqRef.current
    const t = state.clock.getElapsedTime()
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      const age = (t + i * 0.4) % TIMING
      const progress = age / TIMING
      const scale = 0.1 + progress * 3
      const opacity = Math.max(0, (1 - progress) * freq * 2)
      ring.scale.set(scale, scale, scale)
      ring.material.opacity = Math.min(1, opacity)
    })
  })

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Torus
          key={i}
          ref={(el) => { ringsRef.current[i] = el }}
          args={[1, 0.008, 8, 64]}
        >
          <meshBasicMaterial color="#4ade80" transparent opacity={0} />
        </Torus>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════
   CYBERPUNK GRID FLOOR
═══════════════════════════════════════════ */
function CyberGrid({ freqRef }) {
  const meshRef = useRef()

  useFrame(() => {
    if (!meshRef.current) return
    const freq = freqRef.current
    meshRef.current.material.opacity = 0.1 + freq * 0.3
    meshRef.current.position.y = -1.8 - freq * 0.2
  })

  return (
    <gridHelper
      ref={meshRef}
      args={[20, 40, '#4ade80', '#4ade80']}
      position={[0, -1.8, 0]}
    >
      <meshBasicMaterial attach="material" transparent opacity={0.15} />
    </gridHelper>
  )
}

/* ═══════════════════════════════════════════
   CENTRAL ENERGY CORE
═══════════════════════════════════════════ */
function EnergyCore({ freqRef }) {
  const innerRef = useRef()
  const outerRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const freq = freqRef.current
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 1.5
      innerRef.current.rotation.y = t * 2
      innerRef.current.material.emissiveIntensity = 1 + freq * 4
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + freq * 0.6)
      outerRef.current.material.opacity = 0.05 + freq * 0.3
    }
  })

  return (
    <group>
      {/* Inner glowing sphere */}
      <Sphere ref={innerRef} args={[0.35, 32, 32]}>
        <meshStandardMaterial
          color="#4ade80"
          emissive="#4ade80"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>
      {/* Outer shell */}
      <Sphere ref={outerRef} args={[0.5, 16, 16]}>
        <meshBasicMaterial color="#4ade80" transparent opacity={0.1} wireframe />
      </Sphere>
      {/* Point light from core */}
      <pointLight color="#4ade80" intensity={1 + freqRef.current * 3} distance={5} />
    </group>
  )
}

/* ═══════════════════════════════════════════
   SCENE
═══════════════════════════════════════════ */
function Scene({ getFreq }) {
  const freqRef = useRef(0)
  const { camera } = useThree()

  useFrame(() => {
    freqRef.current = getFreq()
    // Camera breathe effect
    camera.position.z = 5 + Math.sin(Date.now() * 0.001) * 0.3
  })

  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 0, 0]} color="#4ade80" intensity={2} distance={6} />

      <EnergyCore freqRef={freqRef} />

      {/* Rings at different scales and speeds */}
      <GlowRing radius={1.2} thickness={0.015} speed={0.4} color="#4ade80" freqRef={freqRef} />
      <GlowRing radius={1.6} thickness={0.01} speed={-0.3} color="#60a5fa" freqRef={freqRef} />
      <GlowRing radius={2.1} thickness={0.008} speed={0.2} color="#a78bfa" freqRef={freqRef} />

      {/* Particles */}
      <Particles count={500} freqRef={freqRef} />

      {/* Bass shockwave */}
      <BassShockwave freqRef={freqRef} />

      {/* Grid floor */}
      <CyberGrid freqRef={freqRef} />

      {/* Floating label */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.18}
          color="#4ade80"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff"
          anchorX="center"
          anchorY="middle"
        >
          OMPHILE.SYS // ACTIVE
        </Text>
      </Float>
    </>
  )
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function AudioVisualizer() {
  const { init, getFreq, ready, micError } = useAudio()
  const [started, setStarted] = useState(false)

  const handleStart = async () => {
    await init()
    setStarted(true)
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!started ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          background: 'rgba(0,0,0,0.85)',
        }}>
          <div style={{
            fontSize: 11,
            color: '#4ade80',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em',
            textAlign: 'center',
            lineHeight: 1.8,
          }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>🎙</div>
            <div>HOLOGRAPHIC AUDIO VISUALIZER</div>
            <div style={{ color: '#6a6a6a', fontSize: 10 }}>requires microphone access</div>
          </div>
          <button
            onClick={handleStart}
            style={{
              padding: '10px 28px',
              background: 'transparent',
              border: '1px solid #4ade80',
              color: '#4ade80',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              borderRadius: 4,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(74,222,128,0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            INITIALIZE
          </button>
          {micError && (
            <div style={{ color: '#f87171', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
              mic access denied
            </div>
          )}
        </div>
      ) : (
        <>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <Scene getFreq={getFreq} />
          </Canvas>

          {/* Corner HUD labels */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 9,
            color: 'rgba(74,222,128,0.5)',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
            lineHeight: 1.8,
          }}>
            <div>SYS.AUDIO // ONLINE</div>
            <div>FPS: 60</div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            fontSize: 9,
            color: 'rgba(74,222,128,0.4)',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
          }}>
            <div>RINGS: 3</div>
            <div>PARTICLES: 500</div>
          </div>
        </>
      )}
    </div>
  )
}
