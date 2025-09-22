// Service layer for Arithmetic page

export const apiFetch = async (path: string, init?: RequestInit) => {
  const p = path.startsWith('/') ? path.slice(1) : path
  const primary = `/api/${p}`
  const fallback = `/operaciones/api/${p}`
  const resPrimary = await fetch(primary, init)
  if (resPrimary.ok) return resPrimary
  try {
    const resFallback = await fetch(fallback, init)
    if (resFallback.ok) return resFallback
    return resPrimary
  } catch {
    return resPrimary
  }
}

export async function saveGestureAPI(payload: any) {
  const res = await apiFetch('guardar-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  try {
    return await res.json()
  } catch (e) {
    return { success: false, error: 'Respuesta inválida del servidor' }
  }
}

export async function recognizeGestureAPI(landmarks: any) {
  const res = await apiFetch('reconocer-gesto/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landmarks_data: landmarks }),
  })
  try {
    return await res.json()
  } catch (e) {
    return { success: false, error: 'Respuesta inválida del servidor' }
  }
}

export async function getTrainedGesturesAPI() {
  const res = await apiFetch('gestos-entrenados/')
  try {
    return await res.json()
  } catch (e) {
    return { success: false, error: 'Respuesta inválida del servidor' }
  }
}

export async function calculateAPI(payload: any) {
  const res = await apiFetch('calcular-operacion/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  try {
    return await res.json()
  } catch (e) {
    return { success: false, error: 'Respuesta inválida del servidor' }
  }
}
