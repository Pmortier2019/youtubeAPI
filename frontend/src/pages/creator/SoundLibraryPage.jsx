import { useEffect, useState } from 'react'
import { getSounds } from '../../api'

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading sounds...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>Sound Library</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Use these sounds in your YouTube Shorts to earn money</p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2540, #141E2E)',
        border: '1px solid rgba(240,180,41,0.20)',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7 }}>
          <strong style={{ color: '#F9FAFB' }}>How it works:</strong> Use one of these tracks in your YouTube Short, link your channel and scrape your Shorts. We check whether the sound was used and count your views towards your earnings.
        </div>
      </div>

      {sounds.length === 0 ? (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>No sounds available</div>
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
                border: searchFocus ? '2px solid #F0B429' : '1px solid rgba(255,255,255,0.10)',
                outline: 'none',
                background: 'rgba(255,255,255,0.04)',
                color: '#F9FAFB',
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
        background: '#141E2E',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.50)' : '0 4px 24px rgba(0,0,0,0.3)',
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
              color: '#0B1120',
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
          <div style={{ color: '#0B1120', fontSize: 16, fontWeight: 800 }}>{sound.title}</div>
          {sound.artistName && <div style={{ color: 'rgba(11,17,32,0.70)', fontSize: 13 }}>{sound.artistName}</div>}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>
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
            color: '#0B1120',
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
