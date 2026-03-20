import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { data } from '../data'

function TypedText({ texts }) {
  const [display, setDisplay] = useState('')
  const [ti, setTi] = useState(0)
  const [ci, setCi] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const cur = texts[ti]
    const speed = deleting ? 30 : 70
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplay(cur.slice(0, ci + 1))
        if (ci + 1 === cur.length) { setDeleting(true); return }
        setCi(c => c + 1)
      } else {
        setDisplay(cur.slice(0, ci - 1))
        if (ci - 1 === 0) { setDeleting(false); setTi(t => (t + 1) % texts.length); setCi(0); return }
        setCi(c => c - 1)
      }
    }, deleting && ci === texts[ti].length ? 2000 : speed)
    return () => clearTimeout(timer)
  }, [ci, deleting, ti, texts])

  return <span>{display}<span className="t-cursor">█</span></span>
}

export default function Terminal() {
  const [activeSection, setActiveSection] = useState('about')
  const sections = ['about', 'skills', 'projects', 'experience', 'credentials', 'contact']

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="t-ascii">
{`  ██████╗ ███╗   ███╗███╗   ███╗
  ██╔═══██╗████╗ ████║████╗ ████║
  ██║   ██║██╔████╔██║██╔████╔██║
  ╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║`}
            </div>
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">cat about.md</span></div>
            <div className="t-output">
              <div className="t-line">╔══════════════════════════════════════╗</div>
              <div className="t-line">║  <span className="t-green">OMPHILE MOLEFE MAANO</span>                ║</div>
              <div className="t-line">║  <span className="t-blue">Junior IT Systems Developer</span>         ║</div>
              <div className="t-line">╚══════════════════════════════════════╝</div>
              <br />
              <div className="t-line"><span className="t-yellow">role</span>     → <span className="t-green"><TypedText texts={data.subtitles} /></span></div>
              <div className="t-line"><span className="t-yellow">location</span> → <span className="t-white">South Africa</span></div>
              <div className="t-line"><span className="t-yellow">status</span>   → <span className="t-green">Available for work ✓</span></div>
              <div className="t-line"><span className="t-yellow">email</span>    → <span className="t-blue">{data.email}</span></div>
              <div className="t-line"><span className="t-yellow">github</span>   → <span className="t-blue">{data.github}</span></div>
              <div className="t-line"><span className="t-yellow">phone</span>    → <span className="t-white">{data.phone}</span></div>
              <br />
              <div className="t-line t-dim"># {data.bio}</div>
            </div>
          </motion.div>
        )}

        {activeSection === 'skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">./skills --list --verbose</span></div>
            <br />
            {data.skills.map((s, i) => (
              <div key={s.name} className="t-skill-row">
                <span className="t-skill-name">{s.name.padEnd(20)}</span>
                <span className="t-skill-bar">
                  {'█'.repeat(Math.round(s.level / 10))}{'░'.repeat(10 - Math.round(s.level / 10))}
                </span>
                <span className="t-green"> {s.level}%</span>
              </div>
            ))}
            <br />
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">ls ./tech-stack/</span></div>
            <div className="t-tags">
              {data.techTags.map(t => <span key={t} className="t-tag">{t}</span>)}
            </div>
          </motion.div>
        )}

        {activeSection === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">ls -la ./projects/</span></div>
            <br />
            {data.projects.map((p, i) => (
              <div key={p.name} className="t-project">
                <div className="t-project-header">
                  <span className="t-yellow">drwxr-xr-x</span>
                  <span className="t-green"> {p.featured ? '★ ' : '  '}{p.name}/</span>
                  <span className="t-dim"> [{p.year} · {p.type}]</span>
                </div>
                <div className="t-project-body">
                  <div className="t-line t-dim">  └─ {p.desc}</div>
                  <div className="t-line">  └─ <span className="t-yellow">stack:</span> {p.tech.join(' · ')}</div>
                  {p.link && <div className="t-line">  └─ <span className="t-blue">{p.link}</span></div>}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === 'experience' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-green">cat experience.log</span></div>
            <br />
            {data.experience.map((e, i) => (
              <div key={i} className="t-exp">
                <div className="t-line"><span className="t-green">[{e.period}]</span> <span className="t-white">{e.role}</span></div>
                <div className="t-line t-dim">  company: {e.company} · {e.location}</div>
                <br />
                {e.points.map((pt, j) => (
                  <div key={j} className="t-line t-dim">  + {pt}</div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === 'credentials' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          </motion.div>
        )}

        {activeSection === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            <div className="t-line t-dim"># Ready to collaborate. Let's build something great.</div>
            <div className="t-prompt">omphile@portfolio:~$ <span className="t-cursor">█</span></div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
