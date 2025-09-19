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
    <div>
      <h3 className="text-white font-bold mb-3">Lecciones</h3>
      <ul className="space-y-2">
        {lessons.map((l, idx) => {
          const isActive = l.id === currentId
          return (
            <li key={l.id}>
              <button
                onClick={() => onSelect(l.id)}
                className={`w-full text-left px-3 py-2 rounded-md border transition ${
                  isActive ? 'border-blue-500 bg-slate-800 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcon(l.type)}</span>
                    <div>
                      <div className="text-sm font-medium">{idx + 1}. {l.title}</div>
                      <div className="text-xs text-slate-400">{l.duration || '—'} · {l.status === 'completed' ? 'Completada' : 'Pendiente'}</div>
                    </div>
                  </div>
                  {l.status === 'completed' && (
                    <span className="text-green-400 text-sm font-bold">✓</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
