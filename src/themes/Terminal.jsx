import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { data } from '../data'

/* ─── Live CLI Prompt ─── */
function LiveTerminal() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [cmdIdx, setCmdIdx] = useState(-1)
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState([])
  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, margin: '-80px' })

  const BOOT_SEQ = [
    '> Initializing omphile-portfolio v2.0.0...',
    '> Loading system modules...',
    '> Mounting /dev/creativity... OK',
    '> Loading skills database... 8 entries found',
    '> Connecting to GitHub... github.com/ommaanotech-sys ✓',
    '> Establishing secure connection... AES-256 ✓',
    '',
    '┌─────────────────────────────────────────────┐',
    '│  omphile-portfolio — ready.                │',
    '│  Type "help" to see available commands.    │',
    '└─────────────────────────────────────────────┘',
    '',
  ]

  useEffect(() => {
    if (!isInView) return
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_SEQ.length) {
        setBootLines(prev => [...prev, BOOT_SEQ[i]])
        i++
      } else {
        clearInterval(interval)
        setBootDone(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 90)
    return () => clearInterval(interval)
  }, [isInView])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, bootLines])

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase()
    const out = getOutput(cmd)
    setHistory(prev => [...prev, { cmd: raw, out }])
    setCmdHistory(prev => [raw, ...prev])
    setCmdIdx(-1)
    setInput('')
  }

  const getOutput = (cmd) => {
    switch (cmd) {
      case '': return null
      case 'help': return `Available commands:
  about      → Bio & overview
  skills     → Technical skills
  projects   → Featured projects
  experience → Work history
  credentials → Certs & education
  contact    → Contact information
  whoami     → Current user
  ls         → List all sections
  date       → Current date/time
  clear      → Clear terminal
  theme      → Theme info`
      case 'about': return `╔══════════════════════════════════════╗
║  ${data.name}
║  ${data.title}
╚══════════════════════════════════════╝

${data.bio}

Status: ${data.available ? 'Available for work ✓' : 'Not available'}
Email:  ${data.email}
Phone:  ${data.phone}
GitHub: ${data.github}`
      case 'skills': {
        const bars = data.skills.map(s => {
          const filled = Math.round(s.level / 5)
          return `${s.name.padEnd(18)} [${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${s.level}%`
        }).join('\n')
        return `Technical Skills:\n${bars}\n\nTech Stack: ${data.techTags.join(' · ')}`
      }
      case 'projects': return data.projects.map(p =>
        `\n★ ${p.featured ? '(FEATURED) ' : ''}${p.name} [${p.year}]\n  ${p.desc}\n  Stack: ${p.tech.join(' · ')}\n  Link: ${p.link || 'N/A'}`
      ).join('')
      case 'experience': return data.experience.map(e =>
        `\n[${e.period}] ${e.role}\n  ${e.company} — ${e.location}\n${e.points.map(p => '  → ' + p).join('\n')}`
      ).join('')
      case 'credentials': {
        const certs = data.certifications.map(c => `  ${c.name} — ${c.org}, ${c.year}`).join('\n')
        const ed = data.education.map(e => `  ${e.degree} — ${e.school}, ${e.year}`).join('\n')
        return `Certifications:\n${certs}\n\nEducation:\n${ed}`
      }
      case 'contact': return `Email:    ${data.email}
Phone:   ${data.phone}
GitHub:  ${data.githubUrl}
Location: ${data.location}`
      case 'whoami': return `omphile`
      case 'ls': return `about/  skills/  projects/  experience/  credentials/  contact/`
      case 'date': return new Date().toString()
      case 'clear': return '__CLEAR__'
      case 'theme': return `Terminal Theme — omphile-portfolio
Style: Vintage CLI / Hacker
Commands: try "help"`
      default: return `bash: ${cmd}: command not found\nType "help" for available commands.`
    }
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
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx] || '')
    }
  }

  const handleClear = () => { setHistory([]); setBootLines([]); setBootDone(false) }
  const filtered = history.filter(h => h.out !== '__CLEAR__')

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Boot sequence */}
      <div className="t-cli">
        {bootLines.map((line, i) => (
          <div key={i} className="t-cli-boot">
            {line.includes('✓') ? line.replace('✓', '<span>✓</span>') : line}
          </div>
        ))}

        {/* Command history */}
        {filtered.map((h, i) => (
          <div key={i}>
            <div className="t-cli-hist-cmd">omphile@portfolio:~$ {h.cmd}</div>
            {h.out && <div className="t-cli-hist-out">{h.out}</div>}
          </div>
        ))}

        {/* Active input */}
        {bootDone && (
          <div className="t-cli-input-row">
            <span className="t-prompt-label">omphile@portfolio:~$</span>
            <input
              ref={inputRef}
              className="t-cli-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </motion.div>
  )
}

