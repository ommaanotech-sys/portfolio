import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { data } from '../data'
import * as THREE from 'three'

/* ─── Scroll reveal helper ─── */
function Reveal({ children, delay = 0, y = 20 }) {
  const ref = useRef(null)
  const isIn = useInView(ref, { once: true, margin: '-70px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={isIn ? { opacity: 1, y: 0 } : {}} transition={{ delay, duration: 0.45, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

/* ─── Three.js Background with mouse parallax ─── */
function ThreeBg() {
  const ref = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const mount = ref.current
    const w = mount.clientWidth, h = mount.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
    camera.position.z = 30

    // Particle field
    const count = 1200
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 100
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.15, transparent: true, opacity: 0.6 })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    // Wireframe icosahedrons
    const icoGeo = new THREE.IcosahedronGeometry(9, 1)
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.07 })
    const ico = new THREE.Mesh(icoGeo, icoMat)
    ico.position.set(16, -4, -8)
    scene.add(ico)
    const ico2Geo = new THREE.IcosahedronGeometry(5, 1)
    const ico2Mat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true, transparent: true, opacity: 0.09 })
    const ico2 = new THREE.Mesh(ico2Geo, ico2Mat)
    ico2.position.set(-18, 6, -4)
    scene.add(ico2)

    const onMouse = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    let frame = 0, raf
    const animate = () => {
      frame++
      const t = frame * 0.004
      const mx = mouse.current.x, my = mouse.current.y

      // Parallax rotation
      pts.rotation.y = t * 0.04 + mx * 0.2
      pts.rotation.x = my * 0.15
      ico.rotation.x = t * 0.3 + my * 0.1; ico.rotation.y = t * 0.5 + mx * 0.15
      ico2.rotation.x = -t * 0.4 + my * 0.08; ico2.rotation.z = t * 0.2 + mx * 0.1

      // Camera follows mouse
      camera.position.x += (mx * 2 - camera.position.x) * 0.02
      camera.position.y += (my - camera.position.y) * 0.02
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const onResize = () => { camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMouse); window.removeEventListener('resize', onResize); mount.removeChild(renderer.domElement); renderer.dispose() }
  }, [])

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

