import { useEffect, useState } from 'react'
import { getMyEarnings, requestPayout } from '../../api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PIE_COLORS = ['#F0B429', '#D97706', '#FBBF24', '#B45309', '#FCD34D', '#F0B429', '#10B981', '#F59E0B']

function SummaryCard({ icon, label, value, highlight }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 200px',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '24px 28px',
        border: highlight ? '1px solid #FDE68A' : '1px solid #E5E7EB',
        boxShadow: hover
          ? highlight ? '0 8px 32px rgba(240,180,41,0.15)' : '0 8px 32px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 40,
        fontWeight: 800,
        color: '#D97706',
        letterSpacing: '-1px',
        marginBottom: 4,
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const [paymentDetails, setPaymentDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [payoutSuccess, setPayoutSuccess] = useState(null)
  const [payoutError, setPayoutError] = useState(null)
  const [detailFocus, setDetailFocus] = useState(false)

  useEffect(() => {
    getMyEarnings().then(data => {
      setEarnings(data)
      setLoading(false)
    })
  }, [])

  async function handleRequestPayout(e) {
    e.preventDefault()
    setPayoutSuccess(null)
    setPayoutError(null)
    setSubmitting(true)
    try {
      await requestPayout({ year, month, paymentMethod, paymentDetails })
      setPayoutSuccess(`Payout request submitted for ${MONTHS[month - 1]} ${year}.`)
      setPaymentDetails('')
    } catch (err) {
      setPayoutError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading earnings...</div>
    </div>
  )

  const { totalEarned = 0, totalPaid = 0, pendingPayout = 0, breakdown = [] } = earnings ?? {}

  const pieData = breakdown
    .filter(r => Number(r.earned ?? 0) > 0)
    .map(r => ({
      name: r.campaignTitle ?? `Campaign ${r.campaignId}`,
      value: Number(r.earned ?? 0),
    }))

  const selectStyle = {
    padding: '12px 16px',
    fontSize: 14,
    borderRadius: 10,
    border: '1px solid #D1D5DB',
    outline: 'none',
    background: '#FFFFFF',
    color: '#111827',
    minWidth: 160,
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>My Earnings</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Your earnings overview</p>
      </div>

      {/* Payout timing notice */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 14, color: '#92400E', lineHeight: 1.7 }}>
          <strong style={{ color: '#92400E' }}>How does payout work?</strong><br />
          Payouts are processed automatically by the admin, typically <strong style={{ color: '#92400E' }}>every 2 months</strong> after your registration.
          You'll receive an email when your payout is ready.
          <span style={{ display: 'block', marginTop: 4, color: '#92400E', fontSize: 13 }}>
            Note: your first payout may take longer depending on the number of active creators.
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
        <SummaryCard
          icon="💰"
          label="Total Earned"
          value={`€${Number(totalEarned).toFixed(2)}`}
          highlight={false}
        />
        <SummaryCard
          icon="✅"
          label="Paid Out"
          value={`€${Number(totalPaid).toFixed(2)}`}
          highlight={false}
        />
        <SummaryCard
          icon="🏦"
          label="Available to Withdraw"
          value={`€${Number(pendingPayout).toFixed(2)}`}
          highlight={pendingPayout > 0}
        />
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '28px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
            Earnings by Campaign
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  color: '#111827',
                  fontSize: 13,
                }}
                formatter={v => [`€${Number(v).toFixed(2)}`, 'Earned']}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        marginBottom: 36,
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Earnings Breakdown</h2>
        </div>
        {breakdown.length === 0 ? (
          <div style={{ padding: '48px 28px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
            No earnings yet. Your data will appear here after the first payout cycle.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Campaign', 'Views', 'Earned'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 24px',
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
              {breakdown.map(row => (
                <tr
                  key={row.campaignId}
                  style={{ borderTop: '1px solid #E5E7EB' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px', fontWeight: 600, fontSize: 14, color: '#111827' }}>
                    {row.campaignTitle ?? `Campaign ${row.campaignId}`}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 14, color: '#6B7280' }}>
                    {Number(row.views ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 17, fontWeight: 800, color: '#D97706' }}>
                    €{Number(row.earned ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payout request form */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '28px 32px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        maxWidth: 640,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Request Payout</h2>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
          Payouts are normally processed automatically. Have a question about your payout? Get in touch.
        </p>
        <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 24 }}>
          You can also manually submit a request for a specific month below.
        </p>

        <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Year</label>
              <select style={selectStyle} value={year} onChange={e => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Month</label>
              <select style={selectStyle} value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Payment Method</label>
              <select style={selectStyle} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="PayPal">💳 PayPal</option>
                <option value="IBAN">🏦 IBAN</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {paymentMethod === 'PayPal' ? 'PayPal email address' : 'IBAN number'}
            </label>
            <input
              type="text"
              placeholder={paymentMethod === 'PayPal' ? 'you@paypal.com' : 'NL91 ABNA 0417 1643 00'}
              value={paymentDetails}
              onChange={e => setPaymentDetails(e.target.value)}
              onFocus={() => setDetailFocus(true)}
              onBlur={() => setDetailFocus(false)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                borderRadius: 10,
                border: detailFocus ? '2px solid #F0B429' : '1px solid #D1D5DB',
                outline: 'none',
                background: '#FFFFFF',
                color: '#111827',
                transition: 'border 0.15s ease',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {payoutError && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#991B1B',
              fontSize: 14,
            }}>{payoutError}</div>
          )}
          {payoutSuccess && (
            <div style={{
              background: '#D1FAE5',
              border: '1px solid #A7F3D0',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#065F46',
              fontSize: 14,
              fontWeight: 600,
            }}>✅ {payoutSuccess}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 28px',
                background: submitting ? 'rgba(240,180,41,0.5)' : 'linear-gradient(135deg, #F0B429, #D97706)',
                color: '#111827',
                border: 'none',
                borderRadius: 10,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: submitting ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
                transition: 'all 0.2s ease',
              }}
            >{submitting ? 'Submitting...' : '💳 Request Payout'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
