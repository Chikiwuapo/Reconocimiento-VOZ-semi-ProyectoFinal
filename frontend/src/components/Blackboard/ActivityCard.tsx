type ActivityCardProps = {
  title: string
  description: string
  emoji?: string // Ej: "🤖", "🖼️", "📈", "☁️"
  favorite?: boolean
  onToggleFavorite?: () => void
  onTrain?: () => void
  imageUrl?: string
  onViewDetails?: () => void
}

export default function ActivityCard({ title, description, emoji = '🤖', favorite, onToggleFavorite, onTrain, imageUrl = '/src/assets/placeholder.svg', onViewDetails }: ActivityCardProps) {
  return (
    <div className="card p-0 overflow-hidden h-[320px] transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg relative flex flex-col">
      {favorite && <span className="ribbon-fav">⭐ FAVORITO</span>}
      <img src={imageUrl} alt="Vista previa" className="h-28 w-full object-cover" />
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
            <span aria-hidden>{emoji}</span>
          </div>
          <div>
            <h3 className="font-semibold text-header">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <button
          aria-label="Marcar como favorito"
          className={`p-2 -mr-2 text-slate-400 hover:text-yellow-500 transition`}
          onClick={onToggleFavorite}
        >
          <svg viewBox="0 0 24 24" className={`h-5 w-5 ${favorite ? 'fill-yellow-400 stroke-yellow-400' : 'fill-none stroke-current'}`} strokeWidth={1.8}>
            <path d="M12 17.3 6.18 21l1.6-6.88L2 8.9l7-.6L12 2l3 6.3 7 .6-5.78 5.22L17.82 21 12 17.3z" />
          </svg>
        </button>
      </div>
      <div className="mt-auto p-5 pt-0 flex items-center gap-3">
        <button className="btn-accent-purple transition-colors duration-300 group-hover:!bg-[var(--accent-cyan)]" onClick={onTrain}>Entrenar</button>
        <button className="text-sm text-slate-600 hover:text-header transition" onClick={onViewDetails}>Ver detalles</button>
      </div>
    </div>
  )
}
