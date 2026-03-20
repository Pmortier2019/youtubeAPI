import { useEffect, useState } from 'react'
import { getMyPayouts, getMyPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../../api'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function StatusBadge({ status }) {
  const isPaid = status === 'PAID'
  return (
    <span style={{
      background: isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(240,180,41,0.15)',
      color: isPaid ? '#10B981' : '#F0B429',
      border: `1px solid ${isPaid ? 'rgba(16,185,129,0.30)' : 'rgba(240,180,41,0.30)'}`,
      borderRadius: 999,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>{status}</span>
  )
}

function PaymentMethodsSection() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'IBAN', details: '', isDefault: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyPaymentMethods()
      .then(data => setMethods(data || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.details.trim()) return
    setSaving(true)
    setError(null)
    try {
      const created = await addPaymentMethod(form)
      setMethods(m => [...m, created])
      setForm({ type: 'IBAN', details: '', isDefault: false })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this payment method?')) return
    try {
      await deletePaymentMethod(id)
      setMethods(m => m.filter(x => x.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const typeIcon = (type) => type === 'PayPal' ? '💳' : '🏦'
  const typePlaceholder = (type) => type === 'PayPal' ? 'your@paypal.email' : 'NL91 ABNA 0417 1643 00'
  const typeLabel = (type) => type === 'PayPal' ? 'PayPal email address' : 'IBAN bank account'

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.10)',
    fontSize: 14,
    background: 'rgba(255,255,255,0.04)',
    color: '#F9FAFB',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 2 }}>Payment Methods</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Where we send your payout</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #F0B429, #D97706)',
              color: '#0B1120',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(240,180,41,0.35)',
            }}
          >+ Add method</button>
        )}
      </div>

      {loading && <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>}

      {!loading && methods.length === 0 && !showForm && (
        <div style={{
          background: '#141E2E',
          border: '1.5px dashed rgba(255,255,255,0.10)',
          borderRadius: 16,
          padding: '32px 24px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: 14,
        }}>
          No payment methods added yet. Add one so we know where to send your earnings.
        </div>
      )}

      {methods.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showForm ? 16 : 0 }}>
          {methods.map(m => (
            <div key={m.id} style={{
              background: '#141E2E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 22,
                  width: 44,
                  height: 44,
                  background: 'rgba(240,180,41,0.15)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(240,180,41,0.25)',
                }}>{typeIcon(m.type)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#F0B429', marginBottom: 2 }}>{m.type}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace' }}>{m.details}</div>
                </div>
                {m.default && (
                  <span style={{
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.30)',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>Default</span>
                )}
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: 18,
                  padding: '4px 8px',
                  lineHeight: 1,
                  borderRadius: 6,
                }}
                title="Remove"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} style={{
          background: '#1A2540',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px',
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: '0 0 140px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 5 }}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, details: '' }))}
                style={inputStyle}
              >
                <option value="IBAN">IBAN</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 5 }}>
                {typeLabel(form.type)}
              </label>
              <input
                type={form.type === 'PayPal' ? 'email' : 'text'}
                placeholder={typePlaceholder(form.type)}
                value={form.details}
                onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer', fontSize: 13, color: '#9CA3AF' }}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default payment method
          </label>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#EF4444',
              fontSize: 13,
              marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: saving ? 'rgba(240,180,41,0.5)' : 'linear-gradient(135deg, #F0B429, #D97706)',
                color: '#0B1120',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
              }}
            >{saving ? 'Saving...' : 'Save'}</button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null) }}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.06)',
                color: '#D1D5DB',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        </form>
      )}
    </div>
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
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>My Payouts</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Manage your payment methods and view payout history</p>
      </div>

      <PaymentMethodsSection />

      {/* Timing notice */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2540, #141E2E)',
        border: '1px solid rgba(240,180,41,0.20)',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7 }}>
          Payouts are typically processed <strong style={{ color: '#F9FAFB' }}>every 2 months</strong> after your registration.
          You'll receive an email when your payment is ready.
          <span style={{ display: 'block', marginTop: 4, color: '#F0B429', fontSize: 13 }}>
            Note: your first payout may take longer depending on the total number of active creators.
          </span>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 16 }}>Payout History</h2>

      {loading && <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>}

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.30)',
          borderRadius: 10,
          padding: '10px 14px',
          color: '#EF4444',
          fontSize: 14,
          marginBottom: 20,
        }}>{error}</div>
      )}

      {!loading && !error && payouts.length === 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>💳</span>
          <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No payouts yet</p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Your first payout will appear here once processed — typically around 2 months after registration.
          </p>
        </div>
      )}

      {!loading && payouts.length > 0 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>AMOUNT</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>PERIOD</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>STATUS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>PAYMENT METHOD</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout, i) => (
                <tr
                  key={payout.id}
                  style={{ borderBottom: i < payouts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontSize: 16, fontWeight: 800, color: '#F0B429' }}>
                    €{Number(payout.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#9CA3AF' }}>
                    {MONTHS[payout.month - 1]} {payout.year}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <StatusBadge status={payout.status} />
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#9CA3AF' }}>
                    {payout.paymentMethod}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
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
