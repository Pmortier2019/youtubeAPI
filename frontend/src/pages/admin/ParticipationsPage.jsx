import { useEffect, useState } from 'react'
import { getCampaigns, getCampaignParticipations, updateParticipationStatus } from '../../api'

const STATUS_CONFIG = {
  PENDING_REVIEW: { bg: 'rgba(240,180,41,0.15)',  color: '#F0B429', dot: '#F0B429', border: 'rgba(240,180,41,0.30)',  label: 'Pending Review' },
  APPROVED:       { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.30)', label: 'Approved'       },
  REJECTED:       { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', dot: '#EF4444', border: 'rgba(239,68,68,0.30)', label: 'Rejected'        },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', dot: '#6B7280', border: 'rgba(107,114,128,0.30)', label: status }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.bg,
      color: s.color,
      fontSize: 12,
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: 999,
      border: `1px solid ${s.border}`,
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>Participations</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Review creator submissions for each campaign</p>
      </div>

      {/* Campaign selector */}
      <div style={{
        background: '#141E2E',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: '#9CA3AF', whiteSpace: 'nowrap' }}>Campaign:</label>
        <select
          value={selectedId}
          onChange={handleCampaignChange}
          style={{
            flex: 1,
            maxWidth: 360,
            padding: '12px 16px',
            fontSize: 14,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            color: '#F9FAFB',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: '#141E2E' }}>— Select a campaign —</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#141E2E' }}>{c.title}</option>
          ))}
        </select>
        {selectedId && participations.length > 0 && (
          <span style={{
            background: 'rgba(240,180,41,0.15)',
            color: '#F0B429',
            border: '1px solid rgba(240,180,41,0.30)',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 999,
          }}>{participations.length} entries</span>
        )}
      </div>

      {loadingParts && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#F0B429', fontWeight: 600 }}>
          Loading participations...
        </div>
      )}

      {!loadingParts && selectedId && participations.length === 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>👥</span>
          <p style={{ color: '#6B7280', fontSize: 15 }}>No participations for this campaign yet.</p>
        </div>
      )}

      {!loadingParts && participations.length > 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Video', 'Creator', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: 0.8,
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
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
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
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#F0B429', fontSize: 13 }}>{p.url}</a>
                      ) : <span style={{ color: '#6B7280' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        background: 'rgba(240,180,41,0.10)',
                        color: '#F0B429',
                        border: '1px solid rgba(240,180,41,0.25)',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 999,
                      }}>
                        {p.creatorName ?? p.creatorId ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
                      {p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {p.status === 'PENDING_REVIEW' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleStatus(p.id, 'APPROVED')}
                            style={{
                              padding: '6px 14px',
                              background: '#10B981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 7,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 700,
                              boxShadow: '0 2px 6px rgba(16,185,129,0.30)',
                            }}
                          >Approve</button>
                          <button
                            onClick={() => handleStatus(p.id, 'REJECTED')}
                            style={{
                              padding: '6px 14px',
                              background: '#EF4444',
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
