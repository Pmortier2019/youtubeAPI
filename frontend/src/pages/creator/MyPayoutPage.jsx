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

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Payment Methods</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Where we send your payout</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >+ Add method</button>
        )}
      </div>

      {loading && <div style={{ color: '#64748b', fontSize: 14 }}>Loading...</div>}

      {!loading && methods.length === 0 && !showForm && (
        <div style={{
          background: '#fff',
          border: '1.5px dashed #e2e8f0',
          borderRadius: 10,
          padding: '32px 24px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 14,
        }}>
          No payment methods added yet. Add one so we know where to send your earnings.
        </div>
      )}

      {methods.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showForm ? 16 : 0 }}>
          {methods.map(m => (
            <div key={m.id} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 22,
                  width: 40,
                  height: 40,
                  background: '#f0f9ff',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>{typeIcon(m.type)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{m.type}</div>
                  <div style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>{m.details}</div>
                </div>
                {m.default && (
                  <span style={{
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
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
                  color: '#dc2626',
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
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '20px 20px',
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: '0 0 140px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, details: '' }))}
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 10px',
                  borderRadius: 8,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 14,
                  background: '#f8fafc',
                }}
              >
                <option value="IBAN">IBAN</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                {typeLabel(form.type)}
              </label>
              <input
                type={form.type === 'PayPal' ? 'email' : 'text'}
                placeholder={typePlaceholder(form.type)}
                value={form.details}
                onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                required
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1.5px solid #e2e8f0',
                  fontSize: 14,
                  background: '#f8fafc',
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default payment method
          </label>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 20px',
                background: saving ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >{saving ? 'Saving...' : 'Save'}</button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null) }}
              style={{
                padding: '9px 20px',
                background: 'none',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
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
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>My Payouts</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Manage your payment methods and view payout history</p>
      </div>

      <PaymentMethodsSection />

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

      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Payout History</h2>

      {loading && <div style={{ color: '#64748b', fontSize: 14 }}>Loading...</div>}

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
                  style={{ borderBottom: i < payouts.length - 1 ? '1px solid #f1f5f9' : 'none' }}
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
