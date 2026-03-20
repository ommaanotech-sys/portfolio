import { useState } from 'react'
import { motion } from 'framer-motion'
import { data } from '../data'

const sections = ['Cover', 'Skills', 'Projects', 'Experience', 'Credentials', 'Contact']

export default function Editorial() {
  const [active, setActive] = useState('Cover')

  return (
    <div className="e-wrap">
      <div className="e-nav">
        <div className="e-logo">MAANO.DEV</div>
        <div className="e-nav-links">
          {sections.map(s => (
            <button key={s} className={`e-nav-btn${active === s ? ' active' : ''}`} onClick={() => setActive(s)}>{s}</button>
          ))}
        </div>
      </div>

      {active === 'Cover' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-cover">
          <div className="e-cover-main">
            <div className="e-issue">Portfolio · 2025 · Issue No.1 · Junior Developer Edition</div>
            <h1 className="e-headline">
              OMPHILE<br />
              <span className="e-inv">MOLEFE</span><br />
              <span className="e-red">MAANO</span>
            </h1>
            <div className="e-tagline">Building systems that matter — one commit at a time.</div>
            <p className="e-bio">{data.bio}</p>
            <div className="e-badges">
              <span className="e-badge black">● Available</span>
              <span className="e-badge red">React</span>
              <span className="e-badge outline">SQL</span>
              <span className="e-badge outline">AWS</span>
              <span className="e-badge outline">Python</span>
              <span className="e-badge outline">Node.js</span>
            </div>
            <div className="e-btns">
              <a href={`mailto:${data.email}`} className="e-btn-p">✉ Hire me</a>
              <a href={data.githubUrl} target="_blank" rel="noreferrer" className="e-btn-s">⌥ GitHub</a>
            </div>
          </div>
          <div className="e-cover-side">
            {data.stats.map(s => (
              <div key={s.label} className="e-stat">
                <div className="e-stat-num">{s.num}</div>
                <div className="e-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="e-cover-bottom">
            <div className="e-cover-cell"><div className="e-cell-lbl">Education</div><div className="e-cell-val">IT Systems Dev · CTU · 2022</div></div>
            <div className="e-cover-cell"><div className="e-cell-lbl">Experience</div><div className="e-cell-val">Digital Printer Op · 2022–24</div></div>
            <div className="e-cover-cell"><div className="e-cell-lbl">Currently</div><div className="e-cell-val">AWS Architect · In Progress</div></div>
          </div>
        </motion.div>
      )}

      {active === 'Skills' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-section">
          <div className="e-sec-head"><span className="e-sec-num">01</span><h2 className="e-sec-title">SKILLS & EXPERTISE</h2></div>
          <div className="e-skills-grid">
            {data.skills.map((s, i) => (
              <div key={s.name} className="e-skill">
                <div className="e-skill-top"><span>{s.name}</span><span className="e-skill-pct">{s.level}%</span></div>
                <div className="e-skill-track"><motion.div className="e-skill-fill" initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ delay: i * 0.07, duration: 0.8 }} /></div>
              </div>
            ))}
          </div>
          <div className="e-divider" />
          <div className="e-tags">{data.techTags.map(t => <span key={t} className="e-tag">{t}</span>)}</div>
        </motion.div>
      )}

      {active === 'Projects' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-section">
          <div className="e-sec-head"><span className="e-sec-num">02</span><h2 className="e-sec-title">SELECTED WORK</h2></div>
          <div className="e-projects">
            {data.projects.map((p, i) => (
              <div key={p.name} className={`e-pcard${p.featured ? ' featured' : ''}`}>
                <div className="e-pnum">0{i + 1} — {p.type.toUpperCase()}</div>
                <div className="e-pname">{p.name.toUpperCase()}</div>
                <div className="e-pdesc">{p.desc}</div>
                <div className="e-ptags">{p.tech.map(t => <span key={t} className="e-ptag">{t}</span>)}</div>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="e-plink">View project →</a>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {active === 'Experience' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-section">
          <div className="e-sec-head"><span className="e-sec-num">03</span><h2 className="e-sec-title">INDUSTRY RECORD</h2></div>
          {data.experience.map((exp, i) => (
            <div key={i} className="e-exp">
              <div className="e-exp-head">
                <div>
                  <div className="e-exp-role">{exp.role.toUpperCase()}</div>
                  <div className="e-exp-co">{exp.company} · {exp.location}</div>
                </div>
                <span className="e-exp-period">{exp.period}</span>
              </div>
              <ul className="e-exp-pts">
                {exp.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            </div>
          ))}
        </motion.div>
      )}

      {active === 'Credentials' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-section">
          <div className="e-sec-head"><span className="e-sec-num">04</span><h2 className="e-sec-title">CREDENTIALS</h2></div>
          <div className="e-cred-grid">
            <div>
              <div className="e-cred-head">CERTIFICATIONS</div>
              {data.certifications.map((c, i) => (
                <div key={i} className={`e-cert${c.inProgress ? ' ip' : ''}`}>
                  <div className="e-cert-dot" />
                  <div><div className="e-cert-name">{c.name}</div><div className="e-cert-meta">{c.org} · {c.year}</div></div>
                </div>
              ))}
            </div>
            <div>
              <div className="e-cred-head">EDUCATION</div>
              {data.education.map((e, i) => (
                <div key={i} className="e-edu">
                  <div className="e-edu-deg">{e.degree}</div>
                  <div className="e-edu-sch">{e.school}</div>
                  <div className="e-edu-meta">{e.location} · {e.year}{e.nqf ? ` · ${e.nqf}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {active === 'Contact' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="e-section">
          <div className="e-sec-head"><span className="e-sec-num">05</span><h2 className="e-sec-title">GET IN TOUCH</h2></div>
          <div className="e-contact-hl">Let's build something<br /><span className="e-red">extraordinary</span> together.</div>
          <div className="e-contact-grid">
            <a href={`mailto:${data.email}`} className="e-contact-card"><span className="e-cc-lbl">EMAIL</span><span>{data.email}</span></a>
            <a href={`tel:${data.phone}`} className="e-contact-card"><span className="e-cc-lbl">PHONE</span><span>{data.phone}</span></a>
            <div className="e-contact-card"><span className="e-cc-lbl">LOCATION</span><span>{data.location}</span></div>
            <a href={data.githubUrl} target="_blank" rel="noreferrer" className="e-contact-card"><span className="e-cc-lbl">GITHUB</span><span>{data.github}</span></a>
          </div>
          <a href={`mailto:${data.email}`} className="e-cta">SEND MESSAGE →</a>
        </motion.div>
      )}

      <div className="e-footer">
        <span>© 2025 Omphile Molefe Maano</span>
        <span>{data.email}</span>
        <span>Built with React · Framer Motion</span>
      </div>
    </div>
  )
}
