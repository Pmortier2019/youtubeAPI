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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Payment Methods</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>Creator payment details for processing payouts</p>
      </div>

      {methods.length === 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
          }}>🏦</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No payment methods</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>No payment methods added by creators yet.</p>
        </div>
      )}

      {methods.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
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
                  style={{ borderTop: '1px solid #E5E7EB' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    {m.creatorName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
                    {m.email}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}>
                      {m.type === 'PayPal' ? '💳' : '🏦'} {m.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
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