/* ─── Skill bars with animated count-up ─── */
function SkillBar({ name, level, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className="t-skill-row"
      initial={{ opacity: 0, x: -10 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.4 }}
    >
      <span className="t-skill-name">{name}</span>
      <SkillBarVisual level={level} />
      <AnimatedNumber target={level} isInView={isInView} />
    </motion.div>
  )
}

function SkillBarVisual({ level }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.span
      ref={ref}
      className="t-skill-bar"
      initial={{ width: 0 }}
      animate={isInView ? { width: 'auto' } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ overflow: 'hidden', display: 'inline-block', maxWidth: '180px', width: '180px' }}
    >
      {'█'.repeat(Math.round(level / 10))}{'░'.repeat(10 - Math.round(level / 10))}
    </motion.span>
  )
}

function AnimatedNumber({ target, isInView }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const dur = 1000
    const step = target / (dur / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.round(start))
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target])
  return <span className="t-green"> {val}%</span>
}

/* ─── Contact Form ─── */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errs, setErrs] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.subject.trim()) e.subject = 'Required'
    if (!form.message.trim()) e.message = 'Required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrs(e2); return }
    setSubmitting(true)
    setErrs({})
    setTimeout(() => { setSuccess(true); setSubmitting(false) }, 1500)
  }

  if (success) return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="t-form-success">
      <svg className="anim-checkmark" viewBox="0 0 42 42">
        <circle className="c-circle" cx="21" cy="21" r="18" />
        <path className="c-check" d="M12 21l6 6 12-12" />
      </svg>
      Message transmitted. I'll get back to you soon.
    </motion.div>
  )

  return (
    <motion.form
      ref={ref}
      className="t-form"
      initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
      onSubmit={handleSubmit}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="t-form-field">
          <label>name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          {errs.name && <span className="t-form-err">{errs.name}</span>}
        </div>
        <div className="t-form-field">
          <label>email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          {errs.email && <span className="t-form-err">{errs.email}</span>}
        </div>
      </div>
      <div className="t-form-field">
        <label>subject</label>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" />
        {errs.subject && <span className="t-form-err">{errs.subject}</span>}
      </div>
      <div className="t-form-field">
        <label>message</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your message..." rows={4} />
        {errs.message && <span className="t-form-err">{errs.message}</span>}
      </div>
      <button type="submit" className="t-form-submit" disabled={submitting}>
        {submitting ? '> transmitting...' : '> send_message'}
      </button>
    </motion.form>
  )
}

