import { useEffect, useState } from 'react'
import { getUsers, updateUserRole, deleteUser } from '../../api'

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: isAdmin ? '#ede9fe' : '#f0f9ff',
      color: isAdmin ? '#7c3aed' : '#0369a1',
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#0ea5e9', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Users</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>{users.length} registered accounts</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Name', 'Email', 'Role', 'Verified', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left',
                  padding: '12px 20px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr
                key={u.id}
                style={{ borderTop: '1px solid #f1f5f9' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                  {u.creatorName ?? '—'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#475569' }}>
                  {u.email}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <RoleBadge role={u.role} />
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14 }}>
                  {u.emailVerified
                    ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Verified</span>
                    : <span style={{ color: '#f59e0b', fontWeight: 600 }}>⏳ Pending</span>}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: '5px 10px',
                        fontSize: 13,
                        borderRadius: 7,
                        border: '1.5px solid #e2e8f0',
                        background: '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="CREATOR">CREATOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      style={{
                        padding: '5px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                      }}
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
