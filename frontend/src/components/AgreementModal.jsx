import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { acceptAgreement } from '../api'

export default function AgreementModal({ version, body, onAccepted }) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAccept() {
    if (!checked) return
    setLoading(true)
    setError(null)
    try {
      await acceptAgreement(version)
      onAccepted()
    } catch (e) {
      setError(e.message || 'Failed to record acceptance. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
            Action Required
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
            Creator Revenue Share Agreement
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6B7280' }}>
            Version {version} · Please read and accept before continuing
          </p>
        </div>

        {/* Scrollable agreement body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 28px',
          fontSize: 14,
          lineHeight: 1.65,
          color: '#374151',
        }}>
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>

        {/* Sticky footer */}
        <div style={{
          borderTop: '1px solid #E5E7EB',
          padding: '16px 28px 20px',
          flexShrink: 0,
          background: '#F9FAFB',
        }}>
          {error && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#B91C1C' }}>
              {error}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', accentColor: '#F0B429' }}
            />
            <span style={{ fontSize: 14, color: '#111827', lineHeight: 1.5 }}>
              I have read and agree to the Creator Revenue Share Agreement
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!checked || loading}
            style={{
              width: '100%',
              padding: '12px 0',
              background: checked && !loading ? '#F0B429' : '#E5E7EB',
              color: checked && !loading ? '#111827' : '#9CA3AF',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: checked && !loading ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {loading ? 'Saving…' : 'Accept'}
          </button>

          <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 11, color: '#9CA3AF' }}>
            Version {version} · Governed by Dutch law · Your acceptance is timestamped
          </p>
        </div>
      </div>
    </div>
  )
}
