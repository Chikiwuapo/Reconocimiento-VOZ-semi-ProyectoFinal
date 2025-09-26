import { useEffect, useState } from 'react'
import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useArithmetic } from './hooks/useArithmetic'
import CameraPanel from '../../../components/Blackboard/Arithmetic/CameraPanel'

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

export default function PracticeModel() {
  const { isDarkMode } = useTheme()
  const {
    videoRef, canvasRef,
    cameraActive, rightDetected, leftDetected,
    startCamera, stopCamera, recognizeCurrent, clearOperation, calculateFromOperation,
    expresion, resultado, mpReady,
  } = useArithmetic()

  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')

  // Auto activar cámara al entrar (espera a mpReady)
  useEffect(() => {
    if (mpReady && !cameraActive) startCamera()
    return () => { stopCamera() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mpReady])

  const onRecognize = async () => {
    await recognizeCurrent()
    setConfirmMsg('Se realizó el reconocimiento con éxito.')
    setShowConfirm(true)
  }

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Prácticar Modelo</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Usa tu cámara para probar el modelo y observar resultados en tiempo real.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cámara */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <CameraPanel 
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraActive={cameraActive}
                rightDetected={rightDetected}
                leftDetected={leftDetected}
                isDarkMode={isDarkMode}
              />

              <div className="grid grid-cols-3 gap-3">
                <button onClick={onRecognize} className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow">Reconocer</button>
                <button onClick={clearOperation} className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow`}>Limpiar</button>
                <button onClick={calculateFromOperation} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow">Calcular</button>
              </div>
            </div>

            {/* Panel lateral */}
            <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-header'}`}>Panel</div>
              <div className="mt-3 space-y-3 text-sm">
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Detección de manos</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`rounded-md px-3 py-2 ${leftDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Izquierda: {leftDetected ? 'Sí' : 'No'}</div>
                    <div className={`rounded-md px-3 py-2 ${rightDetected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-700 border border-slate-200')}`}>Derecha: {rightDetected ? 'Sí' : 'No'}</div>
                  </div>
                </div>

                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Expresión detectada</div>
                  <div className={`${isDarkMode ? 'text-gray-100' : 'text-header'} mt-1 font-semibold break-words`}>{expresion || '—'}</div>
                </div>

                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Resultado</div>
                  <div className={`${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'} mt-1 font-semibold`}>{resultado ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal open={showConfirm} onClose={()=>setShowConfirm(false)} title="Reconocimiento realizado" message={confirmMsg} isDarkMode={isDarkMode} />
    </Layout>
  )
}
