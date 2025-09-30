import { useEffect } from 'react'
import Layout from '../../../../components/Blackboard/Layout'
import { useTheme } from '../../../../App'
import { useArithmetic } from '../hooks/useArithmetic'
import CameraPanel from '../../../../components/Blackboard/Arithmetic/CameraPanel'
import PracticeStats from '../../../../components/Blackboard/Arithmetic/Practice/PracticeStats'
import ConfidenceBar from '../../../../components/Blackboard/Arithmetic/Practice/ConfidenceBar'

export default function PracticeNumeros() {
  const { isDarkMode } = useTheme()
  const { videoRef, canvasRef, cameraActive, rightDetected, leftDetected, startCamera, stopCamera, recognizeCurrent, clearOperation, confidence, expresion, mpReady } = useArithmetic()

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
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Practicar: Números</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Visualiza el número detectado y su nivel de confianza.</p>
          </div>

          <div className="mb-6">
            <PracticeStats isDarkMode={isDarkMode} model="numeros" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <CameraPanel videoRef={videoRef} canvasRef={canvasRef} cameraActive={cameraActive} rightDetected={rightDetected} leftDetected={leftDetected} isDarkMode={isDarkMode} />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={recognizeCurrent} className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow">Reconocer</button>
                <button onClick={clearOperation} className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} h-12 rounded-xl shadow`}>Limpiar</button>
              </div>
              <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow flex items-center justify-between`}>
                <div className={`${isDarkMode ? 'text-white' : 'text-header'} text-5xl font-extrabold tracking-wide`}>{(expresion || '').slice(0,2) || '—'}</div>
                <div className="flex-1 ml-6"><ConfidenceBar value={confidence} isDarkMode={isDarkMode} /></div>
              </div>
            </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
