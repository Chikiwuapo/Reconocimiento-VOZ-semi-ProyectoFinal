// Service layer for Vocales page

export const apiFetch = async (path: string, init?: RequestInit) => {
  const p = path.startsWith('/') ? path.slice(1) : path
  const primary = `/vocales/api/${p}`
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

// payload esperado desde el hook: { frames, vocal, samples, tipo_mano?, landmarks_izquierda?, landmarks_derecha? }
export async function saveGestureAPI(payload: { frames: any[]; vocal: string; samples: number; tipo_mano?: 'left' | 'right' | 'both'; landmarks_izquierda?: any[]; landmarks_derecha?: any[] }) {
  const adapted: any = {
    vocal_vinculada: payload.vocal,
    landmarks_data: payload.frames,
    numero_muestras: payload.samples,
  }
  if (payload.tipo_mano) adapted.tipo_mano = payload.tipo_mano
  if (payload.landmarks_izquierda) adapted.landmarks_izquierda = payload.landmarks_izquierda
  if (payload.landmarks_derecha) adapted.landmarks_derecha = payload.landmarks_derecha
  const res = await apiFetch('guardar-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(res)
}

export async function recognizeGestureAPI(payload: { frame: any }) {
  const adapted = { landmarks_data: payload.frame }
  const res = await apiFetch('reconocer-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(res)
}

export async function getTrainedGesturesAPI() {
  // Endpoint web (sin prefijo api)
  const res = await fetch('/vocales/gestos_entrenados/')
  return toJsonSafe(res)
}

export async function recognizeTwoHandsAPI(payload: { left?: any; right?: any }) {
  const adapted = { landmarks_data: payload }
  const res = await apiFetch('reconocer-dos-manos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(res)
}

export async function deleteGestureAPI(gestoId: number) {
  try {
    const res = await fetch(`/vocales/eliminar-gesto/${gestoId}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    if (res.ok) return toJsonSafe(res)
  } catch {}
  return { success: false, error: 'No se pudo eliminar el gesto' }
}

export async function getVocalesCapturedAPI() {
  const res = await apiFetch('vocales-capturadas/')
  return toJsonSafe(res)
}

export async function getVocalesStatsAPI() {
  // Backend: 'estadisticas-practica/'
  const res = await apiFetch('estadisticas-practica/')
  return toJsonSafe(res)
}