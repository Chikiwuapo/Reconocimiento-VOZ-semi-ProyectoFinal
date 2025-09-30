import Layout from '../../../components/Blackboard/Layout'
import { useTheme } from '../../../App'
import { useEffect, useMemo, useState, useRef } from 'react'
import { getWordStatsAPI, getCapturedWordsAPI } from './services/palabrasService'

export default function TrainModelPalabras() {
  const { isDarkMode } = useTheme()
  const [epochs, setEpochs] = useState(20)
  const [batch, setBatch] = useState(8)
  const [learningRate, setLearningRate] = useState(0.001)
  const [regData, setRegData] = useState<{ x: number; y: number }[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [distData, setDistData] = useState<{ label: string; count: number }[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const onTrain = () => {
    if (isTraining) return
    
    setIsTraining(true)
    setCurrentEpoch(0)
    setRegData([])
    
    const N = Math.max(10, Math.min(50, epochs))
    let epochCount = 0
    
    // Simular entrenamiento en tiempo real
    intervalRef.current = setInterval(() => {
      epochCount++
      setCurrentEpoch(epochCount)
      
      // Generar punto de precisión realista
      const noise = (Math.random() - 0.5) * (0.1 + (1 / (epochs + 1)))
      const base = 0.6 + Math.min(0.35, Math.log10(epochs + batch) / 5)
      const progressFactor = Math.min(1, epochCount / N)
      const y = Math.max(0.5, Math.min(0.99, base + noise + (progressFactor * 0.2)))
      
      const newPoint = { x: epochCount, y: parseFloat(y.toFixed(3)) }
      
      setRegData(prev => [...prev, newPoint])
      
      if (epochCount >= N) {
        setIsTraining(false)
        setShowConfirm(true)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, 200) // Actualizar cada 200ms para efecto en tiempo real
  }

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Cargar estadísticas de distribución por palabra desde backend
  const loadDistribution = async () => {
    try {
      const res = await getCapturedWordsAPI()
      const palabras: any[] = res?.palabras || res || []
      
      // Agrupar por palabra y contar muestras
      const wordMap: Record<string, number> = {}
      palabras.forEach(p => {
        const palabra = (p?.palabra_vinculada || '').toLowerCase()
        if (palabra) {
          wordMap[palabra] = (wordMap[palabra] || 0) + (p?.numero_muestras || 1)
        }
      })
      
      // Convertir a array y tomar las top 12 palabras
      const entries = Object.entries(wordMap)
        .map(([label, count]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
      
      setDistData(entries)
    } catch {
      try {
        const stats = await getWordStatsAPI()
        const byWord = stats?.estadisticas?.por_palabra || {}
        const entries: { label: string; count: number }[] = Object.entries(byWord)
          .map(([k, v]: [string, any]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), count: v?.total ?? 0 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
        setDistData(entries)
      } catch {}
    }
  }

  useEffect(() => {
    loadDistribution()
    const onData = (e: Event) => {
      const ce = e as CustomEvent<any>
      const d = ce?.detail || {}
      if (d?.domain === 'palabras') loadDistribution()
    }
    const onFocus = () => { loadDistribution() }
    window.addEventListener('app:dataChanged', onData as EventListener)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('app:dataChanged', onData as EventListener)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  return (
    <Layout>
      <div className="container-page py-6">
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>Entrenar modelo - Palabras</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-slate-600'} mt-1`}>Configura parámetros y visualiza la curva de precisión en tiempo real.</p>
        </div>

        {/* Tarjeta del modelo seleccionado (solo Palabras) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className={`rounded-2xl p-4 border-2 ${isDarkMode ? 'bg-gray-900 border-indigo-500/60' : 'bg-white border-indigo-500/60'} shadow-soft` }>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-xl">💬</div>
                <div>
                  <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>Palabras</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-xs`}>Gestos de palabras</div>
                </div>
              </div>
              <div className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'} text-xs`}>Registros</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={`rounded-2xl p-4 shadow ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-slate-200'}`}>
            <div className="text-sm font-semibold">Parámetros</div>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Épocas</label>
                <input 
                  type="number" 
                  min={1} 
                  max={200} 
                  value={epochs} 
                  onChange={(e)=>setEpochs(parseInt(e.target.value||'1'))} 
                  disabled={isTraining}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'} ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`} 
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Batch size</label>
                <input 
                  type="number" 
                  min={1} 
                  max={128} 
                  value={batch} 
                  onChange={(e)=>setBatch(parseInt(e.target.value||'1'))} 
                  disabled={isTraining}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'} ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`} 
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Learning rate</label>
                <input 
                  type="number" 
                  step={0.0001} 
                  min={0.0001} 
                  max={0.1} 
                  value={learningRate} 
                  onChange={(e)=>setLearningRate(parseFloat(e.target.value||'0.001'))} 
                  disabled={isTraining}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-300 text-slate-800'} ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`} 
                />
              </div>
              <button 
                onClick={onTrain} 
                disabled={isTraining}
                className={`w-full h-11 rounded-xl text-white shadow transition-all duration-200 ${
                  isTraining 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
                {isTraining ? `Entrenando... (${currentEpoch}/${epochs})` : 'Entrenar'}
              </button>
            </div>

            {regData.length > 0 && (
              <div className={`mt-4 rounded-lg p-3 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Resultados en tiempo real</div>
                <div className="space-y-2 text-xs">
                  <div className={`${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>
                    Época actual: <span className="font-semibold text-blue-600">{currentEpoch}</span>
                  </div>
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
            <DataDistributionCard data={distData} isDarkMode={isDarkMode} />
            <RegressionChart data={regData} isDarkMode={isDarkMode} isTraining={isTraining} />
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal title="Entrenamiento completado" message="El entrenamiento ha finalizado. Revisa los resultados en el gráfico de regresión." onClose={()=>setShowConfirm(false)} isDarkMode={isDarkMode} />
      )}
    </Layout>
  )
}

function RegressionChart({ data, isDarkMode, isTraining }: { data: { x: number; y: number }[]; isDarkMode: boolean; isTraining: boolean }) {
  // Dimensiones del gráfico
  const W = 600
  const H = 300
  const padL = 60  // Aumentado para acomodar porcentajes
  const padR = 24
  const padT = 24
  const padB = 50  // Aumentado para etiquetas del eje X
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const maxEpochs = Math.max(20, data.length > 0 ? Math.max(...data.map(p => p.x)) : 20)
  
  const xAt = (epoch: number) => padL + (innerW * (epoch - 1) / Math.max(1, maxEpochs - 1))
  const yAt = (val: number) => padT + (innerH * (1 - Math.max(0, Math.min(1, val))))
  
  // Ticks del eje Y en porcentajes
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
  
  // Ticks del eje X (épocas)
  const xTicks = []
  for (let i = 1; i <= maxEpochs; i += Math.max(1, Math.floor(maxEpochs / 10))) {
    xTicks.push(i)
  }
  if (xTicks[xTicks.length - 1] !== maxEpochs) {
    xTicks.push(maxEpochs)
  }

  // Path para el área bajo la curva y la línea
  const linePath = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(p.x)} ${yAt(p.y)}`).join(' ')
  const areaPath = data.length > 0 ? 
    `M ${xAt(data[0].x)} ${padT + innerH} ` +
    data.map((p) => `L ${xAt(p.x)} ${yAt(p.y)}`).join(' ') +
    ` L ${xAt(data[data.length - 1].x)} ${padT + innerH} Z` : ''

  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>
          Regresión de precisión por época
        </div>
        {isTraining && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>En tiempo real</span>
          </div>
        )}
      </div>
      
      <div className="h-80 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {/* Grid horizontal */}
          {yTicks.map((t, i) => {
            const y = yAt(t)
            return (
              <line 
                key={`hgrid-${i}`} 
                x1={padL} 
                y1={y} 
                x2={W - padR} 
                y2={y} 
                stroke={isDarkMode ? '#1f2937' : '#f1f5f9'} 
                strokeWidth="1" 
                strokeDasharray={t === 0 ? "none" : "2,2"}
              />
            )
          })}
          
          {/* Grid vertical */}
          {xTicks.map((epoch, i) => {
            const x = xAt(epoch)
            return (
              <line 
                key={`vgrid-${i}`} 
                x1={x} 
                y1={padT} 
                x2={x} 
                y2={H - padB} 
                stroke={isDarkMode ? '#1f2937' : '#f1f5f9'} 
                strokeWidth="1" 
                strokeDasharray="2,2"
              />
            )
          })}
          
          {/* Ejes principales */}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
          
          {/* Etiquetas de eje Y (porcentajes) */}
          {yTicks.map((t, i) => (
            <text 
              key={`ylabel-${i}`} 
              x={padL - 12} 
              y={yAt(t) + 4} 
              fontSize="11" 
              textAnchor="end" 
              fill={isDarkMode ? '#cbd5e1' : '#475569'}
              fontWeight="500"
            >
              {Math.round(t * 100)}%
            </text>
          ))}
          
          {/* Etiquetas de eje X (épocas) */}
          {xTicks.map((epoch, i) => (
            <text 
              key={`xlabel-${i}`} 
              x={xAt(epoch)} 
              y={H - padB + 20} 
              fontSize="11" 
              textAnchor="middle" 
              fill={isDarkMode ? '#cbd5e1' : '#475569'}
              fontWeight="500"
            >
              {epoch}
            </text>
          ))}

          {/* Área bajo la curva con gradiente */}
          {data.length > 0 && (
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          )}
          
          {data.length > 0 && (
            <path 
              d={areaPath} 
              fill="url(#areaGradient)" 
              className={isTraining ? "animate-pulse" : ""}
            />
          )}
          
          {/* Línea principal */}
          {data.length > 0 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3" 
              strokeLinejoin="round" 
              strokeLinecap="round"
              className={isTraining ? "animate-pulse" : ""}
              style={{
                filter: isTraining ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' : 'none'
              }}
            />
          )}
          
          {/* Puntos */}
          {data.map((p, i) => (
            <g key={`point-${i}`}>
              <circle 
                cx={xAt(p.x)} 
                cy={yAt(p.y)} 
                r={isTraining && i === data.length - 1 ? 6 : 4} 
                fill="#10b981" 
                stroke="#ffffff" 
                strokeWidth="2"
                className={isTraining && i === data.length - 1 ? "animate-pulse" : ""}
                style={{
                  filter: isTraining && i === data.length - 1 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' : 'none'
                }}
              />
              {/* Tooltip con valor */}
              {(i === data.length - 1 || i === 0 || i % 5 === 0) && (
                <text 
                  x={xAt(p.x)} 
                  y={yAt(p.y) - 12} 
                  fontSize="10" 
                  textAnchor="middle" 
                  fill={isDarkMode ? '#cbd5e1' : '#475569'}
                  fontWeight="600"
                >
                  {(p.y * 100).toFixed(1)}%
                </text>
              )}
            </g>
          ))}
          
          {/* Título del eje X */}
          <text 
            x={padL + innerW / 2} 
            y={H - 8} 
            fontSize="12" 
            textAnchor="middle" 
            fill={isDarkMode ? '#9ca3af' : '#64748b'}
            fontWeight="500"
          >
            Épocas
          </text>
          
          {/* Título del eje Y */}
          <text 
            x={15} 
            y={padT + innerH / 2} 
            fontSize="12" 
            textAnchor="middle" 
            fill={isDarkMode ? '#9ca3af' : '#64748b'}
            fontWeight="500"
            transform={`rotate(-90, 15, ${padT + innerH / 2})`}
          >
            Precisión (%)
          </text>
        </svg>
        
        {/* Mensaje cuando no hay datos */}
        {data.length === 0 && (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">Presiona "Entrenar" para ver el progreso en tiempo real</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DataDistributionCard({ data, isDarkMode }: { data: { label: string; count: number }[]; isDarkMode: boolean }) {
  const max = useMemo(() => Math.max(1, ...data.map(d => d.count)), [data])
  const labels = data.map(d => d.label)
  const counts = data.map(d => d.count)
  // dimensiones del gráfico (más grandes para legibilidad)
  const W = 600
  const H = 300
  const padL = 50
  const padR = 24
  const padT = 24
  const padB = 42
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = Math.max(1, counts.length)
  const barGap = 16
  const barW = Math.max(24, (innerW - barGap * (n - 1)) / n)

  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} shadow`}>
      <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-header'}`}>Distribución de palabras (Top 12)</div>
      <div className="mt-3 h-80 relative">
        {data.length === 0 ? (
          <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sin datos disponibles</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
            {/* grid horizontal */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = padT + (innerH / 5) * i
              return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke={isDarkMode ? '#1f2937' : '#eef2f7'} strokeWidth="1" />
            })}
            {/* ejes */}
            <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
            <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeWidth="2" />
            {/* barras */}
            {counts.map((c, i) => {
              const h = max === 0 ? 0 : (c / max) * innerH
              const x = padL + i * (barW + barGap)
              const y = H - padB - h
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={h} rx={6} fill="#6366f1" />
                  {/* etiqueta */}
                  <text x={x + barW / 2} y={H - padB + 20} fontSize="12" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{labels[i]}</text>
                  {/* valor */}
                  <text x={x + barW / 2} y={y - 8} fontSize="12" textAnchor="middle" fill={isDarkMode ? '#cbd5e1' : '#475569'}>{c}</text>
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
