import { useEffect, useState } from 'react'
import { getAllChannels, adminScrapeChannel } from '../../api'

export default function ChannelsPage() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState({})
  const [results, setResults] = useState({})

  useEffect(() => {
    getAllChannels().then(data => {
      setChannels(data)
      setLoading(false)
    })
  }, [])

  async function handleScrape(id) {
    setScraping(s => ({ ...s, [id]: true }))
    setResults(r => ({ ...r, [id]: null }))
    try {
      const res = await adminScrapeChannel(id)
      setResults(r => ({ ...r, [id]: { ok: true, count: res.newShortsAdded } }))
    } catch (err) {
      setResults(r => ({ ...r, [id]: { ok: false, msg: err.message } }))
    } finally {
      setScraping(s => ({ ...s, [id]: false }))
      getAllChannels().then(setChannels)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: '#0B1120' }}>
      <div style={{ color: '#F0B429', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB' }}>Channels</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>All linked YouTube channels. Trigger a manual scrape per channel.</p>
      </div>

      {channels.length === 0 ? (
        <div style={{
          background: '#141E2E',
          borderRadius: 16,
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(240,180,41,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 16px',
          }}>🎬</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>No channels yet</h3>
          <p style={{ fontSize: 14, color: '#6B7280' }}>No channels linked yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map(ch => (
            <div key={ch.id} style={{
              background: '#141E2E',
              borderRadius: 16,
              padding: '20px 24px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(240,180,41,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}>🎬</div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#F9FAFB' }}>
                  {ch.channelName || 'Unknown'}
                  {ch.channelHandle && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#F0B429', fontWeight: 600 }}>
                      {ch.channelHandle.startsWith('@') ? ch.channelHandle : `@${ch.channelHandle}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
                  Creator: <strong style={{ color: '#D1D5DB' }}>{ch.creatorName || ch.creatorEmail}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Last scraped: {ch.lastScrapedAt ? new Date(ch.lastScrapedAt).toLocaleString('nl-NL') : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {results[ch.id] && (
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: results[ch.id].ok ? '#10B981' : '#EF4444',
                  }}>
                    {results[ch.id].ok
                      ? `${results[ch.id].count} new shorts`
                      : results[ch.id].msg}
                  </span>
                )}
                <button
                  onClick={() => handleScrape(ch.id)}
                  disabled={scraping[ch.id]}
                  style={{
                    padding: '10px 20px',
                    background: scraping[ch.id]
                      ? 'rgba(255,255,255,0.06)'
                      : 'linear-gradient(135deg, #F0B429, #D97706)',
                    color: scraping[ch.id] ? '#6B7280' : '#0B1120',
                    border: scraping[ch.id] ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    borderRadius: 10,
                    cursor: scraping[ch.id] ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: scraping[ch.id] ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {scraping[ch.id] ? 'Scraping...' : 'Scrape now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
