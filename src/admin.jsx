
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

const emptyProject = {
  title: '',
  category: '',
  description: '',
  accent: 'mint',
  number: '',
  published: true,
  sort_order: 0,
}

const projectImageBucket = 'project-images'
const maxProjectImageSize = 10 * 1024 * 1024
const allowedProjectImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const compositionSections = ['01', '02', '03', '04']

function Admin() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
const [authLoading, setAuthLoading] = useState(true)
const [activeSection, setActiveSection] = useState('projects')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [recoveringPassword, setRecoveringPassword] = useState(false)
const [recoveryEmailSent, setRecoveryEmailSent] = useState(false)
  const [projectImages, setProjectImages] = useState([])
  const [selectedImageFiles, setSelectedImageFiles] = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [imagesUploading, setImagesUploading] = useState(false)
  const [compositionSection, setCompositionSection] = useState('01')
  const [selectedCompositionImageId, setSelectedCompositionImageId] = useState(null)
  const [compositionSaving, setCompositionSaving] = useState(false)
  const [compositionInteraction, setCompositionInteraction] = useState(null)

const [homeContent, setHomeContent] = useState({
  hero_title: '',
  hero_intro: '',
  ticker_text: '',
})
const [aboutContent, setAboutContent] = useState({
  title: '',
  paragraph_one: '',
  paragraph_two: '',
})
const [contactContent, setContactContent] = useState({
  heading: "DON'T BE A STRANGER",
  description: '',
  email: '',
  linkedin_url: '',
  substack_url: '',
  spotify_playlist_url: '',
})
const [notesContent, setNotesContent] = useState([
  {
    id: 1,
    date: '',
    title: '',
    description: '',
    color: '#f8e58c',
  },
])
useEffect(() => {
  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user ?? null)
    setAuthLoading(false)
  }

  checkUser()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
    setAuthLoading(false)
  })

  return () => subscription.unsubscribe()
}, [])

  async function loadProjects() {
    setLoading(true)

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      setMessage(error.message)
    } else {
      setProjects(data || [])
    }

    setLoading(false)
  }
  async function loadHomeContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'home')
    .single()

  if (error) {
    setMessage(error.message)
    return
  }

  setHomeContent({
    hero_title: data?.content?.hero_title || '',
    hero_intro: data?.content?.hero_intro || '',
    ticker_text: data?.content?.ticker_text || '',
  })
}
  async function loadAboutContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'about')
      .single()

    if (error) {
      setMessage(error.message)
      return
    }

    setAboutContent({
      title: data?.content?.title || '',
      paragraph_one: data?.content?.paragraph_one || '',
      paragraph_two: data?.content?.paragraph_two || '',
    })
  }
 async function loadNotesContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'notes')
    .single()

  if (error) {
    setMessage(error.message)
    return
  }

  const content = data?.content

  const notes = Array.isArray(content)
    ? content
    : [
        {
          id: 1,
          date: content?.date || '',
          title: content?.title || '',
          description: content?.description || '',
          color: content?.color || '#f8e58c',
        },
      ]

  setNotesContent(notes)
}
  async function loadContactContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'contact')
      .maybeSingle()

    if (error) {
      setMessage(error.message)
      return
    }

    setContactContent({
      heading: data?.content?.heading || "DON'T BE A STRANGER",
      description: data?.content?.description || '',
      email: data?.content?.email || '',
      linkedin_url: data?.content?.linkedin_url || '',
      substack_url: data?.content?.substack_url || '',
      spotify_playlist_url: data?.content?.spotify_playlist_url || '',
    })
  }
  async function saveHomeContent() {
    setMessage('Saving homepage...')

    const { data: existingData, error: fetchError } = await supabase
      .from('site_content')
      .select('content')
      .eq('section', 'home')
      .single()

    if (fetchError) {
      setMessage(fetchError.message)
      return
    }

    const updatedContent = {
      ...existingData.content,
      hero_title: homeContent.hero_title,
      hero_intro: homeContent.hero_intro,
      ticker_text: homeContent.ticker_text,
    }

    const { error: updateError } = await supabase
      .from('site_content')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('section', 'home')

    if (updateError) {
      setMessage(updateError.message)
      return
    }

    setMessage('Homepage saved successfully!')
  }
   
    async function saveAboutContent() {
  setMessage('Saving about...')

  const { data: existingData, error: fetchError } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'about')
    .single()

  if (fetchError) {
    setMessage(fetchError.message)
    return
  }

  const updatedContent = {
    ...existingData.content,
    title: aboutContent.title,
    paragraph_one: aboutContent.paragraph_one,
    paragraph_two: aboutContent.paragraph_two,
  }

  const { error: updateError } = await supabase
    .from('site_content')
    .update({
      content: updatedContent,
      updated_at: new Date().toISOString(),
    })
    .eq('section', 'about')

  if (updateError) {
    setMessage(updateError.message)
    return
  }

  setMessage('About saved successfully!')
}
async function saveNotesContent() {
  setMessage('Saving notes...')

    const { error: fetchError } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'notes')
    .single()

  if (fetchError) {
    setMessage(fetchError.message)
    return
  }

  const { error: updateError } = await supabase
    .from('site_content')
    .update({
      content: notesContent,
      updated_at: new Date().toISOString(),
    })
    .eq('section', 'notes')

  if (updateError) {
    setMessage(updateError.message)
    return
  }

  setMessage('Notes saved successfully!')
}
async function saveContactContent() {
  setMessage('Saving site links...')

  const { data: existingData, error: fetchError } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'contact')
    .maybeSingle()

  if (fetchError) {
    setMessage(fetchError.message)
    return
  }

  if (!existingData) {
    setMessage(
      'Contact content is not initialized. Add the contact row in Supabase SQL Editor, then try again.'
    )
    return
  }

  const updatedContent = {
    ...(existingData.content || {}),
    heading: contactContent.heading,
    description: contactContent.description,
    email: contactContent.email,
    linkedin_url: contactContent.linkedin_url,
    substack_url: contactContent.substack_url,
    spotify_playlist_url: contactContent.spotify_playlist_url,
  }

  const contentData = {
    content: updatedContent,
    updated_at: new Date().toISOString(),
  }

  const { error: updateError } = await supabase
    .from('site_content')
    .update(contentData)
    .eq('section', 'contact')

  if (updateError) {
    setMessage(updateError.message)
    return
  }

  setMessage('Site links saved successfully!')
}
  useEffect(() => {
  loadProjects()
  loadHomeContent()
  loadAboutContent()
  loadNotesContent()
  loadContactContent()
}, [])
async function handleLogin(event) {
  event.preventDefault()
  setMessage('Logging in...')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    setMessage(error.message)
    return
  }

  setMessage('Logged in successfully!')
}
async function handlePasswordRecovery(event) {
  event.preventDefault()
  setMessage('Sending recovery email...')

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    setMessage(error.message)
    return
  }

  setRecoveryEmailSent(true)
  setMessage('If an account exists for that email, recovery instructions have been sent.')
}
async function handleLogout() {
  await supabase.auth.signOut()
}
  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  async function loadProjectImages(projectId) {
    setImagesLoading(true)

    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      setProjectImages([])
      setMessage(error.message)
    } else {
      setProjectImages(
        (data || []).map((image, index) => ({
          ...image,
          section_number: image.section_number || '01',
          x: Number.isFinite(Number(image.x)) ? Number(image.x) : 8 + index * 4,
          y: Number.isFinite(Number(image.y)) ? Number(image.y) : 8 + index * 4,
          width: Number.isFinite(Number(image.width)) ? Number(image.width) : 36,
          height: Number.isFinite(Number(image.height)) ? Number(image.height) : 30,
          z_index: Number.isFinite(Number(image.z_index)) ? Number(image.z_index) : index,
        }))
      )
    }

    setImagesLoading(false)
  }

  function clearSelectedImageFiles() {
    selectedImageFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
    setSelectedImageFiles([])
  }

  async function startEditing(project) {
    setEditingId(project.id)
    setForm({
      title: project.title || '',
      category: project.category || '',
      description: project.description || '',
      accent: project.accent || 'mint',
      number: project.number || '',
      published: project.published ?? true,
      sort_order: project.sort_order || 0,
    })
    clearSelectedImageFiles()
    setMessage('')
    await loadProjectImages(project.id)
  }

  function startNewProject() {
    setEditingId(null)
    setForm(emptyProject)
    setProjectImages([])
    setCompositionSection('01')
    setSelectedCompositionImageId(null)
    clearSelectedImageFiles()
    setMessage('')
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || [])
    const invalidFile = files.find(
      (file) =>
        !allowedProjectImageTypes.includes(file.type) ||
        file.size > maxProjectImageSize
    )

    if (invalidFile) {
      setMessage('Use JPG, PNG, WEBP, or GIF images up to 10 MB each.')
      event.target.value = ''
      return
    }

    clearSelectedImageFiles()
    setSelectedImageFiles(
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
    )
    setMessage('')
  }

  async function uploadProjectImages() {
    if (!editingId || selectedImageFiles.length === 0 || imagesUploading) return

    setImagesUploading(true)
    setMessage('Uploading images...')
    const uploadedPaths = []

    try {
      const nextSortOrder = projectImages.length
      const imageRows = []

      for (const [index, selectedImage] of selectedImageFiles.entries()) {
        const safeFilename = selectedImage.file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        const storagePath = `${editingId}/${crypto.randomUUID()}-${safeFilename}`

        const { error: uploadError } = await supabase.storage
          .from(projectImageBucket)
          .upload(storagePath, selectedImage.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: selectedImage.file.type,
          })

        if (uploadError) throw uploadError

        uploadedPaths.push(storagePath)
        const { data: publicUrlData } = supabase.storage
          .from(projectImageBucket)
          .getPublicUrl(storagePath)

        imageRows.push({
          project_id: editingId,
          storage_path: storagePath,
          image_url: publicUrlData.publicUrl,
          alt_text: form.title,
          sort_order: nextSortOrder + index,
          section_number: compositionSection,
          x: 8 + index * 4,
          y: 8 + index * 4,
          width: 36,
          height: 30,
          z_index: nextSortOrder + index,
        })
      }

      const { error: insertError } = await supabase
        .from('project_images')
        .insert(imageRows)

      if (insertError) throw insertError

      clearSelectedImageFiles()
      await loadProjectImages(editingId)
      setMessage('Images uploaded successfully!')
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(projectImageBucket).remove(uploadedPaths)
      }
      setMessage(error.message || 'Image upload failed.')
    } finally {
      setImagesUploading(false)
    }
  }

  async function deleteProjectImage(image) {
    if (imagesUploading) return

    setImagesUploading(true)
    setMessage('Deleting image...')

    const { error: storageError } = await supabase.storage
      .from(projectImageBucket)
      .remove([image.storage_path])

    if (storageError) {
      setImagesUploading(false)
      setMessage(storageError.message)
      return
    }

    const { error: deleteError } = await supabase
      .from('project_images')
      .delete()
      .eq('id', image.id)

    if (deleteError) {
      setImagesUploading(false)
      setMessage(deleteError.message)
      return
    }

    await loadProjectImages(editingId)
    setImagesUploading(false)
    setMessage('Image deleted.')
  }

  async function moveProjectImage(imageIndex, direction) {
    const sectionImages = projectImages
      .filter((image) => image.section_number === compositionSection)
      .sort((first, second) => first.z_index - second.z_index)
    const targetIndex = imageIndex + direction
    if (targetIndex < 0 || targetIndex >= sectionImages.length || imagesUploading) return

    const reorderedImages = [...sectionImages]
    const [movedImage] = reorderedImages.splice(imageIndex, 1)
    reorderedImages.splice(targetIndex, 0, movedImage)
    const zIndexes = new Map(
      reorderedImages.map((image, index) => [image.id, index])
    )
    const updatedImages = projectImages.map((image) =>
      zIndexes.has(image.id)
        ? {
            ...image,
            z_index: zIndexes.get(image.id),
            sort_order: zIndexes.get(image.id),
          }
        : image
    )

    setProjectImages(updatedImages)
    setMessage('Layer order changed. Save composition to keep it.')
  }

  function handleCompositionPointerDown(event, imageId, mode = 'move') {
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const image = projectImages.find((item) => item.id === imageId)
    if (!image) return

    setSelectedCompositionImageId(imageId)
    setCompositionInteraction({
      imageId,
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: image.x,
      startY: image.y,
      startWidth: image.width,
      startHeight: image.height,
    })
  }

  function handleCompositionPointerMove(event) {
    if (!compositionInteraction) return
    const canvas = event.currentTarget.getBoundingClientRect()
    const deltaX = ((event.clientX - compositionInteraction.startClientX) / canvas.width) * 100
    const deltaY = ((event.clientY - compositionInteraction.startClientY) / canvas.height) * 100

    setProjectImages((images) =>
      images.map((image) => {
        if (image.id !== compositionInteraction.imageId) return image

        if (compositionInteraction.mode === 'resize') {
          const nextWidth = Math.max(12, Math.min(90, compositionInteraction.startWidth + deltaX))
          const aspectRatio = compositionInteraction.startHeight / compositionInteraction.startWidth
          const nextHeight = Math.max(
            12,
            Math.min(90, nextWidth * (canvas.width / canvas.height) * aspectRatio)
          )
          return { ...image, width: nextWidth, height: nextHeight }
        }

        return {
          ...image,
          x: Math.max(0, Math.min(100 - image.width, compositionInteraction.startX + deltaX)),
          y: Math.max(0, Math.min(100 - image.height, compositionInteraction.startY + deltaY)),
        }
      })
    )
  }

  function stopCompositionInteraction() {
    if (compositionInteraction) {
      setCompositionInteraction(null)
      setMessage('Composition changed. Save composition to keep it.')
    }
  }

  function changeImageSection(imageId, sectionNumber) {
    setProjectImages((images) =>
      images.map((image) =>
        image.id === imageId ? { ...image, section_number: sectionNumber } : image
      )
    )
    setMessage('Section changed. Save composition to keep it.')
  }

  async function saveComposition() {
    if (!editingId || compositionSaving) return

    setCompositionSaving(true)
    setMessage('Saving composition...')
    const results = await Promise.all(
      projectImages.map((image) =>
        supabase
          .from('project_images')
          .update({
            section_number: image.section_number,
            x: image.x,
            y: image.y,
            width: image.width,
            height: image.height,
            z_index: image.z_index,
            sort_order: image.sort_order,
          })
          .eq('id', image.id)
      )
    )
    const saveError = results.find((result) => result.error)?.error

    setCompositionSaving(false)
    if (saveError) {
      setMessage(saveError.message)
      return
    }

    setMessage('Composition saved successfully!')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('Saving...')
const projectData = {
  ...form,
  sort_order: Number(form.sort_order) || 0,
}


    let result

    if (editingId) {
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingId)
    } else {
      result = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()
    }

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setMessage('Saved successfully!')
    if (!editingId && result.data) {
      await startEditing(result.data)
    } else if (editingId) {
      await loadProjectImages(editingId)
    }
    loadProjects()
  }

  async function deleteProject(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Project deleted.')
    loadProjects()
  }

