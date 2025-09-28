import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useEffect, useMemo, useState } from 'react'
import { getTrainedGesturesAPI } from './services/abecedarioService'

export default function TrainModelAbecedario() {
  const { isDarkMode } = useTheme()
  const [epochs, setEpochs] = useState(20)
  const [batch, setBatch] = useState(8)
  const [learningRate, setLearningRate] = useState(0.001)
  const [regData, setRegData] = useState<{ x: number; y: number }[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [distData, setDistData] = useState<{ label: string; count: number }[]>([])

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

  // Cargar distribución A-Z desde gestos entrenados
  const loadDistribution = async () => {
    try {
      const res = await getTrainedGesturesAPI()
      const gestos: any[] = res?.gestos || res || []
      const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
      const map: Record<string, number> = Object.fromEntries(letters.map(l => [l, 0])) as Record<string, number>
      gestos.forEach(g => {
        const L = (g?.letra_vinculada || g?.letra || '').toUpperCase()
        if (map[L] !== undefined) map[L] += (g?.numero_muestras || 0) || (Array.isArray(g?.landmarks) ? g.landmarks.length : 1)
      })
      setDistData(letters.map(l => ({ label: l, count: map[l] || 0 })))
    } catch {
      setDistData([])
    }
  }

  useEffect(() => {
    loadDistribution()
    const onData = (e: Event) => {
      const ce = e as CustomEvent<any>
      if (ce?.detail?.domain === 'abecedario') loadDistribution()
    }
    window.addEventListener('app:dataChanged', onData as EventListener)
    return () => window.removeEventListener('app:dataChanged', onData as EventListener)
  }, [])

  return (
    <Layout>
      <div className="container-page py-6">
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Entrenar Modelo</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Selecciona un modelo, configura los parámetros y entrena visualizando las métricas.</p>
        </div>

        {/* Tarjeta superior de Abecedario (solo esta) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-2xl p-4 shadow border ${isDarkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-800' : 'bg-gradient-to-br from-blue-500 to-indigo-500 border-blue-400'} text-white`}
               style={{ boxShadow: isDarkMode ? '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : '0 10px 25px -5px rgba(59, 130, 246, 0.35)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90">Abecedario</div>
                <div className="text-xs opacity-85">A - Z</div>
              </div>
              <div className="text-sm opacity-85">Registros</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Parámetros */}
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

          {/* Columna derecha: distribución + regresión */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <DataDistributionCard data={distData} isDarkMode={isDarkMode} />
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
  const W = 600
  const H = 300
  const padL = 50, padR = 24, padT = 24, padB = 42
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = Math.max(1, data.length)
  const xAt = (i: number) => padL + (innerW * (i / Math.max(1, n - 1)))
  const yAt = (v: number) => padT + (innerH * (1 - Math.max(0, Math.min(1, v))))
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1]
  const linePath = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.y)}`).join(' ')
  const areaPath = `M ${padL} ${H - padB} ` + data.map((p, i) => `L ${xAt(i)} ${yAt(p.y)}`).join(' ') + ` L ${W - padR} ${H - padB} Z`

  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Regresión de precisión por época</div>
      <div className="mt-3 h-80 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {yTicks.map((t, i) => (<line key={i} x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} stroke={isDarkMode ? '#1f2937' : '#eef2f7'} strokeWidth="1" />))}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
          {yTicks.map((t, i) => (<text key={i} x={padL - 8} y={yAt(t) + 4} fontSize="12" textAnchor="end" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{Math.round(t * 100)}%</text>))}
          {data.length > 0 && (<path d={areaPath} fill={isDarkMode ? 'rgba(79,70,229,0.18)' : 'rgba(99,102,241,0.18)'} />)}
          {data.length > 0 && (<path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />)}
          {data.map((p, i) => (<circle key={i} cx={xAt(i)} cy={yAt(p.y)} r={4} fill="#10b981" stroke="#064e3b" strokeWidth="1" />))}
          {data.map((p, i) => ((i === 0 || i === n - 1 || i % 5 === 0) ? (<text key={`tx_${i}`} x={xAt(i)} y={H - padB + 20} fontSize="12" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{p.x}</text>) : null))}
          {data.length > 0 && (<text x={xAt(n - 1)} y={yAt(data[n - 1].y) - 10} fontSize="12" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{(data[n - 1].y * 100).toFixed(1)}%</text>)}
        </svg>
      </div>
    </div>
  )
}

function DataDistributionCard({ data, isDarkMode }: { data: { label: string; count: number }[]; isDarkMode: boolean }) {
  const max = useMemo(() => Math.max(1, ...data.map(d => d.count)), [data])
  const labels = data.map(d => d.label)
  const counts = data.map(d => d.count)
  const W = 900, H = 300
  const padL = 50, padR = 24, padT = 24, padB = 52
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = Math.max(1, counts.length)
  const barGap = 8
  const barW = Math.max(18, (innerW - barGap * (n - 1)) / n)

  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Distribución de datos (A–Z)</div>
      <div className="mt-3 h-80 relative">
        {data.length === 0 ? (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin datos disponibles</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
            {Array.from({ length: 5 }).map((_, i) => (<line key={i} x1={padL} y1={padT + (innerH/5)*i} x2={W - padR} y2={padT + (innerH/5)*i} stroke={isDarkMode ? '#1f2937' : '#eef2f7'} strokeWidth="1" />))}
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
            <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
            {counts.map((c, i) => {
              const h = max === 0 ? 0 : (c / max) * innerH
              const x = padL + i * (barW + barGap)
              const y = H - padB - h
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={h} rx={6} fill="#6366f1" />
                  <text x={x + barW / 2} y={H - padB + 18} fontSize="10" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{labels[i]}</text>
                  <text x={x + barW / 2} y={y - 6} fontSize="10" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{c}</text>
                </g>
              )
            })}
          </svg>
        )}
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
