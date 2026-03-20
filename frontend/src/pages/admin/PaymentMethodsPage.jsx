import { useEffect, useState } from 'react'
import { getAllPaymentMethods } from '../../api'

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPaymentMethods()
      .then(data => setMethods(data || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB' }}>Payment Methods</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Creator payment details for processing payouts</p>
      </div>

      {methods.length === 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(240,180,41,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
          }}>🏦</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>No payment methods</h3>
          <p style={{ color: '#6B7280', fontSize: 14 }}>No payment methods added by creators yet.</p>
        </div>
      )}

      {methods.length > 0 && (
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
                {['Creator', 'Email', 'Type', 'Details', 'Default', 'Added'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {methods.map(m => (
                <tr
                  key={m.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#F9FAFB' }}>
                    {m.creatorName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#9CA3AF' }}>
                    {m.email}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'rgba(240,180,41,0.15)',
                      color: '#F0B429',
                      border: '1px solid rgba(240,180,41,0.30)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}>
                      {m.type === 'PayPal' ? '💳' : '🏦'} {m.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#D1D5DB', fontFamily: 'monospace' }}>
                    {m.details}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: m.isDefault ? '#10B981' : '#6B7280', fontWeight: 600 }}>
                    {m.isDefault ? '✓ Yes' : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
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
