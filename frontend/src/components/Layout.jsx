import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useState } from 'react'

const ADMIN_LINKS = [
  { to: '/admin/review', label: 'Review', icon: '🔍' },
  { to: '/admin/stats', label: 'Statistics', icon: '📊' },
  { to: '/admin/sounds', label: 'Sound Library', icon: '🎶' },
  { to: '/admin/campaigns', label: 'Campaigns', icon: '🎵' },
  { to: '/admin/participations', label: 'Participations', icon: '👥' },
  { to: '/admin/payout', label: 'Payouts', icon: '💰' },
  { to: '/admin/payouts', label: 'Payout Requests', icon: '💳' },
  { to: '/admin/channels', label: 'Channels', icon: '🎬' },
  { to: '/admin/users', label: 'Users', icon: '👤' },
  { to: '/admin/payment-methods', label: 'Payment Methods', icon: '🏦' },
]

const CREATOR_LINKS = [
  { to: '/me/stats', label: 'My Stats', icon: '📊' },
  { to: '/creator/channels', label: 'My Channels', icon: '🎬' },
  { to: '/creator/shorts', label: 'My Shorts', icon: '🎬' },
  { to: '/sounds', label: 'Sound Library', icon: '🎵' },
  { to: '/campaigns', label: 'Campaigns', icon: '🚀' },
  { to: '/me/earnings', label: 'Earnings', icon: '💰' },
  { to: '/me/payout', label: 'My Payout', icon: '💳' },
]

export default function Layout({ children }) {
  const { role, logout } = useAuth()
  const [logoutHover, setLogoutHover] = useState(false)
  const links = role === 'ADMIN' ? ADMIN_LINKS : CREATOR_LINKS

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: '#1A2744',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
      }}>
        {/* Brand */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎵</span>
            <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px', fontFamily: 'Georgia, "Times New Roman", serif' }}>PierreMusic</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 24px',
                color: isActive ? '#C9A84C' : '#94A3B8',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                background: isActive ? 'rgba(201,168,76,0.10)' : 'transparent',
                borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              })}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #C9A84C, #A07830)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              padding: '2px 8px',
              borderRadius: 999,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>{role}</div>
          </div>
          <button
            onClick={logout}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{
              width: '100%',
              padding: '9px 0',
              background: logoutHover ? 'rgba(201,168,76,0.10)' : 'transparent',
              color: logoutHover ? '#C9A84C' : '#94A3B8',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            ← Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 240,
        flex: 1,
        background: '#F7F4EF',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
