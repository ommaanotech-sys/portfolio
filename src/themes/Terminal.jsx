import { useState, useEffect, useRef } from 'react'
import { data } from '../data'

const isMobile = () => window.innerWidth < 600

const BOOT_SEQ = [
  '┌─────────────────────────────────────┐',
  '│   OMPHILE MOLEFE MAANO — v3.0       │',
  '│   IT Support & Web Administrator    │',
  '└─────────────────────────────────────┘',
  '',
  '> Booting system...          [OK]',
  '> Loading profile...         [OK]',
  '> Status: Available for work ✓',
  '',
  'Type "help" or tap a command below.',
  '',
]

const COMMANDS = {
  help: () =>
    `AVAILABLE COMMANDS
──────────────────────────────
  about       →  Who I am
  skills      →  Technical skills
  experience  →  Work history
  projects    →  My projects
  education   →  Qualifications
  certs       →  Certifications
  contact     →  Get in touch
  cv          →  Download my CV
  clear       →  Clear terminal
  whoami      →  Current user
  date        →  Current date
──────────────────────────────`,

  about: () =>
    `ABOUT
──────────────────────────────
  Name      →  ${data.name}
  Role      →  ${data.title}
  Location  →  ${data.location}
  Status    →  ${data.available ? '✓ Available for work' : 'Not available'}

  ${data.bio}`,

  skills: () =>
    `TECHNICAL SKILLS
──────────────────────────────
${data.skills.map(s => `  →  ${s.name}`).join('\n')}

TECH STACK
──────────────────────────────
  ${data.techTags.join(' · ')}`,

  experience: () =>
    `EXPERIENCE
──────────────────────────────
${data.experience.map(e =>
  `  ${e.role}
  ${e.company}
  ${e.location}
  ${e.period}

${e.points.map(p => `  →  ${p}`).join('\n')}`
).join('\n\n')}`,

  projects: () =>
    `PROJECTS
──────────────────────────────
${data.projects.map(p =>
  `  ${p.featured ? '★ ' : '  '}${p.name} [${p.year}]
  ${p.desc}
  Stack → ${p.tech.join(' · ')}${p.link ? `\n  Link  → ${p.link}` : ''}`
).join('\n\n')}`,

  education: () =>
    `EDUCATION
──────────────────────────────
${data.education.map(e =>
  `  ${e.degree}
  ${e.school} · ${e.year}`
).join('\n\n')}`,

  certs: () =>
    `CERTIFICATIONS
──────────────────────────────
${data.certifications.map(c =>
  `  ${c.inProgress ? '○' : '✓'}  ${c.name}
     ${c.org} · ${c.year}`
).join('\n\n')}`,

  contact: () =>
    `CONTACT
──────────────────────────────
  EMAIL    →  ${data.email}
  PHONE    →  ${data.phone}
  GITHUB   →  ${data.githubUrl}
  LOCATION →  ${data.location}

  Type "cv" to download my CV.`,

  cv: () => '__DOWNLOAD_CV__',
  whoami: () => 'omphile',
  date: () => new Date().toString(),
  clear: () => '__CLEAR__',
}

const CV_URL = '/CV.pdf'

const QUICK_CMDS = ['about', 'skills', 'experience', 'projects', 'certs', 'contact', 'cv']

