import { useEffect, useState } from 'react'
import { getMyShorts } from '../../api'

function StatusBadge({ soundUsed }) {
  if (soundUsed === null || soundUsed === undefined) {
    return (
      <span style={{
        background: '#fff7ed',
        color: '#c2410c',
        border: '1px solid #fed7aa',
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
        background: '#f0fdf4',
        color: '#15803d',
        border: '1px solid #bbf7d0',
        borderRadius: 999,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}>Approved</span>
    )
  }
  return (
    <span style={{
      background: '#fef2f2',
      color: '#b91c1c',
      border: '1px solid #fecaca',
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
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>My Shorts</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Review status of your submitted YouTube Shorts</p>
      </div>

      {/* Review notice */}
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
          Your Shorts are <strong>reviewed manually</strong> by the admin. This may take a few days.
          Approved Shorts count towards your earnings.
          <span style={{ display: 'block', marginTop: 4, color: '#C9A84C', fontSize: 13 }}>
            Make sure your Shorts clearly feature the sponsored sound.
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#B91C1C',
          fontSize: 14,
          marginBottom: 20,
        }}>{error}</div>
      )}

      {!loading && !error && shorts.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '48px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          color: '#6B7280',
          fontSize: 15,
        }}>
          No Shorts found. Add your YouTube channel to get started.
        </div>
      )}

      {!loading && shorts.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FDFAF5', borderBottom: '1px solid #EAE4D9' }}>
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
                    borderBottom: i < shorts.length - 1 ? '1px solid #EAE4D9' : 'none',
                  }}
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
                      style={{ color: '#A07830', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
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
