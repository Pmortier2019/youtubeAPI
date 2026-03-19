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
  { to: '/admin/users', label: 'Users', icon: '👤' },
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
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
      }}>
        {/* Brand */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid #1e293b',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎵</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px' }}>PierreMusic</span>
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
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                background: isActive ? 'linear-gradient(90deg, #1e293b 0%, #1e2a45 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent',
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
          borderTop: '1px solid #1e293b',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{
              display: 'inline-block',
              background: role === 'ADMIN' ? 'linear-gradient(135deg, #0ea5e9, #0891b2)' : 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
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
              background: logoutHover ? '#1e293b' : 'transparent',
              color: logoutHover ? '#fff' : '#64748b',
              border: '1px solid #1e293b',
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
        background: '#f8fafc',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
