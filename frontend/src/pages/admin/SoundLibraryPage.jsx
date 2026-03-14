import { useEffect, useState } from 'react'
import { getSounds, getSoundPreview, addSound, deleteSound } from '../../api'

function extractVideoId(url) {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /shorts\/([^?&#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

const inputStyle = {
  padding: '9px 12px',
  fontSize: 14,
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  outline: 'none',
  background: '#f8fafc',
  color: '#0f172a',
  marginTop: 2,
}

function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151' }}>
      {label}
      {children}
    </label>
  )
}

const emptyForm = { title: '', artistName: '', soundVideoId: '', soundUrl: '', genre: '' }

export default function SoundLibraryPage() {
  const [sounds, setSounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [urlInput, setUrlInput] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [previewError, setPreviewError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getSounds().then(data => { setSounds(data); setLoading(false) })
  }, [])

  async function handleUrlChange(e) {
    const url = e.target.value
    setUrlInput(url)
    setPreviewData(null)
    setPreviewError(null)

    const videoId = extractVideoId(url)
    if (!videoId) return

    setPreviewing(true)
    try {
      const data = await getSoundPreview(videoId)
      setPreviewData(data)
      setForm(f => ({
        ...f,
        soundVideoId: data.videoId,
        soundUrl: url.trim(),
        title: f.title || data.title,
      }))
    } catch {
      setPreviewError('Video niet gevonden of API-fout.')
    } finally {
      setPreviewing(false)
    }
  }

  function handleField(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function openForm() {
    setShowForm(true)
    setForm(emptyForm)
    setUrlInput('')
    setPreviewData(null)
    setPreviewError(null)
    setFormError(null)
  }

  function closeForm() {
    setShowForm(false)
    setForm(emptyForm)
    setUrlInput('')
    setPreviewData(null)
    setPreviewError(null)
    setFormError(null)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const created = await addSound(form)
      setSounds(s => [created, ...s])
      closeForm()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this track from the library?')) return
    try {
      await deleteSound(id)
      setSounds(s => s.filter(x => x.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const filtered = sounds.filter(s =>
    search === '' ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artistName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.genre || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#0ea5e9', fontSize: 16, fontWeight: 600 }}>Loading library...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Sound Library</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Manage tracks that can be used in campaigns</p>
        </div>
        <button
          onClick={showForm ? closeForm : openForm}
          style={{
            padding: '11px 22px',
            background: showForm ? '#f1f5f9' : 'linear-gradient(135deg, #0ea5e9, #0891b2)',
            color: showForm ? '#374151' : '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: showForm ? 'none' : '0 2px 10px rgba(14,165,233,0.35)',
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Track'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          marginBottom: 32,
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>New Track</h2>

          {/* URL input + preview */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              YouTube URL *
            </label>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              placeholder="https://www.youtube.com/watch?v=..."
              value={urlInput}
              onChange={handleUrlChange}
            />
            {previewing && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#0ea5e9' }}>Ophalen...</div>
            )}
            {previewError && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#dc2626' }}>{previewError}</div>
            )}
          </div>

          {/* Thumbnail preview */}
          {previewData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 24,
            }}>
              <img
                src={previewData.thumbnailUrl}
                alt="thumbnail"
                style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{previewData.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{previewData.videoId}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}>
              <FormField label="Title *">
                <input style={inputStyle} name="title" value={form.title} onChange={handleField} required />
              </FormField>
              <FormField label="Artist">
                <input style={inputStyle} name="artistName" value={form.artistName} onChange={handleField} />
              </FormField>
              <FormField label="Genre">
                <input style={inputStyle} name="genre" placeholder="e.g. Pop, Hip-hop..." value={form.genre} onChange={handleField} />
              </FormField>
            </div>
            {formError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: 14,
                marginBottom: 16,
              }}>{formError}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={saving || !form.soundVideoId}
                style={{
                  padding: '10px 24px',
                  background: saving || !form.soundVideoId ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9, #0891b2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving || !form.soundVideoId ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: '10px 20px',
                  background: '#f8fafc',
                  color: '#374151',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {sounds.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <input
            style={{ ...inputStyle, width: '100%', maxWidth: 360, boxSizing: 'border-box' }}
            placeholder="Search by title, artist or genre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Empty state */}
      {sounds.length === 0 && !showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <p style={{ color: '#64748b', fontSize: 16 }}>No tracks in the library yet. Add one to get started!</p>
        </div>
      )}

      {/* Sound cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(sound => (
          <SoundCard key={sound.id} sound={sound} onDelete={handleDelete} />
        ))}
      </div>

      {filtered.length === 0 && sounds.length > 0 && (
        <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
          No tracks found for "{search}"
        </p>
      )}
    </div>
  )
}

function SoundCard({ sound, onDelete }) {
  const [hover, setHover] = useState(false)
  const [delHover, setDelHover] = useState(false)
  const thumbnailUrl = sound.soundVideoId
    ? `https://img.youtube.com/vi/${sound.soundVideoId}/mqdefault.jpg`
    : null

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail or fallback header */}
      {thumbnailUrl ? (
        <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
          <img
            src={thumbnailUrl}
            alt={sound.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15,23,42,0.80) 0%, transparent 55%)',
          }} />
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 3 }}>
              {sound.genre ? sound.genre.toUpperCase() : 'SOUND'}
            </div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
            {sound.artistName && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>{sound.artistName}</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
            {sound.genre ? sound.genre.toUpperCase() : 'SOUND'}
          </div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
          {sound.artistName && (
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3 }}>{sound.artistName}</div>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '14px 20px', flex: 1 }}>
        <a
          href={sound.soundUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: '#0ea5e9', fontWeight: 600, textDecoration: 'none' }}
        >
          Watch on YouTube ↗
        </a>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onDelete(sound.id)}
          onMouseEnter={() => setDelHover(true)}
          onMouseLeave={() => setDelHover(false)}
          style={{
            padding: '6px 14px',
            background: delHover ? '#ef4444' : '#fef2f2',
            color: delHover ? '#fff' : '#ef4444',
            border: '1px solid #fecaca',
            borderRadius: 7,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            transition: 'all 0.15s ease',
          }}
        >Delete</button>
      </div>
    </div>
  )
}
