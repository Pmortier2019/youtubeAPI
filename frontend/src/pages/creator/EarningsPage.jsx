import { useEffect, useState } from 'react'
import { getMyEarnings, requestPayout } from '../../api'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PIE_COLORS = ['#C9A84C', '#A07830', '#D4AF37', '#B8962E', '#E8C96B', '#C9A84C', '#22c55e', '#f59e0b']

function SummaryCard({ icon, label, value, color, highlight }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 200px',
        background: highlight ? 'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)' : '#fff',
        borderRadius: 12,
        padding: '24px 28px',
        border: highlight ? 'none' : '1px solid #EAE4D9',
        boxShadow: hover
          ? highlight ? '0 8px 32px rgba(201,168,76,0.35)' : '0 8px 32px rgba(0,0,0,0.10)'
          : highlight ? '0 4px 20px rgba(201,168,76,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 34,
        fontWeight: 900,
        color: highlight ? '#fff' : color,
        letterSpacing: '-1px',
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: highlight ? 'rgba(255,255,255,0.7)' : '#6B7280', fontWeight: 500 }}>{label}</div>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading earnings...</div>
    </div>
  )

  const { totalEarned = 0, totalPaid = 0, pendingPayout = 0, breakdown = [] } = earnings ?? {}

  const pieData = breakdown
    .filter(r => Number(r.earned ?? 0) > 0)
    .map(r => ({
      name: r.campaignTitle ?? `Campaign ${r.campaignId}`,
      value: Number(r.earned ?? 0),
    }))

  const inputStyle = {
    padding: '9px 12px',
    fontSize: 14,
    borderRadius: 8,
    border: '1.5px solid #EAE4D9',
    outline: 'none',
    background: '#FDFAF5',
    color: '#1A1A1A',
    minWidth: 160,
  }

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>My Earnings</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Your earnings overview</p>
      </div>

      {/* Payout timing notice */}
      <div style={{
        background: 'linear-gradient(135deg, #FDF8EE 0%, #F7F4EF 100%)',
        border: '1.5px solid #E8D9A0',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 14, color: '#A07830', lineHeight: 1.7 }}>
          <strong>How does payout work?</strong><br />
          Payouts are processed automatically by the admin, typically <strong>every 2 months</strong> after your registration.
          You'll receive an email when your payout is ready.
          <span style={{ display: 'block', marginTop: 4, color: '#C9A84C', fontSize: 13 }}>
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
          color="#22c55e"
          highlight={false}
        />
        <SummaryCard
          icon="✅"
          label="Paid Out"
          value={`€${Number(totalPaid).toFixed(2)}`}
          color="#C9A84C"
          highlight={false}
        />
        <SummaryCard
          icon="🏦"
          label="Available to Withdraw"
          value={`€${Number(pendingPayout).toFixed(2)}`}
          color="#C9A84C"
          highlight={pendingPayout > 0}
        />
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 24, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            📊 Earnings by Campaign
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
                  background: '#1A2744',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                }}
                formatter={v => [`€${Number(v).toFixed(2)}`, 'Earned']}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 13, color: '#374151' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Breakdown table */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #EAE4D9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        marginBottom: 36,
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #EAE4D9' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Georgia, "Times New Roman", serif' }}>Earnings Breakdown</h2>
        </div>
        {breakdown.length === 0 ? (
          <div style={{ padding: '48px 28px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            No earnings yet. Your data will appear here after the first payout cycle.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FDFAF5' }}>
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
                  style={{ borderTop: '1px solid #EAE4D9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px', fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>
                    {row.campaignTitle ?? `Campaign ${row.campaignId}`}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 14, color: '#374151' }}>
                    {Number(row.views ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 17, fontWeight: 800, color: '#22c55e' }}>
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
        background: '#fff',
        borderRadius: 12,
        padding: '28px 32px',
        border: '1px solid #EAE4D9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        maxWidth: 640,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Request Payout</h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
          Payouts are normally processed automatically. Have a question about your payout? Get in touch.
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
          You can also manually submit a request for a specific month below.
        </p>

        <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Year</label>
              <select style={inputStyle} value={year} onChange={e => setYear(Number(e.target.value))}>
                {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Month</label>
              <select style={inputStyle} value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Payment Method</label>
              <select style={inputStyle} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
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
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: detailFocus ? '2px solid #C9A84C' : '1.5px solid #EAE4D9',
                outline: 'none',
                background: '#FDFAF5',
                color: '#1A1A1A',
                transition: 'border 0.15s ease',
              }}
            />
          </div>

          {payoutError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#B91C1C',
              fontSize: 14,
            }}>{payoutError}</div>
          )}
          {payoutSuccess && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#15803d',
              fontSize: 14,
              fontWeight: 600,
            }}>✅ {payoutSuccess}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '11px 28px',
                background: submitting ? '#D4AF37' : 'linear-gradient(135deg, #C9A84C, #A07830)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(201,168,76,0.35)',
                transition: 'all 0.2s ease',
              }}
            >{submitting ? 'Submitting...' : '💳 Request Payout'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
