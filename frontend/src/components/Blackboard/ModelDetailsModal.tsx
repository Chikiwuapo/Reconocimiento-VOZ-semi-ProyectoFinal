type Props = {
  title: string
  description: string
  imageUrl: string
  features: string[]
  onClose: () => void
  isDarkMode?: boolean
}

export default function ModelDetailsModal({ title, description, imageUrl, features, onClose, isDarkMode = false }: Props) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-xl shadow-soft overflow-hidden animate-scale-in ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`h-44 w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{title}</h3>
            <button className={`transition ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-slate-500 hover:text-header'}`} aria-label="Cerrar" onClick={onClose}>✕</button>
          </div>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{description}</p>
          <div className="mt-4">
            <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Características</div>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f, i) => (
                <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-700'}`}>{f}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button className="btn" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
