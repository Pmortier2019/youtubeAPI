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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#0ea5e9', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Review Shorts</h1>
            {shorts.length > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0891b2)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 999,
              }}>{shorts.length} pending</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: '#64748b' }}>Review Shorts to confirm they use your sound</p>
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
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 64, marginBottom: 16 }}>🎉</span>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 14, color: '#64748b' }}>No pending reviews at the moment.</p>
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
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: hover ? '0 6px 24px rgba(0,0,0,0.09)' : '0 2px 12px rgba(0,0,0,0.05)',
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
          background: '#f1f5f9',
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
            background: '#f0f9ff',
            color: '#0ea5e9',
            fontSize: 12,
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 999,
          }}>{short.creator}</span>
        </div>
        <a
          href={short.url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#1e293b',
            fontSize: 14,
            fontWeight: 500,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: 'underline',
            textDecorationColor: '#cbd5e1',
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
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(34,197,94,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
          onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
        >
          ✓ My Sound
        </button>
        <button
          onClick={() => onMark(short.id, false)}
          style={{
            padding: '10px 18px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
          onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
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
