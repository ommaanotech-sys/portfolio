import { motion } from 'framer-motion'

const themes = [
  { id: 'terminal', label: 'Terminal', emoji: '>_' },
  // { id: 'editorial', label: 'Editorial', emoji: '§' },
  // { id: 'glass', label: 'Glassmorphism', emoji: '◈' },
]

export default function ThemeSwitcher({ current, onChange }) {
  return (
    <div className="theme-switcher">
      <span className="theme-label">Theme</span>
      <div className="theme-options">
        {themes.map(t => (
          <motion.button
            key={t.id}
            className={`theme-btn theme-${t.id}${current === t.id ? ' active' : ''}`}
            onClick={() => onChange(t.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="theme-emoji">{t.emoji}</span>
            <span className="theme-name">{t.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
