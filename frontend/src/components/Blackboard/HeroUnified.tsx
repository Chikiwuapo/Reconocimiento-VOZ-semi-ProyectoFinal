import { Suspense, useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

type Model = { id: string; title: string; description: string; emoji: string; imageUrl: string; favorite?: boolean; features: string[] }
type Course = { id: string; title: string; progress: string; img: string; completed?: boolean }
// tested models removed from UI for now

type Props = {
  userName: string
  models?: Model[]
  watchedCourses?: Course[]
  onToggleFavorite?: (id: string) => void
  isDarkMode?: boolean
}

export default function HeroUnified({ 
  userName, 
  models = [], 
  watchedCourses = [], 
  onToggleFavorite,
  isDarkMode = false
}: Props) {
  const [active, setActive] = useState<'creados'|'favoritos'|'vistos'|null>(null)
  const navigate = useNavigate()

  // Calcular datos dinámicos
  const favoriteModels = useMemo(() => models.filter(m => !!m.favorite), [models])
  const completedCourses = useMemo(() => watchedCourses.filter(c => c.completed), [watchedCourses])
  // 'probados' section removed; no need to compute testedModelsCount

  const [trainedCount, setTrainedCount] = useState<number>(() => {
    try { return Number(localStorage.getItem('trained_models_count') || '0') } catch { return 0 }
  })
  useEffect(() => {
    const handler = () => {
      try { setTrainedCount(Number(localStorage.getItem('trained_models_count') || '0')) } catch {}
    }
    window.addEventListener('trained:updated', handler as any)
    // also refresh on focus to keep it in sync
    window.addEventListener('focus', handler)
    return () => {
      window.removeEventListener('trained:updated', handler as any)
      window.removeEventListener('focus', handler)
    }
  }, [])

  const cardsLeft = [
    { key: 'entrenados', label: 'Modelos entrenados', value: trainedCount, desc: 'Incrementa al iniciar entrenamiento.' , color: '#0EA5E9'},
    { key: 'creados', label: 'Modelos creados', value: models.length, desc: 'Tus modelos que has creado en la plataforma.' , color: '#3B82F6'},
    { key: 'favoritos', label: 'Modelos favoritos', value: favoriteModels.length, desc: 'Modelos marcados como favoritos.' , color: '#F59E0B'},
  ] as const
  const cardsRight = [
    { key: 'vistos', label: 'Cursos vistos', value: completedCourses.length, desc: 'Cursos que has completado en la plataforma.' , color: '#10B981'},
  ] as const

  // Número animado suave para valores de tarjetas
  function Counter({ value, duration = 600 }: { value: number; duration?: number }) {
    const [display, setDisplay] = useState(0)
    const prevRef = useRef(0)
    useEffect(() => {
      const start = prevRef.current
      const end = value
      const startTs = performance.now()
      let raf = 0
      const tick = (t: number) => {
        const p = Math.min(1, (t - startTs) / duration)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        const val = Math.round(start + (end - start) * eased)
        setDisplay(val)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      prevRef.current = end
      return () => cancelAnimationFrame(raf)
    }, [value, duration])
    return <>{display}</>
  }

  const renderDetail = () => {
    if (!active) return null
    if (active === 'favoritos') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteModels.map(m => (
            <div key={m.id} className={`p-4 rounded-xl border shadow-soft ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Favorito</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.(m.id)
                  }}
                  className="text-lg text-yellow-500 transition-colors hover:text-yellow-600"
                >
                  ⭐
                </button>
              </div>
              <div className="mt-1 font-semibold text-yellow-600">{m.title}</div>
              <div className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{m.description}</div>
              <div className="mt-3 flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => navigate('/arithmetic?tab=train')}>Entrenar</button>
                <button className="btn" onClick={() => navigate('/arithmetic?tab=test')}>Probar</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'creados') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(m => (
            <div key={m.id} className={`p-4 rounded-xl border shadow-soft ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Modelo</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.(m.id)
                  }}
                  className={`text-lg transition-colors ${m.favorite ? 'text-yellow-500' : (isDarkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-slate-300 hover:text-yellow-400')}`}
                >
                  {m.favorite ? '⭐' : '☆'}
                </button>
              </div>
              <div className="mt-1 font-semibold text-blue-600">{m.title}</div>
              <div className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{m.description}</div>
              {/* Características del modelo */}
              {Array.isArray(m.features) && m.features.length > 0 && (
                <ul className={`mt-3 space-y-1 text-sm list-disc pl-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  {m.features.map((f, idx) => (
                    <li key={idx} className="leading-snug">{f}</li>
                  ))}
                </ul>
              )}
              {/* Agregar característica (solo UI) */}
              <div className="mt-3 flex items-center gap-2">
                <input placeholder="Agregar característica" className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' : 'bg-white border-slate-200 text-gray-900'}`} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val) {
                      window.dispatchEvent(new CustomEvent('app:notify', { detail: `Característica agregada: ${val}` }))
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }} />
                <button className="btn-secondary" onClick={() => navigate('/arithmetic?tab=train')}>Entrenar</button>
                <button className="btn" onClick={() => navigate('/arithmetic?tab=test')}>Probar</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'vistos') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchedCourses.filter(c => c.completed).map(c => (
            <div key={c.id} className={`overflow-hidden rounded-xl border shadow-soft ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
              <div className="relative h-28 bg-slate-100">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">✓ Completado</span>
              </div>
              <div className="p-3">
                <div className={`font-semibold line-clamp-2 ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>{c.title}</div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Progreso: {c.progress}%</div>
                <div className="mt-2 flex justify-end">
                  <button className="btn-secondary">Ver certificado</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section className="mt-6">
      <div className="container-page">
        <div className={`relative overflow-hidden rounded-2xl border shadow-soft ${isDarkMode ? 'border-gray-800' : ''}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
          {/* Background Spline */}
          <div className={`relative h-[320px] md:h-[420px] lg:h-[520px] ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Cargando escena 3D…</div>}>
              <Spline scene="https://prod.spline.design/ipCRjZJLB7I3rCDj/scene.splinecode" />
            </Suspense>
          </div>

          {/* Overlay gradient for readability */}
          <div className={`pointer-events-none absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-transparent' : 'bg-gradient-to-br from-white/80 via-white/40 to-transparent'}`} />

          {/* Greeting header: right on desktop, full-width on mobile with CTA */}
          <div className="absolute inset-x-4 top-4 md:inset-auto md:top-6 md:right-6 lg:top-8 lg:right-8 md:text-right">
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-sm ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>Hola, {userName} 👋</h1>
            <p className={`mt-1 max-w-xl md:max-w-md md:ml-auto ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              No necesitas ser un experto en Machine Learning. ¡Explora el mundo con tus propios modelos!
            </p>
          </div>

          {/* Cards bottom-left (2 tarjetas) */}
          <div className="absolute bottom-4 left-4 hidden md:grid grid-cols-1 md:grid-cols-2 gap-3">
            {[cardsLeft[0], cardsLeft[1]].map(c => (
              <div key={c.key} className={`text-left p-4 rounded-xl border backdrop-blur shadow-soft hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}><Counter value={c.value as number} /></div>
                <div className={`mt-1 text-xs max-w-[22ch] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Cards bottom-right (2 tarjetas) */}
          <div className="absolute bottom-4 right-4 hidden md:grid grid-cols-1 md:grid-cols-2 gap-3">
            {[{ key: 'favoritos', label: 'Modelos favoritos', value: favoriteModels.length, desc: 'Modelos marcados como favoritos.', color: '#F59E0B' }, cardsRight[0]].map(c => (
              <div key={c.key} className={`text-left p-4 rounded-xl border backdrop-blur shadow-soft hover:shadow-lg transition-shadow ${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}><Counter value={c.value as number} /></div>
                <div className={`mt-1 text-xs max-w-[22ch] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Mobile stat cards: show all 4 below hero */}
          <div className="md:hidden px-4 pb-4">
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[cardsLeft[0], cardsLeft[1], { key: 'favoritos', label: 'Modelos favoritos', value: favoriteModels.length, desc: 'Modelos marcados como favoritos.', color: '#F59E0B' }, cardsRight[0]].map(c => (
                <div key={c.key} className={`text-left p-4 rounded-xl border shadow-soft ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{c.label}</div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}><Counter value={c.value as number} /></div>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="container-page mt-6">
          <div className={`p-6 border rounded-2xl shadow-soft ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} style={!isDarkMode ? { borderColor: 'rgba(15,23,42,0.08)' } : {}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>
                {active === 'favoritos' && 'Modelos favoritos'}
                {active === 'creados' && 'Modelos creados'}
                {active === 'vistos' && 'Cursos completados'}
              </h2>
              <button onClick={() => setActive(null)} className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-slate-700'}`}>
                ✕
              </button>
            </div>
            {renderDetail()}
          </div>
        </div>
      )}
    </section>
  )
}
