import { useState } from 'react'
import { Link } from 'react-router-dom'
import { register, resendVerification } from '../api'

function FormInput({ label, type, name, placeholder, value, onChange, required, minLength, hint }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          height: 48,
          padding: '0 14px',
          fontSize: 15,
          borderRadius: 10,
          border: focused ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
          outline: 'none',
          background: '#f8fafc',
          color: '#0f172a',
          transition: 'border 0.15s ease',
        }}
      />
      {hint && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', creatorName: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [resent, setResent] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(form)
      setRegistered(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResent(false)
    await resendVerification(form.email)
    setResent(true)
  }

  if (registered) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Check your email</h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            We've sent a verification link to <strong>{form.email}</strong>.<br />
            Click the link in the email to activate your account.
          </p>
          {resent && (
            <p style={{ color: '#16a34a', fontSize: 13, marginBottom: 16 }}>A new link has been sent!</p>
          )}
          <button
            onClick={handleResend}
            style={{ background: 'none', border: 'none', color: '#0ea5e9', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
          >
            Didn't receive it? Resend email
          </button>
          <p style={{ marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Already verified? <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #1a1f3a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <span style={{ fontSize: 36 }}>🎵</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px' }}>SoundTracker</span>
        </div>

        <h1 style={{
          color: '#fff',
          fontSize: 38,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 20,
          letterSpacing: '-0.5px',
        }}>
          Start earning today
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 48, lineHeight: 1.6 }}>
          Create your creator account and we'll automatically find your Shorts using your YouTube handle.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '🎵', text: 'Use our sound in your YouTube Shorts' },
            { icon: '📊', text: 'We track views across all your participating Shorts' },
            { icon: '💳', text: 'Request payouts directly to PayPal or bank' },
          ].map(f => (
            <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(14, 165, 233, 0.2)',
                border: '1px solid rgba(14,165,233,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}>{f.icon}</div>
              <span style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: 40,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 16,
          padding: '48px 40px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>Create account</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Join as a YouTube Shorts creator</p>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 20,
              color: '#dc2626',
              fontSize: 14,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormInput
              label="Email address"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <FormInput
              label="Your name"
              type="text"
              name="creatorName"
              placeholder="e.g. Pieter Vlog"
              value={form.creatorName}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: loading ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 8,
                transition: 'opacity 0.15s ease',
                boxShadow: '0 2px 12px rgba(14,165,233,0.3)',
              }}
            >
              {loading ? 'Fetching your Shorts...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0ea5e9', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