/* ─── Section wrappers with scroll reveal ─── */
function Section({ id, children, isInView }) {
  return (
    <motion.div
      id={`t-${id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Main Terminal ─── */
export default function Terminal() {
  const [activeSection, setActiveSection] = useState('about')
  const sections = ['about', 'skills', 'projects', 'experience', 'credentials', 'contact']
  const sectionRefs = useRef({})
  const inViews = useRef({})

  const setRef = (id) => (el) => { sectionRefs.current[id] = el }

  return (
    <div className="t-wrap">
      <div className="t-titlebar">
        <div className="t-dots">
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <span className="t-wintitle">omphile@portfolio:~</span>
        <div style={{ width: 52 }} />
      </div>

      <div className="t-nav">
        {sections.map(s => (
          <button key={s} className={`t-nav-btn${activeSection === s ? ' active' : ''}`} onClick={() => setActiveSection(s)}>
            {activeSection === s ? '▶ ' : '  '}{s}
          </button>
        ))}
      </div>

      <div className="t-body">
        {activeSection === 'about' && (
          <Section id="about">
            <LiveTerminal />
          </Section>
        )}

        {activeSection === 'skills' && (
          <Section id="skills">
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">./skills --list --verbose</span></div>
            <br />
            {data.skills.map((s, i) => (
              <SkillBar key={s.name} name={s.name} level={s.level} delay={i * 0.06} />
            ))}
            <br />
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">ls ./tech-stack/</span></div>
            <div className="t-tags">
              {data.techTags.map(t => <span key={t} className="t-tag">{t}</span>)}
            </div>
          </Section>
        )}

        {activeSection === 'projects' && (
          <Section id="projects">
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">ls -la ./projects/</span></div>
            <br />
            {data.projects.map((p, i) => (
              <motion.div
                key={p.name}
                className="t-project"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <div className="t-project-header">
                  <span className="t-yellow">drwxr-xr-x</span>
                  <span className="t-green"> {p.featured ? '★ ' : '  '}{p.name}/</span>
                  <span className="t-dim"> [{p.year} · {p.type}]</span>
                </div>
                <div className="t-project-body">
                  <div className="t-line t-dim">  └─ {p.desc}</div>
                  <div className="t-line">  └─ <span className="t-yellow">stack:</span> {p.tech.join(' · ')}</div>
                  {p.link && (
                    <div className="t-line">  └─ <a href={p.link} target="_blank" rel="noreferrer" className="t-blue" style={{ textDecoration: 'underline' }}>{p.link}</a></div>
                  )}
                </div>
              </motion.div>
            ))}
          </Section>
        )}

        {activeSection === 'experience' && (
          <Section id="experience">
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">cat experience.log</span></div>
            <br />
            {data.experience.map((e, i) => (
              <motion.div
                key={i}
                className="t-exp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="t-line"><span className="t-green">[{e.period}]</span> <span className="t-white">{e.role}</span></div>
                <div className="t-line t-dim">  company: {e.company} · {e.location}</div>
                <br />
                {e.points.map((pt, j) => (
                  <div key={j} className="t-line t-dim">  + {pt}</div>
                ))}
              </motion.div>
            ))}
          </Section>
        )}

        {activeSection === 'credentials' && (
          <Section id="credentials">
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">cat credentials.json</span></div>
            <br />
            <div className="t-line t-yellow">{'{'}</div>
            <div className="t-line">  <span className="t-blue">"certifications"</span>: [</div>
            {data.certifications.map((c, i) => (
              <div key={i} className="t-line t-dim">
                {'    { '}<span className="t-green">"{c.name}"</span>{` · ${c.org} · ${c.year} }`}{i < data.certifications.length - 1 ? ',' : ''}
              </div>
            ))}
            <div className="t-line">  ],</div>
            <div className="t-line">  <span className="t-blue">"education"</span>: [</div>
            {data.education.map((e, i) => (
              <div key={i} className="t-line t-dim">
                {'    { '}<span className="t-green">"{e.degree}"</span>{` · ${e.school} · ${e.year} }`}{i < data.education.length - 1 ? ',' : ''}
              </div>
            ))}
            <div className="t-line">  ]</div>
            <div className="t-line t-yellow">{'}'}</div>
          </Section>
        )}

        {activeSection === 'contact' && (
          <Section id="contact">
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">./contact --init</span></div>
            <br />
            <div className="t-line t-green">Initializing contact protocol...</div>
            <div className="t-line t-green">✓ Connection established</div>
            <br />
            <div className="t-line"><span className="t-yellow">EMAIL</span>    → <a href={`mailto:${data.email}`} className="t-blue">{data.email}</a></div>
            <div className="t-line"><span className="t-yellow">PHONE</span>    → <span className="t-white">{data.phone}</span></div>
            <div className="t-line"><span className="t-yellow">GITHUB</span>   → <a href={data.githubUrl} className="t-blue" target="_blank" rel="noreferrer">{data.github}</a></div>
            <div className="t-line"><span className="t-yellow">LOCATION</span> → <span className="t-white">{data.location}</span></div>
            <br />
            <div className="t-line t-dim"># — or fill the form below —</div>
            <br />
            <ContactForm />
            <div className="t-prompt" style={{ marginTop: 20 }}>omphile@portfolio:~$ <span className="t-cursor">█</span></div>
          </Section>
        )}
      </div>
    </div>
  )
}
