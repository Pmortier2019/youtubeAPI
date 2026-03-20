import { useEffect, useState } from 'react'
import { getCampaigns, createCampaign, updateCampaignStatus, getSounds } from '../../api'

const STATUS_COLORS = {
  ACTIVE: { bg: '#22c55e', light: '#f0fdf4', text: '#15803d' },
  PAUSED: { bg: '#f59e0b', light: '#fffbeb', text: '#a16207' },
  COMPLETED: { bg: '#94a3b8', light: '#FDFAF5', text: '#475569' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.COMPLETED
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.light,
      color: s.text,
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
      border: `1px solid ${s.bg}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.bg, display: 'inline-block' }} />
      {status}
    </span>
  )
}

function BudgetBar({ spent, total }) {
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
        <span>€{Number(spent).toFixed(2)} spent</span>
        <span>€{Number(total).toFixed(2)}</span>
      </div>
      <div style={{ background: '#EAE4D9', borderRadius: 4, height: 6 }}>
        <div style={{
          background: 'linear-gradient(90deg, #C9A84C, #A07830)',
          borderRadius: 4,
          height: 6,
          width: `${pct}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

const emptyForm = {
  title: '',
  description: '',
  soundVideoId: '',
  soundUrl: '',
  rpmRate: '',
  totalBudget: '',
  minDurationSeconds: 35,
  maxDurationSeconds: 60,
  minVolumePercent: 15,
  startDate: '',
  endDate: '',
}

function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151' }}>
      {label}
      {children}
    </label>
  )
}

