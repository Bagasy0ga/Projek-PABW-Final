const DEFAULT_API_BASE_URL = 'http://localhost:3000'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function request(path, options = {}) {
  const token = localStorage.getItem('pabwToken')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null
      ? payload.message || payload.error || 'Request ke server gagal.'
      : 'Request ke server gagal.'

    const error = new Error(message)
    error.payload = payload
    throw error
  }

  return payload
}

export function apiGet(path, options = {}) {
  return request(path, {
    method: 'GET',
    ...options
  })
}

export function apiPost(path, body = {}, options = {}) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options
  })
}

export function apiPut(path, body = {}, options = {}) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options
  })
}

export function apiDelete(path, options = {}) {
  return request(path, {
    method: 'DELETE',
    ...options
  })
}