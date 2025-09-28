import { useEffect, useMemo, useState } from 'react'
import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
// Usamos el mismo panel de cámara de Arithmetic para igualar dimensiones/estilo
import CameraPanel from '../../../components/Blackboard/Arithmetic/CameraPanel'
import { useVocales } from './hooks/useVocales'

export default function CaptureSamplesVocales() {
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
    saveGesture,
    clearRecording,
    leftDetected,
    rightDetected,
    vocalVinculada,
    setVocalVinculada,
    samplesCaptured,
  } = useVocales()

  // UI y métricas
  const [dbCount, setDbCount] = useState<number>(0)
  const LIMIT = 300
  const [saving, setSaving] = useState(false)

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

  // Cargar total registros desde backend de vocales
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/vocales/gestos_entrenados/')
        if (!res.ok) throw new Error('No se pudo obtener registros')
        const data = await res.json()
        const count = Array.isArray(data?.gestos) ? data.gestos.length : (Array.isArray(data) ? data.length : 0)
        setDbCount(count)
      } catch { setDbCount(0) }
    }
    load()
  }, [])

  const keys = useMemo(() => ['A', 'E', 'I', 'O', 'U'], [])

  const onCaptureClick = () => {
    toggleRecording()
  }

  const onSaveToDB = async () => {
    if (saving) return
    setSaving(true)
    try {
      await saveGesture()
      // Permanecer en esta vista. La distribución en Entrenar se actualizará sola cuando vayas.
      // Opcional: podríamos mostrar un toast global ya que emitimos app:dataChanged.
    } finally {
      setSaving(false)
    }
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
          {/* Columna principal */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Stats superiores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {statCard('Registros totales (BD)', dbCount, '🗂️')}
              {statCard('Capturados (sesión)', `${samplesCaptured}/${LIMIT}`, '📸')}
              {statCard('Capturando', vocalVinculada, '🎯')}
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
                <button onClick={onCaptureClick} className={`h-12 rounded-xl text-white shadow ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{recording ? 'Detener' : 'Capturar'}</button>
                <button onClick={onSaveToDB} disabled={saving} className={`h-12 rounded-xl text-white shadow ${saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{saving ? 'Guardando...' : 'Guardar en BD'}</button>
                <button onClick={clearRecording} className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow`}>Borrar registros</button>
              </div>
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

              {/* Tipo de modelo (fijo: Vocales) */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Tipo de modelo</div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white border border-indigo-600">
                    <span className="h-2 w-2 rounded-full bg-white/90" /> Vocales
                  </span>
                </div>
              </div>

              {/* Teclado Vocales */}
              <div>
                <div className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Etiqueta</div>
                <div className="grid grid-cols-10 gap-2">
                  {keys.map((k) => (
                    <button key={k} onClick={() => setVocalVinculada(k)} className={`h-10 rounded-md text-sm border ${vocalVinculada === k ? 'bg-indigo-600 text-white border-indigo-600' : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700' : 'bg-white border-slate-200 text-header hover:bg-slate-50')}`}>{k}</button>
                  ))}
                </div>
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Etiqueta actual: <span className="font-semibold">{vocalVinculada}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
