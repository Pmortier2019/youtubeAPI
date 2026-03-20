import { useEffect, useState } from 'react'
import { getSounds } from '../../api'

function HowItWorks({ steps }) {
  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderLeft: '4px solid #F0B429',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 32,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
        How it works
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#F0B429', color: '#111827',
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>{i + 1}</div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55 }}>
              <strong style={{ color: '#111827' }}>{step.title}</strong>
              {step.desc && <span style={{ color: '#6B7280' }}> — {step.desc}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SoundLibraryPage() {
  const [sounds, setSounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)

  useEffect(() => {
    getSounds().then(data => { setSounds(data); setLoading(false) })
  }, [])

  const filtered = sounds.filter(s =>
    search === '' ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artistName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.genre || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading sounds...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Sound Library</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Use these sounds in your YouTube Shorts to earn money</p>
      </div>

      <HowItWorks steps={[
        { title: 'Browse the available sounds', desc: 'These are the sounds you can use in your YouTube Shorts to earn money.' },
        { title: 'Listen before you use it', desc: 'Click the Listen button to preview a sound on YouTube before adding it to your Short.' },
        { title: 'Use the sound in your Short', desc: 'When you upload your Short, make sure the sound is clearly audible throughout the video.' },
        { title: 'We detect it automatically', desc: 'After you link your channel, we find and review your Short within 1–3 days.' },
      ]} />

      {/* Info banner */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: '#92400E', lineHeight: 1.7 }}>
          <strong style={{ color: '#92400E' }}>How it works:</strong> Use one of these tracks in your YouTube Short, link your channel and scrape your Shorts. We check whether the sound was used and count your views towards your earnings.
        </div>
      </div>

      {sounds.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No sounds available</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>No tracks have been added to the library yet.</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <input
              style={{
                padding: '12px 16px',
                fontSize: 14,
                borderRadius: 10,
                border: searchFocus ? '2px solid #F0B429' : '1px solid #D1D5DB',
                outline: 'none',
                background: '#FFFFFF',
                color: '#111827',
                width: '100%',
                maxWidth: 360,
                boxSizing: 'border-box',
                transition: 'border 0.15s ease',
              }}
              placeholder="Search by title, artist or genre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(sound => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
              No sounds found for "{search}"
            </p>
          )}
        </>
      )}
    </div>
  )
}

function SoundCard({ sound }) {
  const [hover, setHover] = useState(false)
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
        border: '1px solid #E5E7EB',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
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
          {sound.genre && (
            <div style={{
              position: 'absolute',
              top: 10,
              left: 12,
              background: 'rgba(240,180,41,0.90)',
              color: '#111827',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              padding: '2px 8px',
              borderRadius: 999,
            }}>
              {sound.genre.toUpperCase()}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            <div style={{ color: '#F9FAFB', fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
            {sound.artistName && (
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{sound.artistName}</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #F0B429 0%, #D97706 100%)',
          padding: '20px',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{ color: '#111827', fontSize: 16, fontWeight: 800 }}>{sound.title}</div>
          {sound.artistName && <div style={{ color: 'rgba(11,17,32,0.70)', fontSize: 13 }}>{sound.artistName}</div>}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB' }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>
          {sound.artistName || '—'}
        </span>
        <a
          href={sound.soundUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 14px',
            background: 'linear-gradient(135deg, #F0B429, #D97706)',
            color: '#111827',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(240,180,41,0.30)',
          }}
        >
          ▶ Listen
        </a>
      </div>
    </div>
  )
}
