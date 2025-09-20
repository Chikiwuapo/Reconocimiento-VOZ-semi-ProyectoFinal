import type { Lesson } from '../../pages/Courses/CoursePage'

const typeIcon = (t: Lesson['type']) => {
  switch (t) {
    case 'video': return '📹'
    case 'resource': return '📄'
    case 'quiz': return '📝'
    default: return '📁'
  }
}

type Props = {
  lessons: Lesson[]
  currentId: string
  onSelect: (id: string) => void
}

export default function LessonSidebar({ lessons, currentId, onSelect }: Props) {
  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
        <h3 className="text-gray-800 font-bold text-lg">Contenido del Curso</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {lessons.map((l, idx) => {
          const isActive = l.id === currentId
          const isCompleted = l.status === 'completed'
          
          return (
            <div key={l.id} className="relative">
              <button
                onClick={() => onSelect(l.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'border-gray-400 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-lg' 
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {/* Efecto de brillo para lección activa */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 rounded-lg" />
                )}
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Número de lección con estilo */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted 
                        ? 'bg-gray-500 text-white' 
                        : isActive 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    
                    {/* Icono del tipo de lección */}
                    <span className="text-xl">{typeIcon(l.type)}</span>
                    
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>
                        {l.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{l.duration || '—'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isCompleted 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isCompleted ? 'Completada' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de progreso */}
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                    {isActive && !isCompleted && (
                      <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
      
      {/* Barra de progreso general */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Progreso del curso</span>
          <span>{lessons.filter(l => l.status === 'completed').length}/{lessons.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(lessons.filter(l => l.status === 'completed').length / lessons.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
