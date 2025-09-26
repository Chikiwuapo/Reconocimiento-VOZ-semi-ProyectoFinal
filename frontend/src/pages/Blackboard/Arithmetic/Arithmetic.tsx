import Layout from '../../../components/Blackboard/Layout'
import { useArithmetic } from './hooks/useArithmetic'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../../App'
import { useLocation } from 'react-router-dom'

type Mode = 'capture'|'train'|'practice'|'default'

export default function Arithmetic({ modeOverride }: { modeOverride?: Mode } = {}) {
  const { isDarkMode } = useTheme()
  const location = useLocation()
  const [uiMode, setUiMode] = useState<Mode>('default')
  const {
    // refs
    videoRef, canvasRef,
    // estado principal
    cameraActive, recording, confidence, rightDetected, leftDetected,
    samplesTarget, samplesCaptured, gestureMode, numeroVinculado, operacionVinculada,
    operando1, operador, operando2, loadingCalc, resultado, expresion, error,
    activeTab, trainedGestures,
    // setters
    setGestureMode, setNumeroVinculado, setOperacionVinculada,
    setOperando1, setOperador, setOperando2,
    setActiveTab,
    // acciones
    startCamera, stopCamera, toggleRecording, saveGesture, saveGestureTwoHands, recognizeCurrent,
    clearOperation, calculateFromOperation, calcular,
    // util
    currentOperationRef, mpReady,
  } = useArithmetic()

  // UI de entrenamiento (simulación visual) – no altera la lógica de guardado
  const [trainUIVisible, setTrainUIVisible] = useState(false)
  const [trainProgress, setTrainProgress] = useState(0)
  const [trainSeries, setTrainSeries] = useState<number[]>([])
  const [trainModalOpen, setTrainModalOpen] = useState(false)
  const timerRef = useRef<number | null>(null)

  const startTrainingUI = () => {
    // Muestra contenedor, reinicia progreso y serie
    setTrainUIVisible(true)
    setTrainProgress(0)
    setTrainSeries([0])
    if (timerRef.current) window.clearInterval(timerRef.current)
    // Simular incremento con jitter hasta 100%
    timerRef.current = window.setInterval(() => {
      setTrainProgress(prev => {
        const next = Math.min(100, prev + Math.random() * 8 + 4)
        setTrainSeries(s => [...s, Math.round(next)])
        if (next >= 100) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          timerRef.current = null
          setTrainModalOpen(true)
        }
        return next
      })
    }, 300)
  }

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current) }, [])

  // Sync UI mode from props or query param and set active tab accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const modeParam = (params.get('mode') || '').toLowerCase()
    const mode = (modeOverride || modeParam) as Mode
    if (mode === 'capture') {
      setUiMode('capture')
      setActiveTab('train')
    } else if (mode === 'train') {
      setUiMode('train')
      setActiveTab('train')
    } else if (mode === 'practice') {
      setUiMode('practice')
      setActiveTab('test')
    } else {
      setUiMode('default')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, modeOverride])

  return (
    <>
    <Layout>
      <div className={`min-h-[85vh] p-6 transition-colors ${isDarkMode ? 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-orange-600">➕</span>
              Operaciones Aritméticas
            </h1>
            <div className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${cameraActive ? (isDarkMode ? 'border-emerald-700 bg-emerald-900/30 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-700') : (isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600')}`}>
                <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500' : (isDarkMode ? 'bg-gray-500' : 'bg-gray-400')}`}></span>
                Cámara {cameraActive ? 'activa' : 'inactiva'}
              </span>
              <span className="hidden md:inline">Confianza:</span>
              <span className="font-semibold">{(confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className={`inline-flex rounded-2xl overflow-hidden border shadow ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <button onClick={() => setActiveTab('train')} className={`px-6 py-2 text-sm font-semibold ${activeTab==='train' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}>Entrenamiento</button>
            <button onClick={() => setActiveTab('test')} className={`px-6 py-2 text-sm font-semibold ${activeTab==='test' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')}`}>Prueba</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className={`rounded-3xl shadow-xl p-5 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}>{activeTab==='train' ? 'Entrenamiento' : 'Prueba'} con Cámara</h2>
                <div className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Confianza: {(confidence * 100).toFixed(0)}%</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-black w-full aspect-[4/3] sm:aspect-video mx-auto ring-1 ring-black/10">
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                <div className={`absolute top-2 right-2 backdrop-blur px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-gray-900/70 text-gray-200' : 'bg-white/80 text-gray-700'}`}>{leftDetected?'✋':'—'} {rightDetected?'🤚':'—'}</div>
                {recording && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs">Grabando... {samplesCaptured}</span>
                  </div>
                )}
                {recording && !leftDetected && !rightDetected && (
                  <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                    No se detectan manos. Acerca tu mano a la cámara.
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {!cameraActive ? (
                  <button type="button" onClick={startCamera} disabled={!mpReady} className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1">Iniciar Cámara</button>
                ) : (
                  <button type="button" onClick={stopCamera} className="bg-rose-600 hover:bg-rose-700 text-white px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1">Detener Cámara</button>
                )}
                {activeTab === 'train' && (
                  <>
                    {/* Capture button always available in train tab */}
                    <button type="button" disabled={!cameraActive} onClick={toggleRecording} className={`px-4 h-12 rounded-xl text-white shadow col-span-2 md:col-span-1 ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
                      {recording ? 'Detener Grabación' : 'Grabar Gesto'}
                    </button>
                    {/* Conditional actions per uiMode */}
                    {(uiMode === 'capture') && (
                      <button
                        type="button"
                        onClick={() => { saveGesture(); /* no training UI in capture-only */ }}
                        title={samplesCaptured === 0 ? 'Graba algunas muestras antes de guardar' : 'Guardar muestras'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1"
                      >
                        Guardar Muestras
                      </button>
                    )}
                    {(uiMode === 'train' || uiMode === 'default') && (
                      <>
                        <button
                          type="button"
                          onClick={() => { saveGesture(); startTrainingUI() }}
                          title={samplesCaptured === 0 ? 'Graba algunas muestras antes de guardar' : 'Entrenará el modelo y guardará los registros'}
                          className="bg-violet-600 hover:bg-violet-700 text-white px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1"
                        >
                          Entrenar Modelo
                        </button>
                        <button
                          type="button"
                          onClick={() => { saveGestureTwoHands(); startTrainingUI() }}
                          title="Exige que haya frames con ambas manos visibles durante la grabación"
                          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1"
                        >
                          Entrenar 2 manos
                        </button>
                        <div className="hidden md:block" />
                      </>
                    )}
                  </>
                )}
                {activeTab === 'test' && (
                  <>
                    <button type="button" onClick={recognizeCurrent} disabled={false} className="px-4 h-12 rounded-xl bg-indigo-600 text-white shadow col-span-2 md:col-span-1">Reconocer gesto actual</button>
                    <button type="button" onClick={clearOperation} className={`px-4 h-12 rounded-xl shadow col-span-2 md:col-span-1 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>Limpiar operación</button>
                    <button type="button" onClick={calculateFromOperation} className="px-4 h-12 rounded-xl bg-emerald-600 text-white shadow col-span-2 md:col-span-1">Calcular con operación</button>
                    {/* Spacer for symmetry to keep buttons equal-sized */}
                    <div className="hidden md:block" />
                  </>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-100'}`}>Objetivo: <b>{samplesTarget}</b></div>
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-100'}`}>Capturadas: <b>{samplesCaptured}</b></div>
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-100'}`}>Progreso: <b>{Math.min(100, Math.round((samplesCaptured / Math.max(1, samplesTarget)) * 100))}%</b></div>
              </div>

              {/* Legacy training chart removed per request */}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-xl p-6 space-y-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : ''}`}>Panel de Control</h3>
                <div className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manos detectadas:</div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${leftDetected ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-800') : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>Izquierda {leftDetected ? '✓' : '✗'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${rightDetected ? (isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-800') : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>Derecha {rightDetected ? '✓' : '✗'}</span>
                </div>
              </div>

              {activeTab === 'train' && (
                <div className="space-y-2">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>Tipo de Gesto</div>
                  <div className="flex gap-2">
                    <button onClick={() => setGestureMode('numero')} className={`px-3 py-1 rounded ${gestureMode === 'numero' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100')}`}>Número</button>
                    <button onClick={() => setGestureMode('operacion')} className={`px-3 py-1 rounded ${gestureMode === 'operacion' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100')}`}>Operación</button>
                  </div>

                  {gestureMode === 'numero' ? (
                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Número vinculado</label>
                      <input type="number" min={0} max={50} value={numeroVinculado} onChange={e => setNumeroVinculado(parseInt(e.target.value || '0'))} className={`w-full rounded border px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : ''}`} />
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operación vinculada</label>
                      <select value={operacionVinculada} onChange={e => setOperacionVinculada(e.target.value)} className={`w-full rounded border px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}>
                        <option value="suma">Suma (+)</option>
                        <option value="resta">Resta (-)</option>
                        <option value="multiplicacion">Multiplicación (*)</option>
                        <option value="division">División (/)</option>
                      </select>
                    </div>
                  )}

                  {/* Panel de entrenamiento visual */}
                  {trainUIVisible && (
                    <div className={`mt-4 border rounded-xl p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Entrenando modelo…</h4>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(trainProgress)}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-2 bg-indigo-600 rounded-full transition-all" style={{ width: `${Math.round(trainProgress)}%` }} />
                      </div>
                      {trainSeries.length > 1 && (
                        <div className="mt-4">
                          <div className={`mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Evolución del entrenamiento (registros vs %)</div>
                          <ChartLine data={trainSeries} isDarkMode={isDarkMode} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : ''}`}>Calcular Operación</h3>
                  <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operación reconocida</div>
                    <div className={`text-lg font-semibold break-all ${isDarkMode ? 'text-gray-100' : ''}`}>{currentOperationRef.current.join(' ') || '—'}</div>
                  </div>
                  <form onSubmit={calcular} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operando 1</label>
                      <input type="number" step="any" value={operando1} onChange={e => setOperando1(e.target.value)} className={`w-full rounded border px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`} required disabled={loadingCalc} />
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operador</label>
                      <select value={operador} onChange={e => setOperador(e.target.value)} className={`w-full rounded border px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`} disabled={loadingCalc}>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Operando 2</label>
                      <input type="number" step="any" value={operando2} onChange={e => setOperando2(e.target.value)} className={`w-full rounded border px-3 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`} required disabled={loadingCalc} />
                    </div>
                  </form>

                  {error && <div className={`mt-3 p-3 rounded border text-sm ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>{error}</div>}
                  {resultado !== null && (
                    <div className={`mt-3 p-3 rounded border ${isDarkMode ? 'bg-orange-900/30 border-orange-800' : 'bg-orange-50 border-orange-200'}`}>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Expresión</div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : ''}`}>{expresion}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : ''}`}>Gestos entrenados</h3>
                  {trainedGestures.length === 0 ? (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay gestos entrenados disponibles.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto pr-2">
                      {trainedGestures.map((g: any) => (
                        <div key={g.id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${isDarkMode ? 'border-gray-700 text-gray-200' : ''}`}>
                          <div className="text-sm">
                            <div className={`font-medium ${isDarkMode ? 'text-gray-100' : ''}`}>{g.nombre_display}</div>
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>#{g.id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>

    {/* Modal de éxito de entrenamiento */}
    {trainModalOpen && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setTrainModalOpen(false)} />
        <div className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 text-center ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
          <div className="text-3xl mb-2">✅</div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-header'}`}>Entrenamiento exitoso</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Tu modelo se ha entrenado correctamente.</p>
          <div className="mt-4">
            <button className="btn-accent-purple" onClick={() => setTrainModalOpen(false)}>Confirmar</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

// Pequeño componente de gráfico lineal sin dependencias
function ChartLine({ data, isDarkMode }: { data: number[]; isDarkMode?: boolean }) {
  const padding = 24
  const width = 800
  const height = 200
  const maxY = Math.max(100, ...data)
  const minY = Math.min(0, ...data)
  const toX = (i: number) => padding + (i * (width - padding * 2)) / (data.length - 1)
  const toY = (v: number) => padding + (height - padding * 2) * (1 - (v - minY) / (maxY - minY || 1))

  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(v)}`).join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  const colors = {
    bg: isDarkMode ? '#0b0b0b' : '#fafafa',
    axis: isDarkMode ? '#374151' : '#e5e7eb',
    grid: isDarkMode ? '#1f2937' : '#f0f0f0',
    label: isDarkMode ? '#9ca3af' : '#6b7280',
    line: isDarkMode ? '#6366f1' : '#4f46e5',
    dot: isDarkMode ? '#818cf8' : '#4f46e5',
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Fondo */}
        <rect x={0} y={0} width={width} height={height} fill={colors.bg} />
        {/* Ejes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={colors.axis} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={colors.axis} />
        {/* Grid y ticks */}
        {yTicks.map((t, idx) => {
          const y = toY(t)
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={colors.grid} />
              <text x={8} y={y + 4} fontSize={10} fill={colors.label}>{t}%</text>
            </g>
          )
        })}
        {/* Línea */}
        <path d={path} fill="none" stroke={colors.line} strokeWidth={2} />
        {/* Puntos */}
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill={colors.dot} />
        ))}
      </svg>
    </div>
  )
}
