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

export async function registerBasic(payload: { nombres: string; apellidos: string; email: string; dni: string }) {
  const res = await fetch('/api/register-basic/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `No se pudo guardar (${res.status})`)
  }
  return data as { ok: true; created?: boolean }
}

// Validate traditional credentials (email + DNI)
export async function validateUserTraditional(params: { email: string; dni: string }) {
  const res = await fetch('/api/validate-user/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email, dni: params.dni }),
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok) {
    const err: any = new Error(data?.error || 'Credenciales inválidas')
    err.status = res.status
    throw err
  }
  return data as { ok: true }
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

  // Django redirects to /login on success; any non-redirect HTML means failure
  if (res.redirected || res.url.endsWith('/login/')) {
    return { ok: true }
  }
  const text = await res.text().catch(() => '')
  // Heuristic: when embeddings fail, the view renders register.html with error messages.
  // We treat any non-redirect 200 as failure so the UI can inform the user correctly.
  const msg = 'No se pudo registrar tu rostro. Verifica iluminación, encuadre y vuelve a intentar.'
  if (!res.ok) {
    throw new Error(text || `${msg} (HTTP ${res.status})`)
  }
  throw new Error(msg)
}

// Voice registration function
export async function registerVoice(audioBlob: Blob) {
  try {
    // Get CSRF token
    const csrftoken = getCookie('csrftoken')
    
    // First, get or create a pending registration token from backend
    const pendingTokenRes = await fetch('/voz/api/get_pending_token/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {})
      },
    })

    if (!pendingTokenRes.ok) {
      throw new Error('No se pudo obtener el token de registro')
    }

    const tokenData = await pendingTokenRes.json()
    if (!tokenData.success || !tokenData.pending_token) {
      throw new Error('No se pudo generar el token de registro')
    }

    // Create FormData with audio
    const formData = new FormData()
    formData.append('audio', audioBlob, 'voice_sample.webm')
    formData.append('pending_token', tokenData.pending_token)

    const res = await fetch('/voz/api/register_audio/', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: csrftoken ? { 'X-CSRFToken': csrftoken } : undefined,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `No se pudo guardar el audio (${res.status})`)
    }
    
    return data as { success: true; message?: string }
  } catch (error) {
    console.error('Error registering voice:', error)
    throw error
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift()
  return undefined
}
