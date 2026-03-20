import { useState, useEffect } from 'react'
import { previewPayout, processPayout, getPayoutHistory, markPayoutPaid } from '../../api'

const inputStyle = {
  padding: '10px 14px',
  fontSize: 14,
  borderRadius: 8,
  border: '1.5px solid #EAE4D9',
  outline: 'none',
  background: '#FDFAF5',
  color: '#1A1A1A',
  minWidth: 160,
}

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '28px 32px',
  border: '1px solid #EAE4D9',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  marginBottom: 32,
  maxWidth: 760,
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 20px',
  fontSize: 12,
  fontWeight: 700,
  color: '#6B7280',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
}

const tdStyle = {
  padding: '14px 20px',
  fontSize: 14,
  color: '#374151',
  borderTop: '1px solid #EAE4D9',
}

export default function PayoutPage() {
  const [pot, setPot] = useState('')
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [processLoading, setProcessLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const data = await getPayoutHistory()
      setHistory(data || [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handlePreview(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setPreview(null)
    setPreviewLoading(true)
    try {
      const data = await previewPayout(Number(pot))
      setPreview(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleProcess() {
    if (!window.confirm(`Process payout of €${pot} to all creators? This cannot be undone.`)) return
    setError(null)
    setSuccess(null)
    setProcessLoading(true)
    try {
      await processPayout(Number(pot))
      setSuccess(`Payout of €${pot} processed successfully. Views have been marked as paid.`)
      setPreview(null)
      setPot('')
      await loadHistory()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessLoading(false)
    }
  }

  async function handleMarkPaid(id) {
    try {
      await markPayoutPaid(id)
      await loadHistory()
    } catch (err) {
      setError(err.message)
    }
  }

  const totalNewViews = preview ? preview.reduce((s, l) => s + l.newViews, 0) : 0
  const totalPayout = preview ? preview.reduce((s, l) => s + l.payout, 0) : 0

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Section 1: Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Payout Calculator
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          Proportionally distribute a pot among creators based on new views
        </p>
      </div>

      {/* Section 2: Calculate form card */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 20, fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Calculate Payout
        </h2>

        <form onSubmit={handlePreview} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Total pot (€)
            </label>
            <input
              style={inputStyle}
              type="number"
              placeholder="e.g. 500.00"
              value={pot}
              onChange={e => { setPot(e.target.value); setPreview(null); setSuccess(null) }}
              required
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            disabled={previewLoading}
            style={{
              padding: '10px 24px',
              background: previewLoading ? '#D4AF37' : 'linear-gradient(135deg, #C9A84C, #A07830)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: previewLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 700,
              height: 42,
              boxShadow: '0 2px 10px rgba(201,168,76,0.35)',
            }}
          >
            {previewLoading ? 'Loading...' : 'Preview'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: 16,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: 14,
          }}>{error}</div>
        )}

        {success && (
          <div style={{
            marginTop: 16,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#16a34a',
            fontSize: 14,
            fontWeight: 600,
          }}>{success}</div>
        )}

        {/* Preview results table */}
        {preview && preview.length === 0 && (
          <div style={{
            marginTop: 20,
            background: '#FDFAF5',
            borderRadius: 8,
            padding: '16px 20px',
            color: '#6B7280',
            fontSize: 14,
          }}>
            No new views to pay out. All views may already have been paid, or no videos with sound used exist.
          </div>
        )}

        {preview && preview.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #EAE4D9',
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FDFAF5' }}>
                    <th style={thStyle}>Creator</th>
                    <th style={thStyle}>New Views</th>
                    <th style={thStyle}>Share %</th>
                    <th style={thStyle}>Payout (€)</th>
                    <th style={thStyle}>Payment Method</th>
                    <th style={thStyle}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map(line => (
                    <tr
                      key={line.creator}
                      onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1A1A1A' }}>{line.creator}</td>
                      <td style={tdStyle}>{line.newViews.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: '#FDF8EE',
                          color: '#A07830',
                          border: '1px solid #E8D9A0',
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 999,
                        }}>
                          {(line.sharePercent * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 15, fontWeight: 800, color: '#22c55e' }}>
                        € {line.payout.toFixed(2)}
                      </td>
                      <td style={tdStyle}>
                        {line.paymentMethod ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: line.paymentMethod === 'PAYPAL' ? '#eff6ff' : '#f0fdf4',
                            color: line.paymentMethod === 'PAYPAL' ? '#2563eb' : '#16a34a',
                            border: line.paymentMethod === 'PAYPAL' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                          }}>
                            {line.paymentMethod === 'PAYPAL' ? 'PayPal' : 'IBAN'}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {line.paymentDetails ? (
                          <span style={{ fontSize: 13, color: '#374151' }}>{line.paymentDetails}</span>
                        ) : (
                          <span style={{ color: '#f97316', fontSize: 13, fontWeight: 600 }}>⚠️ Not set</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr style={{ background: '#FDFAF5', borderTop: '2px solid #EAE4D9' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1A1A1A' }}>Total</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1A1A1A' }}>{totalNewViews.toLocaleString()}</td>
                    <td style={tdStyle}></td>
                    <td style={{ ...tdStyle, fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>
                      € {totalPayout.toFixed(2)}
                    </td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Warning + Process button */}
            <div style={{
              background: '#fff8f0',
              border: '1px solid #fed7aa',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#92400e',
              fontSize: 13,
              marginBottom: 16,
            }}>
              Warning: This will mark all current views as paid. Views will not be counted again in future payouts.
            </div>

            <button
              onClick={handleProcess}
              disabled={processLoading}
              style={{
                padding: '11px 28px',
                background: processLoading
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #7c3aed, #dc2626)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: processLoading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: processLoading ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
              }}
            >
              {processLoading ? 'Processing...' : `Process & Pay €${Number(pot).toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Payout History */}
      <div style={{ maxWidth: 760 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 16, fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Payout History
        </h2>

        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          {historyLoading ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
              No payout records yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FDFAF5' }}>
                  <th style={thStyle}>Creator</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Details</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(p => (
                  <tr
                    key={p.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#FDFAF5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#1A1A1A' }}>{p.creatorName}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#22c55e' }}>
                      € {Number(p.amount).toFixed(2)}
                    </td>
                    <td style={tdStyle}>
                      {p.year}-{String(p.month).padStart(2, '0')}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: p.status === 'PAID' ? '#f0fdf4' : '#fefce8',
                        color: p.status === 'PAID' ? '#16a34a' : '#a16207',
                        border: p.status === 'PAID' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {p.paymentMethod && p.paymentMethod !== 'UNKNOWN' ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: p.paymentMethod === 'PAYPAL' ? '#eff6ff' : '#f0fdf4',
                          color: p.paymentMethod === 'PAYPAL' ? '#2563eb' : '#16a34a',
                          border: p.paymentMethod === 'PAYPAL' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                        }}>
                          {p.paymentMethod === 'PAYPAL' ? 'PayPal' : 'IBAN'}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.paymentDetails ? (
                        <span style={{ fontSize: 13, color: '#374151' }}>{p.paymentDetails}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          style={{
                            padding: '5px 14px',
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
