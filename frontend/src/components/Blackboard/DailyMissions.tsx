import { useState } from 'react'

export type Mission = {
  id: string
  label: string
  completed: boolean
}

const initial: Mission[] = [
  { id: 'mv', label: 'Crea un modelo de vocales', completed: false },
  { id: 'ma', label: 'Crea un modelo de abecedario', completed: false },
  { id: 'mp', label: 'Crea un modelo de palabras', completed: false },
  { id: 'mo', label: 'Crea un modelo de operaciones básicas', completed: false },
]

export default function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>(initial)
  const completed = missions.filter(m => m.completed).length

  const toggle = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
    const m = missions.find(m => m.id === id)
    const done = !(m?.completed)
    window.dispatchEvent(new CustomEvent('app:notify', { detail: done ? 'Misión completada ✅' : 'Misión desmarcada' }))
  }

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-header">Misiones Diarias</h3>
        <span className="badge">Completadas: {completed}/{missions.length}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {missions.map(m => (
          <li key={m.id} className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={m.completed} onChange={() => toggle(m.id)} />
              {m.label}
            </label>
            {m.completed ? (
              <span className="text-green-600 text-sm font-medium">✓</span>
            ) : (
              <span className="text-red-600 text-sm font-medium">✗</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
