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
  padding: '12px 16px',
  fontSize: 14,
  borderRadius: 10,
  border: '1px solid #D1D5DB',
  outline: 'none',
  background: '#FFFFFF',
  color: '#111827',
  marginTop: 2,
  transition: 'border-color 0.15s ease',
}

function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading library...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Sound Library</h1>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>Manage tracks that can be used in campaigns</p>
        </div>
        <button
          onClick={showForm ? closeForm : openForm}
          style={{
            padding: '10px 20px',
            background: showForm
              ? '#FFFFFF'
              : 'linear-gradient(135deg, #F0B429, #D97706)',
            color: showForm ? '#374151' : '#111827',
            border: showForm ? '1px solid #D1D5DB' : 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: showForm ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Track'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '28px 32px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>New Track</h2>

          {/* URL input + preview */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>
              YouTube URL *
            </label>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              placeholder="https://www.youtube.com/watch?v=..."
              value={urlInput}
              onChange={handleUrlChange}
            />
            {previewing && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#D97706' }}>Ophalen...</div>
            )}
            {previewError && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#EF4444' }}>{previewError}</div>
            )}
          </div>

          {/* Thumbnail preview */}
          {previewData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
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
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{previewData.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>{previewData.videoId}</div>
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
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#991B1B',
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
                  background: saving || !form.soundVideoId
                    ? 'rgba(240,180,41,0.4)'
                    : 'linear-gradient(135deg, #F0B429, #D97706)',
                  color: '#111827',
                  border: 'none',
                  borderRadius: 10,
                  cursor: saving || !form.soundVideoId ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: saving || !form.soundVideoId ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
                  transition: 'all 0.15s ease',
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: '10px 20px',
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
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
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
          }}>🎵</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No tracks yet</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>No tracks in the library yet. Add one to get started!</p>
        </div>
      )}

      {/* Sound cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map(sound => (
          <SoundCard key={sound.id} sound={sound} onDelete={handleDelete} />
        ))}
      </div>

      {filtered.length === 0 && sounds.length > 0 && (
        <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
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
        background: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        border: hover ? '1px solid #FDE68A' : '1px solid #E5E7EB',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
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
            background: 'linear-gradient(to top, rgba(11,17,32,0.90) 0%, transparent 55%)',
          }} />
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            {sound.genre && (
              <span style={{
                display: 'inline-block',
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                letterSpacing: 0.5,
                marginBottom: 5,
                textTransform: 'uppercase',
              }}>{sound.genre}</span>
            )}
            <div style={{ color: '#F9FAFB', fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
            {sound.artistName && (
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{sound.artistName}</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(240,180,41,0.12) 0%, rgba(217,119,6,0.12) 100%)',
          borderBottom: '1px solid #FDE68A',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>🎵</div>
            {sound.genre && (
              <span style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}>{sound.genre}</span>
            )}
          </div>
          <div style={{ color: '#111827', fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
          {sound.artistName && (
            <div style={{ color: '#6B7280', fontSize: 13, marginTop: 3 }}>{sound.artistName}</div>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '14px 20px', flex: 1 }}>
        <a
          href={sound.soundUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: '#D97706', fontWeight: 600, textDecoration: 'none' }}
        >
          Watch on YouTube ↗
        </a>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onDelete(sound.id)}
          onMouseEnter={() => setDelHover(true)}
          onMouseLeave={() => setDelHover(false)}
          style={{
            padding: '6px 14px',
            background: delHover ? '#EF4444' : '#FEE2E2',
            color: delHover ? '#fff' : '#991B1B',
            border: '1px solid #FECACA',
            borderRadius: 8,
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
