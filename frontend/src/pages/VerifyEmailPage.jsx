import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { verifyEmail } from '../api'
import { useAuth } from '../AuthContext'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token found in the link.')
      return
    }

    verifyEmail(token)
      .then(res => {
        saveToken(res.token)
        setStatus('success')
        setTimeout(() => navigate('/me/stats'), 2000)
      })
      .catch(err => {
        setStatus('error')
        setErrorMsg(err.message || 'Invalid or expired verification link.')
      })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>

        {status === 'verifying' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Verifying your email…</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Email verified!</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Redirecting you to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Verification failed</h2>
            <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 24 }}>{errorMsg}</p>
            <Link to="/register" style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 14 }}>
              Back to register
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
