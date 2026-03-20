import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { data } from '../data'
import * as THREE from 'three'

function ThreeBg() {
  const ref = useRef(null)
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
    const count = 1200
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.15, transparent: true, opacity: 0.6 })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)
    const icoGeo = new THREE.IcosahedronGeometry(9, 1)
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.07 })
    const ico = new THREE.Mesh(icoGeo, icoMat)
    ico.position.set(16, -4, -8)
    scene.add(ico)
    const ico2 = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 1), new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true, transparent: true, opacity: 0.09 }))
    ico2.position.set(-18, 6, -4)
    scene.add(ico2)
    let mouse = { x: 0, y: 0 }
    const onMouse = e => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('mousemove', onMouse)
    let frame = 0, raf
    const animate = () => {
      frame++
      const t = frame * 0.004
      pts.rotation.y = t * 0.04 + mouse.x * 0.02
      pts.rotation.x = mouse.y * 0.015
      ico.rotation.x = t * 0.3; ico.rotation.y = t * 0.5
      ico2.rotation.x = -t * 0.4; ico2.rotation.z = t * 0.2
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02
      camera.position.y += (mouse.y - camera.position.y) * 0.02
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

const sections = ['Home', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact']

export default function Glass() {
  const [active, setActive] = useState('Home')

  return (
    <div className="g-wrap">
      <ThreeBg />
      <div className="g-orb g-orb1" />
      <div className="g-orb g-orb2" />
      <div className="g-orb g-orb3" />

      <nav className="g-nav">
        <div className="g-logo">OMM<span>.</span></div>
        <div className="g-nav-links">
          {sections.map(s => (
            <button key={s} className={`g-nav-btn${active === s ? ' active' : ''}`} onClick={() => setActive(s)}>{s}</button>
          ))}
        </div>
      </nav>

      <div className="g-content">
        {active === 'Home' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="g-hero">
            <motion.div className="g-pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              ● Available for work · South Africa
            </motion.div>
            <motion.h1 className="g-name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              Omphile<br /><span className="g-grad">Molefe Maano</span>
            </motion.h1>
            <motion.div className="g-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {data.title}
            </motion.div>
            <motion.p className="g-bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{data.bio}</motion.p>
            <motion.div className="g-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              {data.stats.map(s => (
                <div key={s.label} className="g-stat">
                  <div className="g-stat-num">{s.num}</div>
                  <div className="g-stat-lbl">{s.label}</div>
                </div>
              ))}
            </motion.div>
            <motion.div className="g-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <a href={`mailto:${data.email}`} className="g-btn-p">✉ Get in touch</a>
              <a href={data.githubUrl} target="_blank" rel="noreferrer" className="g-btn-s">⌥ GitHub</a>
            </motion.div>
          </motion.div>
        )}

        {active === 'Skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="g-section">
            <h2 className="g-sec-title">Technical <span className="g-grad">Proficiency</span></h2>
            <div className="g-skills">
              {data.skills.map((s, i) => (
                <motion.div key={s.name} className="g-skill-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="g-skill-top"><span>{s.name}</span><span className="g-skill-pct">{s.level}%</span></div>
                  <div className="g-skill-track"><motion.div className="g-skill-fill" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ delay: i * 0.06 + 0.2, duration: 0.9 }} /></div>
                </motion.div>
              ))}
            </div>
            <div className="g-tags">{data.techTags.map(t => <span key={t} className="g-tag">{t}</span>)}</div>
          </motion.div>
        )}

        {active === 'Projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="g-section">
            <h2 className="g-sec-title">Selected <span className="g-grad">Work</span></h2>
            <div className="g-projects">
              {data.projects.map((p, i) => (
                <motion.div key={p.name} className={`g-pcard${p.featured ? ' featured' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}>
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
              ))}
            </div>
          </motion.div>
        )}

        {active === 'Experience' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="g-section">
            <h2 className="g-sec-title">Industry <span className="g-grad">Record</span></h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="g-exp">
                <div className="g-exp-head">
                  <div><div className="g-exp-role">{exp.role}</div><div className="g-exp-co">{exp.company} · {exp.location}</div></div>
                  <span className="g-exp-period">{exp.period}</span>
                </div>
                <ul className="g-exp-pts">{exp.points.map((pt, j) => <li key={j}>{pt}</li>)}</ul>
              </div>
            ))}
          </motion.div>
        )}

        {active === 'Credentials' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="g-section">
            <h2 className="g-sec-title">Education & <span className="g-grad">Certifications</span></h2>
            <div className="g-cred-grid">
              <div>
                <div className="g-cred-head">Certifications</div>
                {data.certifications.map((c, i) => (
                  <motion.div key={i} className={`g-cert${c.inProgress ? ' ip' : ''}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className="g-cert-dot" />
                    <div><div className="g-cert-name">{c.name}</div><div className="g-cert-meta">{c.org} · {c.year}</div></div>
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="g-cred-head">Education</div>
                {data.education.map((e, i) => (
                  <motion.div key={i} className="g-edu" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="g-edu-deg">{e.degree}</div>
                    <div className="g-edu-sch">{e.school}</div>
                    <div className="g-edu-meta">{e.location} · {e.year}{e.nqf ? ` · ${e.nqf}` : ''}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {active === 'Contact' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="g-section g-contact">
            <h2 className="g-contact-hl">Let's build something<br /><span className="g-grad">extraordinary</span> together.</h2>
            <div className="g-contact-grid">
              <a href={`mailto:${data.email}`} className="g-ccard"><div className="g-ccard-lbl">Email</div><div>{data.email}</div></a>
              <a href={`tel:${data.phone}`} className="g-ccard"><div className="g-ccard-lbl">Phone</div><div>{data.phone}</div></a>
              <div className="g-ccard"><div className="g-ccard-lbl">Location</div><div>{data.location}</div></div>
              <a href={data.githubUrl} target="_blank" rel="noreferrer" className="g-ccard"><div className="g-ccard-lbl">GitHub</div><div>{data.github}</div></a>
            </div>
            <motion.a href={`mailto:${data.email}`} className="g-cta" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>Send me a message</motion.a>
          </motion.div>
        )}
      </div>

      <div className="g-footer">Built with React · Three.js · Framer Motion · 2025</div>
    </div>
  )
}
