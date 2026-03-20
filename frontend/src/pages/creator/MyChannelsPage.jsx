import { useState, useEffect } from 'react'
import { getMyChannels, addMyChannel, deleteMyChannel } from '../../api'

function ChannelCard({ channel, onRemove }) {
  const [removing, setRemoving] = useState(false)
  const [hover, setHover] = useState(false)

  async function handleRemove() {
    if (!window.confirm(`Remove channel "${channel.channelName}"? This cannot be undone.`)) return
    setRemoving(true)
    try {
      await deleteMyChannel(channel.id)
      onRemove(channel.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setRemoving(false)
    }
  }

  const addedDate = channel.createdAt
    ? new Date(channel.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#141E2E',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 18,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #F0B429 0%, #D97706 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(240,180,41,0.30)',
      }}>
        🎬
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#F9FAFB', marginBottom: 2 }}>
          {channel.channelName || 'Unknown Channel'}
        </div>
        {channel.channelHandle && (
          <div style={{ fontSize: 14, color: '#F0B429', fontWeight: 600, marginBottom: 4 }}>
            {channel.channelHandle.startsWith('@') ? channel.channelHandle : `@${channel.channelHandle}`}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4, fontFamily: 'monospace' }}>
          ID: {channel.channelId || channel.youtubeChannelId || '—'}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>
          Added: {addedDate}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={handleRemove}
          disabled={removing}
          style={{
            padding: '8px 14px',
            background: removing ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.10)',
            color: removing ? 'rgba(239,68,68,0.5)' : '#EF4444',
            border: '1.5px solid rgba(239,68,68,0.30)',
            borderRadius: 8,
            cursor: removing ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!removing) { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#EF4444' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = removing ? 'rgba(239,68,68,0.5)' : '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.30)' }}
        >
          {removing ? 'Removing...' : '✕ Remove'}
        </button>
      </div>
    </div>
  )
}

export default function MyChannelsPage() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [channelInput, setChannelInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState(null)
  const [inputFocus, setInputFocus] = useState(false)

  async function loadChannels() {
    try {
      const data = await getMyChannels()
      setChannels(Array.isArray(data) ? data : (data?.channels ?? []))
    } catch (err) {
      console.error('Failed to load channels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChannels()
  }, [])

  async function handleAddChannel(e) {
    e.preventDefault()
    if (!channelInput.trim()) return
    setAddError(null)
    setAdding(true)
    try {
      await addMyChannel(channelInput.trim())
      setChannelInput('')
      await loadChannels()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  function handleRemoved(id) {
    setChannels(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ padding: '40px 48px 60px', background: '#0B1120', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>My Channels</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>
          Link your YouTube channels to automatically submit your Shorts for review
        </p>
      </div>

      {/* Info banner — dark with gold border */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2540, #141E2E)',
        border: '1px solid rgba(240,180,41,0.20)',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: '#F9FAFB' }}>How it works:</strong> Add your channel and we'll automatically fetch your Shorts for review.
          Approved Shorts count towards your earnings.
          <span style={{ display: 'block', marginTop: 6, color: '#F0B429', fontSize: 13 }}>
            Review may take a few days. Payouts happen approximately every 2 months — the first one may take longer.
          </span>
        </div>
      </div>

      {/* Add channel form */}
      <div style={{
        background: '#141E2E',
        borderRadius: 16,
        padding: '28px 32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        marginBottom: 32,
        maxWidth: 680,
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F9FAFB', marginBottom: 6 }}>Add a Channel</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
          Enter your YouTube channel URL or handle (e.g.{' '}
          <code style={{ background: 'rgba(255,255,255,0.06)', color: '#F0B429', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
            https://youtube.com/@yourchannel
          </code>{' '}
          or{' '}
          <code style={{ background: 'rgba(255,255,255,0.06)', color: '#F0B429', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>
            @yourchannel
          </code>)
        </p>

        <form onSubmit={handleAddChannel}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={channelInput}
              onChange={e => setChannelInput(e.target.value)}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
              placeholder="https://youtube.com/@yourchannel or @yourchannel"
              disabled={adding}
              style={{
                flex: '1 1 300px',
                padding: '12px 16px',
                fontSize: 14,
                borderRadius: 10,
                border: inputFocus ? '2px solid #F0B429' : '1px solid rgba(255,255,255,0.10)',
                outline: 'none',
                background: 'rgba(255,255,255,0.04)',
                color: '#F9FAFB',
                transition: 'border 0.15s ease',
              }}
            />
            <button
              type="submit"
              disabled={adding || !channelInput.trim()}
              style={{
                padding: '10px 24px',
                background: adding || !channelInput.trim()
                  ? 'rgba(240,180,41,0.4)'
                  : 'linear-gradient(135deg, #F0B429, #D97706)',
                color: '#0B1120',
                border: 'none',
                borderRadius: 10,
                cursor: adding || !channelInput.trim() ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: adding || !channelInput.trim() ? 'none' : '0 2px 12px rgba(240,180,41,0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {adding ? 'Adding...' : '+ Add Channel'}
            </button>
          </div>

          {addError && (
            <div style={{
              marginTop: 12,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#EF4444',
              fontSize: 14,
            }}>
              {addError}
            </div>
          )}
        </form>
      </div>

      {/* Channel list */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F9FAFB', marginBottom: 16 }}>
          Linked Channels
          {!loading && (
            <span style={{
              marginLeft: 10,
              background: 'rgba(240,180,41,0.15)',
              color: '#F0B429',
              border: '1px solid rgba(240,180,41,0.30)',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
            }}>
              {channels.length}
            </span>
          )}
        </h2>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <div style={{ color: '#F0B429', fontSize: 15, fontWeight: 600 }}>Loading channels...</div>
          </div>
        ) : channels.length === 0 ? (
          <div style={{
            background: '#141E2E',
            borderRadius: 16,
            padding: '60px 32px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', marginBottom: 8 }}>
              No channels linked yet
            </div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>
              Add your YouTube channel above to get started.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {channels.map(channel => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onRemove={handleRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
