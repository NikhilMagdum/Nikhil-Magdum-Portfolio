import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useReducedMotion } from 'framer-motion'
import * as THREE from 'three'

type Project = {
  title: string
  eyebrow: string
  stack: string[]
  description: string
  bullets: string[]
  github?: string
}

const navItems = ['HOME', 'ABOUT', 'EXPERIENCE', 'PROJECTS', 'SKILLS', 'EDUCATION', 'CONTACT']

const skills = {
  'Language': ['Java', 'Core Java', 'Object-Oriented Programming', 'Collections Framework', 'Exception Handling', 'Multithreading', 'Java 8', 'Java 17'],
  'Backend': ['JDBC', 'Spring', 'Spring Boot', 'Spring MVC', 'Hibernate', 'Spring Data JPA', 'Spring Security', 'JWT', 'REST APIs'],
  'Database': ['PostgreSQL'],
  'Tools': ['Eclipse IDE', 'STS', 'Git/GitHub', 'Postman', 'Swagger'],
}

const projects: Project[] = [
  {
    title: 'RD System',
    eyebrow: 'Recurring Deposit Management System',
    stack: ['Java', 'Spring Boot', 'React.js', 'PostgreSQL', 'Spring Data JPA', 'Bootstrap'],
    description: 'A full-stack recurring deposit management system for managing RD users, passbook entries and administration.',
    bullets: [
      'Built REST APIs for RD users, passbook entries and admin authentication with CRUD functionality.',
      'Implemented JPA/Hibernate relationships and backend validation.',
      'Developed automated RD due-date, late-day, fine and maturity calculations.',
      'Created a responsive React.js + Bootstrap interface and integrated it with Spring Boot REST APIs.',
      'Tested and verified APIs using Postman.',
    ],
  },
  {
    title: 'JobConnect',
    eyebrow: 'Job Portal Backend',
    stack: ['Java 21', 'Spring Boot', 'Spring Data JPA', 'Hibernate', 'PostgreSQL', 'Spring Security', 'JWT', 'Gradle', 'REST APIs', 'Postman', 'Swagger'],
    description: 'A secure REST API-based job portal backend connecting Candidates and Recruiters.',
    bullets: [
      'Developed REST APIs for User, Candidate, Company, Job, Application, Saved Job and Notification modules.',
      'Implemented JWT authentication, Spring Security and role-based authorization for Candidate and Recruiter.',
      'Implemented BCrypt password encryption, forgot/reset password and secure DTO-based responses.',
      'Developed job search, filtering, pagination and sorting features.',
      'Implemented job application, duplicate prevention, status update, withdrawal, saved jobs and notifications.',
      'Used Spring Data JPA, Hibernate and PostgreSQL; tested APIs using Postman and Swagger.',
    ],
  },
]

