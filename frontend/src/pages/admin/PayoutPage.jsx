import { useState, useEffect } from 'react'
import { previewPayout, processPayout, getPayoutHistory, markPayoutPaid } from '../../api'

const inputStyle = {
  padding: '12px 16px',
  fontSize: 14,
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.10)',
  outline: 'none',
  background: 'rgba(255,255,255,0.04)',
  color: '#F9FAFB',
  minWidth: 160,
}

const cardStyle = {
  background: '#141E2E',
  borderRadius: 16,
  padding: '28px 32px',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  marginBottom: 32,
  maxWidth: 860,
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 20px',
  fontSize: 11,
  fontWeight: 700,
  color: '#6B7280',
  letterSpacing: 0.8,
  textTransform: 'uppercase',
}

const tdStyle = {
  padding: '14px 20px',
  fontSize: 14,
  color: '#9CA3AF',
  borderTop: '1px solid rgba(255,255,255,0.05)',
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
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>
          Payout Calculator
        </h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>
          Proportionally distribute a pot among creators based on new views
        </p>
      </div>

      {/* Calculate form card */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', marginBottom: 20 }}>
          Calculate Payout
        </h2>

        <form onSubmit={handlePreview} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>
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
              background: previewLoading ? 'rgba(240,180,41,0.40)' : 'linear-gradient(135deg, #F0B429, #D97706)',
              color: '#0B1120',
              border: 'none',
              borderRadius: 10,
              cursor: previewLoading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 700,
              height: 46,
              boxShadow: previewLoading ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
            }}
          >
            {previewLoading ? 'Loading...' : 'Preview'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: 16,
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.30)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#EF4444',
            fontSize: 14,
          }}>{error}</div>
        )}

        {success && (
          <div style={{
            marginTop: 16,
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.30)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#10B981',
            fontSize: 14,
            fontWeight: 600,
          }}>{success}</div>
        )}

        {/* Preview empty */}
        {preview && preview.length === 0 && (
          <div style={{
            marginTop: 20,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            padding: '16px 20px',
            color: '#6B7280',
            fontSize: 14,
          }}>
            No new views to pay out. All views may already have been paid, or no videos with sound used exist.
          </div>
        )}

        {/* Preview table */}
        {preview && preview.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              background: '#1A2540',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
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
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#F9FAFB' }}>{line.creator}</td>
                      <td style={tdStyle}>{line.newViews.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: 'rgba(240,180,41,0.15)',
                          color: '#F0B429',
                          border: '1px solid rgba(240,180,41,0.30)',
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 999,
                        }}>
                          {(line.sharePercent * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 16, fontWeight: 800, color: '#F0B429' }}>
                        €{line.payout.toFixed(2)}
                      </td>
                      <td style={tdStyle}>
                        {line.paymentMethod ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            background: line.paymentMethod === 'PAYPAL' ? 'rgba(37,99,235,0.15)' : 'rgba(16,185,129,0.15)',
                            color: line.paymentMethod === 'PAYPAL' ? '#60a5fa' : '#10B981',
                            border: line.paymentMethod === 'PAYPAL' ? '1px solid rgba(37,99,235,0.30)' : '1px solid rgba(16,185,129,0.30)',
                          }}>
                            {line.paymentMethod === 'PAYPAL' ? 'PayPal' : 'IBAN'}
                          </span>
                        ) : (
                          <span style={{ color: '#6B7280', fontSize: 13 }}>—</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {line.paymentDetails ? (
                          <span style={{ fontSize: 13, color: '#9CA3AF' }}>{line.paymentDetails}</span>
                        ) : (
                          <span style={{ color: '#f97316', fontSize: 13, fontWeight: 600 }}>⚠️ Not set</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#F9FAFB' }}>Total</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#F9FAFB' }}>{totalNewViews.toLocaleString()}</td>
                    <td style={tdStyle}></td>
                    <td style={{ ...tdStyle, fontSize: 16, fontWeight: 800, color: '#F0B429' }}>
                      €{totalPayout.toFixed(2)}
                    </td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Warning */}
            <div style={{
              background: 'rgba(249,115,22,0.10)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#fb923c',
              fontSize: 13,
              marginBottom: 16,
            }}>
              Warning: This will mark all current views as paid. Views will not be counted again in future payouts.
            </div>

            <button
              onClick={handleProcess}
              disabled={processLoading}
              style={{
                padding: '10px 28px',
                background: processLoading
                  ? 'rgba(240,180,41,0.40)'
                  : 'linear-gradient(135deg, #F0B429, #D97706)',
                color: '#0B1120',
                border: 'none',
                borderRadius: 10,
                cursor: processLoading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: processLoading ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
              }}
            >
              {processLoading ? 'Processing...' : `Process & Pay €${Number(pot).toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div style={{ maxWidth: 860 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F9FAFB', marginBottom: 16 }}>
          Payout History
        </h2>

        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
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
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
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
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#F9FAFB' }}>{p.creatorName}</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#F0B429', fontSize: 16 }}>
                      €{Number(p.amount).toFixed(2)}
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
                        background: p.status === 'PAID' ? 'rgba(16,185,129,0.15)' : 'rgba(240,180,41,0.15)',
                        color: p.status === 'PAID' ? '#10B981' : '#F0B429',
                        border: p.status === 'PAID' ? '1px solid rgba(16,185,129,0.30)' : '1px solid rgba(240,180,41,0.30)',
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
                          background: p.paymentMethod === 'PAYPAL' ? 'rgba(37,99,235,0.15)' : 'rgba(16,185,129,0.15)',
                          color: p.paymentMethod === 'PAYPAL' ? '#60a5fa' : '#10B981',
                          border: p.paymentMethod === 'PAYPAL' ? '1px solid rgba(37,99,235,0.30)' : '1px solid rgba(16,185,129,0.30)',
                        }}>
                          {p.paymentMethod === 'PAYPAL' ? 'PayPal' : 'IBAN'}
                        </span>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.paymentDetails ? (
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>{p.paymentDetails}</span>
                      ) : (
                        <span style={{ color: '#6B7280', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          style={{
                            padding: '5px 14px',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 7,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            boxShadow: '0 2px 6px rgba(16,185,129,0.30)',
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
