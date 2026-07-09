const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = data.detail || data.message || 'Request failed'
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }

  return data
}

export function triageAndExplain(payload) {
  return request('/api/triage-and-explain', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchNearbyHospitals(latitude, longitude) {
  return request('/api/nearby-hospitals', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  })
}

export const ACCRA_COORDS = { latitude: 5.6037, longitude: -0.1870 }