function Scene({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null)
  const [pointer] = useState(() => new THREE.Vector2())

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointer])

  useFrame((state) => {
    if (!group.current || reduced) return
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.12, 0.025)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.07, 0.025)
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.08
  })

  const dots = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 90; i++) {
      const radius = 3.2 + Math.random() * 2.2
      const a = Math.random() * Math.PI * 2
      const b = (Math.random() - 0.5) * 1.6
      pts.push([Math.cos(a) * radius, b, Math.sin(a) * radius])
    }
    return pts
  }, [])

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.5]}>
        <icosahedronGeometry args={[1.55, 2]} />
        <meshStandardMaterial color="#11151a" roughness={0.32} metalness={0.82} wireframe />
      </mesh>
      <mesh position={[0, 0, -0.5]} scale={0.82}>
        <icosahedronGeometry args={[1.55, 2]} />
        <meshStandardMaterial color="#171c23" roughness={0.5} metalness={0.7} />
      </mesh>
      {dots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.018 + (i % 3) * 0.008, 8, 8]} />
          <meshBasicMaterial color="#c78bea" transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function ThreeBackdrop() {
  const reduced = useReducedMotion()
  return (
    <div className="three-backdrop" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 2, 4]} intensity={20} distance={8} />
        <pointLight position={[-4, -2, 2]} intensity={8} distance={7} />
        <Suspense fallback={null}>
          <Scene reduced={Boolean(reduced)} />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('HOME')
  const reduced = useReducedMotion()

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.toLowerCase())).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id.toUpperCase())
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0.05, 0.2, 0.5] },
    )
    sections.forEach((section) => observer.observe(section!))
    return () => observer.disconnect()
  }, [])

  const go = (item: string) => {
    document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="site">
      <div className="noise" aria-hidden="true" />
      <nav className="nav glass">
        <button className="brand" onClick={() => go('HOME')} aria-label="Go to home">
          NM<span>.</span>
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button key={item} className={active === item ? 'active' : ''} onClick={() => go(item)}>{item}</button>
          ))}
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          <span /><span />
        </button>
      </nav>

      <main>
        <section id="home" className="hero section">
          <ThreeBackdrop />
          <div className="hero-grid">
            <div className="hero-copy">
              <motion.p className="kicker" initial={reduced ? false : { opacity: 0, y: 12 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: .6 }}>JAVA DEVELOPER · FULL-STACK DEVELOPMENT</motion.p>
              <motion.h1 initial={reduced ? false : { opacity: 0, y: 20 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ delay: .08, duration: .7 }}>
                Nikhil<br /><span>Magdum</span>
              </motion.h1>
              <motion.p className="hero-lede" initial={reduced ? false : { opacity: 0 }} animate={reduced ? undefined : { opacity: 1 }} transition={{ delay: .22, duration: .7 }}>
                Motivated Computer Applications graduate seeking a Java Developer role, with a strong foundation in Java, Spring Boot, JPA/Hibernate, PostgreSQL and RESTful APIs.
              </motion.p>
              <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 14 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ delay: .32, duration: .65 }}>
                <button className="button primary" onClick={() => go('PROJECTS')}>View My Work <span>↗</span></button>
                <a className="button secondary" href="/Nikhil_Magdum_Resume.pdf" download>Download Resume <span>↓</span></a>
              </motion.div>
            </div>

            <motion.div className="portrait-frame" initial={reduced ? false : { opacity: 0, scale: .94 }} animate={reduced ? undefined : { opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }}>
              <div className="portrait-halo" />
              <div className="portrait">
                <img src="/profile-photo.jpg" alt="Nikhil Magdum" />
              </div>
              <div className="portrait-note">JAVA · SPRING BOOT · POSTGRESQL</div>
            </motion.div>
          </div>
          <div className="scroll-cue"><span /> SCROLL TO EXPLORE</div>
        </section>

        <section id="about" className="section content-section">
          <Reveal><SectionHeader index="01" title="About" intro="A backend-focused developer profile grounded in Java and modern Spring technologies." /></Reveal>
          <div className="about-grid">
            <Reveal className="about-lead">
              <p>Passionate about writing clean, efficient and maintainable code, with hands-on work across full-stack RD management and secure job-portal backend development.</p>
            </Reveal>
            <div className="mini-grid">
              {[
                ['FOCUS', 'Java backend development'],
                ['FOUNDATION', 'Core Java · OOP · Collections'],
                ['APIs', 'REST · Postman · Swagger'],
                ['DATABASE', 'PostgreSQL · JPA · Hibernate'],
              ].map(([label, value], i) => (
                <Reveal key={label} className="mini-card" >
                  <span>0{i + 1}</span><small>{label}</small><strong>{value}</strong>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section content-section">
          <Reveal><SectionHeader index="02" title="Experience" intro="Professional experience documented in the resume." /></Reveal>
          <Reveal className="timeline">
            <div className="timeline-line" />
            <article className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-date">APR 2026 — SEP 2026</div>
              <div className="timeline-card glass">
                <p className="eyebrow">SOFTWARE DEVELOPER INTERNSHIP</p>
                <h3>Humming Byte Technologies Private Limited.</h3>
                <p>Software Developer Internship</p>
              </div>
            </article>
          </Reveal>
        </section>

        <section id="projects" className="section content-section projects-section">
          <Reveal><SectionHeader index="03" title="Selected Work" intro="Two substantial projects from the resume, presented as the core portfolio experience." /></Reveal>
          <div className="projects">
            {projects.map((project, i) => (
              <Reveal key={project.title}>
                <ProjectCard project={project} number={`0${i + 1}`} />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="skills" className="section content-section">
          <Reveal><SectionHeader index="04" title="Technical Skills" intro="Technologies and tools explicitly listed in the resume." /></Reveal>
          <div className="skill-grid">
            {Object.entries(skills).map(([group, items], i) => (
              <Reveal key={group} className="skill-card glass">
                <div className="skill-head"><span>0{i + 1}</span><h3>{group}</h3></div>
                <div className="tags">{items.map((skill) => <span key={skill}>{skill}</span>)}</div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="education" className="section content-section">
          <Reveal><SectionHeader index="05" title="Education" intro="Academic background from the resume." /></Reveal>
          <div className="education-grid">
            <Reveal className="education-card glass">
              <span className="education-year">2021 — 2024</span>
              <h3>Bachelor of Computer Applications (B.C.A.)</h3>
              <p>Shivaji University · Shivraj College Gadhinglaj</p>
              <strong>66%</strong>
            </Reveal>
            <Reveal className="education-card glass">
              <span className="education-year">2020 — 2021</span>
              <h3>H.S.C. Vocational · Electronics Technology</h3>
              <p>Sadhana Junior College Gadhinglaj</p>
              <strong>76%</strong>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <Reveal>
            <p className="kicker">06 · CONTACT</p>
            <h2>Let’s build something<br /><span>meaningful.</span></h2>
            <p className="contact-copy">Available contact details from the resume.</p>
            <div className="contact-links">
              <a href="mailto:nikhilmagdum2003@gmail.com">nikhilmagdum2003@gmail.com</a>
              <a href="tel:+919021007271">+91 9021007271</a>
            </div>
            <p className="contact-location">Tal-Gadhinglaj, Dist- Kolhapur, State- Maharashtra – 416502</p>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/nikhil-magdum-2111343b7/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="https://github.com/NikhilMagdum" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
            <p className="contact-note">Connect with me on LinkedIn or explore my projects on GitHub.</p>
            <a className="button primary contact-resume" href="/Nikhil_Magdum_Resume.pdf" download>Download Resume <span>↓</span></a>
          </Reveal>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Nikhil Magdum</span>
        <span>JAVA DEVELOPER</span>
      </footer>
    </div>
  )
}

function SectionHeader({ index, title, intro }: { index: string; title: string; intro: string }) {
  return (
    <div className="section-header">
      <p className="kicker">{index} · {title.toUpperCase()}</p>
      <h2>{title}</h2>
      <p>{intro}</p>
    </div>
  )
}

function ProjectCard({ project, number }: { project: Project; number: string }) {
  const [open, setOpen] = useState(false)
  return (
    <article className={`project-card glass ${open ? 'expanded' : ''}`}>
      <div className="project-top">
        <span className="project-number">{number}</span>
        <span className="project-type">{project.eyebrow}</span>
      </div>
      <div className="project-main">
        <div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
        <button className="expand" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? '−' : '+'}</button>
      </div>
      <div className="tags project-tags">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} className="project-details">
        <ul>{project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
      </motion.div>
    </article>
  )
}

export default App
