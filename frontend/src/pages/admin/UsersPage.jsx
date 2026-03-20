import { useEffect, useState } from 'react'
import { getUsers, updateUserRole, deleteUser } from '../../api'

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: isAdmin ? 'rgba(240,180,41,0.15)' : 'rgba(59,130,246,0.15)',
      color: isAdmin ? '#F0B429' : '#60A5FA',
      border: isAdmin ? '1px solid rgba(240,180,41,0.30)' : '1px solid rgba(59,130,246,0.30)',
    }}>{role}</span>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers().then(data => { setUsers(data); setLoading(false) })
  }, [])

  async function handleRoleChange(id, role) {
    try {
      const updated = await updateUserRole(id, role)
      setUsers(u => u.map(x => x.id === id ? updated : x))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  async function handleDelete(id, email) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return
    try {
      await deleteUser(id)
      setUsers(u => u.filter(x => x.id !== id))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB' }}>Users</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{users.length} registered accounts</p>
      </div>

      <div style={{
        background: '#141E2E',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Name', 'Email', 'Role', 'Verified', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left',
                  padding: '12px 20px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#6B7280',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#F9FAFB', fontSize: 14 }}>
                  {u.creatorName ?? '—'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#D1D5DB' }}>
                  {u.email}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <RoleBadge role={u.role} />
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14 }}>
                  {u.emailVerified
                    ? <span style={{ color: '#10B981', fontWeight: 600 }}>✓ Verified</span>
                    : <span style={{ color: '#F0B429', fontWeight: 600 }}>⏳ Pending</span>}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#F9FAFB',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="CREATOR" style={{ background: '#141E2E' }}>CREATOR</option>
                      <option value="ADMIN" style={{ background: '#141E2E' }}>ADMIN</option>
                    </select>
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(239,68,68,0.15)',
                        color: '#EF4444',
                        border: '1px solid rgba(239,68,68,0.30)',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#EF4444' }}
                    >Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
