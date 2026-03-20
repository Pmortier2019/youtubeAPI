import { useEffect, useState } from 'react'
import { getPendingShorts, markSoundUsed } from '../../api'

export default function ReviewPage() {
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPendingShorts().then(data => {
      setShorts(data)
      setLoading(false)
    })
  }, [])

  async function mark(id, used) {
    try {
      await markSoundUsed(id, used)
      setShorts(s => s.filter(v => v.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB' }}>Review Shorts</h1>
            {shorts.length > 0 && (
              <span style={{
                background: 'rgba(240,180,41,0.15)',
                color: '#F0B429',
                border: '1px solid rgba(240,180,41,0.30)',
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
              }}>{shorts.length} pending</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Review Shorts to confirm they use your sound</p>
        </div>
      </div>

      {/* Empty state */}
      {shorts.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '3px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 32, color: '#10B981', lineHeight: 1 }}>✓</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 14, color: '#6B7280' }}>No pending reviews at the moment.</p>
        </div>
      )}

      {/* Short cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {shorts.map(short => (
          <ShortCard key={short.id} short={short} onMark={mark} />
        ))}
      </div>
    </div>
  )
}

function ShortCard({ short, onMark }) {
  const [hover, setHover] = useState(false)
  const videoId = extractVideoId(short.url)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: '#141E2E',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Thumbnail */}
      {videoId ? (
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt="thumbnail"
          style={{ width: 120, height: 68, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 120,
          height: 68,
          borderRadius: 8,
          background: 'rgba(240,180,41,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 28,
        }}>🎵</div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            background: 'rgba(240,180,41,0.15)',
            color: '#F0B429',
            border: '1px solid rgba(240,180,41,0.30)',
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
          }}>{short.creator}</span>
        </div>
        <a
          href={short.url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#F0B429',
            fontSize: 14,
            fontWeight: 500,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(240,180,41,0.35)',
          }}
        >
          {short.url}
        </a>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={() => onMark(short.id, true)}
          style={{
            padding: '10px 18px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 12px rgba(16,185,129,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(16,185,129,0.35)' }}
        >
          ✓ My Sound
        </button>
        <button
          onClick={() => onMark(short.id, false)}
          style={{
            padding: '10px 18px',
            background: '#EF4444',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 12px rgba(239,68,68,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(239,68,68,0.35)' }}
        >
          ✗ Not My Sound
        </button>
      </div>
    </div>
  )
}

function extractVideoId(url) {
  if (!url) return null
  const m = url.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
