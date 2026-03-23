import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useState, useEffect } from 'react'
import {
  Search, BarChart2, Music, Megaphone, Users, DollarSign, CreditCard,
  Video, UserCog, Landmark, TrendingUp, Play, Rocket, PiggyBank, Wallet,
  LogOut, Menu, X
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

const SIDEBAR_WIDTH = 260

function NavItem({ to, label, Icon }) {
  const [hovered, setHovered] = useState(false)
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '10px 20px',
        color: isActive ? '#F0B429' : (hovered ? '#FFFFFF' : '#F1F5F9'),
        fontWeight: isActive ? 600 : 400,
        fontSize: 14,
        background: isActive ? 'rgba(240,180,41,0.10)' : (hovered ? 'rgba(255,255,255,0.06)' : 'transparent'),
        borderLeft: isActive ? '3px solid #F0B429' : '3px solid transparent',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            style={{
              color: isActive ? '#F0B429' : (hovered ? '#F1F5F9' : '#CBD5E1'),
              flexShrink: 0,
              transition: 'color 0.15s ease',
            }}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { role, logout } = useAuth()
  const [logoutHover, setLogoutHover] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()
  const links = role === 'ADMIN' ? ADMIN_LINKS : CREATOR_LINKS

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  const sidebarVisible = !isMobile || sidebarOpen

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        height: '100vh',
        background: '#070E1A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transform: sidebarVisible ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
        transition: 'transform 0.25s ease',
      }}>

        {/* Brand */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Music size={26} color="#F0B429" strokeWidth={2} />
            <div style={{ flex: 1 }}>
              <div style={{
                color: '#F9FAFB',
                fontWeight: 700,
                fontSize: 18,
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
            {/* Close button — mobile only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            )}
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
            color: '#94A3B8',
            textTransform: 'uppercase',
          }}>Navigation</div>

          {links.map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} />
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
          <a
            href="https://discord.gg/tJMd7znS"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(88,101,242,0.15)',
              color: '#A5B4FC',
              border: '1px solid rgba(88,101,242,0.30)',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 10,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.28)'; e.currentTarget.style.color = '#C7D2FE' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.15)'; e.currentTarget.style.color = '#A5B4FC' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join Discord
          </a>
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

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: '#070E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          zIndex: 98,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F1F5F9',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 8,
            }}
          >
            <Menu size={22} />
          </button>
          <Music size={20} color="#F0B429" strokeWidth={2} />
          <span style={{
            color: '#F9FAFB',
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '-0.3px',
          }}>PierreMusic</span>
        </div>
      )}

      {/* Main content */}
      <main style={{
        marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
        marginTop: isMobile ? 56 : 0,
        flex: 1,
        background: '#F8F9FA',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