/* ─── Sticky Nav with scroll blur ─── */
function GlassNav({ active, onChange }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`g-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="g-logo">OMM<span>.</span></div>
      <div className="g-nav-links">
        {['Home', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact'].map(s => (
          <button key={s} className={`g-nav-btn${active === s ? ' active' : ''}`} onClick={() => onChange(s)}>{s}</button>
        ))}
      </div>
    </nav>
  )
}

/* ─── Contact Form ─── */
function GlassForm() {
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="g-form-success">
      <svg className="anim-checkmark" viewBox="0 0 42 42">
        <circle className="c-circle" cx="21" cy="21" r="18" />
        <path className="c-check" d="M12 21l6 6 12-12" />
      </svg>
      Message sent — I'll get back to you soon.
    </motion.div>
  )

  return (
    <motion.form ref={ref} className="g-form" initial={{ opacity: 0, y: 16 }} animate={isIn ? { opacity: 1, y: 0 } : {}} onSubmit={handleSubmit}>
      <div className="g-form-row">
        <div className="g-form-field">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          {errs.name && <span className="g-form-err">{errs.name}</span>}
        </div>
        <div className="g-form-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          {errs.email && <span className="g-form-err">{errs.email}</span>}
        </div>
      </div>
      <div className="g-form-field">
        <label>Subject</label>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" />
        {errs.subject && <span className="g-form-err">{errs.subject}</span>}
      </div>
      <div className="g-form-field">
        <label>Message</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your message..." rows={5} />
        {errs.message && <span className="g-form-err">{errs.message}</span>}
      </div>
      <button type="submit" className="g-form-submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send message'}
      </button>
    </motion.form>
  )
}

const sections = ['Home', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact']

export default function Glass() {
  const [active, setActive] = useState('Home')

  return (
    <div className="g-wrap">
      <div className="g-grain" />
      <ThreeBg />
      <GlassNav active={active} onChange={setActive} />

      <div className="g-content">
        {active === 'Home' && (
          <div className="g-hero">
            <Reveal><div className="g-pill">● Available for work · South Africa</div></Reveal>
            <Reveal delay={0.08}><h1 className="g-name">Omphile<br /><span className="g-grad">Molefe Maano</span></h1></Reveal>
            <Reveal delay={0.14}><div className="g-title">{data.title}</div></Reveal>
            <Reveal delay={0.2}><p className="g-bio">{data.bio}</p></Reveal>
            <Reveal delay={0.26}>
              <div className="g-stats">
                {data.stats.map((s, i) => (
                  <div key={s.label} className="g-stat">
                    <div className="g-stat-num">{s.num}</div>
                    <div className="g-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="g-btns">
                <a href={`mailto:${data.email}`} className="g-btn-p">✉ Get in touch</a>
                <a href={data.githubUrl} target="_blank" rel="noreferrer" className="g-btn-s">⌥ GitHub</a>
              </div>
            </Reveal>
          </div>
        )}

        {active === 'Skills' && (
          <div className="g-section">
            <Reveal><h2 className="g-sec-title">Technical <span className="g-grad">Proficiency</span></h2></Reveal>
            <div className="g-skills">
              {data.skills.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.06}>
                  <div className="g-skill-card">
                    <div className="g-skill-top"><span>{s.name}</span><span className="g-skill-pct">{s.level}%</span></div>
                    <div className="g-skill-track"><motion.div className="g-skill-fill" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ delay: i * 0.07 + 0.2, duration: 0.9 }} /></div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}><div className="g-tags">{data.techTags.map(t => <span key={t} className="g-tag">{t}</span>)}</div></Reveal>
          </div>
        )}

        {active === 'Projects' && (
          <div className="g-section">
            <Reveal><h2 className="g-sec-title">Selected <span className="g-grad">Work</span></h2></Reveal>
            <div className="g-projects">
              {data.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.1}>
                  <motion.div
                    className={`g-pcard${p.featured ? ' featured' : ''}`}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <div className="g-pcard-top">
                      <div className="g-picon" style={{ background: i === 0 ? 'rgba(167,139,250,0.2)' : i === 1 ? 'rgba(236,72,153,0.2)' : 'rgba(249,115,22,0.2)' }}>{p.icon}</div>
                      <span className="g-pyr">{p.year}</span>
                    </div>
                    {p.featured && <div className="g-pfeat">★ Featured</div>}
                    <div className="g-pname">{p.name}</div>
                    <div className="g-pdesc">{p.desc}</div>
                    <div className="g-ptags">{p.tech.map(t => <span key={t} className="g-ptag">{t}</span>)}</div>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="g-plink">View on GitHub →</a>}
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {active === 'Experience' && (
          <div className="g-section">
            <Reveal><h2 className="g-sec-title">Industry <span className="g-grad">Record</span></h2></Reveal>
            {data.experience.map((exp, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="g-exp">
                  <div className="g-exp-head">
                    <div><div className="g-exp-role">{exp.role}</div><div className="g-exp-co">{exp.company} · {exp.location}</div></div>
                    <span className="g-exp-period">{exp.period}</span>
                  </div>
                  <ul className="g-exp-pts">{exp.points.map((pt, j) => <li key={j}>{pt}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {active === 'Credentials' && (
          <div className="g-section">
            <Reveal><h2 className="g-sec-title">Education & <span className="g-grad">Certifications</span></h2></Reveal>
            <div className="g-cred-grid">
              <div>
                <Reveal><div className="g-cred-head">Certifications</div></Reveal>
                {data.certifications.map((c, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <div className={`g-cert${c.inProgress ? ' ip' : ''}`}>
                      <div className="g-cert-dot" />
                      <div><div className="g-cert-name">{c.name}</div><div className="g-cert-meta">{c.org} · {c.year}</div></div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div>
                <Reveal><div className="g-cred-head">Education</div></Reveal>
                {data.education.map((e, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="g-edu">
                      <div className="g-edu-deg">{e.degree}</div>
                      <div className="g-edu-sch">{e.school}</div>
                      <div className="g-edu-meta">{e.location} · {e.year}{e.nqf ? ` · ${e.nqf}` : ''}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        )}

        {active === 'Contact' && (
          <div className="g-section g-contact">
            <Reveal><h2 className="g-contact-hl">Let's build something<br /><span className="g-grad">extraordinary</span> together.</h2></Reveal>
            <Reveal delay={0.08}><div className="g-contact-grid">
              <a href={`mailto:${data.email}`} className="g-ccard"><div className="g-ccard-lbl">Email</div><div>{data.email}</div></a>
              <a href={`tel:${data.phone}`} className="g-ccard"><div className="g-ccard-lbl">Phone</div><div>{data.phone}</div></a>
              <div className="g-ccard"><div className="g-ccard-lbl">Location</div><div>{data.location}</div></div>
              <a href={data.githubUrl} target="_blank" rel="noreferrer" className="g-ccard"><div className="g-ccard-lbl">GitHub</div><div>{data.github}</div></a>
            </div></Reveal>
            <Reveal delay={0.14}><GlassForm /></Reveal>
          </div>
        )}
      </div>

      <div className="g-footer">Built with React · Three.js · Framer Motion · 2025</div>
    </div>
  )
}
