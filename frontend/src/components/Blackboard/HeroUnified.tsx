import { Suspense, useState, useMemo } from 'react'
import Spline from '@splinetool/react-spline'

type Model = { id: string; title: string; description: string; emoji: string; imageUrl: string; favorite?: boolean; features: string[] }
type Course = { id: string; title: string; progress: string; img: string; completed?: boolean }
type TestedModel = { id: string; title: string; result: string; color: string; tested?: boolean }

type Props = {
  userName: string
  models?: Model[]
  watchedCourses?: Course[]
  testedModels?: TestedModel[]
  onToggleFavorite?: (id: string) => void
}

export default function HeroUnified({ 
  userName, 
  models = [], 
  watchedCourses = [], 
  testedModels = [],
  onToggleFavorite
}: Props) {
  const [active, setActive] = useState<'creados'|'favoritos'|'vistos'|'probados'|null>(null)

  // Calcular datos dinámicos
  const favoriteModels = useMemo(() => models.filter(m => !!m.favorite), [models])
  const completedCourses = useMemo(() => watchedCourses.filter(c => c.completed), [watchedCourses])
  const testedModelsCount = useMemo(() => testedModels.filter(t => t.tested).length, [testedModels])

  const cardsLeft = [
    { key: 'creados', label: 'Modelos creados', value: models.length, desc: 'Tus modelos que has creado en la plataforma.' , color: '#3B82F6'},
    { key: 'favoritos', label: 'Modelos favoritos', value: favoriteModels.length, desc: 'Modelos marcados como favoritos.' , color: '#F59E0B'},
  ] as const
  const cardsRight = [
    { key: 'vistos', label: 'Cursos vistos', value: completedCourses.length, desc: 'Cursos que has completado en la plataforma.' , color: '#10B981'},
    { key: 'probados', label: 'Modelos probados', value: testedModelsCount, desc: 'Modelos que has probado en la plataforma.' , color: '#8B5CF6'},
  ] as const

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
              <div className="mt-3 flex justify-end">
                <button className="btn-secondary">Entrenar</button>
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
              <div className="mt-3 flex justify-end">
                <button className="btn-secondary">Entrenar</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'probados') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testedModels.filter(t => t.tested).map(t => (
            <div key={t.id} className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="text-slate-600 text-xs">Resultado</div>
              <div className="mt-1 font-semibold" style={{ color: t.color }}>{t.title}</div>
              <div className="text-slate-600 text-sm">{t.result}</div>
              <div className="mt-3 flex justify-end">
                <button className="btn-secondary">Ver detalles</button>
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
            <p className="text-slate-700 mt-1 max-w-md ml-auto">¡Explora el mundo del Machine Learning con tus propios modelos!</p>
          </div>

          {/* Cards bottom-left */}
          <div className="absolute bottom-4 left-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {cardsLeft.map(c => (
              <div key={c.key} className="text-left p-4 rounded-xl border bg-white/95 backdrop-blur shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
                <div className="text-slate-600 text-sm">{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
                <div className="mt-1 text-xs text-slate-500 max-w-[22ch]">{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Cards bottom-right */}
          <div className="absolute bottom-4 right-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {cardsRight.map(c => (
              <div key={c.key} className="text-left p-4 rounded-xl border bg-white/95 backdrop-blur shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
                <div className="text-slate-600 text-sm">{c.label}</div>
                <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
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
