import { useState, useEffect, useRef } from 'react'
import { data } from '../data'

const BOOT_SEQ = [
  '┌─────────────────────────────────────────────────────┐',
  '│         OMPHILE MOLEFE MAANO — PORTFOLIO v3.0       │',
  '│         IT Support Assistant & Web Administrator    │',
  '└─────────────────────────────────────────────────────┘',
  '',
  '> Booting system...',
  '> Loading profile data...          [OK]',
  '> Mounting skills database...      [OK]',
  '> Connecting to GitHub...          [OK]',
  '> Status: Available for work ✓',
  '',
  'Type "help" to see available commands.',
  '',
]

const COMMANDS = {
  help: () =>
    `AVAILABLE COMMANDS
──────────────────────────────────────────
  about        →  Who I am
  skills       →  Technical skills
  experience   →  Work history
  projects     →  My projects
  education    →  Qualifications
  certs        →  Certifications
  contact      →  Get in touch
  cv           →  Download my CV
  clear        →  Clear the terminal
  whoami       →  Current user
  date         →  Current date & time
──────────────────────────────────────────`,

  about: () =>
    `ABOUT
──────────────────────────────────────────
  Name      →  ${data.name}
  Role      →  ${data.title}
  Location  →  ${data.location}
  Status    →  ${data.available ? '✓ Available for work' : 'Not available'}

  ${data.bio}`,

  skills: () =>
    `TECHNICAL SKILLS
──────────────────────────────────────────
${data.skills.map(s => `  →  ${s.name}`).join('\n')}

TECH STACK
──────────────────────────────────────────
  ${data.techTags.join('  ·  ')}`,

  experience: () =>
    `EXPERIENCE
──────────────────────────────────────────
${data.experience.map(e =>
  `  ${e.role}
  ${e.company}  |  ${e.location}
  ${e.period}

${e.points.map(p => `    →  ${p}`).join('\n')}`
).join('\n\n')}`,

  projects: () =>
    `PROJECTS
──────────────────────────────────────────
${data.projects.map(p =>
  `  ${p.featured ? '★ ' : '  '}${p.name}  [${p.year} · ${p.type}]
    ${p.desc}
    Stack  →  ${p.tech.join(' · ')}${p.link ? `\n    Link   →  ${p.link}` : ''}`
).join('\n\n')}`,

  education: () =>
    `EDUCATION
──────────────────────────────────────────
${data.education.map(e =>
  `  ${e.degree}
  ${e.school}  |  ${e.location}  |  ${e.year}`
).join('\n\n')}`,

  certs: () =>
    `CERTIFICATIONS
──────────────────────────────────────────
${data.certifications.map(c =>
  `  ${c.inProgress ? '○' : '✓'}  ${c.name}
     ${c.org}  ·  ${c.year}`
).join('\n\n')}`,

  contact: () =>
    `CONTACT
──────────────────────────────────────────
  EMAIL     →  ${data.email}
  PHONE     →  ${data.phone}
  GITHUB    →  ${data.githubUrl}
  LOCATION  →  ${data.location}

  Type "cv" to download my CV.`,

  cv: () => '__DOWNLOAD_CV__',

  whoami: () => `omphile`,

  date: () => new Date().toString(),

  clear: () => '__CLEAR__',
}

const CV_URL = 'https://raw.githubusercontent.com/ommaanotech-sys/portfolio/main/Omphile_Molefe%20Maano.pdf'

export default function Terminal() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdIdx, setCmdIdx] = useState(-1)
  const [booting, setBooting] = useState(true)
  const [bootLines, setBootLines] = useState([])
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  // Boot sequence
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
      setHistory(prev => [...prev, {
        cmd: raw,
        out: '> Initiating CV download...',
      }])
      setTimeout(() => {
        window.open(CV_URL, '_blank')
        setHistory(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            cmd: raw,
            out: `> Initiating CV download...
✓  Download started.

  If it did not start automatically:
  ${CV_URL}`,
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{ width: '100%', maxWidth: 860 }}>

        {/* Title bar */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '8px 8px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #333',
        }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <span style={{ flex: 1, textAlign: 'center', color: '#888', fontSize: 13 }}>
            omphile@portfolio:~
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #222',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '24px 28px',
          minHeight: '80vh',
          color: '#c8c8c8',
          fontSize: 14,
          lineHeight: 1.7,
        }}>

          {/* Boot lines */}
          {bootLines.map((line, i) => (
            <div key={i} style={{ color: i < 3 ? '#28c840' : '#888', whiteSpace: 'pre' }}>
              {line}
            </div>
          ))}

          {/* Command history */}
          {history.map((h, i) => (
            <div key={i} style={{ marginTop: 12 }}>
              <div style={{ color: '#28c840' }}>
                omphile@portfolio:~$ <span style={{ color: '#fff' }}>{h.cmd}</span>
              </div>
              <div style={{
                color: h.error ? '#ff5f57' : '#c8c8c8',
                whiteSpace: 'pre-wrap',
                marginTop: 4,
                paddingLeft: 4,
              }}>
                {h.out}
              </div>
            </div>
          ))}

          {/* Input */}
          {!booting && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
              <span style={{ color: '#28c840', flexShrink: 0 }}>
                omphile@portfolio:~$&nbsp;
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 14,
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
