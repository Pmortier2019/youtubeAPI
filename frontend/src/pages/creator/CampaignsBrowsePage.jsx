import { useEffect, useState } from 'react'
import { getActiveCampaigns, joinCampaign, getMyParticipations } from '../../api'

const PARTICIPATION_STATUS = {
  PENDING_REVIEW: { label: 'Pending Review', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  APPROVED:       { label: 'Approved',       bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  REJECTED:       { label: 'Rejected',       bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
}

function ParticipationBadge({ status }) {
  const s = PARTICIPATION_STATUS[status] || PARTICIPATION_STATUS.PENDING_REVIEW
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
    }}>{s.label}</span>
  )
}

export default function CampaignsBrowsePage() {
  const [campaigns, setCampaigns] = useState([])
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [joinUrl, setJoinUrl] = useState('')
  const [joinStatus, setJoinStatus] = useState({})

  useEffect(() => {
    Promise.all([getActiveCampaigns(), getMyParticipations()]).then(([cData, pData]) => {
      setCampaigns(cData)
      setParticipations(pData)
      setLoading(false)
    })
  }, [])

  function openJoinForm(id) {
    setJoiningId(id)
    setJoinUrl('')
    setJoinStatus(s => ({ ...s, [id]: null }))
  }

  function cancelJoin() {
    setJoiningId(null)
    setJoinUrl('')
  }

  async function handleJoin(e, id) {
    e.preventDefault()
    setJoinStatus(s => ({ ...s, [id]: null }))
    try {
      await joinCampaign(id, joinUrl)
      setJoinStatus(s => ({ ...s, [id]: { success: 'Successfully joined! Your participation is pending review.' } }))
      setJoiningId(null)
      setJoinUrl('')
    } catch (err) {
      setJoinStatus(s => ({ ...s, [id]: { error: err.message } }))
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading campaigns...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Campaigns</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Join a campaign and earn money with your Shorts</p>
      </div>

      {/* My participations */}
      {participations.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>My Participations</h2>
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
                  <th style={thStyle}>Campaign</th>
                  <th style={thStyle}>Short</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p, i) => (
                  <tr
                    key={p.participationId}
                    style={{ borderBottom: i < participations.length - 1 ? '1px solid #E5E7EB' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{p.campaignTitle}</span>
                    </td>
                    <td style={tdStyle}>
                      <a
                        href={p.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#D97706', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                      >
                        {p.videoId} ↗
                      </a>
                    </td>
                    <td style={tdStyle}>
                      <ParticipationBadge status={p.status} />
                    </td>
                    <td style={{ ...tdStyle, color: '#6B7280', fontSize: 13 }}>
                      {new Date(p.joinedAt).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign cards grid */}
      {campaigns.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {campaigns.map(c => {
            const budgetRemaining = Number(c.budget ?? 0) - Number(c.budgetSpent ?? 0)
            const budgetPct = c.budget > 0 ? Math.max(0, Math.min(100, (budgetRemaining / c.budget) * 100)) : 0
            return (
              <CampaignCard
                key={c.id}
                campaign={c}
                budgetRemaining={budgetRemaining}
                budgetPct={budgetPct}
                status={joinStatus[c.id]}
                isJoining={joiningId === c.id}
                joinUrl={joinUrl}
                onJoinUrl={setJoinUrl}
                onOpen={openJoinForm}
                onCancel={cancelJoin}
                onSubmit={handleJoin}
              />
            )
          })}
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '64px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>🚀</span>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Coming soon</h3>
          <p style={{ color: '#6B7280', fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
            Campaigns are coming soon. In the meantime, link your channel — your Shorts will be automatically submitted for review.
          </p>
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  color: '#6B7280',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

const tdStyle = {
  padding: '14px 20px',
  verticalAlign: 'middle',
}

function CampaignCard({
  campaign: c,
  budgetRemaining,
  budgetPct,
  status,
  isJoining,
  joinUrl,
  onJoinUrl,
  onOpen,
  onCancel,
  onSubmit,
}) {
  const [hover, setHover] = useState(false)
  const [urlFocus, setUrlFocus] = useState(false)

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
      {/* Sound thumbnail as card header */}
      {c.soundVideoId ? (
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            src={`https://img.youtube.com/vi/${c.soundVideoId}/mqdefault.jpg`}
            alt={c.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11,17,32,0.90) 0%, transparent 60%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
          }}>
            <h3 style={{ color: '#F9FAFB', fontSize: 18, fontWeight: 800, margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {c.title}
            </h3>
          </div>
          {c.soundUrl && (
            <a
              href={c.soundUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(240,180,41,0.90)',
                color: '#111827',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >▶ Watch Sound</a>
          )}
        </div>
      ) : (
        <div style={{
          height: 120,
          background: 'linear-gradient(135deg, #F0B429, #D97706)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '16px 20px',
        }}>
          <h3 style={{ color: '#111827', fontSize: 18, fontWeight: 800, margin: 0 }}>{c.title}</h3>
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {c.description && (
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{c.description}</p>
        )}

        {/* RPM rate highlight */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FEF3C7',
          borderRadius: 10,
          padding: '10px 14px',
          border: '1px solid #FDE68A',
        }}>
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>RPM Rate</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#D97706' }}>
            €{Number(c.rpmRate).toFixed(4)}<span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>/1K views</span>
          </span>
        </div>

        {/* Rules */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
          }}>
            ⏱ {c.minDurationSeconds}–{c.maxDurationSeconds}s
          </span>
          <span style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
          }}>
            🔊 min {c.minVolumePercent}% vol
          </span>
        </div>

        {/* Budget remaining */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>
            <span>Budget remaining</span>
            <span style={{ fontWeight: 700, color: '#D97706' }}>€{budgetRemaining.toFixed(2)}</span>
          </div>
          <div style={{ background: '#E5E7EB', borderRadius: 4, height: 6 }}>
            <div style={{
              background: 'linear-gradient(90deg, #F0B429, #D97706)',
              borderRadius: 4,
              height: 6,
              width: `${budgetPct}%`,
            }} />
          </div>
        </div>

        {/* Dates */}
        <div style={{ fontSize: 12, color: '#6B7280' }}>
          📅 {c.startDate ?? '—'}{c.endDate ? ` → ${c.endDate}` : ''}
        </div>

        {/* Success message */}
        {status && status.success && (
          <div style={{
            background: '#D1FAE5',
            border: '1px solid #A7F3D0',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#065F46',
            fontSize: 13,
            fontWeight: 600,
          }}>✅ {status.success}</div>
        )}

        {/* Join button */}
        {!isJoining && !(status && status.success) && (
          <button
            onClick={() => onOpen(c.id)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #F0B429, #D97706)',
              color: '#111827',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 2px 12px rgba(240,180,41,0.35)',
              transition: 'all 0.2s ease',
              alignSelf: 'flex-start',
            }}
          >Join Campaign →</button>
        )}

        {/* Inline join form */}
        {isJoining && (
          <form
            onSubmit={e => onSubmit(e, c.id)}
            style={{
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Your Short URL
            </label>
            <input
              type="text"
              placeholder="https://youtube.com/shorts/..."
              value={joinUrl}
              onChange={e => onJoinUrl(e.target.value)}
              onFocus={() => setUrlFocus(true)}
              onBlur={() => setUrlFocus(false)}
              required
              style={{
                padding: '12px 16px',
                fontSize: 14,
                borderRadius: 10,
                border: urlFocus ? '2px solid #F0B429' : '1px solid #D1D5DB',
                outline: 'none',
                background: '#FFFFFF',
                color: '#111827',
                transition: 'border 0.15s ease',
              }}
            />
            {status && status.error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#991B1B',
                fontSize: 13,
              }}>{status.error}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'linear-gradient(135deg, #F0B429, #D97706)',
                  color: '#111827',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: '0 2px 12px rgba(240,180,41,0.35)',
                }}
              >Submit</button>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '10px 16px',
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
