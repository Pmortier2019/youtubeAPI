import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useState } from 'react'
import {
  Search, BarChart2, Music, Megaphone, Users, DollarSign, CreditCard,
  Video, UserCog, Landmark, TrendingUp, Play, Rocket, PiggyBank, Wallet,
  LogOut, ChevronRight
} from 'lucide-react'

const ADMIN_LINKS = [
  { to: '/admin/review', label: 'Review', Icon: Search },
  { to: '/admin/stats', label: 'Statistics', Icon: BarChart2 },
  { to: '/admin/sounds', label: 'Sound Library', Icon: Music },
  { to: '/admin/campaigns', label: 'Campaigns', Icon: Megaphone },
  { to: '/admin/participations', label: 'Participations', Icon: Users },
  { to: '/admin/payout', label: 'Payouts', Icon: DollarSign },
  { to: '/admin/payouts', label: 'Payout Requests', Icon: CreditCard },
  { to: '/admin/channels', label: 'Channels', Icon: Video },
  { to: '/admin/users', label: 'Users', Icon: UserCog },
  { to: '/admin/payment-methods', label: 'Payment Methods', Icon: Landmark },
]

const CREATOR_LINKS = [
  { to: '/me/stats', label: 'My Stats', Icon: TrendingUp },
  { to: '/creator/channels', label: 'My Channels', Icon: Video },
  { to: '/creator/shorts', label: 'My Shorts', Icon: Play },
  { to: '/sounds', label: 'Sound Library', Icon: Music },
  { to: '/campaigns', label: 'Campaigns', Icon: Rocket },
  { to: '/me/earnings', label: 'Earnings', Icon: PiggyBank },
  { to: '/me/payout', label: 'My Payout', Icon: Wallet },
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
        width: 260,
        height: '100vh',
        background: '#070E1A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}>

        {/* Brand */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #F0B429, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 2px 12px rgba(240,180,41,0.35)',
              flexShrink: 0,
              color: '#0B1120',
              fontWeight: 900,
            }}>♪</div>
            <div>
              <div style={{
                color: '#F9FAFB',
                fontWeight: 700,
                fontSize: 20,
                lineHeight: 1.2,
                letterSpacing: '-0.3px',
              }}>PierreMusic</div>
              <div style={{
                color: '#4B5563',
                fontSize: 11,
                marginTop: 1,
                letterSpacing: '0.3px',
              }}>Creator Platform</div>
            </div>
          </div>
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(240,180,41,0.5), rgba(240,180,41,0.05))',
            marginBottom: 0,
          }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <div style={{
            padding: '16px 20px 8px',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '1.2px',
            color: '#374151',
            textTransform: 'uppercase',
          }}>Navigation</div>

          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 20px',
                color: isActive ? '#F0B429' : '#6B7280',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                background: isActive ? 'rgba(240,180,41,0.10)' : 'transparent',
                borderLeft: isActive ? '3px solid #F0B429' : '3px solid transparent',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                textDecoration: 'none',
              })}
              onMouseEnter={e => {
                const el = e.currentTarget
                if (!el.getAttribute('data-active')) {
                  el.style.color = '#9CA3AF'
                  el.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                if (!el.getAttribute('data-active')) {
                  el.style.color = ''
                  el.style.background = ''
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? '#F0B429' : '#4B5563',
                      flexShrink: 0,
                      transition: 'color 0.15s ease',
                    }}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #F0B429, #D97706)',
              color: '#0B1120',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1px',
              padding: '3px 10px',
              borderRadius: 999,
              textTransform: 'uppercase',
            }}>{role}</span>
          </div>
          <button
            onClick={logout}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: logoutHover ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
              color: logoutHover ? '#D1D5DB' : '#9CA3AF',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 260,
        flex: 1,
        background: '#0B1120',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
