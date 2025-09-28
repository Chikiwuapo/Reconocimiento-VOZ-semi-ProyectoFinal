// Servicio para la página de Abecedario
// Proporciona funciones para interactuar con la API del backend

// Coincidir con proxy de Vite: '/abecedario/api' (ver vite.config.ts)
const API_BASE = '/abecedario/api'

// Función auxiliar para hacer peticiones fetch
async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

// Función auxiliar para parsear JSON de forma segura
async function toJsonSafe(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return null
  }
}

// Guardar un gesto de letra (con soporte a tipo de mano y landmarks por mano)
export async function saveGestureAPI(payload: { frames: any[]; letra: string; samples: number; tipo_mano?: 'left' | 'right' | 'both'; landmarks_izquierda?: any[]; landmarks_derecha?: any[] }) {
  const adapted: any = {
    letra_vinculada: payload.letra,
    landmarks_data: payload.frames,
    numero_muestras: payload.samples,
  }
  if (payload.tipo_mano) adapted.tipo_mano = payload.tipo_mano
  if (payload.landmarks_izquierda) adapted.landmarks_izquierda = payload.landmarks_izquierda
  if (payload.landmarks_derecha) adapted.landmarks_derecha = payload.landmarks_derecha
  const response = await apiFetch(`${API_BASE}/guardar-gesto/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Reconocer un gesto de letra
export async function recognizeGestureAPI(payload: { frame: any }) {
  const adapted = { landmarks_data: payload.frame }
  const response = await apiFetch(`${API_BASE}/reconocer-gesto/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Obtener gestos entrenados
export async function getTrainedGesturesAPI() {
  // Para coincidencia con proxy definido, usar ruta sin /api para este endpoint
  const response = await fetch(`/abecedario/gestos_entrenados/`)
  return toJsonSafe(response) || []
}

// Reconocer dos manos simultáneamente
export async function recognizeTwoHandsAPI(payload: { leftFrame: any; rightFrame: any }) {
  const adapted = { landmarks_data: { left: payload.leftFrame, right: payload.rightFrame } }
  const response = await apiFetch(`${API_BASE}/reconocer-dos-manos/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Eliminar un gesto
export async function deleteGestureAPI(gestureId: number) {
  // Intentar rutas web y api
  const candidates = [
    `/abecedario/eliminar-gesto/${gestureId}/`,
    `/api/abecedario/eliminar-gesto/${gestureId}/`,
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (res.ok) return toJsonSafe(res)
    } catch {}
  }
  return { success: false, error: 'No se pudo eliminar el gesto' }
}

// Obtener letras capturadas
export async function getCapturedLettersAPI() {
  const response = await apiFetch(`${API_BASE}/letras-capturadas/`)
  return toJsonSafe(response) || []
}

// Obtener estadísticas de letras
export async function getLetterStatsAPI() {
  const response = await apiFetch(`${API_BASE}/estadisticas-practica/`)
  return toJsonSafe(response) || {
    total_attempts: 0,
    correct_attempts: 0,
    current_streak: 0,
    best_streak: 0,
    accuracy: 0
  }
}