import { useState } from 'react'
import ActivityCard from './ActivityCard'

export type Activity = {
  id: string
  title: string
  description: string
  icon?: 'bars' | 'cloud' | 'image' | 'text'
  favorite?: boolean
}

const initialActivities: Activity[] = [
  { id: 'a1', title: 'Clasificador de Sentimientos', description: 'Analiza polaridad en reseñas de texto.', icon: 'text' },
  { id: 'a2', title: 'Detección de Objetos', description: 'Identifica objetos en imágenes.', icon: 'image' },
  { id: 'a3', title: 'Predicción de Series Temporales', description: 'Proyecta tendencias y valores futuros.', icon: 'bars' },
  { id: 'a4', title: 'Clasificación de Nubes', description: 'Categoriza tipos de nubes meteorológicas.', icon: 'cloud' },
]

export default function ActivitiesGrid({ onFavoriteChange }: { onFavoriteChange?: (id: string, fav: boolean) => void }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)

  const toggleFavorite = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, favorite: !a.favorite } : a)))
    const updated = activities.find((a) => a.id === id)
    if (updated && onFavoriteChange) onFavoriteChange(id, !updated.favorite)
  }

  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Modelos para entrenar</h2>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver todos</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {activities.map((a) => (
          <ActivityCard
            key={a.id}
            title={a.title}
            description={a.description}
            icon={a.icon}
            favorite={a.favorite}
            onToggleFavorite={() => toggleFavorite(a.id)}
            onTrain={() => {/* hook into route or action later */}}
          />
        ))}
      </div>
    </section>
  )
}
