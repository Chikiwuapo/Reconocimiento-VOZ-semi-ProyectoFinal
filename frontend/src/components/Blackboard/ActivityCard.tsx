type ActivityCardProps = {
  title: string
  description: string
  emoji?: string // Ej: "🤖", "🖼️", "📈", "☁️"
  favorite?: boolean
  onToggleFavorite?: () => void
  onTrain?: () => void
  imageUrl?: string
  onViewDetails?: () => void
  isDarkMode?: boolean
}

export default function ActivityCard({ title, description, emoji = '🤖', favorite, onToggleFavorite, onTrain, imageUrl = '/src/assets/placeholder.svg', onViewDetails, isDarkMode = false }: ActivityCardProps) {
  return (
    <div className={`card p-0 overflow-hidden h-[320px] transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg relative flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : ''}`}>
      {favorite && <span className="ribbon-fav">⭐ FAVORITO</span>}
      <img src={imageUrl} alt="Vista previa" className="h-28 w-full object-cover" />
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
            <span aria-hidden>{emoji}</span>
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{title}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{description}</p>
          </div>
        </div>
        <button
          aria-label="Marcar como favorito"
          className={`p-2 -mr-2 hover:text-yellow-500 transition ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}
          onClick={onToggleFavorite}
        >
          <svg viewBox="0 0 24 24" className={`h-5 w-5 ${favorite ? 'fill-yellow-400 stroke-yellow-400' : 'fill-none stroke-current'}`} strokeWidth={1.8}>
            <path d="M12 17.3 6.18 21l1.6-6.88L2 8.9l7-.6L12 2l3 6.3 7 .6-5.78 5.22L17.82 21 12 17.3z" />
          </svg>
        </button>
      </div>
      <div className="mt-auto p-5 pt-0 flex items-center gap-3">
        <button className="btn-accent-purple transition-colors duration-300 group-hover:!bg-[var(--accent-cyan)]" onClick={onTrain}>Ir a practicar</button>
        <button className={`text-sm transition ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-600 hover:text-header'}`} onClick={onViewDetails}>Ver detalles</button>
      </div>
    </div>
  )
}
