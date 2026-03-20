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
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Payment Methods</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Creator payment details for processing payouts</p>
      </div>

      {methods.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🏦</span>
          <p style={{ color: '#6B7280', fontSize: 15 }}>No payment methods added by creators yet.</p>
        </div>
      )}

      {methods.length > 0 && (
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
                {['Creator', 'Email', 'Type', 'Details', 'Default', 'Added'].map(h => (
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
              {methods.map(m => (
                <tr
                  key={m.id}
                  style={{ borderTop: '1px solid #EAE4D9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
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
                      background: '#FDF8EE',
                      color: '#A07830',
                      border: '1px solid #E8D9A0',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}>
                      {m.type === 'PayPal' ? '💳' : '🏦'} {m.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#1A1A1A', fontFamily: 'monospace' }}>
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
