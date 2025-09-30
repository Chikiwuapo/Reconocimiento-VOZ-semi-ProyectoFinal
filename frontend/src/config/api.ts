// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get the API base URL from environment variables or use defaults
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment ? 'http://127.0.0.1:8000' : 'https://your-backend-app.onrender.com');

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/login/',
    register: '/api/register-basic/',
    validate: '/api/validate-user/',
    encode: '/api/encode/',
    dbCheck: '/api/db-check/',
  },
  
  // Operations (Arithmetic)
  operations: {
    base: '/operaciones',
    gestosTrained: '/operaciones/gestos-entrenados/',
    saveGesto: '/operaciones/guardar-gesto/',
    recognizeGesto: '/operaciones/reconocer-gesto/',
    recognizeTwoHands: '/operaciones/reconocer-dos-manos/',
    calculate: '/operaciones/calcular-operacion/',
    deleteGesto: '/operaciones/eliminar-gesto/',
  },
  
  // Vowels
  vowels: {
    base: '/vocales/api',
    captured: '/vocales/api/vocales-capturadas/',
    saveGesto: '/vocales/api/guardar-gesto/',
    recognizeGesto: '/vocales/api/reconocer-gesto/',
    recognizeTwoHands: '/vocales/api/reconocer-dos-manos/',
    statistics: '/vocales/api/estadisticas-practica/',
    trained: '/vocales/gestos_entrenados/',
    deleteGesto: '/vocales/eliminar-gesto/',
  },
  
  // Alphabet
  alphabet: {
    base: '/abecedario/api',
    captured: '/abecedario/api/letras-capturadas/',
    saveGesto: '/abecedario/api/guardar-gesto/',
    recognizeGesto: '/abecedario/api/reconocer-gesto/',
    recognizeTwoHands: '/abecedario/api/reconocer-dos-manos/',
    statistics: '/abecedario/api/estadisticas-practica/',
    trained: '/abecedario/gestos_entrenados/',
    deleteGesto: '/abecedario/eliminar-gesto/',
  },
  
  // Words
  words: {
    base: '/palabras/api',
    captured: '/palabras/api/palabras-capturadas/',
    saveGesto: '/palabras/api/guardar-gesto/',
    recognizeGesto: '/palabras/api/reconocer-gesto/',
    recognizeTwoHands: '/palabras/api/reconocer-dos-manos/',
    statistics: '/palabras/api/estadisticas-practica/',
    trained: '/palabras/gestos_entrenados/',
    deleteGesto: '/palabras/eliminar-gesto/',
  },
  
  // Voice
  voice: {
    base: '/voz',
    start: '/voz/iniciar/',
    stop: '/voz/detener/',
    status: '/voz/estado/',
    commands: '/voz/comandos/',
    register: '/voz/registrar/',
    login: '/voz/login/',
    registerAudio: '/voz/api/register_audio/',
    getPendingToken: '/voz/api/get_pending_token/',
    recognizeCommand: '/voz/api/recognize_command/',
    voiceStatus: '/voz/api/voice_status/',
    deleteProfile: '/voz/api/voice_profile/',
    checkUsers: '/voz/api/check_registered_users/',
  },
  
  // Chatbot
  chatbot: {
    base: '/chatbot',
    chat: '/chatbot/api/chat/',
    health: '/chatbot/api/health/',
    history: '/chatbot/api/history/',
    clearSession: '/chatbot/api/clear-session/',
    analytics: '/chatbot/api/analytics/',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // In development, use relative URLs (handled by Vite proxy)
  if (isDevelopment) {
    return endpoint;
  }
  
  // In production, use full URLs with the backend domain
  return `${API_BASE_URL}${endpoint}`;
};

// Export environment info
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  apiBaseUrl: API_BASE_URL,
  nodeEnv: import.meta.env.VITE_NODE_ENV || import.meta.env.MODE,
};