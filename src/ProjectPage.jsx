import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const compositionSections = ['01', '02', '03', '04']

export default function ProjectPage() {
  const [project, setProject] = useState(null)
  const [projectImages, setProjectImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProject() {
      const params = new URLSearchParams(window.location.search)
      const title = params.get('title')

      if (!title) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('title', title.trim())
        .limit(1)

      if (error) {
        console.error('Error loading project:', error)
      } else if (data && data.length > 0) {
        const loadedProject = data[0]
        setProject(loadedProject)

        const { data: imageData, error: imageError } = await supabase
          .from('project_images')
          .select(
            'id, image_url, alt_text, sort_order, section_number, x, y, width, height, z_index'
          )
          .eq('project_id', loadedProject.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (imageError) {
          console.error('Error loading project images:', imageError)
        } else {
          setProjectImages(imageData || [])
        }
      }

      setLoading(false)
    }

    loadProject()
  }, [])

  if (loading) {
    return <main className="project-page">Loading project...</main>
  }

  if (!project) {
    return (
      <main className="project-page">
        <h1>Project not found</h1>

        <button onClick={() => window.history.back()}>
          Go back
        </button>
      </main>
    )
  }

  const imageSections = compositionSections
    .map((sectionNumber) => ({
      sectionNumber,
      images: projectImages
        .filter(
          (image) =>
            (image.section_number || '01') === sectionNumber &&
            typeof image.image_url === 'string' &&
            image.image_url.trim().length > 0
        )
        .sort((first, second) => (first.z_index || 0) - (second.z_index || 0)),
    }))
    .filter(({ images }) => images.length > 0)

  return (
    <main className="project-page">
      <div className="project-header">
        <div className="project-brand">
          <a className="project-logo" href="/">
            <img
              src="/images/sheida-logo.png"
              alt="Sheida Design logo"
            />
          </a>

          <span className="brand-name">Sheida Design</span>
        </div>

        <button
          className="project-back"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </div>

      <p className="project-category">{project.category}</p>

      <h1>{project.title}</h1>

      <p className="project-description">
        {project.description}
      </p>

      {imageSections.length > 0 && (
        <div className="project-composition">
          {imageSections.map(({ sectionNumber, images }) => (
            <section
              className="project-composition-section"
              key={sectionNumber}
              aria-label={`Project image section ${sectionNumber}`}
            >
              <div className="project-composition-number">{sectionNumber}</div>
              <div className="project-composition-canvas">
                {images.map((image, index) => (
                  <img
                    className="project-composition-image"
                    key={image.id}
                    src={image.image_url.trim()}
                    alt={image.alt_text || project.title}
                    style={{
                      left: `${image.x ?? 8}%`,
                      top: `${image.y ?? 8}%`,
                      width: `${image.width ?? 36}%`,
                      height: `${image.height ?? 30}%`,
                      zIndex: image.z_index ?? index,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {imageSections.length > 0 && (
        <div className="project-details">
          <p>
            This project page is ready for images, videos, writing,
            and documentation.
          </p>
        </div>
      )}
    </main>
  )
}