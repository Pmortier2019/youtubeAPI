import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../AuthContext'
import { Music, TrendingUp, ShieldCheck } from 'lucide-react'

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

  const features = [
    {
      Icon: Music,
      title: 'Use a sound, earn views',
      text: 'Pick a track from an active library, use it in your Short and build up earnings per 1,000 views.',
    },
    {
      Icon: TrendingUp,
      title: 'Automatic view tracking',
      text: 'Connect your YouTube channel and your views are tracked daily — no manual work.',
    },
    {
      Icon: ShieldCheck,
      title: 'Transparent earnings',
      text: 'See exactly what you have built up and request a payout once you reach the threshold.',
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
          Turn Your Shorts Into{' '}
          <span style={{
            borderBottom: '3px solid #F0B429',
            paddingBottom: 2,
          }}>Revenue</span>
        </h1>
        <p style={{
          color: '#9CA3AF',
          fontSize: 16,
          marginBottom: 52,
          lineHeight: 1.7,
          maxWidth: 380,
        }}>
          Make YouTube Shorts with tracks from our campaigns and build up earnings with every view.
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

        {/* Subtle new-user nudge */}
        <div style={{
          marginTop: 48,
          paddingTop: 28,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 12 }}>
            New here?
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#F0B429',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(240,180,41,0.35)',
              borderRadius: 8,
              padding: '9px 16px',
              background: 'rgba(240,180,41,0.07)',
              transition: 'background 0.15s ease',
            }}
          >
            Create a free account →
          </Link>
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
          maxWidth: 420,
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
          }}>Welcome back</h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
            Sign in to your PierreMusic account
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
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 7,
                letterSpacing: '0.2px',
              }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                style={{
                  ...inputBase,
                  border: emailFocus
                    ? '2px solid #F0B429'
                    : '1px solid #D1D5DB',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 7,
                letterSpacing: '0.2px',
              }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                required
                style={{
                  ...inputBase,
                  border: passFocus
                    ? '2px solid #F0B429'
                    : '1px solid #D1D5DB',
                }}
              />
            </div>

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
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#6B7280' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
