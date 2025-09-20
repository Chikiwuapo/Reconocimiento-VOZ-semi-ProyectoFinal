import { useMemo, useState } from 'react'
type WelcomeProps = {
  userName: string
  progress: number // 0-100 (no se muestra, se mantiene para compatibilidad)
  models?: Array<{ id: string; title: string; detail?: string; color?: string; favorite?: boolean; imageUrl?: string }>
  watchedCourses?: Array<{ id: string; title: string; progress: string; img: string }>
  testedModels?: Array<{ id: string; title: string; result: string; color?: string }>
}



export default function Welcome({ userName, progress: _progress, models = [], watchedCourses, testedModels }: WelcomeProps) {
  const [active, setActive] = useState<'creados'|'favoritos'|'vistos'|'probados' | null>(null)

  const createdModels = models
  const favoriteModels = useMemo(() => createdModels.filter(m => !!m.favorite), [createdModels])

  const stats = {
    creados: {
      title: 'Modelos creados',
      desc: 'Tus modelos que has creado en la plataforma.',
      value: createdModels.length,
      items: createdModels.map(m => m.title),
    },
    favoritos: {
      title: 'Modelos favoritos',
      desc: 'Modelos que has marcado como favoritos para acceso rápido.',
      value: favoriteModels.length,
      items: favoriteModels.map(m => m.title),
    },
    vistos: {
      title: 'Cursos vistos',
      desc: 'Cursos que has visto en la plataforma.',
      value: (watchedCourses?.length ?? 0),
      items: watchedCourses?.map(c => c.title) ?? [],
    },
    probados: {
      title: 'Modelos probados',
      desc: 'Modelos que has probado en la plataforma.',
      value: (testedModels?.length ?? 0),
      items: testedModels?.map(t => t.title) ?? [],
    },
  }

  const favoriteCourses = [
    { id: 'c1', title: 'Reconocimiento Facial Avanzado', img: 'https://png.pngtree.com/background/20231016/original/pngtree-revolutionary-technology-advanced-facial-recognition-system-with-cutting-edge-3d-scanning-picture-image_5574665.jpg', tag: 'Intermedio' },
    { id: 'c2', title: 'Reconocimiento de Voz con IA', img: 'https://imgs.elpais.com.uy/dims4/default/e4f9060/2147483647/strip/true/crop/1047x720+116+0/resize/1440x990!/format/webp/quality/90/?url=https%3A%2F%2Fel-pais-uruguay-production-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Ff1%2F2e%2F68a008b24916909823145bf82743%2Fimagen-voz-microsoft-portada.jpg', tag: 'Todos los niveles' },
    { id: 'c3', title: 'Chatbot Automatizado con IA', img: 'https://website-assets-fd.freshworks.com/attachments/cjr7cheqv01aq92g00a0z7onq-ai-chatbot-04-2x.one-half.png', tag: 'Proyecto' },
  ]

  const testedModelsLocal = testedModels ?? [
    { id: 't1', title: 'Demo voz', result: 'WER 12%', color: '#F59E0B' },
    { id: 't2', title: 'Demo rostro', result: 'Acc 94%', color: '#06B6D4' },
  ]

  const watchedCoursesLocal = watchedCourses ?? [
    { id: 'w1', title: 'MediaPipe Hands', progress: '60%', img: 'https://i.blogs.es/2b36a7/algoritmo/1366_2000.png' },
  ]

  const renderDetail = () => {
    if (!active) return null
    if (active === 'favoritos') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteCourses.map(c => (
            <div key={c.id} className="overflow-hidden rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="relative h-28 bg-slate-100">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-white/90">{c.tag}</span>
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-fuchsia-500 text-white">★ Favorito</span>
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-800 line-clamp-2">{c.title}</div>
                <div className="mt-2 flex justify-end">
                  <a href="#cursos" className="btn-secondary">Ver curso</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'creados') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {createdModels.map(m => (
            <div key={m.id} className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="text-slate-600 text-xs">Modelo</div>
              <div className="mt-1 font-semibold" style={{ color: m.color ?? '#3B82F6' }}>{m.title}</div>
              {m.detail && <div className="text-slate-600 text-sm">{m.detail}</div>}
              <div className="mt-3 flex justify-end">
                <button className="btn-secondary">Abrir</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'probados') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testedModelsLocal.map(t => (
            <div key={t.id} className="p-4 rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="text-slate-600 text-xs">Resultado</div>
              <div className="mt-1 font-semibold" style={{ color: t.color }}>{t.title}</div>
              <div className="text-slate-600 text-sm">{t.result}</div>
              <div className="mt-3 flex justify-end">
                <button className="btn-secondary">Reprobar</button>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (active === 'vistos') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchedCoursesLocal.map(w => (
            <div key={w.id} className="overflow-hidden rounded-xl border bg-white shadow-soft" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="relative h-28 bg-slate-100">
                <img src={w.img} alt={w.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-white/90">Progreso {w.progress}</span>
              </div>
              <div className="p-3">
                <div className="font-semibold text-slate-800 line-clamp-2">{w.title}</div>
                <div className="mt-2 flex justify-end">
                  <a href="#cursos" className="btn-secondary">Continuar</a>
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
    <>
    <section className="mt-6 animate-slide-up">
      <div className="bg-hero-gradient">
        <div className="container-page py-8">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl font-bold text-header">
                  Hola, {userName} 👋
                </h1>
                <p className="text-slate-700 mt-2 font-inter">
                  ¡Explora el mundo del Machine Learning con tus propios modelos!
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Reemplazo: visor 3D con robot amarillo */}
                {/* @ts-ignore - model-viewer es un web component */}
                <model-viewer
                  src="https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
                  alt="Robot 3D"
                  autoplay
                  auto-rotate
                  camera-controls
                  style={{ width: '120px', height: '120px', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {([
                { key: 'creados', label: 'Modelos creados', color: '#3B82F6' },
                { key: 'favoritos', label: 'Modelos favoritos', color: '#F59E0B' },
                { key: 'vistos', label: 'Cursos vistos', color: '#10B981' },
                { key: 'probados', label: 'Modelos probados', color: '#8B5CF6' },
              ] as const).map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className={`text-left p-4 rounded-xl border transition shadow-soft bg-white hover:translate-y-[-4px] hover:shadow-lg ${active===c.key? 'ring-2 ring-offset-2 ring-offset-white': ''}`}
                  style={{ borderColor: 'rgba(15,23,42,0.08)' }}
                >
                  <div className="text-slate-600 text-sm">{c.label}</div>
                  <div className="mt-1 text-2xl font-bold" style={{ color: c.color }}>
                    {stats[c.key as keyof typeof stats].value}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {stats[c.key as keyof typeof stats].desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Panel de detalle */}
            {active && (
              <div className="mt-4 p-4 rounded-xl border bg-white" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-header">{stats[active].title}</h3>
                    <p className="text-slate-600 text-sm">{stats[active].desc}</p>
                  </div>
                  <button className="btn-secondary" onClick={() => setActive(null)}>Cerrar</button>
                </div>
                <div className="mt-3">
                  {renderDetail()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
    <section className="container-page">
    </section>
  </>
)

}
