import { useEffect, useState } from 'react'
import { getMyShorts } from '../../api'

function StatusBadge({ soundUsed }) {
  if (soundUsed === null || soundUsed === undefined) {
    return (
      <span style={{
        background: 'rgba(240,180,41,0.15)',
        color: '#F0B429',
        border: '1px solid rgba(240,180,41,0.30)',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}>Pending Review</span>
    )
  }
  if (soundUsed === true) {
    return (
      <span style={{
        background: 'rgba(16,185,129,0.15)',
        color: '#10B981',
        border: '1px solid rgba(16,185,129,0.30)',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}>Approved</span>
    )
  }
  return (
    <span style={{
      background: 'rgba(239,68,68,0.12)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.30)',
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>Rejected</span>
  )
}

export default function MyShortsPage() {
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyShorts()
      .then(data => setShorts(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>My Shorts</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Review status of your submitted YouTube Shorts</p>
      </div>

      {/* Review notice */}
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
          Your Shorts are <strong style={{ color: '#F9FAFB' }}>reviewed manually</strong> by the admin. This may take a few days.
          Approved Shorts count towards your earnings.
          <span style={{ display: 'block', marginTop: 4, color: '#F0B429', fontSize: 13 }}>
            Make sure your Shorts clearly feature the sponsored sound.
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.30)',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#EF4444',
          fontSize: 14,
          marginBottom: 20,
        }}>{error}</div>
      )}

      {!loading && !error && shorts.length === 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          color: '#6B7280',
          fontSize: 15,
        }}>
          No Shorts found. Add your YouTube channel to get started.
        </div>
      )}

      {!loading && shorts.length > 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>THUMBNAIL</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>VIDEO</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>STATUS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>DATE ADDED</th>
              </tr>
            </thead>
            <tbody>
              {shorts.map((short, i) => (
                <tr
                  key={short.videoId}
                  style={{
                    borderBottom: i < shorts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 20px' }}>
                    <img
                      src={`https://img.youtube.com/vi/${short.videoId}/mqdefault.jpg`}
                      alt={short.videoId}
                      style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                    />
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <a
                      href={short.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#F0B429', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                    >
                      {short.videoId}
                    </a>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <StatusBadge soundUsed={short.soundUsed} />
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#6B7280' }}>
                    {short.createdAt
                      ? new Date(short.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
