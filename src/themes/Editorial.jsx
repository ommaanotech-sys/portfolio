import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { data } from '../data'

/* ─── Scroll-triggered fade/slide ─── */
function Reveal({ children, delay = 0, y = 16 }) {
  const ref = useRef(null)
  const isIn = useInView(ref, { once: true, margin: '-70px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={isIn ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.4 }}>
      {children}
    </motion.div>
  )
}

/* ─── Contact Form ─── */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errs, setErrs] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const ref = useRef(null)
  const isIn = useInView(ref, { once: true, margin: '-60px' })

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
    setSubmitting(true); setErrs({})
    setTimeout(() => { setSuccess(true); setSubmitting(false) }, 1500)
  }

  if (success) return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="e-form-success">
      <svg className="anim-checkmark" viewBox="0 0 42 42">
        <circle className="c-circle" cx="21" cy="21" r="18" />
        <path className="c-check" d="M12 21l6 6 12-12" />
      </svg>
      Message sent — I'll be in touch shortly.
    </motion.div>
  )

  return (
    <motion.form ref={ref} className="e-form" initial={{ opacity: 0, y: 12 }} animate={isIn ? { opacity: 1, y: 0 } : {}} onSubmit={handleSubmit}>
      <div className="e-form-row">
        <div className="e-form-field">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          {errs.name && <span className="e-form-err">{errs.name}</span>}
        </div>
        <div className="e-form-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          {errs.email && <span className="e-form-err">{errs.email}</span>}
        </div>
      </div>
      <div className="e-form-field">
        <label>Subject</label>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" />
        {errs.subject && <span className="e-form-err">{errs.subject}</span>}
      </div>
      <div className="e-form-field">
        <label>Message</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your message..." rows={5} />
        {errs.message && <span className="e-form-err">{errs.message}</span>}
      </div>
      <button type="submit" className="e-form-submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'SEND MESSAGE'}
      </button>
    </motion.form>
  )
}

