import { useEffect, useState } from 'react'
import Layout from '../../../../components/Blackboard/Layout'
import { useTheme } from '../../../../App'
import { useArithmetic } from '../hooks/useArithmetic'
import CameraPanel from '../../../../components/Blackboard/Arithmetic/CameraPanel'
import PracticeStats from '../../../../components/Blackboard/Arithmetic/Practice/PracticeStats'
import { getTrainedGesturesAPI } from '../services/arithmeticService'

export default function PracticeOperations() {
  const { isDarkMode } = useTheme()
  const { videoRef, canvasRef, cameraActive, rightDetected, leftDetected, startCamera, stopCamera, recognizeCurrent, clearOperation, calculateFromOperation, expresion, resultado, mpReady, currentOperationRef, confidence } = useArithmetic()
  
  // Estado para elementos disponibles
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
  const [availableOperations, setAvailableOperations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado para reconocimiento automático
  const [autoRecognition, setAutoRecognition] = useState(false)
  const [lastGestureTime, setLastGestureTime] = useState(0)
  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  
  // Reconocimiento automático cada 2 segundos cuando hay manos detectadas
  useEffect(() => {
    if (!autoRecognition || !cameraActive || (!rightDetected && !leftDetected)) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      if (now - lastGestureTime > 2000 && confidence > 0.7) {
        recognizeCurrent()
        setLastGestureTime(now)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [autoRecognition, cameraActive, rightDetected, leftDetected, lastGestureTime, confidence, recognizeCurrent])
  
  // Actualizar secuencia actual cuando cambie la operación
  useEffect(() => {
    setCurrentSequence([...currentOperationRef.current])
  }, [currentOperationRef.current])
  
  // Auto-calcular cuando se complete una operación válida
  useEffect(() => {
    if (currentSequence.length === 3) {
      const [num1, op, num2] = currentSequence
      if (!isNaN(Number(num1)) && ['+', '-', '*', '/', '×', '÷'].includes(op) && !isNaN(Number(num2))) {
        setTimeout(() => {
          calculateFromOperation()
        }, 1000) // Esperar 1 segundo antes de calcular automáticamente
      }
    }
  }, [currentSequence, calculateFromOperation])

  // Cargar elementos disponibles desde la base de datos
  useEffect(() => {
    const loadAvailableElements = async () => {
      try {
        const response = await getTrainedGesturesAPI()
        if (response?.success && response?.gestos) {
          const numbers: string[] = []
          const operations: string[] = []
          
          response.gestos.forEach((gesto: any) => {
            if (gesto.numero_vinculado !== null && gesto.numero_vinculado !== undefined) {
              const num = gesto.numero_vinculado.toString()
              if (!numbers.includes(num)) {
                numbers.push(num)
              }
            }
            if (gesto.operacion_vinculada) {
              let op = gesto.operacion_vinculada
              // Convertir operaciones a símbolos
              if (op === 'suma') op = '+'
              else if (op === 'resta') op = '-'
              else if (op === 'multiplicacion') op = '×'
              else if (op === 'division') op = '÷'
              
              if (!operations.includes(op)) {
                operations.push(op)
              }
            }
          })
          
          // Ordenar números y operaciones
          numbers.sort((a, b) => parseInt(a) - parseInt(b))
          setAvailableNumbers(numbers)
          setAvailableOperations(operations)
        }
      } catch (error) {
        console.error('Error loading available elements:', error)
        // Fallback a elementos comunes
        setAvailableNumbers(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
        setAvailableOperations(['+', '-', '×', '÷'])
      } finally {
        setLoading(false)
      }
    }

    loadAvailableElements()
  }, [])

  useEffect(() => {
    if (mpReady && !cameraActive) startCamera()
    return () => { stopCamera() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Practicar: Operaciones Aritméticas</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Calcula operaciones detectadas por el modelo y visualiza el resultado.</p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <PracticeStats isDarkMode={isDarkMode} model="operaciones" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <CameraPanel videoRef={videoRef} canvasRef={canvasRef} cameraActive={cameraActive} rightDetected={rightDetected} leftDetected={leftDetected} isDarkMode={isDarkMode} />
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={recognizeCurrent} 
                  className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors"
                  disabled={!cameraActive || (!rightDetected && !leftDetected)}
                >
                  Reconocer
                </button>
                <button 
                  onClick={clearOperation} 
                  className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow transition-colors`}
                >
                  Limpiar
                </button>
                <button 
                  onClick={calculateFromOperation} 
                  className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors"
                  disabled={currentSequence.length !== 3}
                >
                  Calcular
                </button>
              </div>
              
              {/* Auto Recognition Toggle */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      Reconocimiento Automático
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} mt-1`}>
                      Detecta gestos automáticamente cada 2 segundos
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoRecognition(!autoRecognition)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRecognition ? 'bg-indigo-600' : (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRecognition ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {/* Current Sequence Display */}
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Secuencia Actual</div>
                <div className="mt-2 flex items-center gap-2">
                  {currentSequence.length === 0 ? (
                    <span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      Haz gestos para construir una operación...
                    </span>
                  ) : (
                    currentSequence.map((token, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className={`px-3 py-2 rounded-lg font-bold text-lg ${
                          isDarkMode ? 'bg-gray-800 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {token}
                        </span>
                        {index < currentSequence.length - 1 && (
                          <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>→</span>
                        )}
                      </div>
                    ))
                  )}
                  {currentSequence.length < 3 && (
                    <span className={`px-3 py-2 rounded-lg border-2 border-dashed text-lg ${
                      isDarkMode ? 'border-gray-600 text-gray-500' : 'border-slate-300 text-slate-400'
                    }`}>
                      ?
                    </span>
                  )}
                </div>
                {currentSequence.length === 3 && (
                  <div className={`mt-2 text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ✓ Operación completa - Se calculará automáticamente
                  </div>
                )}
              </div>
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Operación detectada</div>
                <div className={`${isDarkMode ? 'text-white' : 'text-header'} text-2xl font-bold mt-1 break-words`}>{expresion || '—'}</div>
                <div className={`text-sm mt-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Resultado: <span className="font-semibold">{resultado ?? '—'}</span></div>
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

                {/* Available Numbers */}
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Números disponibles {loading ? '' : `(${availableNumbers.length})`}
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Cargando...</div>
                    ) : availableNumbers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {availableNumbers.map(num => (
                          <span key={num} className={`rounded-md px-2 py-1 text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        No hay números entrenados. Entrena algunos números primero.
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Operations */}
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    Operaciones disponibles {loading ? '' : `(${availableOperations.length})`}
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Cargando...</div>
                    ) : availableOperations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {availableOperations.map(op => (
                          <span key={op} className={`rounded-md px-2 py-1 text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                            {op}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        No hay operaciones entrenadas. Entrena algunas operaciones primero.
                      </div>
                    )}
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
