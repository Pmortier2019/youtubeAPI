import { useEffect, useState } from 'react'
import { getAllPayouts, markPayoutPaid } from '../../api'

const STATUS_CONFIG = {
  PENDING: { bg: '#fef9c3', color: '#a16207', dot: '#f59e0b' },
  PAID: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' }
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
      {status}
    </span>
  )
}

function MethodIcon({ method }) {
  if (!method) return <span style={{ color: '#cbd5e1' }}>—</span>
  const icon = method === 'PayPal' ? '💳' : method === 'IBAN' ? '🏦' : '💰'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: '#FDF8EE',
      color: '#A07830',
      border: '1px solid #E8D9A0',
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading payouts...</div>
    </div>
  )

  const pendingCount = payouts.filter(p => p.status === 'PENDING').length
  const totalPending = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((s, p) => s + Number(p.amount ?? 0), 0)

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Payout Requests</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Manage and process creator payout requests</p>
        </div>
        {pendingCount > 0 && (
          <div style={{
            background: '#fff',
            border: '1px solid #EAE4D9',
            borderRadius: 10,
            padding: '12px 20px',
            display: 'flex',
            gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>PENDING</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>TOTAL DUE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>€{totalPending.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {payouts.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>💳</span>
          <p style={{ color: '#6B7280', fontSize: 15 }}>No payout requests yet.</p>
        </div>
      )}

      {payouts.length > 0 && (
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
                {['Creator', 'Amount', 'Period', 'Method', 'Details', 'Status', 'Requested', 'Action'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: 0.5,
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
                  style={{ borderTop: '1px solid #EAE4D9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                    {p.creatorName ?? p.creatorId ?? '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#22c55e' }}>
                      €{Number(p.amount ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151', fontWeight: 600 }}>
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
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#94a3b8' }}>
                    {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        style={{
                          padding: '7px 16px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: '0 2px 6px rgba(34,197,94,0.3)',
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
