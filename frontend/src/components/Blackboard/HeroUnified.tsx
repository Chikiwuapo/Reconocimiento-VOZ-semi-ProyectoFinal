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
}

export default function HeroUnified({ 
  userName, 
  models = [], 
  watchedCourses = [], 
  onToggleFavorite
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
            <div key={m.id} className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-600 text-xs">Favorito</div>
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
              <div className="text-slate-600 text-sm line-clamp-2">{m.description}</div>
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
            <div key={m.id} className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-600 text-xs">Modelo</div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite?.(m.id)
                  }}
                  className={`text-lg transition-colors ${m.favorite ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                >
                  {m.favorite ? '⭐' : '☆'}
                </button>
              </div>
              <div className="mt-1 font-semibold text-blue-600">{m.title}</div>
              <div className="text-slate-600 text-sm line-clamp-2">{m.description}</div>
              {/* Características del modelo */}
              {Array.isArray(m.features) && m.features.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-600 list-disc pl-5">
                  {m.features.map((f, idx) => (
                    <li key={idx} className="leading-snug">{f}</li>
                  ))}
                </ul>
              )}
              {/* Agregar característica (solo UI) */}
              <div className="mt-3 flex items-center gap-2">
                <input placeholder="Agregar característica" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" onKeyDown={(e) => {
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
            <div key={c.id} className="overflow-hidden rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="relative h-28 bg-slate-100">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">✓ Completado</span>
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-800 line-clamp-2">{c.title}</div>
                <div className="text-slate-600 text-xs mt-1">Progreso: {c.progress}%</div>
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
        <div className="relative overflow-hidden rounded-2xl border shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
          {/* Background Spline */}
          <div className="relative h-[320px] md:h-[420px] lg:h-[520px] bg-white">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Cargando escena 3D…</div>}>
              <Spline scene="https://prod.spline.design/ipCRjZJLB7I3rCDj/scene.splinecode" />
            </Suspense>
          </div>

          {/* Overlay gradient for readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-transparent" />

          {/* Greeting top-right */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 text-right">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-header drop-shadow-sm">Hola, {userName} 👋</h1>
            <p className="text-slate-700 mt-1 max-w-md ml-auto">No necesitas ser un experto en Machine Learning. 
            <br></br>¡Explora el mundo con tus propios modelos!</p>
          </div>

          {/* Cards bottom-left (2 tarjetas) */}
          <div className="absolute bottom-4 left-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[cardsLeft[0], cardsLeft[1]].map(c => (
              <div key={c.key} className="text-left p-4 rounded-xl border bg-white/95 backdrop-blur shadow-soft hover:shadow-lg transition-shadow" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
                <div className="text-slate-600 text-sm">{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}><Counter value={c.value as number} /></div>
                <div className="mt-1 text-xs text-slate-500 max-w-[22ch]">{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Cards bottom-right (2 tarjetas) */}
          <div className="absolute bottom-4 right-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[{ key: 'favoritos', label: 'Modelos favoritos', value: favoriteModels.length, desc: 'Modelos marcados como favoritos.', color: '#F59E0B' }, cardsRight[0]].map(c => (
              <div key={c.key} className="text-left p-4 rounded-xl border bg-white/95 backdrop-blur shadow-soft hover:shadow-lg transition-shadow" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
                <div className="text-slate-600 text-sm">{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}><Counter value={c.value as number} /></div>
                <div className="mt-1 text-xs text-slate-500 max-w-[22ch]">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {active && (
        <div className="container-page mt-4">
          <div className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-header capitalize">{active.replace('creados','Modelos creados').replace('favoritos','Modelos favoritos').replace('vistos','Cursos vistos').replace('probados','Modelos probados')}</h3>
              <button className="btn-secondary" onClick={() => setActive(null)}>Cerrar</button>
            </div>
            <div className="mt-3">
              {renderDetail()}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
