import { useEffect, useState } from 'react'
import Layout from '../../../../components/Blackboard/Layout'
import { useTheme } from '../../../../App'
import { usePalabras } from '../hooks/usePalabras'
import CameraPanel from '../../../../components/Blackboard/Arithmetic/CameraPanel'
import PracticeStats from '../../../../components/Blackboard/Arithmetic/Practice/PracticeStats'
import { getCapturedWordsAPI } from '../services/palabrasService'

export default function PracticePalabras() {
  const { isDarkMode } = useTheme()
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const {
    videoRef,
    canvasRef,
    cameraActive,
    rightDetected,
    leftDetected,
    startCamera,
    stopCamera,
    recognizeCurrentGesture,
    recognizedWord,
    recognitionConfidence,
    mpReady,
    error,
    setError
  } = usePalabras()

  useEffect(() => {
    if (mpReady && !cameraActive) startCamera()
    return () => { stopCamera() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  // Cargar palabras disponibles desde la base de datos
  useEffect(() => {
    const loadAvailableWords = async () => {
      try {
        const response = await getCapturedWordsAPI()
        if (response.success && response.palabras) {
          const words = response.palabras.map((palabra: any) => palabra.palabra_vinculada)
          setAvailableWords(words)
        } else {
          // Fallback a palabras comunes si no hay respuesta de la API
          setAvailableWords([
            'HOLA', 'ADIOS', 'GRACIAS', 'POR_FAVOR', 'SI', 'NO',
            'AGUA', 'COMIDA', 'CASA', 'FAMILIA', 'AMOR', 'TRABAJO',
            'ESCUELA', 'AMIGO', 'TIEMPO', 'DINERO', 'SALUD', 'FELIZ'
          ])
        }
      } catch (error) {
        console.error('Error loading available words:', error)
        // Fallback a palabras comunes en caso de error
        setAvailableWords([
          'HOLA', 'ADIOS', 'GRACIAS', 'POR_FAVOR', 'SI', 'NO',
          'AGUA', 'COMIDA', 'CASA', 'FAMILIA', 'AMOR', 'TRABAJO',
          'ESCUELA', 'AMIGO', 'TIEMPO', 'DINERO', 'SALUD', 'FELIZ'
        ])
      }
    }

    loadAvailableWords()
  }, [])

  const handleRecognize = async () => {
    try {
      setError(null)
      await recognizeCurrentGesture()
    } catch (err) {
      setError('Error al reconocer la palabra')
      console.error('Recognition error:', err)
    }
  }

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Practicar: Palabras</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Practica el reconocimiento de palabras clave usando gestos de manos.</p>
          </div>

          <div className="mb-6">
            <PracticeStats isDarkMode={isDarkMode} model="palabras" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <CameraPanel
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraActive={cameraActive}
                rightDetected={rightDetected}
                leftDetected={leftDetected}
                isDarkMode={isDarkMode}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRecognize}
                  className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors"
                >
                  Reconocer Palabra
                </button>
                <button
                  onClick={() => { setError(null) }}
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow transition-colors`}
                >
                  Limpiar
                </button>
              </div>

              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Palabra reconocida</div>
                <div className={`${isDarkMode ? 'text-white' : 'text-header'} text-2xl font-bold mt-1`}>
                  {recognizedWord || '—'}
                </div>
                <div className={`text-sm mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Confianza: <span className="font-semibold">{recognitionConfidence ? `${(recognitionConfidence * 100).toFixed(1)}%` : '—'}</span>
                </div>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </div>
            </div>

            <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-header'}`}>Panel de Control</div>

              <div className="mt-3 space-y-3 text-sm">
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Detección de manos</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`rounded-md px-3 py-2 text-center ${leftDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Izquierda: {leftDetected ? 'Sí' : 'No'}</div>
                    <div className={`rounded-md px-3 py-2 text-center ${rightDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Derecha: {rightDetected ? 'Sí' : 'No'}</div>
                  </div>
                </div>

                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Palabras disponibles</div>
                  <div className="mt-2 grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                    {availableWords.length > 0 ? (
                      availableWords.map(word => (
                        <div key={word} className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-slate-700 border border-slate-200'} rounded-md px-2 py-1 text-center text-xs font-medium`}>
                          {word.replace('_', ' ')}
                        </div>
                      ))
                    ) : (
                      <div className={`col-span-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-xs py-4`}>
                        Cargando palabras disponibles...
                      </div>
                    )}
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-xs mt-2`}>
                    {availableWords.length > 0 ? (
                      `${availableWords.length} palabra${availableWords.length !== 1 ? 's' : ''} entrenada${availableWords.length !== 1 ? 's' : ''}`
                    ) : (
                      'Palabras cargadas desde la base de datos'
                    )}
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'} rounded-lg p-3`}>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-xs`}>Instrucciones</div>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} text-xs mt-2`}>
                    1. Posiciona tus manos frente a la cámara<br/>
                    2. Realiza el gesto de la palabra<br/>
                    3. Haz clic en "Reconocer Palabra"<br/>
                    4. Observa el resultado y la confianza
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}