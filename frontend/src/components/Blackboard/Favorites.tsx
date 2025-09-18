import ActivityCard from './ActivityCard'
import type { Activity } from './ActivitiesGrid'

const favorites: Activity[] = [
  { id: 'f1', title: 'Clasificador', description: 'Tu último modelo clasificador.', emoji: '📝', favorite: true, imageUrl: '/src/assets/placeholder.svg' },
  { id: 'f2', title: 'Detector', description: 'Tu último modelo detector.', emoji: '🖼️', favorite: true, imageUrl: '/src/assets/placeholder.svg' },
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
              emoji={f.emoji}
              imageUrl={f.imageUrl}
              favorite
              onTrain={() => {/* train again */}}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
