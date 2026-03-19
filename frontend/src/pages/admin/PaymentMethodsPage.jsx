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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#0ea5e9', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Payment Methods</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Creator payment details for processing payouts</p>
      </div>

      {methods.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '80px 40px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🏦</span>
          <p style={{ color: '#64748b', fontSize: 15 }}>No payment methods added by creators yet.</p>
        </div>
      )}

      {methods.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Creator', 'Email', 'Type', 'Details', 'Default', 'Added'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {methods.map(m => (
                <tr
                  key={m.id}
                  style={{ borderTop: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {m.creatorName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>
                    {m.email}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: '#f0f9ff',
                      color: '#0ea5e9',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}>
                      {m.type === 'PayPal' ? '💳' : '🏦'} {m.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#0f172a', fontFamily: 'monospace' }}>
                    {m.details}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: m.isDefault ? '#15803d' : '#94a3b8', fontWeight: 600 }}>
                    {m.isDefault ? '✓ Yes' : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>
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
