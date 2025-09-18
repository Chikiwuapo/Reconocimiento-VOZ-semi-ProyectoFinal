type ActivityCardProps = {
  title: string
  description: string
  icon?: 'bars' | 'cloud' | 'image' | 'text'
  favorite?: boolean
  onToggleFavorite?: () => void
  onTrain?: () => void
}

function Icon({ name }: { name: ActivityCardProps['icon'] }) {
  switch (name) {
    case 'bars':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M5 3h2v18H5zM11 9h2v12h-2zM17 5h2v16h-2z" />
        </svg>
      )
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M7 18a5 5 0 1 1 .9-9.9A7 7 0 0 1 21 11a4 4 0 0 1-1 7H7z" />
        </svg>
      )
    case 'image':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M4 5h16v14H4zM7 8.5A1.5 1.5 0 1 0 7 11a1.5 1.5 0 0 0 0-2.5Zm12 8.5-4.5-5.5-3.5 4.5-2.5-3-3.5 4v0Z" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M4 6V4h16v2h-7v14h-2V6H4z" />
        </svg>
      )
    default:
      return null
  }
}

export default function ActivityCard({ title, description, icon = 'bars', favorite, onToggleFavorite, onTrain }: ActivityCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon name={icon} />
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
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-primary" onClick={onTrain}>Entrenar modelo</button>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver detalles</button>
      </div>
    </div>
  )
}
