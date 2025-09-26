import { useEffect, useState } from 'react'
import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useLocation } from 'react-router-dom'

type ModelKey = 'vocales' | 'abecedario' | 'numeros' | 'operaciones'

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

export default function TrainModel() {
  const { isDarkMode } = useTheme()
  const location = useLocation()
  const [selected, setSelected] = useState<ModelKey>('abecedario')
  const [epochs, setEpochs] = useState(10)
  const [batch, setBatch] = useState(8)
  const [learningRate, setLearningRate] = useState(0.001)
  const [showConfirm, setShowConfirm] = useState(false)
  const [barData, setBarData] = useState<{ label: string; value: number }[]>([])
  const [regData, setRegData] = useState<{ x: number; y: number }[]>([])

  // Read ?model to preselect card
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const model = (params.get('model') || '').toLowerCase()
    if (model === 'vocales' || model === 'abecedario' || model === 'numeros' || model === 'operaciones') {
      setSelected(model as ModelKey)
    }
  }, [location.search])

  // Cargar conteos (simulado por ahora; puede integrarse a backend real)
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await fetch('/operaciones/gestos_entrenados')
        if (!res.ok) throw new Error('err')
        const data = await res.json()
        const gestos = Array.isArray(data?.gestos) ? data.gestos : []
        const counts: Record<string, number> = {}
        gestos.forEach((g: any) => { counts[g?.label || 'otro'] = (counts[g?.label || 'otro'] || 0) + 1 })
        const arr = Object.entries(counts).map(([label, value]) => ({ label, value }))
        setBarData(arr.sort((a, b) => b.value - a.value).slice(0, 12))
      } catch {
        setBarData([])
      }
    }
    loadCounts()
  }, [selected])

  const models: { key: ModelKey; title: string; desc: string; emoji: string; color: string }[] = [
    { key: 'vocales', title: 'Vocales', desc: 'A, E, I, O, U', emoji: '🗣️', color: 'from-emerald-400 to-emerald-600' },
    { key: 'abecedario', title: 'Abecedario', desc: 'A - Z', emoji: '🔤', color: 'from-blue-400 to-blue-600' },
    { key: 'numeros', title: 'Números', desc: '1 - 50', emoji: '🔢', color: 'from-purple-400 to-purple-600' },
    { key: 'operaciones', title: 'Operaciones', desc: 'Básicas', emoji: '➕', color: 'from-orange-400 to-orange-600' },
  ]

  const onTrain = () => {
    // Simular datos de regresión dependiendo de parámetros
    const N = 20
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

  const Card = ({ m }: { m: typeof models[number] }) => (
    <button onClick={() => setSelected(m.key)} className={`rounded-xl overflow-hidden border shadow transition transform hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} ${selected === m.key ? 'ring-2 ring-indigo-500' : ''}`}>
      <div className={`h-16 bg-gradient-to-r ${m.color} relative`}>
        <div className="absolute top-2 left-2 w-5 h-5 bg-white/30 rounded-full" />
        <div className="absolute top-2 right-2 w-10 h-1.5 bg-white/40 rounded-full" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl">{m.emoji}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Registros</div>
        </div>
        <div className={`mt-1 font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{m.title}</div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{m.desc}</div>
      </div>
    </button>
  )

  const BarChart = ({ data }: { data: { label: string; value: number }[] }) => (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}> 
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Distribución de datos (Top 12)</div>
      <div className="mt-3 grid grid-cols-12 gap-2 items-end h-48">
        {data.length === 0 ? (
          <div className={`col-span-12 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin datos</div>
        ) : data.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-full flex-1 flex items-end">
              <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${Math.min(100, d.value)}%` }} />
            </div>
            <div className="mt-1 text-[10px] truncate max-w-[60px]" title={d.label}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const RegressionChart = ({ data }: { data: { x: number; y: number }[] }) => (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}> 
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Regresión de precisión por época</div>
      <div className="mt-3 h-48 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* eje */}
          <line x1="5" y1="95" x2="95" y2="95" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="5" y1="5" x2="5" y2="95" stroke="#94a3b8" strokeWidth="0.5" />
          {/* línea */}
          {data.map((p, i) => (
            i === 0 ? null : (
              <line key={i} x1={(i-1)*(90/(data.length-1))+5} y1={95 - data[i-1].y*80} x2={i*(90/(data.length-1))+5} y2={95 - p.y*80} stroke="#6366f1" strokeWidth="0.8" />
            )
          ))}
          {/* puntos */}
          {data.map((p, i) => (
            <circle key={i} cx={i*(90/(data.length-1))+5} cy={95 - p.y*80} r="1.2" fill="#22c55e" />
          ))}
        </svg>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Entrenar Modelo</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Selecciona un modelo, configura los parámetros y entrena visualizando las métricas.</p>
          </div>

          {/* Cards arriba */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {models.map(m => <Card key={m.key} m={m} />)}
          </div>

          {/* Panel de control a la izquierda y gráficos a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Config lateral */}
            <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-header'}`}>Configuración</div>
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
                
                {/* Resultados del entrenamiento - Solo mostrar cuando hay datos */}
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
            </div>

            {/* Gráficos a la derecha */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <BarChart data={barData} />
              <RegressionChart data={regData} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal open={showConfirm} onClose={()=>setShowConfirm(false)} title="Entrenamiento completado" message="El entrenamiento ha finalizado. Revisa los resultados en el gráfico de regresión." isDarkMode={isDarkMode} />
    </Layout>
  )
}
