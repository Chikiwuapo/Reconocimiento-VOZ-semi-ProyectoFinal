import { Link } from 'react-router-dom'

type Props = {
  title: string
  subtitle: string
  imageUrl: string
  cornerCode?: string
  to: string
  accent?: 'emerald' | 'blue' | 'purple' | 'orange' | 'indigo' | 'teal' | 'cyan' | 'fuchsia'
  onComplete?: () => void
  completed?: boolean
  isDarkMode?: boolean
}

export default function CourseCard({ title, subtitle, imageUrl, cornerCode = '', to, accent = 'blue', onComplete, completed = false, isDarkMode = false }: Props) {
  const map: Record<string, string> = {
    emerald: 'from-emerald-400 to-teal-600',
    blue: 'from-blue-500 to-indigo-700',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
    indigo: 'from-indigo-500 to-purple-700',
    teal: 'from-teal-500 to-cyan-600',
    cyan: 'from-cyan-500 to-blue-600',
    fuchsia: 'from-fuchsia-500 to-rose-600',
  }
  return (
    <div className={`course-card udemy rounded-lg overflow-hidden group cursor-pointer h-full ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
      <div className={`relative h-40 bg-gradient-to-br ${map[accent]} overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <div className="text-6xl"><img src={imageUrl} alt={title} /></div>
        </div>
        {cornerCode && (
          <div className="absolute bottom-3 right-3">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-black/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
              {cornerCode}
            </div>
          </div>
        )}
      </div>
      <div className={`course-body ${isDarkMode ? 'bg-gray-900 text-gray-100' : ''}`}>
        <div className={`course-title ${isDarkMode ? 'text-gray-100' : ''}`}>{title}</div>
        <div className={`course-subtitle ${isDarkMode ? 'text-gray-400' : ''}`}>{subtitle}</div>
        <div className="course-footer">
          <div className="flex gap-2 items-center">
            <Link to={to} className="btn-accent-cyan flex-1 text-center">Ver curso</Link>
            {completed ? (
              <div className={`flex items-center justify-center gap-2 py-2 font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                <span>✓</span>
                <span>Completado</span>
              </div>
            ) : (
              onComplete && (
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    onComplete()
                  }}
                  className="btn-secondary px-3"
                  title="Marcar como completado"
                >
                  ✓
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
