import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passFocus, setPassFocus] = useState(false)
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      saveToken(res.token)
      const payload = JSON.parse(atob(res.token.split('.')[1]))
      const isAdmin = payload.authorities?.includes('ROLE_ADMIN')
      navigate(isAdmin ? '/admin/review' : '/me/stats')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
    }}>
      {/* Left panel — dark gradient with branding */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #1a1f3a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '60px 64px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <span style={{ fontSize: 36 }}>🎵</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px' }}>PierreMusic</span>
        </div>

        {/* Tagline */}
        <h1 style={{
          color: '#fff',
          fontSize: 38,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 20,
          letterSpacing: '-0.5px',
        }}>
          Get paid for every Short
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 48, lineHeight: 1.6 }}>
          Join the platform that connects sound creators with YouTube Shorts creators and pays you for every view.
        </p>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '📈', text: 'Track views in real time across all Shorts' },
            { icon: '💰', text: 'Automatic earnings calculated by RPM rate' },
            { icon: '✅', text: 'Transparent payout system with full history' },
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

      {/* Right panel — form */}
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
          maxWidth: 400,
          background: '#fff',
          borderRadius: 16,
          padding: '48px 40px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>Welcome back</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>Sign in to your PierreMusic account</p>

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
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 14px',
                  fontSize: 15,
                  borderRadius: 10,
                  border: emailFocus ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  transition: 'border 0.15s ease',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                required
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 14px',
                  fontSize: 15,
                  borderRadius: 10,
                  border: passFocus ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  transition: 'border 0.15s ease',
                }}
              />
            </div>

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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
