import ActivityCard from './ActivityCard'
import type { Activity } from './ActivitiesGrid'

const favorites: Activity[] = [
  { id: 'f1', title: 'Clasificador de Sentimientos', description: 'Tu último modelo entrenado de texto.', icon: 'text', favorite: true },
  { id: 'f2', title: 'Detección de Objetos', description: 'Entrenado hace 2 días.', icon: 'image', favorite: true },
]

export default function Favorites() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Favoritos</h2>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver todos</button>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2">
        {favorites.map((f) => (
          <div key={f.id} className="min-w-[280px] w-[320px]">
            <ActivityCard
              title={f.title}
              description={f.description}
              icon={f.icon}
              favorite
              onTrain={() => {/* train again */}}
            />
            <div className="flex gap-3 mt-3">
              <button className="btn-primary">Entrenar de nuevo</button>
              <button className="text-sm text-slate-600 hover:text-header transition">Ver resultados previos</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
