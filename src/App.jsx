
import './App.css'
import './archive.css'
import { supabase } from './supabaseClient'
import { useEffect, useRef, useState } from 'react'
import Admin from './admin'
import ProjectPage from './ProjectPage'
import MusicPage from './MusicPage'
import ResetPassword from './ResetPassword'

const projects = [
  {
    number: '01',
    title: 'Morning Ritual',
    category: 'Object / Ritual / Light',
    description:
      'An exploration of everyday rituals, soft light, and the objects that shape the beginning of a day.',
    accent: 'mint',
  },
  {
    number: '02',
    title: 'Visual Essays',
    category: 'Image / Writing / Research',
    description:
      'A collection of visual observations, fragments, images, and thoughts gathered over time.',
    accent: 'pink',
  },
  {
    number: '03',
    title: 'Offline Things',
    category: 'Memory / Technology / Objects',
    description:
      'Experiments around physical memories, offline technology, and the things we choose to keep.',
    accent: 'lilac',
  },
  {
    number: '04',
    title: 'Something in Between',
    category: 'Graphic / Space / Experiment',
    description:
      'A space for unfinished ideas, visual experiments, and projects that resist a single category.',
    accent: 'butter',
  },
]

function getLinkedInUrl(value) {
  const trimmedValue = value?.trim() || ''

  if (!trimmedValue) return ''

  const candidate = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  try {
    const parsedUrl = new URL(candidate)
    const hostname = parsedUrl.hostname.toLowerCase()
    const isLinkedInHost =
      hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')

    if (!isLinkedInHost || !['http:', 'https:'].includes(parsedUrl.protocol)) {
      return ''
    }

    return parsedUrl.toString()
  } catch {
    return ''
  }
}

