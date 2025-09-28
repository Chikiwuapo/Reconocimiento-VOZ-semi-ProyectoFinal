import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useState } from 'react'

export default function TrainModelPalabras() {
  const { isDarkMode } = useTheme()
  const [epochs, setEpochs] = useState(20)
  const [batch, setBatch] = useState(8)
  const [learningRate, setLearningRate] = useState(0.001)
  const [regData, setRegData] = useState<{ x: number; y: number }[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const onTrain = () => {
    const N = Math.max(10, Math.min(50, epochs))
    const pts = Array.from({ length: N }, (_, i) => {
      const x = i + 1
      const noise = (Math.random() - 0.5) * (0.1 + (1 / (epochs + 1)))
      const base = 0.6 + Math.min(0.35, Math.log10(epochs + batch) / 5)
      const y = Math.max(0.5, Math.min(0.99, base + noise))
      return { x, y: parseFloat(y.toFixed(3)) }
    })
    setRegData(pts)
    setShowConfirm(true)
  }

  return (
    <Layout>
      <div className="container-page py-6">
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Entrenar modelo - Palabras</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Configura parámetros y visualiza la curva de precisión.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
            <div className="text-sm font-semibold">Parámetros</div>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Épocas</label>
                <input type="number" min={1} max={200} value={epochs} onChange={(e)=>setEpochs(parseInt(e.target.value||'1'))} className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'}`} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Batch size</label>
                <input type="number" min={1} max={128} value={batch} onChange={(e)=>setBatch(parseInt(e.target.value||'1'))} className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'}`} />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Learning rate</label>
                <input type="number" step={0.0001} min={0.0001} max={0.1} value={learningRate} onChange={(e)=>setLearningRate(parseFloat(e.target.value||'0.001'))} className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'}`} />
              </div>
              <button onClick={onTrain} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow">Entrenar</button>
            </div>

            {regData.length > 0 && (
              <div className={`mt-4 rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Resultados</div>
                <div className="space-y-2 text-xs">
                  <div className={`${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                    Última precisión: <span className="font-semibold text-emerald-600">{(regData[regData.length-1].y * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                    Mejor precisión: <span className="font-semibold text-emerald-600">{(Math.max(...regData.map(p=>p.y)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <RegressionChart data={regData} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal title="Entrenamiento completado" message="El entrenamiento ha finalizado. Revisa los resultados en el gráfico de regresión." onClose={()=>setShowConfirm(false)} isDarkMode={isDarkMode} />
      )}
    </Layout>
  )
}

function RegressionChart({ data, isDarkMode }: { data: { x: number; y: number }[]; isDarkMode: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Regresión de precisión por época</div>
      <div className="mt-3 h-56 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <line x1="5" y1="95" x2="95" y2="95" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="5" y1="5" x2="5" y2="95" stroke="#94a3b8" strokeWidth="0.5" />
          {data.map((p, i) => i === 0 ? null : (
            <line key={i} x1={(i-1)*(90/(data.length-1))+5} y1={95 - data[i-1].y*80} x2={i*(90/(data.length-1))+5} y2={95 - p.y*80} stroke="#6366f1" strokeWidth="0.8" />
          ))}
          {data.map((p, i) => (
            <circle key={i} cx={i*(90/(data.length-1))+5} cy={95 - p.y*80} r="1.2" fill="#22c55e" />
          ))}
        </svg>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, onClose, isDarkMode }: { title: string; message: string; onClose: ()=>void; isDarkMode: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md rounded-xl p-5 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
        <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{title}</div>
        <div className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-2`}>{message}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">Entendido</button>
        </div>
      </div>
    </div>
  )
}
