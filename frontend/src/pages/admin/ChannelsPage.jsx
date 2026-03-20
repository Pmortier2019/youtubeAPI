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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Channels</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>All linked YouTube channels. Trigger a manual scrape per channel.</p>
      </div>

      {channels.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '80px 40px', textAlign: 'center',
          border: '1px solid #EAE4D9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <p style={{ fontSize: 16, color: '#6B7280' }}>No channels linked yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map(ch => (
            <div key={ch.id} style={{
              background: '#fff', borderRadius: 12, padding: '20px 24px',
              border: '1px solid #EAE4D9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>🎬</div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>
                  {ch.channelName || 'Unknown'}
                  {ch.channelHandle && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#C9A84C', fontWeight: 600 }}>
                      {ch.channelHandle.startsWith('@') ? ch.channelHandle : `@${ch.channelHandle}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  Creator: <strong>{ch.creatorName || ch.creatorEmail}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Last scraped: {ch.lastScrapedAt ? new Date(ch.lastScrapedAt).toLocaleString('nl-NL') : '—'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {results[ch.id] && (
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: results[ch.id].ok ? '#15803d' : '#B91C1C',
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
                    padding: '8px 18px',
                    background: scraping[ch.id] ? '#FDFAF5' : 'linear-gradient(135deg, #C9A84C, #A07830)',
                    color: scraping[ch.id] ? '#94a3b8' : '#fff',
                    border: scraping[ch.id] ? '1px solid #EAE4D9' : 'none',
                    borderRadius: 8,
                    cursor: scraping[ch.id] ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    boxShadow: scraping[ch.id] ? 'none' : '0 2px 10px rgba(201,168,76,0.35)',
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