function getHttpUrl(value) {
  const trimmedValue = value?.trim() || ''

  if (!trimmedValue) return ''

  const candidate = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`

  try {
    const parsedUrl = new URL(candidate)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : ''
  } catch {
    return ''
  }
}


function getLocalArchiveDate() {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = String(today.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

function ArchiveDate() {
  const [date, setDate] = useState(getLocalArchiveDate)

  useEffect(() => {
    const now = new Date()
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    )
    const timer = window.setTimeout(
      () => setDate(getLocalArchiveDate()),
      nextMidnight.getTime() - now.getTime() + 50
    )

    return () => window.clearTimeout(timer)
  }, [date])

  return date
}
function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let targetX = x
    let targetY = y
    let animationFrame

    function handlePointerMove(event) {
      targetX = event.clientX
      targetY = event.clientY
      cursor.classList.add('is-visible')
    }

    function handlePointerDown() {
      cursor.classList.add('is-pressed')
    }

    function handlePointerUp() {
      cursor.classList.remove('is-pressed')
    }

    function followPointer() {
      x += (targetX - x) * 0.2
      y += (targetY - y) * 0.2
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      animationFrame = window.requestAnimationFrame(followPointer)
    }

    animationFrame = window.requestAnimationFrame(followPointer)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [])

  return (
    <div className="cursor-comet" ref={cursorRef} aria-hidden="true">
      <span className="cursor-comet-trail cursor-comet-trail-one">✦</span>
      <span className="cursor-comet-trail cursor-comet-trail-two">✧</span>
      <span className="cursor-comet-trail cursor-comet-trail-three">·</span>
      <span className="cursor-comet-star">✳</span>
    </div>
  )
}

function App() {
  const [dbProjects, setDbProjects] = useState([])
  const [dbProjectImages, setDbProjectImages] = useState([])
  const [siteContent, setSiteContent] = useState({})

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    const revealItems = document.querySelectorAll(
      '.section-heading, .project-card, .about-grid > *, .note-card, .contact-copy, .contact-phone'
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in-view')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -35px 0px' }
    )

    revealItems.forEach((item) => {
      item.classList.add('scroll-reveal')
      observer.observe(item)
    })

    return () => observer.disconnect()
  }, [dbProjects.length, dbProjectImages.length, siteContent])

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error loading projects:', error)
        return
      }

      setDbProjects(data || [])
    }

    async function loadSiteContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')

      if (error) {
        console.error('Error loading site content:', error)
        return
      }

      const content = {}

      data.forEach((item) => {
        content[item.section] = item.content
      })

      setSiteContent(content)
    }

    async function loadProjectImages() {
      const { data, error } = await supabase
        .from('project_images')
        .select('project_id, image_url, sort_order')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error loading project images:', error)
        return
      }

      setDbProjectImages(data || [])
    }

    loadProjects()
    loadSiteContent()
    loadProjectImages()
    }, [])

  const routePath = window.location.pathname.replace(/\/+$/, '') || '/'

  if (routePath === '/music') {
    return (
      <MusicPage
        playlistUrl={siteContent.contact?.spotify_playlist_url || ''}
        cursor={<CustomCursor />}
      />
    )
  }

  if (routePath === '/project') {
    return <ProjectPage />
  }

  if (routePath === '/admin') {
    return <Admin />
  }

  if (routePath === '/reset-password') {
    return <ResetPassword />
  }

  const visibleProjects = [
  ...projects.map((localProject) => {
    const remoteProject = dbProjects.find(
      (dbProject) => dbProject.title === localProject.title
    )

    return remoteProject
      ? {
          ...localProject,
          ...remoteProject,
          number: localProject.number,
          accent: remoteProject.accent || localProject.accent,
          category: remoteProject.category || localProject.category,
          description:
            remoteProject.description || localProject.description,
        }
      : localProject
  }),

  ...dbProjects.filter(
    (dbProject) =>
      !projects.some(
        (localProject) => localProject.title === dbProject.title
      )
  ),
]

  const contactContent = siteContent.contact || {}
  const contactEmail = contactContent.email?.trim() || ''
  const contactLinkedIn = getLinkedInUrl(contactContent.linkedin_url)
  const contactSubstack = getHttpUrl(contactContent.substack_url)

  return (
    <div className="site">
      <CustomCursor />
      <header className="site-header">
       <div className="main-brand">
  <a className="logo" href="#top">
    <img
      src="/images/sheida-logo.png"
      alt="Sheida Design logo"
    />
  </a>
  <span className="brand-name">Sheida Design</span>
</div>
        <div className="header-status">
          <span className="status-dot"></span>
          Personal archive / 2026
        </div>

        <nav className="navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#notes">Notes</a>
          <a href="/music">Listen</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-topline">
            <span>SHEIDA / PERSONAL ARCHIVE</span>
            <span className="archive-stamp">
              <span><ArchiveDate /></span>
              <span>late summer / early autumn</span>
            </span>
          </div>

        <h1>
  {(() => {
    const title =
      siteContent.home?.hero_title ||
      "Things I make. Things I notice. Things I can't stop thinking about."
    const sentences = title.trim().toLowerCase().match(/[^.]+\.?/g) || []
    const finalSentence = sentences[2]?.trim() || ''
    const thirdLine = finalSentence
      .replace(/\s+stop thinking about\.?$/, '')
      .trim()
    const finalPunctuation = finalSentence.endsWith('.') ? '.' : ''

    return (
      <>
        <span className="hero-line">{sentences[0]?.trim()}</span>
        <span className="hero-line">{sentences[1]?.trim()}</span>
        <span className="hero-line">{thirdLine}</span>
        <span className="hero-line">
          <span className="hero-highlight">stop thinking about</span>
          {finalPunctuation}
        </span>
      </>
    )
  })()}
</h1>
          <div className="hero-bottom">
           <p className="hero-intro">
  {siteContent.home?.hero_intro ||
    'An evolving archive of objects, images, spaces, research, experiments, and ideas in progress.'}
</p>
            <a className="scroll-link" href="#work">
              Scroll to explore
              <span>↓</span>
            </a>
          </div>

        </section>

        <section className="ticker" aria-label="Current interests">
          <div className="ticker-track">
  {siteContent.home?.ticker_text ||
    'Currently thinking about ✳ offline memories ✳ everyday rituals ✳ objects with stories ✳'}
</div>
        </section>

        <section className="work-section" id="work">
          <div className="section-heading">
            <p className="section-label">[ SELECTED WORK ]</p>
           <p className="section-count">
  {String(visibleProjects.length).padStart(2, '0')} projects
</p>
          </div>

          <div className="project-list">
           {visibleProjects.map((project) => (
              <article
                className={`project-card project-${project.accent}`}
                key={project.number}
              >
                <div className="project-number">{project.number}</div>

                <div className="project-visual">
                  {(() => {
                    const projectImage = dbProjectImages.find(
                      (image) =>
                        image.project_id === project.id &&
                        typeof image.image_url === 'string' &&
                        image.image_url.trim().length > 0
                    )

                    return projectImage ? (
                      <img
                        className="project-card-image"
                        src={projectImage.image_url.trim()}
                        alt={project.title}
                      />
                    ) : (
                      <>
                        <span className="visual-symbol">✳</span>
                        <span className="visual-label">image coming soon</span>
                      </>
                    )
                  })()}
                </div>

                <div className="project-content">
                  <p className="project-category">{project.category}</p>
                  <h2>{project.title}</h2>
                  <p className="project-description">
                    {project.description}
                  </p>
                  <a
  className="project-link"
  href={`/project?title=${encodeURIComponent(project.title)}`}
>
  View project ↗
</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <p className="section-label">[ ABOUT ]</p>
            <p className="section-count">A little context</p>
          </div>

          <div className="about-grid">
           <h2>
  {siteContent.about?.title ||
    'Exploring objects, spaces, images, and the ideas between them.'}
</h2>

            <div className="about-paper">
              <p>
  {siteContent.about?.paragraph_one ||
    "I'm Sheida — an industrial design student and multidisciplinary maker interested in the relationships between people, objects, spaces, images, and stories."}
</p>

<p>
  {siteContent.about?.paragraph_two ||
    "This is a growing archive of the things I create, study, collect, notice, and wonder about."}
</p>

              <a href="#notes" className="text-link">
                Read the notes ↗
              </a>
            </div>
          </div>
        </section>

        <section className="notes-section" id="notes">
  <div className="section-heading">
    <p className="section-label">[ CURRENTLY ]</p>
    <p className="section-count">Notes & fragments</p>
  </div>

 <div className="notes-board">
  {(
    Array.isArray(siteContent.notes)
      ? siteContent.notes
      : [siteContent.notes]
  )
    .filter(Boolean)
    .slice(0, 3)
    .map((note, index) => (
      <article
        className={`note-card note-card-${index + 1}`}
        key={note.id || index}
        style={{
          '--note-color': note.color || '#f8e58c',
        }}
      >
        <div className="note-tape"></div>

        <div className="note-card-inner">
          <span className="note-date">
            {note.date || '20 / 09 / 2026'}
          </span>

          <span className="note-small-label">
            {`little thought no. ${String(index + 1).padStart(2, '0')}`}
          </span>

          <h2>
            {note.title || 'A little thought.'}
          </h2>

          <p>
            {note.description || 'A small fragment from the archive.'}
          </p>

          <span className="note-footer">
            kept in the archive ✳
          </span>
        </div>
      </article>
    ))}
</div>
</section>

        <section className="contact-section" id="contact">
          <div className="contact-layout">
            <div className="contact-copy">
              <p className="section-label">[ CONTACT / SAY HELLO ]</p>
              <h2>{contactContent.heading || "DON'T BE A STRANGER"}</h2>
              <p>
                {contactContent.description ||
                  'Have a question, an idea, or a good reason to talk about objects, images, and everything in between? The line is open.'}
              </p>

              <div className="contact-links">
                <a
                  href={contactEmail ? `mailto:${contactEmail}` : undefined}
                  aria-disabled={!contactEmail}
                >
                  Email / {contactEmail || 'add address in Admin'}
                </a>
                {contactLinkedIn ? (
                  <a
                    href={contactLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn / {contactLinkedIn}
                  </a>
                ) : (
                  <span aria-disabled="true">
                    LinkedIn / add valid URL in Admin
                  </span>
                )}
                {contactSubstack ? (
                  <a
                    href={contactSubstack}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Substack / {contactSubstack}
                  </a>
                ) : (
                  <span aria-disabled="true">
                    Substack / add URL in Admin
                  </span>
                )}
              </div>
            </div>

            <div className="contact-phone" aria-hidden="true">
              <div className="flip-phone-paper">
                <div className="flip-phone-paper-tape" />
              </div>
              <img
                className="contact-phone-image"
                src="/images/contact-phone.png"
                alt="Open silver flip phone"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
         <div className="footer-mark">
  <img src="/images/sheida-logo.png" alt="Sheida logo" />
</div>
          <p>Made, noticed, and collected by Sheida.</p>
        </div>

        <div className="footer-links">
          <a href="#top">Back to top ↑</a>
          <a href="#work">Projects</a>
          <a href="#about">About</a>
        </div>
      </footer>
    </div>
  )
}

export default App