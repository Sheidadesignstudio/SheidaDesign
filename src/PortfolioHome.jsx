import { useEffect, useState } from 'react'
import './portfolio.css'
import HanddrawnHero from './HanddrawnHero'
import './illustration-theme.css'

const projectHref = p => `/project?title=${encodeURIComponent(p.title)}`
export default function PortfolioHome({ projects, images, content, projectState }) {
  const [view, setView] = useState('gallery')
  const [filter, setFilter] = useState('All')
  const [night, setNight] = useState(() => {
    try { return localStorage.getItem('sheida-desk-light') === 'night' } catch { return false }
  })
  useEffect(() => {
    document.documentElement.dataset.deskLight = night ? 'night' : 'day'
    try { localStorage.setItem('sheida-desk-light', night ? 'night' : 'day') } catch { /* Storage can be unavailable in private browsing. */ }
  }, [night])
  const toggleNight = () => setNight(value => !value)
  const imageFor = p => images.find(i => i.project_id === p.id && i.image_url?.trim())?.image_url?.trim()
  const categories = [...new Set(projects.map(p => p.category?.split('/')[0].trim()).filter(Boolean))]
  const ordered = [...projects].sort((a, b) => Number(Boolean(imageFor(b))) - Number(Boolean(imageFor(a))))
  const shown = filter === 'All' ? ordered : ordered.filter(p => p.category?.split('/')[0].trim() === filter)
  const notes = (Array.isArray(content.notes) ? content.notes : [content.notes]).filter(Boolean)
  const contact = content.contact || {}
  const safeExternal = value => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : undefined } catch { return undefined } }
  return <div className={`portfolio-home${night ? ' evening' : ''}`}>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <header className="studio-header">
      <a className="studio-brand" href="#top"><img src="/images/sheida-logo.png" alt=""/><span>Sheida<span className="brand-sub">DESIGN & OTHER CURIOSITIES</span></span></a>
      <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="/music">Listening room</a><a href="#contact" className="hello-link">Say hello ↗</a></nav>
    </header>
    <main id="top">
      <HanddrawnHero playlistUrl={contact.spotify_playlist_url || ''} night={night} onToggleNight={toggleNight} />
      <div className="interest-strip"><span>CURRENTLY CURIOUS ABOUT</span><p>Everyday rituals <i>/</i> Offline memories <i>/</i> Objects with stories <i>/</i> The spaces between</p><button onClick={toggleNight} aria-pressed={night}>{night ? 'Daytime / lamp off' : 'Nighttime / lamp on'} ◐</button></div>
      <section className="studio-work" id="work" aria-labelledby="work-title">
        <div className="section-top"><div><p className="eyebrow">01 / MADE & EXPLORED</p><h2 id="work-title">Selected <em>work.</em></h2></div><p>A collection of projects,<br/>each with a different starting point.</p></div>
        <div className="work-tools"><div className="work-filters" role="group" aria-label="Filter projects">{['All', ...categories].map(c => <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}{c === 'All' ? ` (${projects.length})` : ''}</button>)}</div><div className="view-toggle" role="group" aria-label="Project layout"><button aria-pressed={view === 'gallery'} onClick={() => setView('gallery')}>Gallery</button><button aria-pressed={view === 'index'} onClick={() => setView('index')}>Index</button></div></div>
        <div className={`studio-projects ${view}`}>
          {shown.map((p, index) => <a className={`studio-project${imageFor(p) ? ' has-image' : ' text-project'}`} href={projectHref(p)} key={p.id || p.title}>
            {view === 'gallery' && imageFor(p) && <div className="work-image"><img loading="lazy" src={imageFor(p)} alt={p.title}/><span>Explore project ↗</span></div>}
            <div className="work-info"><span className="work-number">{String(index + 1).padStart(2, '0')}</span><div><p>{p.category}</p><h3>{p.title}</h3><p className="work-description">{p.description}</p></div><span className="work-arrow" aria-hidden="true">↗</span></div>
          </a>)}
        </div>
        {projects.length === 0 && <p className="work-loading" role="status">{projectState === 'loading' ? 'Opening the archive…' : projectState === 'error' ? 'The archive could not load. Please refresh the page or get in touch below.' : 'New projects will be added here soon.'}</p>}
      </section>
      <section className="studio-about" id="about"><div><p className="eyebrow">02 / THE PERSON BEHIND THE PROJECTS</p><h2>Serious about design.<br/><em>Curious about everything.</em></h2></div><div className="about-letter"><span>A LITTLE CONTEXT</span><p>{content.about?.paragraph_one || "I'm Sheida — an industrial design student and multidisciplinary maker interested in the relationships between people, objects, spaces, images, and stories."}</p><p>{content.about?.paragraph_two || 'This is a growing archive of the things I create, study, collect, notice, and wonder about.'}</p><a href="/music">A small detour: what I'm listening to ↗</a><span className="letter-signature">Sheida</span></div></section>
      <section className="studio-notes" id="notes"><div className="section-top"><div><p className="eyebrow">03 / STILL THINKING</p><h2>Loose <em>ends.</em></h2></div><p>Small observations.<br/>Ideas before they become projects.</p></div><div className="studio-note-grid">{notes.length ? notes.slice(0, 3).map((n,i) => <article key={n.id || i}><span className="eyebrow">NOTE {String(i+1).padStart(2,'0')} / {n.date}</span><h3>{n.title}</h3><p>{n.description}</p></article>) : <p>A space for observations, experiments, and unfinished thoughts.</p>}</div></section>
      <section className="studio-contact" id="contact"><p className="eyebrow">04 / THE LINE IS OPEN</p><h2>Good things start<br/>with a <em>conversation.</em></h2><div className="contact-bottom"><p>{contact.description || 'Have a question, an idea, or something interesting to share? Get in touch.'}</p><div>{contact.email && <a href={`mailto:${contact.email.trim()}`}>Email me ↗</a>}{safeExternal(contact.linkedin_url) && <a href={safeExternal(contact.linkedin_url)} target="_blank" rel="noreferrer">LinkedIn ↗</a>}{safeExternal(contact.substack_url) && <a href={safeExternal(contact.substack_url)} target="_blank" rel="noreferrer">Substack ↗</a>}</div></div></section>
    </main>
    <footer className="studio-footer"><span>© {new Date().getFullYear()} Sheida Shayesteh</span><span>Made, noticed, and collected.</span><a href="#top">Back to the beginning ↑</a></footer>
  </div>
}


