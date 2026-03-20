import { useEffect, useState } from 'react'
import { getVideoStats } from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

function StatCard({ icon, label, value }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 200px',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '28px',
        border: '1px solid #E5E7EB',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>{icon}</div>
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

const COLORS = ['#F0B429','#D97706','#F59E0B','#B45309','#FCD34D','#F0B429','#D97706','#F59E0B','#B45309','#FCD34D']

export default function StatsPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVideoStats().then(data => {
      setVideos(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#F8F9FA' }}>
      <div style={{ color: '#D97706', fontSize: 16, fontWeight: 600 }}>Loading statistics...</div>
    </div>
  )

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0)
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0)
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0)

  const top10 = [...videos]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(v => ({
      name: v.videoId ? v.videoId.slice(0, 10) + (v.videoId.length > 10 ? '…' : '') : '—',
      views: v.views || 0,
      videoId: v.videoId,
    }))

  return (
    <div style={{ padding: '40px 48px 60px', background: '#F8F9FA', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>Statistics</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>Track performance across all Shorts using your sound</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
        <StatCard icon="🎵" label="Total Videos" value={videos.length} />
        <StatCard icon="👁️" label="Total Views" value={totalViews} />
        <StatCard icon="👍" label="Total Likes" value={totalLikes} />
        <StatCard icon="💬" label="Total Comments" value={totalComments} />
      </div>

      {/* Bar chart */}
      {top10.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          padding: '28px 28px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: 36,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
            Top 10 Videos by Views
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={top10} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
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
                  background: '#111827',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  color: '#F9FAFB',
                  fontSize: 13,
                }}
                formatter={v => [v.toLocaleString(), 'Views']}
              />
              <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                {top10.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>All Videos</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Video', 'Link', 'Creator', 'Views', 'Likes', 'Comments', 'Date'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '12px 20px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6B7280',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.map((v, idx) => (
                <tr key={v.videoId || idx}
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
                      style={{ color: '#D97706', fontSize: 13, fontWeight: 500 }}
                    >
                      {v.videoId || 'link'}
                    </a>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151', fontWeight: 500 }}>{v.creator}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#374151' }}>{(v.views || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>{(v.likes || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>{(v.comments || 0).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{v.snapshotDate}</td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                    No video statistics yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
