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
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)',
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
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        🎬
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 2 }}>
          {channel.channelName || 'Unknown Channel'}
        </div>
        {channel.channelHandle && (
          <div style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 600, marginBottom: 4 }}>
            {channel.channelHandle.startsWith('@') ? channel.channelHandle : `@${channel.channelHandle}`}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, fontFamily: 'monospace' }}>
          ID: {channel.channelId || channel.youtubeChannelId || '—'}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
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
            background: removing ? '#fef2f2' : '#fef2f2',
            color: removing ? '#fca5a5' : '#dc2626',
            border: '1.5px solid #fecaca',
            borderRadius: 8,
            cursor: removing ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!removing) { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#dc2626' } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = removing ? '#fca5a5' : '#dc2626'; e.currentTarget.style.borderColor = '#fecaca' }}
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
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>My Channels</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Link your YouTube channels to automatically submit your Shorts for review
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
        <div style={{ fontSize: 14, color: '#0369a1', lineHeight: 1.7, margin: 0 }}>
          <strong>How it works:</strong> Add your channel and we'll automatically fetch your Shorts for review.
          Approved Shorts count towards your earnings.
          <span style={{ display: 'block', marginTop: 6, color: '#0ea5e9', fontSize: 13 }}>
            Review may take a few days. Payouts happen approximately every 2 months — the first one may take longer.
          </span>
        </div>
      </div>

      {/* Add channel form */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '28px 32px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        marginBottom: 32,
        maxWidth: 680,
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Add a Channel</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          Enter your YouTube channel URL or handle (e.g. <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>https://youtube.com/@yourchannel</code> or <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>@yourchannel</code>)
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
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: inputFocus ? '2px solid #0ea5e9' : '1.5px solid #e2e8f0',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                transition: 'border 0.15s ease',
              }}
            />
            <button
              type="submit"
              disabled={adding || !channelInput.trim()}
              style={{
                padding: '10px 24px',
                background: adding || !channelInput.trim()
                  ? '#7dd3fc'
                  : 'linear-gradient(135deg, #0ea5e9, #0891b2)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: adding || !channelInput.trim() ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: adding || !channelInput.trim() ? 'none' : '0 2px 10px rgba(14,165,233,0.3)',
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
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: 14,
            }}>
              {addError}
            </div>
          )}
        </form>
      </div>

      {/* Channel list */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          Linked Channels
          {!loading && (
            <span style={{
              marginLeft: 10,
              background: '#f1f5f9',
              color: '#64748b',
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
            <div style={{ color: '#0ea5e9', fontSize: 15, fontWeight: 600 }}>Loading channels...</div>
          </div>
        ) : channels.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '60px 32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              No channels linked yet
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
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
