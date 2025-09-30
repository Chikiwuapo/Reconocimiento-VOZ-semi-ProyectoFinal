import { useEffect, useMemo, useState } from 'react'
import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useArithmetic } from './hooks/useArithmetic'
import CameraPanel from '../../../components/Blackboard/Arithmetic/CameraPanel'

type Category = 'vocales' | 'abecedario' | 'numeros' | 'operaciones' | 'palabras'

function ConfirmModal({ open, onClose, title, message, isDarkMode }: { open: boolean; onClose: () => void; title: string; message: string; isDarkMode: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-header'}`}>{title}</h3>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className={`${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} px-4 py-2 rounded-lg`} onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

export default function CaptureSamples() {
  const { isDarkMode } = useTheme()
  const {
    videoRef, canvasRef,
    cameraActive, recording, rightDetected, leftDetected,
    startCamera, stopCamera, toggleRecording, saveGesture,
    mpReady, samplesCaptured,
    setGestureMode, setNumeroVinculado, setOperacionVinculada,
  } = useArithmetic()

  // Estado de UI
  const [category, setCategory] = useState<Category>('abecedario')
  const [selectedLabel, setSelectedLabel] = useState<string>('A')
  const [word, setWord] = useState('')
  const [dbCount, setDbCount] = useState<number>(0)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const LIMIT = 300

  // Auto activar cámara al entrar (espera a que MediaPipe esté listo)
  useEffect(() => {
    if (mpReady && !cameraActive) {
      startCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => { stopCamera() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cargar total de registros de BD
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/operaciones/gestos_entrenados')
        if (!res.ok) throw new Error('No se pudo obtener registros')
        const data = await res.json()
        const count = Array.isArray(data?.gestos) ? data.gestos.length : (Array.isArray(data) ? data.length : 0)
        setDbCount(count)
      } catch {
        setDbCount(0)
      }
    }
    load()
  }, [])

  // Teclado por categoría
  const keys = useMemo(() => {
    if (category === 'vocales') {
      return ['A', 'E', 'I', 'O', 'U']
    }
    if (category === 'abecedario') {
      // Abecedario sin vocales
      return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).filter(l => !['A','E','I','O','U'].includes(l))
    }
    if (category === 'numeros') {
      return Array.from({ length: 50 }, (_, i) => String(i + 1))
    }
    if (category === 'operaciones') {
      return ['+', '-', '×', '÷']
    }
    return []
  }, [category])

  // Manejo de captura
  const onCaptureClick = () => {
    if (samplesCaptured >= LIMIT) {
      setShowLimitModal(true)
      return
    }
    toggleRecording()
  }

  const onSaveToDB = async () => {
    // Guardar gesto con etiqueta seleccionada; asumimos saveGesture persistirá
    await saveGesture()
    setShowSavedModal(true)
    if (samplesCaptured >= LIMIT && recording) {
      toggleRecording()
    }
  }

  const onClearLocal = () => {
    // La limpieza del contador ahora se maneja en el hook useArithmetic
    // No necesitamos hacer nada aquí ya que samplesCaptured se resetea automáticamente
  }

  const statCard = (title: string, value: string | number, icon: string, extra?: string) => (
    <div className={`rounded-xl p-4 shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{title}</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{value}</div>
          {extra && <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{extra}</div>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        {/* Encabezado */}
        <div className="max-w-6xl mx-auto mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Capturar Muestras</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Usa tu cámara para capturar registros etiquetados y guardarlos en la base de datos.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna principal con cámara */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Stats superiores - Movidas arriba de la cámara */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {statCard('Registros totales (BD)', dbCount, '🗂️')}
              {statCard('Capturados (sesión)', `${samplesCaptured}/${LIMIT}`, '📸', samplesCaptured >= LIMIT ? 'Límite alcanzado' : undefined)}
              {statCard('Capturando', category === 'palabras' ? (word || '—') : selectedLabel, '🎯')}
            </div>
            
            <CameraPanel 
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraActive={cameraActive}
              rightDetected={rightDetected}
              leftDetected={leftDetected}
              isDarkMode={isDarkMode}
            />

            {/* Acciones de captura */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={onCaptureClick} className={`h-12 rounded-xl text-white shadow ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{recording ? 'Detener' : 'Capturar'}</button>
              <button onClick={onSaveToDB} className="h-12 rounded-xl text-white shadow bg-emerald-600 hover:bg-emerald-700">Guardar en BD</button>
              <button onClick={onClearLocal} className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow`}>Borrar registros</button>
            </div>
          </div>

          {/* Panel lateral derecho */}
          <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-header'}`}>Panel de Control</div>
            <div className="mt-3 space-y-4">
              {/* Detección de manos */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Detección de manos</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className={`rounded-md px-3 py-2 ${leftDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Izquierda: {leftDetected ? 'Sí' : 'No'}</div>
                  <div className={`rounded-md px-3 py-2 ${rightDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Derecha: {rightDetected ? 'Sí' : 'No'}</div>
                </div>
              </div>

              {/* Tipo de modelo */}
              <div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Tipo de modelo</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { key: 'numeros', label: 'Números' },
                    { key: 'operaciones', label: 'Operaciones Básicas' },
                  ] as { key: Category; label: string }[]).map(({ key, label }) => (
                    <button key={key} onClick={() => {
                      setCategory(key)
                      // Actualizar el estado del hook useArithmetic
                      if (key === 'numeros') {
                        setGestureMode('numero')
                      } else if (key === 'operaciones') {
                        setGestureMode('operacion')
                      }
                    }} className={`px-3 py-2 rounded-lg text-sm border transition ${category === key ? 'bg-indigo-600 text-white border-indigo-600' : (isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-white text-header border-slate-200 hover:bg-slate-50')}`}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Teclado / inputs según categoría */}
              <div>
                {category === 'palabras' ? (
                  <div>
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Palabra</div>
                    <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Escribe la palabra" className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`} />
                    <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Etiqueta actual: <span className="font-semibold">{word || '—'}</span></div>
                  </div>
                ) : (
                  <div>
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Etiqueta</div>
                    <div className="grid grid-cols-10 gap-2">
                      {keys.map(k => (
                        <button key={k} onClick={() => {
                          setSelectedLabel(k)
                          // Actualizar el estado del hook useArithmetic según la categoría
                          if (category === 'numeros') {
                            const numero = parseInt(k)
                            if (!isNaN(numero)) {
                              setNumeroVinculado(numero)
                            }
                          } else if (category === 'operaciones') {
                            // Mapear símbolos a operaciones
                            const operacionMap: Record<string, string> = {
                              '+': 'suma',
                              '-': 'resta',
                              '×': 'multiplicacion',
                              '÷': 'division'
                            }
                            const operacion = operacionMap[k]
                            if (operacion) {
                              setOperacionVinculada(operacion)
                            }
                          }
                        }} className={`h-10 rounded-md text-sm border ${selectedLabel === k ? 'bg-indigo-600 text-white border-indigo-600' : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700' : 'bg-white border-slate-200 text-header hover:bg-slate-50')}`}>{k}</button>
                      ))}
                    </div>
                    <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Etiqueta actual: <span className="font-semibold">{selectedLabel}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals de confirmación */}
      <ConfirmModal open={showSavedModal} onClose={() => setShowSavedModal(false)} title="Registro guardado" message="La muestra se ha guardado correctamente en la base de datos." isDarkMode={isDarkMode} />
      <ConfirmModal open={showLimitModal} onClose={() => setShowLimitModal(false)} title="Límite alcanzado" message="Has alcanzado el límite de 300 registros para esta sesión." isDarkMode={isDarkMode} />
    </Layout>
  )
}