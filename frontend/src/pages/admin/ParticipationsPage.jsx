import { useEffect, useState } from 'react'
import { getCampaigns, getCampaignParticipations, updateParticipationStatus } from '../../api'

const STATUS_CONFIG = {
  PENDING_REVIEW: { bg: '#fef9c3', color: '#a16207', dot: '#f59e0b', label: 'Pending Review' },
  APPROVED: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', label: 'Approved' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Rejected' },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af', label: status }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

export default function ParticipationsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [participations, setParticipations] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingParts, setLoadingParts] = useState(false)

  useEffect(() => {
    getCampaigns().then(data => {
      setCampaigns(data)
      setLoadingCampaigns(false)
    })
  }, [])

  async function handleCampaignChange(e) {
    const id = e.target.value
    setSelectedId(id)
    if (!id) { setParticipations([]); return }
    setLoadingParts(true)
    try {
      const data = await getCampaignParticipations(id)
      setParticipations(data)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoadingParts(false)
    }
  }

  async function handleStatus(id, status) {
    try {
      await updateParticipationStatus(id, status)
      setParticipations(p => p.map(x => x.id === id ? { ...x, status } : x))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loadingCampaigns) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Participations</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Review creator submissions for each campaign</p>
      </div>

      {/* Campaign selector */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #EAE4D9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Campaign:</label>
        <select
          value={selectedId}
          onChange={handleCampaignChange}
          style={{
            flex: 1,
            maxWidth: 360,
            padding: '10px 14px',
            fontSize: 14,
            borderRadius: 8,
            border: '1.5px solid #EAE4D9',
            background: '#FDFAF5',
            color: '#1A1A1A',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">— Select a campaign —</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        {selectedId && participations.length > 0 && (
          <span style={{
            background: '#FDF8EE',
            color: '#A07830',
            border: '1px solid #E8D9A0',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 999,
          }}>{participations.length} entries</span>
        )}
      </div>

      {loadingParts && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#C9A84C', fontWeight: 600 }}>
          Loading participations...
        </div>
      )}

      {!loadingParts && selectedId && participations.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>👥</span>
          <p style={{ color: '#6B7280', fontSize: 15 }}>No participations for this campaign yet.</p>
        </div>
      )}

      {!loadingParts && participations.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FDFAF5' }}>
                {['Video', 'Creator', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participations.map(p => {
                const videoId = p.videoId || extractVideoId(p.url)
                return (
                  <tr
                    key={p.id}
                    style={{ borderTop: '1px solid #EAE4D9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      {videoId ? (
                        <a href={`https://www.youtube.com/shorts/${videoId}`} target="_blank" rel="noreferrer">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt="thumb"
                            style={{ width: 56, height: 32, borderRadius: 4, objectFit: 'cover', display: 'block' }}
                          />
                        </a>
                      ) : p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#A07830', fontSize: 13 }}>{p.url}</a>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                      {p.creatorName ?? p.creatorId ?? '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>
                      {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {p.status === 'PENDING_REVIEW' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleStatus(p.id, 'APPROVED')}
                            style={{
                              padding: '6px 14px',
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(34,197,94,0.25)',
                            }}
                          >Approve</button>
                          <button
                            onClick={() => handleStatus(p.id, 'REJECTED')}
                            style={{
                              padding: '6px 14px',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(239,68,68,0.25)',
                            }}
                          >Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function extractVideoId(url) {
  if (!url) return null
  const m = url.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}
