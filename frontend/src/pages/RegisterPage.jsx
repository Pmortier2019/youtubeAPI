import { useState } from 'react'
import { Link } from 'react-router-dom'
import { register, resendVerification } from '../api'
import { Music, TrendingUp, Wallet } from 'lucide-react'

const inputBase = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 15,
  borderRadius: 10,
  outline: 'none',
  background: '#FFFFFF',
  color: '#111827',
  transition: 'border 0.15s ease',
  boxSizing: 'border-box',
}

function FormInput({ label, type, name, placeholder, value, onChange, required, minLength, hint }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 7,
        letterSpacing: '0.2px',
      }}>
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
          ...inputBase,
          border: focused
            ? '2px solid #F0B429'
            : '1px solid #D1D5DB',
        }}
      />
      {hint && (
        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 5 }}>{hint}</p>
      )}
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
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FA',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          maxWidth: 460,
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '52px 48px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            margin: '0 auto 24px',
          }}>📬</div>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#111827',
            marginBottom: 14,
            letterSpacing: '-0.3px',
          }}>Check your email</h2>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            We've sent a verification link to{' '}
            <strong style={{ color: '#111827' }}>{form.email}</strong>.<br />
            Click the link in the email to activate your account.
          </p>
          {resent && (
            <p style={{
              color: '#065F46',
              fontSize: 13,
              marginBottom: 16,
              background: '#D1FAE5',
              border: '1px solid #A7F3D0',
              borderRadius: 8,
              padding: '8px 14px',
              display: 'inline-block',
            }}>A new link has been sent!</p>
          )}
          <div style={{ marginBottom: 8 }}>
            <button
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#D97706',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Didn't receive it? Resend email
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 14, color: '#6B7280' }}>
            Already verified?{' '}
            <Link to="/login" style={{ color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const features = [
    {
      Icon: Music,
      title: 'Use our sounds',
      text: 'Browse the library and add trending tracks to your YouTube Shorts.',
    },
    {
      Icon: TrendingUp,
      title: 'Automatic tracking',
      text: 'We track views across all your participating Shorts automatically.',
    },
    {
      Icon: Wallet,
      title: 'Flexible payouts',
      text: 'Request payouts directly to PayPal or bank whenever you want.',
    },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Left panel — keep dark */}
      <div style={{
        flex: '0 0 45%',
        background: '#070E1A',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 64px',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <Music size={32} color="#F0B429" strokeWidth={1.5} />
          <span style={{
            color: '#F9FAFB',
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '-0.5px',
          }}>PierreMusic</span>
        </div>

        {/* Tagline */}
        <h1 style={{
          color: '#F9FAFB',
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 20,
          letterSpacing: '-0.8px',
        }}>
          Join the{' '}
          <span style={{
            borderBottom: '3px solid #F0B429',
            paddingBottom: 2,
          }}>Creator Community</span>
        </h1>
        <p style={{
          color: '#9CA3AF',
          fontSize: 16,
          marginBottom: 52,
          lineHeight: 1.7,
          maxWidth: 380,
        }}>
          Create your creator account and we'll automatically find your Shorts using your YouTube handle.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {features.map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(240,180,41,0.12)',
                border: '1px solid rgba(240,180,41,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}><f.Icon size={18} color="#F0B429" strokeWidth={1.8} /></div>
              <div>
                <div style={{ color: '#F9FAFB', fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{f.title}</div>
                <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.55 }}>{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — light */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FA',
        padding: 40,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 440,
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '48px 44px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 6,
            color: '#111827',
            letterSpacing: '-0.4px',
          }}>Create your account</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            Join as a YouTube Shorts creator
          </p>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: 10,
              padding: '11px 16px',
              marginBottom: 22,
              color: '#991B1B',
              fontSize: 14,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
              label="Display name"
              type="text"
              name="creatorName"
              placeholder="e.g. Pieter Vlog"
              value={form.creatorName}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 0',
                background: loading
                  ? 'rgba(240,180,41,0.5)'
                  : 'linear-gradient(135deg, #F0B429, #D97706)',
                color: '#111827',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 6,
                transition: 'opacity 0.15s ease',
                boxShadow: loading ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
                letterSpacing: '0.2px',
              }}
            >
              {loading ? 'Fetching your Shorts...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#6B7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
