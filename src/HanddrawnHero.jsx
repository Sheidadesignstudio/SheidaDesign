import { useEffect, useRef, useState } from 'react'
import './handdrawn-hero.css'

function playlistEmbed(value = '') {
  const uri = value.trim().match(/^spotify:(playlist|album|track):([a-z0-9]+)$/i)
  if (uri) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}`
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:' || u.hostname !== 'open.spotify.com') return ''
    const m = u.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(?:embed\/)?(playlist|album|track)\/([a-z0-9]+)\/?$/i)
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : ''
  } catch { return '' }
}

export default function HanddrawnHero({ playlistUrl = '', night = false, onToggleNight }) {
  const lamp = night
  const [hello, setHello] = useState(false)
  const [music, setMusic] = useState(false)
  const [windowTab, setWindowTab] = useState('hello')
  const modal = useRef(null)
  const viewport = useRef(null)
  useEffect(() => {
    const center = () => {
      const el = viewport.current
      if (el) el.scrollLeft = window.innerWidth <= 700 ? Math.max(0, (900 - el.clientWidth) / 2 + 27) : 0
    }
    center()
    window.addEventListener('resize', center)
    return () => window.removeEventListener('resize', center)
  }, [])
  const embed = playlistEmbed(playlistUrl)
  const play = () => { setMusic(true); modal.current.showModal() }
  return <section className={`drawn-hero ${lamp ? 'lamp-on' : 'lamp-off'}`} aria-label="Sheida's illustrated interactive desk">
    <div className="drawn-topline"><span>WELCOME TO MY LITTLE CORNER OF THE INTERNET</span><span>Drawn by me. A little world to explore.</span></div>
    <div className="drawn-viewport" ref={viewport}><div className="drawn-scene">
      <img className="drawn-base" src="/images/sheida-desk-shaded.jpg" alt="Sheida's hand-drawn desk: a laptop, bubble tea, plant, lamp, smiling octopus, sketchbook and turquoise MP3 player." fetchPriority="high"/>
      <img className="drawn-night-art" src="/images/sheida-desk-night.jpg" alt="" aria-hidden="true"/>
      <div className="lamp-glow" aria-hidden="true"/>
      <div className="drawn-screen">
        <div className="drawn-screen-bar"><span>sheida.exe</span><span aria-hidden="true">– □ ×</span></div>
        <div className="drawn-tabs" role="group" aria-label="Laptop pages"><button aria-pressed={windowTab === 'hello'} onClick={() => setWindowTab('hello')}>hello.txt</button><button aria-pressed={windowTab === 'work'} onClick={() => setWindowTab('work')}>my work</button></div>
        <div className="drawn-screen-copy">{windowTab === 'hello' ? <><h1>Hi, I'm Sheida.<br/>I make things.<br/><em>I notice things.</em></h1><p>Industrial design, curious experiments<br/>and the stories in everyday objects.</p><a href="#work">Explore my work ↗</a></> : <><h1>Objects. Images.<br/><em>Ideas in between.</em></h1><p>A collection of things I've made,<br/>explored, and kept thinking about.</p><a href="#work">Open the archive ↗</a></>}</div>
      </div>
      <button className="drawn-object drawn-mp3" onClick={play} aria-label="Play Sheida's playlist"><span className="drawn-tip">My soundtrack ▶</span><span className="mp3-signal" aria-hidden="true">♫</span></button>
      <button className="drawn-object drawn-lamp" aria-pressed={lamp} onClick={onToggleNight} aria-label="Toggle the desk lamp"><span className="drawn-tip">{lamp ? 'Back to daytime?' : 'Nighttime + a little light?'}</span></button>
      <button className="drawn-object drawn-octopus" onClick={() => setHello(v => !v)} aria-pressed={hello} aria-label="Say hello to the little octopus"><span className={`octopus-bubble ${hello ? 'is-open' : ''}`} role="status">{hello ? 'You found my desk buddy. Hi!' : ''}</span><span className="drawn-tip">Psst. Say hi!</span></button>
      <a className="drawn-object drawn-notebook" href="#work" aria-label="Explore my projects in the sketchbook"><span className="drawn-tip">Ideas start here ↗</span></a>
      <a className="drawn-object drawn-note" href="#about" aria-label="Read about Sheida"><span className="drawn-tip">A little about me ↗</span></a>
    </div></div>
    <div className="drawn-bottom"><span>Take a look around. The little things are clickable.</span><div><button onClick={play}>▶ My playlist</button><button onClick={onToggleNight} aria-pressed={lamp}>Lamp {lamp ? 'on' : 'off'}</button><button onClick={() => setHello(v => !v)} aria-pressed={hello}>Say hi to my desk buddy</button></div></div>
    <dialog ref={modal} className="drawn-player" aria-labelledby="drawn-player-title" onClose={() => setMusic(false)} onClick={e => { if(e.target === e.currentTarget) modal.current.close() }}><div className="drawn-player-bar"><span>my_soundtrack.mp3</span><button autoFocus onClick={() => modal.current.close()} aria-label="Close playlist">×</button></div><div className="drawn-player-body"><p>THINGS I PLAY WHILE I MAKE THINGS</p><h2 id="drawn-player-title">A little soundtrack.</h2>{embed && music ? <iframe src={embed} title="Sheida's Spotify playlist" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen/> : <p>The listening room is just a click away.</p>}<a href="/music">Visit the listening room ↗</a></div></dialog>
  </section>
}

