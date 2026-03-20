import { useEffect, useState } from 'react'
import { getSounds } from '../../api'

export default function SoundLibraryPage() {
  const [sounds, setSounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading sounds...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Sound Library</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Use these sounds in your YouTube Shorts to earn money</p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FDF8EE 0%, #F7F4EF 100%)',
        border: '1.5px solid #E8D9A0',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: '#A07830', lineHeight: 1.7 }}>
          <strong>Hoe werkt het:</strong> Gebruik een van deze nummers in je YouTube Short, koppel je kanaal en scrape je shorts. Wij controleren of het geluid gebruikt is en tellen je views mee voor je verdiensten.
        </div>
      </div>

      {sounds.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Geen nummers beschikbaar</div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>Er zijn nog geen nummers toegevoegd aan de bibliotheek.</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <input
              style={{
                padding: '9px 12px',
                fontSize: 14,
                borderRadius: 8,
                border: '1.5px solid #EAE4D9',
                outline: 'none',
                background: '#FDFAF5',
                color: '#1A1A1A',
                width: '100%',
                maxWidth: 360,
                boxSizing: 'border-box',
              }}
              placeholder="Zoek op titel, artiest of genre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(sound => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
              Geen nummers gevonden voor "{search}"
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
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #EAE4D9',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
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
            background: 'linear-gradient(to top, rgba(26,39,68,0.80) 0%, transparent 55%)',
          }} />
          {sound.genre && (
            <div style={{
              position: 'absolute',
              top: 10,
              left: 12,
              background: 'rgba(201,168,76,0.9)',
              color: '#fff',
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
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{sound.title}</div>
            {sound.artistName && (
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>{sound.artistName}</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
          padding: '20px',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{sound.title}</div>
          {sound.artistName && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{sound.artistName}</div>}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            padding: '6px 14px',
            background: 'linear-gradient(135deg, #C9A84C, #A07830)',
            color: '#fff',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(201,168,76,0.3)',
          }}
        >
          ▶ Beluisteren
        </a>
      </div>
    </div>
  )
}
