import { useEffect, useState } from 'react'
import { getAllPayouts, markPayoutPaid } from '../../api'

const STATUS_CONFIG = {
  PENDING: { bg: 'rgba(240,180,41,0.15)',  color: '#F0B429', dot: '#F0B429', border: 'rgba(240,180,41,0.30)'  },
  PAID:    { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', dot: '#10B981', border: 'rgba(16,185,129,0.30)' },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', dot: '#6B7280', border: 'rgba(107,114,128,0.30)' }
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
      {status}
    </span>
  )
}

function MethodIcon({ method }) {
  if (!method) return <span style={{ color: '#6B7280' }}>—</span>
  const icon = method === 'PayPal' ? '💳' : method === 'IBAN' ? '🏦' : '💰'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(240,180,41,0.10)',
      color: '#F0B429',
      border: '1px solid rgba(240,180,41,0.25)',
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
    }}>
      {icon} {method}
    </span>
  )
}

export default function PayoutsAdminPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPayouts().then(data => {
      setPayouts(data)
      setLoading(false)
    })
  }, [])

  async function handleMarkPaid(id) {
    try {
      await markPayoutPaid(id)
      setPayouts(p => p.map(x => x.id === id ? { ...x, status: 'PAID' } : x))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading payouts...</div>
    </div>
  )

  const pendingCount = payouts.filter(p => p.status === 'PENDING').length
  const totalPending = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((s, p) => s + Number(p.amount ?? 0), 0)

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>Payout Requests</h1>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Manage and process creator payout requests</p>
        </div>
        {pendingCount > 0 && (
          <div style={{
            background: '#141E2E',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '16px 24px',
            display: 'flex',
            gap: 32,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' }}>Pending</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F0B429' }}>{pendingCount}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' }}>Total Due</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#F0B429' }}>€{totalPending.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {payouts.length === 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>💳</span>
          <p style={{ color: '#6B7280', fontSize: 15 }}>No payout requests yet.</p>
        </div>
      )}

      {payouts.length > 0 && (
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
                {['Creator', 'Amount', 'Period', 'Method', 'Details', 'Status', 'Requested', 'Action'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr
                  key={p.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#F9FAFB' }}>
                    {p.creatorName ?? p.creatorId ?? '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#F0B429' }}>
                      €{Number(p.amount ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                    {p.month}/{p.year}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <MethodIcon method={p.paymentMethod} />
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#6B7280', maxWidth: 180 }}>
                    <span style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{p.paymentDetails ?? '—'}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#6B7280' }}>
                    {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        style={{
                          padding: '7px 16px',
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                      >✓ Mark Paid</button>
                    )}
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