const inputStyle = {
  padding: '9px 12px',
  fontSize: 14,
  borderRadius: 8,
  border: '1.5px solid #EAE4D9',
  outline: 'none',
  background: '#FDFAF5',
  color: '#1A1A1A',
  marginTop: 2,
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [sounds, setSounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    Promise.all([getCampaigns(), getSounds()]).then(([cData, sData]) => {
      setCampaigns(cData)
      setSounds(sData)
      setLoading(false)
    })
  }, [])

  function handleField(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const body = {
        ...form,
        rpmRate: parseFloat(form.rpmRate),
        totalBudget: parseFloat(form.totalBudget),
        minDurationSeconds: parseInt(form.minDurationSeconds),
        maxDurationSeconds: parseInt(form.maxDurationSeconds),
        minVolumePercent: parseInt(form.minVolumePercent),
        endDate: form.endDate || null,
      }
      const created = await createCampaign(body)
      setCampaigns(c => [created, ...c])
      setShowForm(false)
      setForm(emptyForm)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const updated = await updateCampaignStatus(id, status)
      setCampaigns(c => c.map(x => x.id === id ? { ...x, status: updated.status ?? status } : x))
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: '#C9A84C', fontSize: 16, fontWeight: 600 }}>Loading campaigns...</div>
    </div>
  )

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A', marginBottom: 6, fontFamily: 'Georgia, "Times New Roman", serif' }}>Campaigns</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Manage your sound campaigns and track spending</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setFormError(null) }}
          style={{
            padding: '11px 22px',
            background: showForm ? '#fff' : 'linear-gradient(135deg, #C9A84C, #A07830)',
            color: showForm ? '#374151' : '#fff',
            border: showForm ? '1.5px solid #EAE4D9' : 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: showForm ? 'none' : '0 2px 10px rgba(201,168,76,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Campaign'}
        </button>
      </div>

      {/* Create form — slide-down panel */}
      {showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '28px 32px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          marginBottom: 32,
          border: '1px solid #EAE4D9',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 24, fontFamily: 'Georgia, "Times New Roman", serif' }}>New Campaign</h2>
          <form onSubmit={handleCreate}>
            {/* Sound picker from library */}
            {sounds.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Pick from library <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sounds.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, soundVideoId: s.soundVideoId, soundUrl: s.soundUrl }))}
                      style={{
                        padding: '6px 14px',
                        background: form.soundVideoId === s.soundVideoId ? 'linear-gradient(135deg, #C9A84C, #A07830)' : '#FDF8EE',
                        color: form.soundVideoId === s.soundVideoId ? '#fff' : '#A07830',
                        border: form.soundVideoId === s.soundVideoId ? 'none' : '1px solid #E8D9A0',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      🎵 {s.title}{s.artistName ? ` — ${s.artistName}` : ''}
                    </button>
                  ))}
                </div>
                {form.soundVideoId && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#A07830' }}>
                    Selected: <code style={{ background: '#FDF8EE', padding: '2px 6px', borderRadius: 4 }}>{form.soundVideoId}</code>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, soundVideoId: '', soundUrl: '' }))}
                      style={{ marginLeft: 8, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
                    >✕ clear</button>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #EAE4D9', marginTop: 16, paddingTop: 16, fontSize: 12, color: '#94a3b8' }}>
                  Or fill in manually:
                </div>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 20,
            }}>
              <FormField label="Title">
                <input style={inputStyle} name="title" value={form.title} onChange={handleField} required />
              </FormField>
              <FormField label="Description">
                <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }} name="description" value={form.description} onChange={handleField} />
              </FormField>
              <FormField label="YouTube Video ID">
                <input style={inputStyle} name="soundVideoId" placeholder="YouTube video ID" value={form.soundVideoId} onChange={handleField} required />
              </FormField>
              <FormField label="Sound URL">
                <input style={inputStyle} name="soundUrl" placeholder="YouTube URL" value={form.soundUrl} onChange={handleField} required />
              </FormField>
              <FormField label="RPM Rate (€)">
                <input style={inputStyle} name="rpmRate" type="number" step="0.0001" min="0" value={form.rpmRate} onChange={handleField} required />
              </FormField>
              <FormField label="Total Budget (€)">
                <input style={inputStyle} name="totalBudget" type="number" step="0.01" min="0" value={form.totalBudget} onChange={handleField} required />
              </FormField>
              <FormField label="Min Duration (s)">
                <input style={inputStyle} name="minDurationSeconds" type="number" min="0" value={form.minDurationSeconds} onChange={handleField} required />
              </FormField>
              <FormField label="Max Duration (s)">
                <input style={inputStyle} name="maxDurationSeconds" type="number" min="0" value={form.maxDurationSeconds} onChange={handleField} required />
              </FormField>
              <FormField label="Min Volume %">
                <input style={inputStyle} name="minVolumePercent" type="number" min="0" max="100" value={form.minVolumePercent} onChange={handleField} required />
              </FormField>
              <FormField label="Start Date">
                <input style={inputStyle} name="startDate" type="date" value={form.startDate} onChange={handleField} required />
              </FormField>
              <FormField label="End Date (optional)">
                <input style={inputStyle} name="endDate" type="date" value={form.endDate} onChange={handleField} />
              </FormField>
            </div>
            {formError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#B91C1C',
                fontSize: 14,
                marginBottom: 16,
              }}>{formError}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  background: saving ? '#D4AF37' : 'linear-gradient(135deg, #C9A84C, #A07830)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(201,168,76,0.35)',
                }}
              >{saving ? 'Saving...' : 'Save Campaign'}</button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(null); setForm(emptyForm) }}
                style={{
                  padding: '10px 20px',
                  background: '#fff',
                  color: '#374151',
                  border: '1.5px solid #EAE4D9',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Campaign cards grid */}
      {campaigns.length === 0 && !showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #EAE4D9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎵</span>
          <p style={{ color: '#6B7280', fontSize: 16 }}>No campaigns yet. Create your first one!</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {campaigns.map(c => (
          <CampaignCard key={c.id} campaign={c} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  )
}

function CampaignCard({ campaign: c, onStatusChange }) {
  const [hover, setHover] = useState(false)
  const gradients = [
    'linear-gradient(135deg, #C9A84C 0%, #A07830 100%)',
    'linear-gradient(135deg, #A07830 0%, #C9A84C 100%)',
    'linear-gradient(135deg, #D4AF37 0%, #A07830 100%)',
    'linear-gradient(135deg, #B8962E 0%, #C9A84C 100%)',
  ]
  const grad = gradients[c.id % gradients.length] || gradients[0]

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #EAE4D9',
        boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Gradient header */}
      <div style={{
        background: grad,
        padding: '20px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>
            CAMPAIGN
          </div>
          <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0, lineHeight: 1.3, fontFamily: 'Georgia, "Times New Roman", serif' }}>{c.title}</h3>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        {c.description && (
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
            {c.description}
          </p>
        )}

        {/* RPM */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>RPM Rate</span>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#C9A84C',
          }}>€{Number(c.rpmRate).toFixed(4)}<span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/1K views</span></span>
        </div>

        {/* Budget progress */}
        <div style={{ marginBottom: 16 }}>
          <BudgetBar spent={c.spent ?? 0} total={c.totalBudget ?? 0} />
        </div>

        {/* Rules chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          <span style={{ background: '#FDF8EE', color: '#A07830', border: '1px solid #E8D9A0', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
            ⏱ {c.minDurationSeconds}–{c.maxDurationSeconds}s
          </span>
          <span style={{ background: '#FDF8EE', color: '#A07830', border: '1px solid #E8D9A0', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
            🔊 min {c.minVolumePercent}% vol
          </span>
          {c.soundUrl && (
            <a href={c.soundUrl} target="_blank" rel="noreferrer" style={{
              background: '#FDF8EE',
              color: '#A07830',
              border: '1px solid #E8D9A0',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
            }}>🎵 Sound ↗</a>
          )}
        </div>

        {/* Dates */}
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
          📅 {c.startDate ?? '—'}{c.endDate ? ` → ${c.endDate}` : ' (no end date)'}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #EAE4D9' }}>
        {c.status !== 'ACTIVE' && (
          <ActionBtn color="#22c55e" onClick={() => onStatusChange(c.id, 'ACTIVE')}>Activate</ActionBtn>
        )}
        {c.status !== 'PAUSED' && (
          <ActionBtn color="#f59e0b" onClick={() => onStatusChange(c.id, 'PAUSED')}>Pause</ActionBtn>
        )}
        {c.status !== 'COMPLETED' && (
          <ActionBtn color="#94a3b8" onClick={() => onStatusChange(c.id, 'COMPLETED')}>Complete</ActionBtn>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ color, onClick, children }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 14px',
        background: hover ? color : color + '18',
        color: hover ? '#fff' : color,
        border: `1px solid ${color}40`,
        borderRadius: 7,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
        transition: 'all 0.15s ease',
      }}
    >{children}</button>
  )
}
