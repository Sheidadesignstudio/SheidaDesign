
import './App.css'
import './archive.css'
import PortfolioHome from './PortfolioHome'
import { supabase } from './supabaseClient'
import { useEffect, useRef, useState } from 'react'
import Admin from './admin'
import ProjectPage from './ProjectPage'
import MusicPage from './MusicPage'
import ResetPassword from './ResetPassword'

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
  useEffect(() => {
    try { document.documentElement.dataset.deskLight = localStorage.getItem('sheida-desk-light') === 'night' ? 'night' : 'day' } catch { document.documentElement.dataset.deskLight = 'day' }
  }, [])
  const [dbProjects, setDbProjects] = useState([])
  const [dbProjectImages, setDbProjectImages] = useState([])
  const [siteContent, setSiteContent] = useState({})
  const [projectState, setProjectState] = useState('loading')

  useEffect(() => {
    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (error) {
        setProjectState('error')
        console.error('Error loading projects:', error)
        return
      }

      setDbProjects(data || [])
      setProjectState('ready')
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

    loadProjects().catch(() => setProjectState('error'))
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

  return <PortfolioHome projects={dbProjects} images={dbProjectImages} content={siteContent} projectState={projectState} />
}

export default App
