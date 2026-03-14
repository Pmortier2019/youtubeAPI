import { useEffect, useState } from 'react'
import { getMyPayouts } from '../../api'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function StatusBadge({ status }) {
  const isPaid = status === 'PAID'
  return (
    <span style={{
      background: isPaid ? '#f0fdf4' : '#fff7ed',
      color: isPaid ? '#15803d' : '#c2410c',
      border: `1px solid ${isPaid ? '#bbf7d0' : '#fed7aa'}`,
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>{status}</span>
  )
}

export default function MyPayoutPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyPayouts()
      .then(data => setPayouts(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>My Payouts</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Your payout history</p>
      </div>

      {/* Timing notice */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 14, color: '#0369a1', lineHeight: 1.7 }}>
          Payouts are typically processed <strong>every 2 months</strong> after your registration.
          You'll receive an email when your payment is ready.
          <span style={{ display: 'block', marginTop: 4, color: '#0ea5e9', fontSize: 13 }}>
            Note: your first payout may take longer depending on the total number of active creators.
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading...</div>
      )}

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#dc2626',
          fontSize: 14,
          marginBottom: 20,
        }}>{error}</div>
      )}

      {!loading && !error && payouts.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>💳</span>
          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No payouts yet</p>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Your first payout will appear here once processed — typically around 2 months after registration.
          </p>
        </div>
      )}

      {!loading && payouts.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>AMOUNT (€)</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>PERIOD</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>STATUS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>PAYMENT METHOD</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout, i) => (
                <tr
                  key={payout.id}
                  style={{
                    borderBottom: i < payouts.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}
                >
                  <td style={{ padding: '14px 20px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    € {Number(payout.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>
                    {MONTHS[payout.month - 1]} {payout.year}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={payout.status} />
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>
                    {payout.paymentMethod}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>
                    {payout.paymentDetails}
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
