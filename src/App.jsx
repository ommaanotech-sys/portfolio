import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeSwitcher from './components/ThemeSwitcher'
import Terminal from './themes/Terminal'
import Editorial from './themes/Editorial'
import Glass from './themes/Glass'
import './styles.css'

export default function App() {
  const [theme, setTheme] = useState('terminal')

  return (
    <div className="app">
      <ThemeSwitcher current={theme} onChange={setTheme} />
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {theme === 'terminal' && <Terminal />}
          {theme === 'editorial' && <Editorial />}
          {theme === 'glass' && <Glass />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
