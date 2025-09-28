// Servicio para la página de Palabras
// Proporciona funciones para interactuar con la API del backend

const API_BASES = ['/palabras/api', '/api']

// Función auxiliar para hacer peticiones fetch
async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // No lanzar error aquí; dejamos que el caller decida y podamos intentar rutas alternativas
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

// Guardar un gesto de palabra (con soporte a tipo de mano y landmarks por mano)
export async function saveGestureAPI(payload: { frames: any[]; palabra: string; samples: number; tipo_mano?: 'left' | 'right' | 'both'; landmarks_izquierda?: any[]; landmarks_derecha?: any[] }) {
  // Payload mínimo esperado por el backend
  const adapted: any = {
    palabra_vinculada: payload.palabra || '',
    landmarks_data: Array.isArray(payload.frames) ? payload.frames : [],
    numero_muestras: typeof payload.samples === 'number' ? payload.samples : (Array.isArray(payload.frames) ? payload.frames.length : 0),
  }
  if (payload.tipo_mano) adapted.tipo_mano = payload.tipo_mano
  if (payload.landmarks_izquierda && payload.landmarks_izquierda.length > 0) adapted.landmarks_izquierda = payload.landmarks_izquierda
  if (payload.landmarks_derecha && payload.landmarks_derecha.length > 0) adapted.landmarks_derecha = payload.landmarks_derecha

  // Usar la misma estructura que vocales y abecedario que funcionan correctamente
  const response = await apiFetch(`${API_BASES[0]}/guardar-gesto/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Reconocer un gesto de palabra
export async function recognizeGestureAPI(payload: { frame: any }) {
  const adapted = { landmarks_data: payload.frame }
  const response = await apiFetch(`${API_BASES[0]}/reconocer-gesto/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Obtener gestos entrenados
export async function getTrainedGesturesAPI() {
  // Coincidir con proxy de Vite: usar ruta sin /api para este endpoint
  const response = await fetch(`/palabras/gestos_entrenados/`)
  return toJsonSafe(response) || []
}

// Reconocer dos manos simultáneamente
export async function recognizeTwoHandsAPI(payload: { leftFrame: any; rightFrame: any }) {
  const adapted = { landmarks_data: { left: payload.leftFrame, right: payload.rightFrame } }
  const response = await apiFetch(`${API_BASES[0]}/reconocer-dos-manos/`, {
    method: 'POST',
    body: JSON.stringify(adapted),
  })
  return toJsonSafe(response)
}

// Eliminar un gesto
export async function deleteGestureAPI(gestureId: number) {
  const candidates = [
    `/palabras/eliminar-gesto/${gestureId}/`,
    `/api/palabras/eliminar-gesto/${gestureId}/`,
  ]
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      if (res.ok) return toJsonSafe(res)
    } catch {}
  }
  return { success: false, error: 'No se pudo eliminar el gesto' }
}

// Obtener palabras capturadas
export async function getCapturedWordsAPI() {
  const response = await apiFetch(`${API_BASES[0]}/palabras-capturadas/`)
  return toJsonSafe(response) || []
}

// Obtener estadísticas de palabras
export async function getWordStatsAPI() {
  const response = await apiFetch(`${API_BASES[0]}/estadisticas-practica/`)
  return toJsonSafe(response) || {
    total_attempts: 0,
    correct_attempts: 0,
    current_streak: 0,
    best_streak: 0,
    accuracy: 0
  }
}