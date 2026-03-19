const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || 'Something went wrong')
  }

  if (res.status === 204) return null
  return res.json()
}

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const register = (data) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const verifyEmail = (token) =>
  request(`/auth/verify?token=${encodeURIComponent(token)}`)

export const resendVerification = (email) =>
  request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })

// Admin — review shorts
export const getPendingShorts = () => request('/shorts/pending')
export const scrapeSound = (soundVideoId, creator) =>
  request('/shorts/scrape-sound', { method: 'POST', body: JSON.stringify({ soundVideoId, creator }) })
export const markSoundUsed = (id, used) =>
  request(`/shorts/${id}/sound-used`, { method: 'PATCH', body: JSON.stringify({ used }) })

// Admin — statistics
export const getVideoStats = () => request('/stats/videos')
export const getCreatorStats = () => request('/stats/creators')

// Admin — payout (monthly report, kept for backward compat)
export const getPayout = (year, month, pot) =>
  request(`/reports/payout?year=${year}&month=${month}&pot=${pot}`)

// Admin — pool payout
export async function previewPayout(pot) {
  return request(`/admin/payout/preview?pot=${pot}`)
}

export async function processPayout(pot) {
  return request('/admin/payout/process', {
    method: 'POST',
    body: JSON.stringify({ pot }),
  })
}

export async function getPayoutHistory() {
  return request('/admin/payout/history')
}

export async function markPayoutPaid(id) {
  return request(`/admin/payout/${id}/paid`, { method: 'PATCH' })
}

// Creator — own data
export const getMyStats = () => request('/me/stats')
export const getMyPayout = (year, month, pot) =>
  request(`/me/payout?year=${year}&month=${month}&pot=${pot}`)

export async function getMyShorts() {
  return request('/me/shorts')
}

export async function getMyPayouts() {
  return request('/me/payouts')
}

// Campaigns
export const getCampaigns = () => request('/campaigns')
export const createCampaign = (data) => request('/campaigns', { method: 'POST', body: JSON.stringify(data) })
export const updateCampaignStatus = (id, status) => request(`/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const getActiveCampaigns = () => request('/campaigns/active')
export const joinCampaign = (id, url) => request(`/campaigns/${id}/join`, { method: 'POST', body: JSON.stringify({ url }) })
export const getCampaignParticipations = (id) => request(`/campaigns/${id}/participations`)
export const updateParticipationStatus = (id, status) => request(`/participations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

// Channels
export const getMyParticipations = () => request('/me/participations')

export const getMyChannels = () => request('/me/channels')
export const addMyChannel = (channelInput) =>
  request('/me/channels', { method: 'POST', body: JSON.stringify({ channelInput }) })
export const deleteMyChannel = (id) => request(`/me/channels/${id}`, { method: 'DELETE' })
export const scrapeMyChannel = (id) => request(`/me/channels/${id}/scrape`, { method: 'POST' })

// Earnings & Payouts
export const getMyEarnings = () => request('/me/earnings')
export const requestPayout = (data) => request('/me/payout/request', { method: 'POST', body: JSON.stringify(data) })
export const getMyPaymentMethods = () => request('/me/payment-methods')
export const addPaymentMethod = (data) => request('/me/payment-methods', { method: 'POST', body: JSON.stringify(data) })
export const deletePaymentMethod = (id) => request(`/me/payment-methods/${id}`, { method: 'DELETE' })
export const getAllPayouts = () => request('/payouts')

// Sound Library
export const getSounds = () => request('/sounds')
export const getSoundPreview = (videoId) => request(`/sounds/preview?videoId=${encodeURIComponent(videoId)}`)
export const addSound = (data) => request('/sounds', { method: 'POST', body: JSON.stringify(data) })
export const deleteSound = (id) => request(`/sounds/${id}`, { method: 'DELETE' })
