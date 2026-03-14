import { useEffect, useState } from 'react'
import { getMyStats } from '../../api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function StatCard({ icon, label, value, color }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 180px',
        background: '#fff',
        borderRadius: 12,
        padding: '24px 28px',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{
          background: color + '18',
          color: color,
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 999,
          letterSpacing: 0.5,
        }}>TOTAL</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function MyStatsPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyStats().then(data => {
      setVideos(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#0ea5e9', fontSize: 16, fontWeight: 600 }}>Loading your stats...</div>
    </div>
  )

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0)
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0)
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0)

  // Build line chart data: group by snapshotDate, sum views
  const byDate = {}
  videos.forEach(v => {
    const d = v.snapshotDate || 'unknown'
    byDate[d] = (byDate[d] || 0) + (v.views || 0)
  })
  const lineData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }))

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>My Stats</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Performance of your Shorts using our sound</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
        <StatCard icon="🎵" label="My Videos" value={videos.length} color="#0ea5e9" />
        <StatCard icon="👁️" label="Total Views" value={totalViews} color="#0ea5e9" />
        <StatCard icon="👍" label="Total Likes" value={totalLikes} color="#22c55e" />
        <StatCard icon="💬" label="Total Comments" value={totalComments} color="#f59e0b" />
      </div>

      {/* Line chart */}
      {lineData.length > 1 && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 28px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
            📈 View Growth Over Time
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                }}
                formatter={v => [v.toLocaleString(), 'Views']}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ fill: '#0ea5e9', r: 3 }}
                activeDot={{ r: 5, fill: '#0891b2' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {videos.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '80px 40px',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No stats yet</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Link your channel via "My Channels" to get started. Stats will appear once your Shorts are approved.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Your Videos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Thumbnail', 'Video', 'Views', 'Likes', 'Comments', 'Date'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '12px 20px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {videos.map((v, idx) => (
                  <tr
                    key={v.videoId || idx}
                    style={{ borderTop: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      {v.videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                          alt=""
                          style={{ width: 56, height: 32, borderRadius: 4, objectFit: 'cover', display: 'block' }}
                        />
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 500 }}
                      >
                        {v.videoId || 'link'}
                      </a>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {(v.views || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>
                      {(v.likes || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>
                      {(v.comments || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#94a3b8' }}>
                      {v.snapshotDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