export default function Terminal() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdIdx, setCmdIdx] = useState(-1)
  const [booting, setBooting] = useState(true)
  const [bootLines, setBootLines] = useState([])
  const [mobile, setMobile] = useState(false)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_SEQ.length) {
        setBootLines(prev => [...prev, BOOT_SEQ[i]])
        i++
      } else {
        clearInterval(interval)
        setBooting(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, bootLines])

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase()
    const fn = COMMANDS[cmd]

    if (!fn) {
      setHistory(prev => [...prev, {
        cmd: raw,
        out: `bash: ${cmd}: command not found\nType "help" for available commands.`,
        error: true,
      }])
      setCmdHistory(prev => [raw, ...prev])
      setCmdIdx(-1)
      setInput('')
      return
    }

    const result = fn()

    if (result === '__CLEAR__') {
      setHistory([])
      setCmdHistory(prev => [raw, ...prev])
      setCmdIdx(-1)
      setInput('')
      return
    }

    if (result === '__DOWNLOAD_CV__') {
      setHistory(prev => [...prev, { cmd: raw, out: '> Initiating CV download...' }])
      setTimeout(() => {
        window.open(CV_URL, '_blank')
        setHistory(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            cmd: raw,
            out: `> Initiating CV download...\n✓  Download started.\n\n  If it did not start:\n  ${CV_URL}`,
          }
          return updated
        })
      }, 400)
      setCmdHistory(prev => [raw, ...prev])
      setCmdIdx(-1)
      setInput('')
      return
    }

    setHistory(prev => [...prev, { cmd: raw, out: result }])
    setCmdHistory(prev => [raw, ...prev])
    setCmdIdx(-1)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) runCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIdx = Math.min(cmdIdx + 1, cmdHistory.length - 1)
      setCmdIdx(newIdx)
      if (cmdHistory[newIdx] !== undefined) setInput(cmdHistory[newIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIdx = Math.max(cmdIdx - 1, -1)
      setCmdIdx(newIdx)
      setInput(newIdx === -1 ? '' : (cmdHistory[newIdx] || ''))
    }
  }

  const prompt = mobile ? '~$' : 'omphile@portfolio:~$'
  const fontSize = mobile ? 12 : 14
  const padding = mobile ? '16px' : '24px 28px'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: mobile ? '0' : '40px 16px',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        boxSizing: 'border-box',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{ width: '100%', maxWidth: 860 }}>

        {/* Title bar */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: mobile ? '0' : '8px 8px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #333',
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <span style={{ flex: 1, textAlign: 'center', color: '#888', fontSize: 12 }}>
            omphile@portfolio:~
          </span>
        </div>

        {/* Quick command buttons — mobile only */}
        {!booting && mobile && (
          <div style={{
            background: '#111',
            borderBottom: '1px solid #222',
            padding: '8px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            {QUICK_CMDS.map(cmd => (
              <button
                key={cmd}
                onClick={(e) => { e.stopPropagation(); runCommand(cmd) }}
                style={{
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: 4,
                  color: '#28c840',
                  fontFamily: 'inherit',
                  fontSize: 11,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {/* Terminal body */}
        <div style={{
          background: '#0d0d0d',
          border: mobile ? 'none' : '1px solid #222',
          borderTop: 'none',
          borderRadius: mobile ? '0' : '0 0 8px 8px',
          padding,
          minHeight: mobile ? '100vh' : '80vh',
          color: '#c8c8c8',
          fontSize,
          lineHeight: 1.7,
          overflowX: 'hidden',
          wordBreak: 'break-word',
        }}>

          {/* Boot lines */}
          {bootLines.map((line, i) => (
            <div key={i} style={{
              color: i < 4 ? '#28c840' : '#888',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {line}
            </div>
          ))}

          {/* Command history */}
          {history.map((h, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <div style={{ color: '#28c840', wordBreak: 'break-all' }}>
                {prompt} <span style={{ color: '#fff' }}>{h.cmd}</span>
              </div>
              <div style={{
                color: h.error ? '#ff5f57' : '#c8c8c8',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginTop: 4,
                paddingLeft: mobile ? 0 : 4,
              }}>
                {h.out}
              </div>
            </div>
          ))}

          {/* Input */}
          {!booting && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, flexWrap: 'nowrap' }}>
              <span style={{ color: '#28c840', flexShrink: 0, fontSize, whiteSpace: 'nowrap' }}>
                {prompt}&nbsp;
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                autoFocus={!mobile}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize,
                  caretColor: '#28c840',
                }}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}
