import { useEffect, useState } from 'react'
import { getMyStats } from '../../api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function StatCard({ icon, label, value }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 180px',
        background: '#141E2E',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{
          background: 'rgba(240,180,41,0.15)',
          color: '#F0B429',
          border: '1px solid rgba(240,180,41,0.30)',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 999,
          letterSpacing: 0.5,
        }}>TOTAL</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#F0B429', letterSpacing: '-1px', marginBottom: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{label}</div>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading your stats...</div>
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
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>My Stats</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Performance of your Shorts using our sound</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
        <StatCard icon="🎵" label="My Videos" value={videos.length} />
        <StatCard icon="👁️" label="Total Views" value={totalViews} />
        <StatCard icon="👍" label="Total Likes" value={totalLikes} />
        <StatCard icon="💬" label="Total Comments" value={totalComments} />
      </div>

      {/* Line chart */}
      {lineData.length > 1 && (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '28px 28px 20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', marginBottom: 24 }}>
            View Growth Over Time
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A2540',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#F9FAFB',
                  fontSize: 13,
                }}
                formatter={v => [v.toLocaleString(), 'Views']}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#F0B429"
                strokeWidth={2.5}
                dot={{ fill: '#F0B429', r: 3 }}
                activeDot={{ r: 5, fill: '#D97706' }}
                fill="rgba(240,180,41,0.1)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {videos.length === 0 ? (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>No stats yet</h3>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Link your channel via "My Channels" to get started. Stats will appear once your Shorts are approved.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB' }}>Your Videos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Thumbnail', 'Video', 'Views', 'Likes', 'Comments', 'Date'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left',
                      padding: '12px 20px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#6B7280',
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
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      {v.videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                          alt=""
                          style={{ width: 56, height: 32, borderRadius: 4, objectFit: 'cover', display: 'block' }}
                        />
                      ) : <span style={{ color: '#6B7280' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#F0B429', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                      >
                        {v.videoId || 'link'}
                      </a>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#F0B429' }}>
                      {(v.views || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#9CA3AF' }}>
                      {(v.likes || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#9CA3AF' }}>
                      {(v.comments || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
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
