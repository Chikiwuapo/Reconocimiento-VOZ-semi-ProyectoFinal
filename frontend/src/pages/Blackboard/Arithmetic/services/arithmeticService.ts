// Service layer for Arithmetic page

export const apiFetch = async (path: string, init?: RequestInit) => {
  const p = path.startsWith('/') ? path.slice(1) : path
  const primary = `/api/operaciones/${p}`
  const resPrimary = await fetch(primary, init)
  // Always rely on Vite proxy for local dev to avoid CORS.
  // If the backend returns non-2xx, let the caller handle the JSON/error.
  return resPrimary
}

// Generic JSON parser with safe fallback
const toJsonSafe = async (res: Response) => {
  try {
    return await res.json()
  } catch {
    return { success: false, error: 'Respuesta inválida del servidor' }
  }
}

export async function saveGestureAPI(payload: any) {
  const res = await apiFetch('guardar-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return toJsonSafe(res)
}

export async function recognizeGestureAPI(landmarks: any) {
  const res = await apiFetch('reconocer-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landmarks_data: landmarks }),
  })
  return toJsonSafe(res)
}

export async function getTrainedGesturesAPI() {
  const res = await apiFetch('gestos-entrenados/')
  return toJsonSafe(res)
}

export async function calculateAPI(payload: any) {
  const res = await apiFetch('calcular-operacion/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return toJsonSafe(res)
}

// Reconocimiento con ambas manos
export async function recognizeTwoHandsAPI(payload: { left?: any; right?: any }) {
  const res = await apiFetch('reconocer-dos-manos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return toJsonSafe(res)
}

// Eliminar gesto específico (intenta rutas con y sin prefijo /api)
export async function deleteGestureAPI(gestoId: number) {
  const candidates = [
    `/api/operaciones/eliminar-gesto/${gestoId}/`,
    `/operaciones/eliminar-gesto/${gestoId}/`,
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) return toJsonSafe(res)
    } catch {
      // try next candidate
    }
  }
  return { success: false, error: 'No se pudo eliminar el gesto' }
}