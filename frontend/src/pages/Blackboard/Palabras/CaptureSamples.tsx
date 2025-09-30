import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
// Usamos el mismo panel de cámara para igualar dimensiones/estilos
import CameraPanel from '../../../components/Blackboard/Arithmetic/CameraPanel'
import { usePalabras } from './hooks/usePalabras'
import { useEffect, useState } from 'react'

export default function CaptureSamplesPalabras() {
  const { isDarkMode } = useTheme()
  const {
    videoRef,
    canvasRef,
    mpReady,
    cameraActive,
    startCamera,
    stopCamera,
    recording,
    toggleRecording,
    samplesCaptured,
    saveGesture,
    clearRecording,
    leftDetected,
    rightDetected,
    setPalabraVinculada,
    error,
    setError,
  } = usePalabras()

  const [dbCount, setDbCount] = useState<number>(0)
  const [word, setWord] = useState('')
  const LIMIT = 300

  // Auto-activar cámara cuando MediaPipe esté listo
  useEffect(() => {
    if (mpReady && !cameraActive) startCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  // Cleanup al salir
  useEffect(() => {
    return () => { if (cameraActive) stopCamera() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPalabraVinculada((word || '').toUpperCase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  const onSave = async () => { 
    try {
      setError(null)
      await saveGesture()
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el gesto')
    }
  }

  // Cargar total BD
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/palabras/gestos_entrenados/')
        if (res.ok) {
          const data = await res.json()
          const count = Array.isArray(data?.gestos) ? data.gestos.length : (Array.isArray(data) ? data.length : 0)
          setDbCount(count)
        }
      } catch { setDbCount(0) }
    }
    load()
  }, [])

  const statCard = (title: string, value: string | number, icon: string) => (
    <div className={`rounded-xl p-4 shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{title}</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{value}</div>
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
          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Stats superiores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {statCard('Registros totales (BD)', dbCount, '🗂️')}
              {statCard('Capturados (sesión)', `${samplesCaptured}/${LIMIT}`, '📸')}
              {statCard('Capturando', word || '—', '🎯')}
            </div>

            {/* Panel de cámara */}
            <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
              <CameraPanel
                videoRef={videoRef as unknown as React.RefObject<HTMLVideoElement>}
                canvasRef={canvasRef as unknown as React.RefObject<HTMLCanvasElement>}
                cameraActive={cameraActive}
                leftDetected={leftDetected}
                rightDetected={rightDetected}
                isDarkMode={isDarkMode}
              />

              {/* Acciones */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button onClick={toggleRecording} className={`h-12 rounded-xl text-white shadow ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{recording ? 'Detener' : 'Capturar'}</button>
                <button onClick={onSave} className="h-12 rounded-xl text-white shadow bg-emerald-600 hover:bg-emerald-700">Guardar en BD</button>
                <button onClick={clearRecording} className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow`}>Borrar registros</button>
              </div>

              {/* Mostrar errores si existen */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho */}
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

              {/* Tipo de modelo (solo Palabras) */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Tipo de modelo</div>
                <div className="mt-2">
                  <button className={`px-4 py-2 rounded-lg text-sm border bg-indigo-600 text-white border-indigo-600 w-full`}>Palabras</button>
                </div>
              </div>

              {/* Palabra vinculada */}
              <div>
                <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Palabra</div>
                <input
                  value={word}
                  onChange={(e)=>setWord(e.target.value.toUpperCase())}
                  placeholder="Escribe la palabra"
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'}`}
                />
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Etiqueta actual: <span className="font-semibold">{word || '—'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
