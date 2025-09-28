import { useEffect } from 'react'
import Layout from '../../../../components/Blackboard/Layout'
import { useTheme } from '../../../../App'
import { useAbecedario } from '../hooks/useAbecedario'
import CameraPanel from '../../../../components/Blackboard/Arithmetic/CameraPanel'
import PracticeStats from '../../../../components/Blackboard/Arithmetic/Practice/PracticeStats'

export default function PracticeAbecedario() {
  const { isDarkMode } = useTheme()
  const { 
    videoRef, 
    canvasRef, 
    cameraActive, 
    rightDetected, 
    leftDetected, 
    startCamera, 
    stopCamera, 
    recognizeCurrentGesture, 
    recognizedLetter, 
    recognitionConfidence,
    mpReady,
    error,
    setError
  } = useAbecedario()

  useEffect(() => {
    if (mpReady && !cameraActive) startCamera()
    return () => { stopCamera() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  const handleRecognize = async () => {
    try {
      setError(null)
      await recognizeCurrentGesture()
    } catch (err) {
      setError('Error al reconocer la letra')
      console.error('Recognition error:', err)
    }
  }

  // Generate alphabet letters (excluding vowels as they're handled separately)
  const consonants = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    .filter(letter => !['A', 'E', 'I', 'O', 'U'].includes(letter))

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Practicar: Abecedario</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Practica el reconocimiento de letras del abecedario usando gestos de manos.</p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <PracticeStats isDarkMode={isDarkMode} model="abecedario" />
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
                  Reconocer Letra
                </button>
                <button 
                  onClick={() => {
                    setError(null)
                  }} 
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow transition-colors`}
                >
                  Limpiar
                </button>
              </div>

              {/* Results Display */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Letra reconocida</div>
                <div className={`${isDarkMode ? 'text-white' : 'text-header'} text-3xl font-bold mt-1`}>
                  {recognizedLetter || '—'}
                </div>
                <div className={`text-sm mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Confianza: <span className="font-semibold">{recognitionConfidence ? `${(recognitionConfidence * 100).toFixed(1)}%` : '—'}</span>
                </div>
                {error && (
                  <div className="text-red-500 text-sm mt-2">{error}</div>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-header'}`}>Panel de Control</div>
              
              <div className="mt-3 space-y-3 text-sm">
                {/* Hand Detection Status */}
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Detección de manos</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`rounded-md px-3 py-2 text-center ${leftDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>
                      Izquierda: {leftDetected ? 'Sí' : 'No'}
                    </div>
                    <div className={`rounded-md px-3 py-2 text-center ${rightDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>
                      Derecha: {rightDetected ? 'Sí' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Consonants Guide */}
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Consonantes disponibles</div>
                  <div className="mt-2 grid grid-cols-7 gap-1 max-h-32 overflow-y-auto">
                    {consonants.map(letter => (
                      <div key={letter} className={`rounded-md px-2 py-1 text-center text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    * Las vocales (A, E, I, O, U) se practican por separado
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