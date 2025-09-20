import { useState } from 'react'
import ActivityCard from './ActivityCard'

export type Activity = {
  id: string
  title: string
  description: string
  emoji?: string
  favorite?: boolean
  imageUrl?: string
}

const initialActivities: Activity[] = [
  { id: 'a1', title: 'Modelo de entrenamiento para Vocales', description: 'Crea un modelo para reconocer vocales habladas.', emoji: '🗣️', imageUrl: '/src/assets/placeholder.svg' },
  { id: 'a2', title: 'Modelo de entrenamiento para Abecedario', description: 'Entrena un modelo para letras del abecedario.', emoji: '🔤', imageUrl: '/src/assets/placeholder.svg' },
  { id: 'a3', title: 'Modelo de entrenamiento para Palabras', description: 'Reconoce palabras clave frecuentes.', emoji: '📝', imageUrl: '/src/assets/placeholder.svg' },
  { id: 'a4', title: 'Modelo de entrenamiento para Operaciones aritméticas básicas', description: 'Suma, resta, multiplicación y división.', emoji: '➕', imageUrl: '/src/assets/placeholder.svg' },
]

export default function ActivitiesGrid({ onFavoriteChange }: { onFavoriteChange?: (id: string, fav: boolean) => void }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)

  const toggleFavorite = (id: string) => {
    setActivities((prev) => {
      const updated = prev.map((a) => 
        a.id === id ? { ...a, favorite: !a.favorite } : a
      )
      updated.sort((x, y) => Number(!!y.favorite) - Number(!!x.favorite))
      
      const toggled = updated.find(a => a.id === id)
      if (toggled) {
        const isFavorite = Boolean(toggled.favorite)
        const msg = isFavorite 
          ? `Añadido a favoritos: ${toggled.title}` 
          : `Quitado de favoritos: ${toggled.title}`
        window.dispatchEvent(new CustomEvent('app:notify', { detail: msg }))
        if (onFavoriteChange) onFavoriteChange(id, isFavorite)
      }
      
      return updated
    })
  }

  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tus modelos</h2>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver todos</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {activities.map((a) => (
          <ActivityCard
            key={a.id}
            title={a.title}
            description={a.description}
            emoji={a.emoji}
            favorite={a.favorite}
            imageUrl={a.imageUrl}
            onToggleFavorite={() => toggleFavorite(a.id)}
            onTrain={() => {/* hook into route or action later */}}
          />
        ))}
      </div>
    </section>
  )
}
