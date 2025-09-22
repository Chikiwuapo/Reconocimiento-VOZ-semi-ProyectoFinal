import React from 'react'
import Layout from '../../../components/Blackboard/Layout'
import { useArithmetic } from './hooks/useArithmetic'

export default function Arithmetic() {
  const {
    // refs
    videoRef, canvasRef,
    // estado principal
    cameraActive, recording, confidence, rightDetected, leftDetected,
    samplesTarget, samplesCaptured, gestureMode, numeroVinculado, operacionVinculada,
    operando1, operador, operando2, loadingCalc, resultado, expresion, error,
    activeTab, trainedGestures, chartData, showChart,
    // setters
    setGestureMode, setNumeroVinculado, setOperacionVinculada,
    setOperando1, setOperador, setOperando2,
    setActiveTab, setShowChart,
    // acciones
    startCamera, stopCamera, toggleRecording, saveGesture, recognizeCurrent,
    clearOperation, calculateFromOperation, calcular,
    // util
    currentOperationRef, mpReady,
  } = useArithmetic()

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-600">➕</span>
              Operaciones Aritméticas
            </h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${cameraActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                Cámara {cameraActive ? 'activa' : 'inactiva'}
              </span>
              <span className="hidden md:inline">Confianza:</span>
              <span className="font-semibold">{(confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="inline-flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow">
            <button onClick={() => setActiveTab('train')} className={`px-6 py-2 text-sm font-semibold ${activeTab==='train' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Entrenamiento</button>
            <button onClick={() => setActiveTab('test')} className={`px-6 py-2 text-sm font-semibold ${activeTab==='test' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Prueba</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{activeTab==='train' ? 'Entrenamiento' : 'Prueba'} con Cámara</h2>
                <div className="text-xs md:text-sm text-gray-500">Confianza: {(confidence * 100).toFixed(0)}%</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-black w-full max-w-3xl aspect-video mx-auto ring-1 ring-black/10">
                <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-gray-700">{leftDetected?'✋':'—'} {rightDetected?'🤚':'—'}</div>
                {recording && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs">Grabando... {samplesCaptured}</span>
                  </div>
                )}
                {recording && !leftDetected && !rightDetected && (
                  <div className="absolute bottom-2 right-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    No se detectan manos. Acerca tu mano a la cámara.
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {!cameraActive ? (
                  <button onClick={startCamera} disabled={!mpReady} className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-xl shadow">Iniciar Cámara</button>
                ) : (
                  <button onClick={stopCamera} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow">Detener Cámara</button>
                )}
                {activeTab === 'train' && (
                  <>
                    <button disabled={!cameraActive} onClick={toggleRecording} className={`px-4 py-2 rounded-xl text-white shadow ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
                      {recording ? 'Detener Grabación' : 'Grabar Gesto'}
                    </button>
                    <button disabled={samplesCaptured === 0} onClick={saveGesture} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl shadow disabled:opacity-50">Guardar Gesto</button>
                  </>
                )}
                {activeTab === 'test' && (
                  <>
                    <button onClick={recognizeCurrent} disabled={false} className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow">Reconocer gesto actual</button>
                    <button onClick={clearOperation} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 shadow">Limpiar operación</button>
                    <button onClick={calculateFromOperation} className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow">Calcular con operación</button>
                  </>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">Objetivo: <b>{samplesTarget}</b></div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">Capturadas: <b>{samplesCaptured}</b></div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">Progreso: <b>{Math.min(100, Math.round((samplesCaptured / Math.max(1, samplesTarget)) * 100))}%</b></div>
              </div>

              {activeTab === 'train' && showChart && chartData.length > 1 && (
                <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Evolución de confianza por muestra</h3>
                    <button className="text-xs text-indigo-600 hover:underline" onClick={() => setShowChart(false)}>Ocultar</button>
                  </div>
                  <ChartLine data={chartData} />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Panel de Control</h3>
                <div className="text-sm text-gray-600 mb-2">Manos detectadas:</div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${leftDetected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>Izquierda {leftDetected ? '✓' : '✗'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${rightDetected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>Derecha {rightDetected ? '✓' : '✗'}</span>
                </div>
              </div>

              {activeTab === 'train' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tipo de Gesto</div>
                  <div className="flex gap-2">
                    <button onClick={() => setGestureMode('numero')} className={`px-3 py-1 rounded ${gestureMode === 'numero' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Número</button>
                    <button onClick={() => setGestureMode('operacion')} className={`px-3 py-1 rounded ${gestureMode === 'operacion' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Operación</button>
                  </div>

                  {gestureMode === 'numero' ? (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Número vinculado</label>
                      <input type="number" min={0} max={50} value={numeroVinculado} onChange={e => setNumeroVinculado(parseInt(e.target.value || '0'))} className="w-full rounded border px-3 py-2" />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Operación vinculada</label>
                      <select value={operacionVinculada} onChange={e => setOperacionVinculada(e.target.value)} className="w-full rounded border px-3 py-2">
                        <option value="suma">Suma (+)</option>
                        <option value="resta">Resta (-)</option>
                        <option value="multiplicacion">Multiplicación (*)</option>
                        <option value="division">División (/)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className="font-semibold mb-2">Calcular Operación</h3>
                  <div className="mb-3 p-3 rounded bg-gray-50">
                    <div className="text-xs text-gray-600 mb-1">Operación reconocida</div>
                    <div className="text-lg font-semibold break-all">{currentOperationRef.current.join(' ') || '—'}</div>
                  </div>
                  <form onSubmit={calcular} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Operando 1</label>
                      <input type="number" step="any" value={operando1} onChange={e => setOperando1(e.target.value)} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Operador</label>
                      <select value={operador} onChange={e => setOperador(e.target.value)} className="w-full rounded border px-3 py-2">
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Operando 2</label>
                      <input type="number" step="any" value={operando2} onChange={e => setOperando2(e.target.value)} className="w-full rounded border px-3 py-2" required />
                    </div>
                    <div className="md:col-span-4">
                      <button type="submit" disabled={loadingCalc} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg">{loadingCalc ? 'Calculando...' : 'Calcular'}</button>
                    </div>
                  </form>

                  {error && <div className="mt-3 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{error}</div>}
                  {resultado !== null && (
                    <div className="mt-3 p-3 bg-orange-50 rounded border border-orange-200">
                      <div className="text-xs text-gray-600">Expresión</div>
                      <div className="text-xl font-bold">{expresion}</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'test' && (
                <div>
                  <h3 className="font-semibold mb-2">Gestos entrenados</h3>
                  {trainedGestures.length === 0 ? (
                    <div className="text-sm text-gray-500">No hay gestos entrenados disponibles.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto pr-2">
                      {trainedGestures.map((g: any) => (
                        <div key={g.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                          <div className="text-sm">
                            <div className="font-medium">{g.nombre_display}</div>
                            <div className="text-gray-500">Precisión: {typeof g.precision === 'number' ? (g.precision*100).toFixed(1) : g.precision}%</div>
                          </div>
                          <div className="text-xs text-gray-400">#{g.id}</div>
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
  )
}

// Pequeño componente de gráfico lineal sin dependencias
function ChartLine({ data }: { data: number[] }) {
  const padding = 24
  const width = 800
  const height = 200
  const maxY = Math.max(100, ...data)
  const minY = Math.min(0, ...data)
  const toX = (i: number) => padding + (i * (width - padding * 2)) / (data.length - 1)
  const toY = (v: number) => padding + (height - padding * 2) * (1 - (v - minY) / (maxY - minY || 1))

  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(v)}`).join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Fondo */}
        <rect x={0} y={0} width={width} height={height} fill="#fafafa" />
        {/* Ejes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
        {/* Grid y ticks */}
        {yTicks.map((t, idx) => {
          const y = toY(t)
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f0f0f0" />
              <text x={8} y={y + 4} fontSize={10} fill="#6b7280">{t}%</text>
            </g>
          )
        })}
        {/* Línea */}
        <path d={path} fill="none" stroke="#4f46e5" strokeWidth={2} />
        {/* Puntos */}
        {data.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill="#4f46e5" />
        ))}
      </svg>
    </div>
  )
}
