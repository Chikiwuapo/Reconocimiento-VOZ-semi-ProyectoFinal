// Auth service to communicate with Django backend
// Uses Vite dev proxy configured for /api and we extend fetch to hit /register/ via proxy as well

export type PositionData = {
  x?: number
  y?: number
  scale?: number
  roll?: number
  pitch?: number
  yaw?: number
  dist?: number
}

export async function loginFacial(params: { email: string; facialFrame: string; position: PositionData }) {
  const res = await fetch('/api/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      facial_frame: params.facialFrame,
      position_data: params.position,
    }),
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Login failed (${res.status})`)
  }
  return data as { ok: true; redirect?: string }
}

// Registration must POST a form to the Django view at /register/ which requires CSRF.
// Strategy: first perform a GET to /register/ to receive the csrftoken cookie, then submit the form.
export type RegisterPayload = {
  nombres: string
  apellidos: string
  email: string
  dni: string
  // Either single capture (compat) or preferred multi-samples JSON
  facial_frame?: string
  position_data?: PositionData
  samples?: { frames: string[]; positions: PositionData[] }
}

export async function registerUser(payload: RegisterPayload) {
  // Step 1: fetch the page to set csrftoken cookie
  await fetch('/register/', { method: 'GET', credentials: 'include' })
  const csrftoken = getCookie('csrftoken')

  const form = new FormData()
  form.append('nombres', payload.nombres)
  form.append('apellidos', payload.apellidos)
  form.append('email', payload.email)
  form.append('dni', payload.dni)
  if (payload.samples) {
    form.append('samples', JSON.stringify(payload.samples))
  } else if (payload.facial_frame && payload.position_data) {
    form.append('facial_frame', payload.facial_frame)
    form.append('position_data', JSON.stringify(payload.position_data))
  }

  const res = await fetch('/register/', {
    method: 'POST',
    body: form,
    credentials: 'include',
    headers: csrftoken ? { 'X-CSRFToken': csrftoken } : undefined,
  })

  // Django redirects to /login on success; treat 200 with HTML as possibly validation error
  if (res.redirected || res.url.endsWith('/login/')) {
    return { ok: true }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Registration failed (${res.status})`)
  }
  return { ok: true }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift()
  return undefined
}