if (authLoading) {
  return <p>Checking access...</p>
}

if (!user) {
  return (
    <main className="admin-page">
      <div className="admin-login">
        <h1>{recoveringPassword ? 'Reset Your Password.' : 'Welcome Back, Sheida.'}</h1>
        <p className="admin-intro">
          {recoveringPassword
            ? 'We’ll send a secure link to your email.'
            : 'Your little corner of the archive.'}
</p>

        {recoveringPassword ? (
          recoveryEmailSent ? (
            <button
              type="button"
              className="admin-login-link"
              onClick={() => {
                setRecoveringPassword(false)
                setRecoveryEmailSent(false)
                setMessage('')
              }}
            >
              Back to log in
            </button>
          ) : (
            <form onSubmit={handlePasswordRecovery}>
              <input
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit">Send recovery email</button>
              <button
                type="button"
                className="admin-login-link"
                onClick={() => {
                  setRecoveringPassword(false)
                  setMessage('')
                }}
              >
                Back to log in
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit">Log in</button>
            <button
              type="button"
              className="admin-login-link"
              onClick={() => {
                setRecoveringPassword(true)
                setMessage('')
              }}
            >
              Forgot password?
            </button>
          </form>
        )}

        {message && (
          <p className="admin-message" role="status">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
if (activeSection !== 'projects') {
  return (
    <main className="admin-page">
      <nav className="admin-nav">
        <button
          type="button"
          className={activeSection === 'projects' ? 'active' : ''}
          onClick={() => setActiveSection('projects')}
        >
          Projects
        </button>

        <button
          type="button"
          className={activeSection === 'homepage' ? 'active' : ''}
          onClick={() => setActiveSection('homepage')}
        >
          Homepage
        </button>

        <button
          type="button"
          className={activeSection === 'about' ? 'active' : ''}
          onClick={() => setActiveSection('about')}
        >
          About
        </button>

        <button
          type="button"
          className={activeSection === 'notes' ? 'active' : ''}
          onClick={() => setActiveSection('notes')}
        >
          Notes
        </button>

        <button
          type="button"
          className={activeSection === 'contact' ? 'active' : ''}
          onClick={() => setActiveSection('contact')}
        >
          Contact
        </button>

        <button
          type="button"
          className={activeSection === 'music' ? 'active' : ''}
          onClick={() => setActiveSection('music')}
        >
          Music
        </button>
      </nav>

      {activeSection === 'homepage' ? (
  <section className="admin-form-section">
    <div className="admin-header">
      <div>
        <p className="section-label">[ ADMIN / HOMEPAGE ]</p>
        <h1>Edit Homepage</h1>
        <p className="admin-section-intro">
          Update the text that appears on your homepage.
        </p>
      </div>
    </div>

    <form className="admin-form">
            <label>
        Hero title
        <textarea
          value={homeContent.hero_title}
          onChange={(event) =>
            setHomeContent({
              ...homeContent,
              hero_title: event.target.value,
            })
          }
          placeholder="Things I make. Things I notice..."
          rows="4"
        />
      </label>
      <label>
        Hero introduction
        <textarea
          value={homeContent.hero_intro}
          onChange={(event) =>
            setHomeContent({
              ...homeContent,
              hero_intro: event.target.value,
            })
          }
          placeholder="An evolving archive of objects..."
          rows="4"
        />
      </label>

      <label>
        Ticker text
        <textarea
          value={homeContent.ticker_text}
          onChange={(event) =>
            setHomeContent({
              ...homeContent,
              ticker_text: event.target.value,
            })
          }
          placeholder="Currently thinking about..."
          rows="3"
        />
      </label>

      <button type="button" onClick={saveHomeContent}>
  Save Homepage
</button>
{message && (
  <p className="admin-message">
    {message}
  </p>
)}
    </form>
  </section>
) : activeSection === 'about' ? (
 <section className="admin-form-section admin-editor-page admin-about-editor">
  <h2>Edit About</h2>

  <label>Title</label>
  <input
    value={aboutContent.title}
    onChange={(e) =>
      setAboutContent({
        ...aboutContent,
        title: e.target.value,
      })
    }
  />

  <label>Paragraph One</label>
  <textarea
    value={aboutContent.paragraph_one}
    onChange={(e) =>
      setAboutContent({
        ...aboutContent,
        paragraph_one: e.target.value,
      })
    }
  />

  <label>Paragraph Two</label>
  <textarea
    value={aboutContent.paragraph_two}
    onChange={(e) =>
      setAboutContent({
        ...aboutContent,
        paragraph_two: e.target.value,
      })
    }
  />

  <button type="button" onClick={saveAboutContent}>
  Save About
</button>

{message && (
  <p className="admin-message">
    {message}
  </p>
)}
</section>

) : activeSection === 'notes' ? (
  <section className="admin-form-section admin-editor-page admin-notes-editor">
    <h2>Edit Notes</h2>

    <button type="button" onClick={addNewNote}>
      + New Note
    </button>

    {notesContent.map((note, index) => (
      <div className="admin-note-editor" key={note.id}>
        <h3>Note {index + 1}</h3>

        <label>Date</label>
        <input
          value={note.date}
          onChange={(e) =>
            updateNote(note.id, 'date', e.target.value)
          }
        />

        <label>Title</label>
        <input
          value={note.title}
          onChange={(e) =>
            updateNote(note.id, 'title', e.target.value)
          }
        />

        <label>Description</label>
        <textarea
          value={note.description}
          onChange={(e) =>
            updateNote(note.id, 'description', e.target.value)
          }
        />

        <label>Color</label>
        <input
          type="color"
          value={note.color}
          onChange={(e) =>
            updateNote(note.id, 'color', e.target.value)
          }
        />
                <button
          type="button"
          onClick={() => deleteNote(note.id)}
        >
          Delete Note
        </button>
      </div>
    ))}

    <button type="button" onClick={saveNotesContent}>
      Save Notes
    </button>


    {message && (
      <p className="admin-message">
        {message}
      </p>
    )}
  </section>
) : activeSection === 'contact' ? (
  <section className="admin-form-section admin-editor-page admin-contact-editor">
    <h2>Edit Contact</h2>

    <label>Contact heading</label>
    <input
      value={contactContent.heading}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          heading: event.target.value,
        })
      }
    />

    <label>Contact description</label>
    <textarea
      value={contactContent.description}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          description: event.target.value,
        })
      }
      rows="5"
    />

    <label>Email address</label>
    <input
      type="email"
      value={contactContent.email}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          email: event.target.value,
        })
      }
      placeholder="hello@example.com"
    />

    <label>LinkedIn URL</label>
    <input
      type="url"
      value={contactContent.linkedin_url}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          linkedin_url: event.target.value,
        })
      }
      placeholder="https://www.linkedin.com/in/your-name"
    />

    <label>Substack URL</label>
    <input
      type="url"
      value={contactContent.substack_url}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          substack_url: event.target.value,
        })
      }
      placeholder="https://yourpublication.substack.com"
    />

    <button type="button" onClick={saveContactContent}>
      Save Contact
    </button>

    {message && (
      <p className="admin-message">
        {message}
      </p>
    )}
  </section>
) : activeSection === 'music' ? (
  <section className="admin-form-section admin-editor-page admin-music-editor">
    <p className="section-label">[ ADMIN / LISTENING ROOM ]</p>
    <h2>Music Player</h2>
    <p className="admin-section-intro">
      Add a Spotify playlist link. It will appear inside the Walkman page player.
    </p>

    <label>Spotify playlist URL</label>
    <input
      type="url"
      value={contactContent.spotify_playlist_url}
      onChange={(event) =>
        setContactContent({
          ...contactContent,
          spotify_playlist_url: event.target.value,
        })
      }
      placeholder="https://open.spotify.com/playlist/..."
    />

    <button type="button" onClick={saveContactContent}>
      Save Music Settings
    </button>

    {message && <p className="admin-message">{message}</p>}
  </section>
) : null}
    </main>
  )
}
function addNewNote() {
  if (notesContent.length >= 3) {
    setMessage('You can add up to 3 notes.')
    return
  }

  setNotesContent([
    ...notesContent,
    {
      id: Date.now(),
      date: '',
      title: '',
      description: '',
      color: '#f8e58c',
    },
  ])

  setMessage('')
}
function updateNote(id, field, value) {
  setNotesContent(
    notesContent.map((note) =>
      note.id === id
        ? {
            ...note,
            [field]: value,
          }
        : note
    )
  )
}
function deleteNote(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this note?'
  )

  if (!confirmed) return

  setNotesContent(
    notesContent.filter((note) => note.id !== id)
  )

  setMessage('Note deleted.')
}
  return (
    <main className="admin-page">
      
<nav className="admin-nav">
  <button
    type="button"
    className={activeSection === 'projects' ? 'active' : ''}
    onClick={() => setActiveSection('projects')}
  >
    Projects
  </button>

  <button
    type="button"
    className={activeSection === 'homepage' ? 'active' : ''}
    onClick={() => setActiveSection('homepage')}
  >
    Homepage
  </button>

  <button
    type="button"
    className={activeSection === 'about' ? 'active' : ''}
    onClick={() => setActiveSection('about')}
  >
    About
  </button>

  <button
    type="button"
    className={activeSection === 'notes' ? 'active' : ''}
    onClick={() => setActiveSection('notes')}
  >
    Notes
  </button>

  <button
    type="button"
    className={activeSection === 'contact' ? 'active' : ''}
    onClick={() => setActiveSection('contact')}
  >
    Contact
  </button>
</nav>
       <button
  className="admin-logout"
      type="button"
      onClick={handleLogout}
    >
      Log out
   
 </button>
      <div className="admin-header">
        <div>
          <p className="section-label">[ ADMIN / ARCHIVE ]</p>
          <h1>Welcome Back, Sheida.</h1>
          <h1>Manage Projects</h1>
          <p className="admin-section-intro">
  Add, edit, and keep track of the things you make.
</p>
        </div>

        <button onClick={startNewProject}>
          + New Project
        </button>
      </div>

    <section className="admin-form-section admin-project-editor">
  <h2>{editingId ? 'Edit Project' : 'New Project'}</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Project title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Morning Ritual"
              required
            />
          </label>

          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Object / Ritual / Light"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows="4"
            />
          </label>

          <label>
            Accent color
            <select
              name="accent"
              value={form.accent}
              onChange={handleChange}
            >
              <option value="mint">Mint</option>
              <option value="pink">Pink</option>
              <option value="lilac">Lilac</option>
              <option value="butter">Butter</option>
              <option value="coral">Coral</option>
            </select>
          </label>

          <label>
            Project number
            <input
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="01"
            />
          </label>

          <label>
            Sort order
            <input
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={handleChange}
            />
          </label>

          <label className="admin-checkbox">
            <input
              name="published"
              type="checkbox"
              checked={form.published}
              onChange={handleChange}
            />
            Published on website
          </label>

          <div className="admin-form-actions">
            <button type="submit">
              {editingId ? 'Update Project' : 'Save Project'}
            </button>

            {editingId && (
              <button type="button" onClick={startNewProject}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="admin-message">{message}</p>}

        {editingId && (
          <section className="admin-image-manager">
            <h3>Project images</h3>
            <p>Select one or more images, then upload them to this project.</p>

            <label>
              Add images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageSelection}
                disabled={imagesUploading}
              />
            </label>

            {selectedImageFiles.length > 0 && (
              <div className="admin-image-preview-list">
                {selectedImageFiles.map(({ file, previewUrl }) => (
                  <figure key={previewUrl} className="admin-image-preview">
                    <img src={previewUrl} alt={`Preview of ${file.name}`} />
                    <figcaption>{file.name}</figcaption>
                  </figure>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={uploadProjectImages}
              disabled={selectedImageFiles.length === 0 || imagesUploading}
            >
              {imagesUploading ? 'Working...' : 'Upload selected images'}
            </button>

            <div className="admin-composition-editor">
              <div className="admin-composition-heading">
                <div>
                  <h4>Composition</h4>
                  <p>Drag images to move them. Drag the corner handle to resize.</p>
                </div>
                <button
                  type="button"
                  onClick={saveComposition}
                  disabled={compositionSaving || imagesUploading}
                >
                  {compositionSaving ? 'Saving...' : 'Save composition'}
                </button>
              </div>

              <div className="admin-composition-sections" role="tablist" aria-label="Composition sections">
                {compositionSections.map((section) => (
                  <button
                    type="button"
                    key={section}
                    className={compositionSection === section ? 'active' : ''}
                    onClick={() => setCompositionSection(section)}
                  >
                    Section {section}
                  </button>
                ))}
              </div>

              <div
                className="admin-composition-canvas"
                onPointerMove={handleCompositionPointerMove}
                onPointerUp={stopCompositionInteraction}
                onPointerCancel={stopCompositionInteraction}
              >
                {projectImages
                  .filter((image) => image.section_number === compositionSection)
                  .sort((first, second) => first.z_index - second.z_index)
                  .map((image) => (
                    <div
                      className={`admin-composition-image ${
                        selectedCompositionImageId === image.id ? 'selected' : ''
                      }`}
                      key={image.id}
                      onPointerDown={(event) =>
                        handleCompositionPointerDown(event, image.id)
                      }
                      style={{
                        left: `${image.x}%`,
                        top: `${image.y}%`,
                        width: `${image.width}%`,
                        height: `${image.height}%`,
                        zIndex: image.z_index + 1,
                      }}
                    >
                      <img src={image.image_url} alt={image.alt_text || form.title} />
                      <button
                        type="button"
                        className="admin-composition-resize"
                        aria-label={`Resize image ${image.id}`}
                        onPointerDown={(event) =>
                          handleCompositionPointerDown(event, image.id, 'resize')
                        }
                      />
                    </div>
                  ))}
                {projectImages.filter(
                  (image) => image.section_number === compositionSection
                ).length === 0 && <span className="admin-composition-empty">No images in this section.</span>}
              </div>

              <div className="admin-composition-image-list">
                {projectImages
                  .filter((image) => image.section_number === compositionSection)
                  .sort((first, second) => first.z_index - second.z_index)
                  .map((image, index, sectionImages) => (
                    <div className="admin-composition-image-row" key={image.id}>
                      <span>{image.alt_text || form.title}</span>
                      <label>
                        Section
                        <select
                          value={image.section_number}
                          onChange={(event) =>
                            changeImageSection(image.id, event.target.value)
                          }
                        >
                          {compositionSections.map((section) => (
                            <option value={section} key={section}>
                              {section}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => moveProjectImage(index, -1)}
                        disabled={index === 0}
                      >
                        Send backward
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProjectImage(index, 1)}
                        disabled={index === sectionImages.length - 1}
                      >
                        Bring forward
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <h4>Uploaded images</h4>
            {imagesLoading ? (
              <p>Loading images...</p>
            ) : projectImages.length === 0 ? (
              <p>No images uploaded for this project.</p>
            ) : (
              <div className="admin-image-list">
                {projectImages.map((image, index) => (
                  <article className="admin-image-item" key={image.id}>
                    <img src={image.image_url} alt={image.alt_text || form.title} />
                    <div>
                      <span>Image {index + 1}</span>
                      <div className="admin-image-actions">
                        <button
                          type="button"
                          onClick={() => deleteProjectImage(image)}
                          disabled={imagesUploading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>

      <section className="admin-projects-section">
        <h2>Existing Projects</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <div className="admin-project-list">
            {projects.map((project) => (
              <article className="admin-project-item" key={project.id}>
                <div>
                  <span>{project.number}</span>
                  <h3>{project.title}</h3>
                  <p>{project.category}</p>
                </div>

                <div className="admin-item-actions">
                  <button onClick={() => startEditing(project)}>
                    Edit
                  </button>

                  <button onClick={() => deleteProject(project.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Admin