import { useEffect, useState } from 'react'
import { getMyStats } from '../../api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

function HowItWorks({ steps }) {
  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderLeft: '4px solid #F0B429',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 32,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
        How it works
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#F0B429', color: '#111827',
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>{i + 1}</div>
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.55 }}>
              <strong style={{ color: '#111827' }}>{step.title}</strong>
              {step.desc && <span style={{ color: '#6B7280' }}> — {step.desc}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 180px',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #E5E7EB',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FDE68A',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 9px',
          borderRadius: 999,
          letterSpacing: 0.5,
        }}>TOTAL</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#D97706', letterSpacing: '-1px', marginBottom: 4 }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading your stats...</div>
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
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 6 }}>My Stats</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Performance of your Shorts using our sound</p>
      </div>

      <HowItWorks steps={[
        { title: 'Only approved Shorts are shown here', desc: 'Stats are only tracked for Shorts that have passed review and use the correct sound.' },
        { title: 'Stats update once per day', desc: 'Views, likes, and comments are fetched from YouTube every day at night.' },
        { title: 'Use this to track your growth', desc: 'The chart shows how your views have grown over time across all your approved Shorts.' },
      ]} />

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
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '28px 28px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
            View Growth Over Time
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}
              />
              <Tooltip
                contentStyle={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  color: '#111827',
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
                fill="rgba(240,180,41,0.08)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {videos.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No stats yet</h3>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Link your channel via "My Channels" to get started. Stats will appear once your Shorts are approved.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Your Videos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
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
                    style={{ borderTop: '1px solid #E5E7EB' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
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
                        style={{ color: '#D97706', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                      >
                        {v.videoId || 'link'}
                      </a>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#D97706' }}>
                      {(v.views || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#6B7280' }}>
                      {(v.likes || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#6B7280' }}>
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