/* ─── Nav with scroll shadow ─── */
function EditorialNav({ active, onChange }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`e-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="e-logo">MAANO.DEV</div>
      <div className="e-nav-links">
        {['Cover', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact'].map(s => (
          <button key={s} className={`e-nav-btn${active === s ? ' active' : ''}`} onClick={() => onChange(s)}>{s}</button>
        ))}
      </div>
    </nav>
  )
}

const sections = ['Cover', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact']

export default function Editorial() {
  const [active, setActive] = useState('Cover')
  return (
    <div className="e-wrap">
      <EditorialNav active={active} onChange={setActive} />

      {active === 'Cover' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-cover">
          <div className="e-cover-main">
            <Reveal><div className="e-issue">Portfolio · 2025 · Issue No.1 · Junior Developer Edition</div></Reveal>
            <Reveal delay={0.05}><h1 className="e-headline">
              OMPHILE<br />
              <span className="e-inv">MOLEFE</span><br />
              <span className="e-red">MAANO</span>
            </h1></Reveal>
            <Reveal delay={0.1}><div className="e-tagline">Building systems that matter — one commit at a time.</div></Reveal>
            <Reveal delay={0.15}>
              <blockquote className="e-pullquote">"{data.bio}"</blockquote>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="e-badges">
                <span className="e-badge black">● Available</span>
                <span className="e-badge red">React</span>
                <span className="e-badge outline">SQL</span>
                <span className="e-badge outline">AWS</span>
                <span className="e-badge outline">Python</span>
                <span className="e-badge outline">Node.js</span>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="e-btns">
                <a href={`mailto:${data.email}`} className="e-btn-p">✉ Hire me</a>
                <a href={data.githubUrl} target="_blank" rel="noreferrer" className="e-btn-s">⌥ GitHub</a>
              </div>
            </Reveal>
          </div>
          <div className="e-cover-side">
            {data.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07}>
                <div className="e-stat">
                  <div className="e-stat-num">{s.num}</div>
                  <div className="e-stat-lbl">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="e-cover-bottom">
            {data.education.map((e, i) => (
              <div key={i} className="e-cover-cell">
                <div className="e-cell-lbl">{i === 0 ? 'Education' : i === 1 ? 'Experience' : 'Currently'}</div>
                <div className="e-cell-val">{i === 0 ? `${e.school} · ${e.year}` : i === 1 ? `${data.experience[0]?.company} · ${data.experience[0]?.period.split('–')[0]}` : 'AWS Architect · In Progress'}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {active === 'Skills' && (
        <div className="e-section">
          <Reveal><div className="e-sec-head"><span className="e-sec-num">01</span><h2 className="e-sec-title">SKILLS & EXPERTISE</h2></div></Reveal>
          <div className="e-skills-grid">
            {data.skills.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.06}>
                <div className="e-skill">
                  <div className="e-skill-top"><span>{s.name}</span><span className="e-skill-pct">{s.level}%</span></div>
                  <div className="e-skill-track"><motion.div className="e-skill-fill" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ delay: i * 0.07 + 0.2, duration: 0.8 }} /></div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal><div className="e-divider" /></Reveal>
          <Reveal><div className="e-tags">{data.techTags.map(t => <span key={t} className="e-tag">{t}</span>)}</div></Reveal>
        </div>
      )}

      {active === 'Projects' && (
        <div className="e-section">
          <Reveal><div className="e-sec-head"><span className="e-sec-num">02</span><h2 className="e-sec-title">SELECTED WORK</h2></div></Reveal>
          <div className="e-projects">
            {data.projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div className={`e-pcard${p.featured ? ' featured' : ''}`}>
                  <div className="e-pnum">0{i + 1} — {p.type.toUpperCase()}</div>
                  <div className="e-pname">{p.name.toUpperCase()}</div>
                  <div className="e-pdesc">{p.desc}</div>
                  <div className="e-ptags">{p.tech.map(t => <span key={t} className="e-ptag">{t}</span>)}</div>
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="e-plink">View project →</a>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {active === 'Experience' && (
        <div className="e-section">
          <Reveal><div className="e-sec-head"><span className="e-sec-num">03</span><h2 className="e-sec-title">INDUSTRY RECORD</h2></div></Reveal>
          {data.experience.map((exp, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="e-exp">
                <div className="e-exp-head">
                  <div>
                    <div className="e-exp-role">{exp.role.toUpperCase()}</div>
                    <div className="e-exp-co">{exp.company} · {exp.location}</div>
                  </div>
                  <span className="e-exp-period">{exp.period}</span>
                </div>
                <ul className="e-exp-pts">{exp.points.map((pt, j) => <li key={j}>{pt}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {active === 'Credentials' && (
        <div className="e-section">
          <Reveal><div className="e-sec-head"><span className="e-sec-num">04</span><h2 className="e-sec-title">CREDENTIALS</h2></div></Reveal>
          <div className="e-cred-grid">
            <div>
              <Reveal><div className="e-cred-head">CERTIFICATIONS</div></Reveal>
              {data.certifications.map((c, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className={`e-cert${c.inProgress ? ' ip' : ''}`}>
                    <div className="e-cert-dot" />
                    <div><div className="e-cert-name">{c.name}</div><div className="e-cert-meta">{c.org} · {c.year}</div></div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div>
              <Reveal><div className="e-cred-head">EDUCATION</div></Reveal>
              {data.education.map((e, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="e-edu">
                    <div className="e-edu-deg">{e.degree}</div>
                    <div className="e-edu-sch">{e.school}</div>
                    <div className="e-edu-meta">{e.location} · {e.year}{e.nqf ? ` · ${e.nqf}` : ''}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}

      {active === 'Contact' && (
        <div className="e-section">
          <Reveal><div className="e-sec-head"><span className="e-sec-num">05</span><h2 className="e-sec-title">GET IN TOUCH</h2></div></Reveal>
          <Reveal><div className="e-contact-hl">Let's build something<br /><span className="e-red">extraordinary</span> together.</div></Reveal>
          <Reveal><div className="e-contact-grid">
            <a href={`mailto:${data.email}`} className="e-contact-card"><span className="e-cc-lbl">EMAIL</span><span>{data.email}</span></a>
            <a href={`tel:${data.phone}`} className="e-contact-card"><span className="e-cc-lbl">PHONE</span><span>{data.phone}</span></a>
            <div className="e-contact-card"><span className="e-cc-lbl">LOCATION</span><span>{data.location}</span></div>
            <a href={data.githubUrl} target="_blank" rel="noreferrer" className="e-contact-card"><span className="e-cc-lbl">GITHUB</span><span>{data.github}</span></a>
          </div></Reveal>
          <Reveal delay={0.1}><ContactForm /></Reveal>
          <Reveal delay={0.15}><a href={`mailto:${data.email}`} className="e-cta">SEND MESSAGE →</a></Reveal>
        </div>
      )}

      <div className="e-footer">
        <span>© 2025 Omphile Molefe Maano</span>
        <span>{data.email}</span>
        <span>Built with React · Framer Motion</span>
      </div>
    </div>
  )
}
