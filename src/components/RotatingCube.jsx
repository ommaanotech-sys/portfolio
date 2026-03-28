import { motion } from 'framer-motion'

export default function RotatingCube() {
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: 800 }}>
      {/* Glow backdrop */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, rgba(74,222,128,0.3) 0%, transparent 70%)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating container */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', zIndex: 1 }}
      >
        {/* The Cube */}
        <motion.div
          className="relative"
          style={{ width: 120, height: 120, transformStyle: 'preserve-3d' }}
          animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
          transition={{ rotateX: { duration: 20, repeat: Infinity, ease: 'linear' }, rotateY: { duration: 14, repeat: Infinity, ease: 'linear' } }}
        >
          {/* Front */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
              boxShadow: 'inset 0 0 20px rgba(74,222,128,0.08)',
            }}
          />
          {/* Back */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'rotateY(180deg) translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
            }}
          />
          {/* Right */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'rotateY(90deg) translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
            }}
          />
          {/* Left */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'rotateY(-90deg) translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
            }}
          />
          {/* Top */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'rotateX(90deg) translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
            }}
          />
          {/* Bottom */}
          <div
            className="absolute border backdrop-blur-sm"
            style={{
              width: 120, height: 120,
              transform: 'rotateX(-90deg) translateZ(60px)',
              borderColor: 'rgba(74,222,128,0.6)',
              background: 'rgba(74,222,128,0.05)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Glow line below cube */}
      <div
        className="absolute"
        style={{
          width: 80,
          height: 2,
          bottom: -20,
          background: 'linear-gradient(90deg, transparent, #4ade80, transparent)',
          boxShadow: '0 0 12px rgba(74,222,128,0.5)',
          borderRadius: 999,
        }}
      />
    </div>
  )
}
