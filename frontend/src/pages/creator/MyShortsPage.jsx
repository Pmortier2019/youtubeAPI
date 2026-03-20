import { useEffect, useState } from 'react'
import { getMyShorts } from '../../api'

function StatusBadge({ soundUsed }) {
  if (soundUsed === null || soundUsed === undefined) {
    return (
      <span style={{
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #FDE68A',
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
        background: '#D1FAE5',
        color: '#065F46',
        border: '1px solid #A7F3D0',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}>Approved</span>
    )
  }
  return (
    <span style={{
      background: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #FECACA',
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
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>My Shorts</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Review status of your submitted YouTube Shorts</p>
      </div>

      {/* Review notice */}
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
          Your Shorts are <strong style={{ color: '#92400E' }}>reviewed manually</strong> by the admin. This may take a few days.
          Approved Shorts count towards your earnings.
          <span style={{ display: 'block', marginTop: 4, color: '#92400E', fontSize: 13 }}>
            Make sure your Shorts clearly feature the sponsored sound.
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>
      )}

      {error && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#991B1B',
          fontSize: 14,
          marginBottom: 20,
        }}>{error}</div>
      )}

      {!loading && !error && shorts.length === 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          color: '#6B7280',
          fontSize: 15,
        }}>
          No Shorts found. Add your YouTube channel to get started.
        </div>
      )}

      {!loading && shorts.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
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
                    borderBottom: i < shorts.length - 1 ? '1px solid #E5E7EB' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
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
                      style={{ color: '#D97706', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
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
