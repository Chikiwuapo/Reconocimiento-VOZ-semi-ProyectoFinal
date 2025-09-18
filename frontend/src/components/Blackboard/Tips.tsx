import { useState } from 'react'

const initialTips = [
  { id: 't1', icon: '⚖️', text: 'Usa datos balanceados.' },
  { id: 't2', icon: '🧩', text: 'Separa entrenamiento y validación.' },
  { id: 't3', icon: '💾', text: 'Guarda checkpoints frecuentemente.' },
]

type Tip = typeof initialTips[number]

type Mission = {
  id: string
  label: string
  completed: boolean
}

const initialMissions: Mission[] = [
  { id: 'm1', label: 'Entrena 1 modelo hoy (+5 XP)', completed: false },
  { id: 'm2', label: 'Marca 2 favoritos (+5 XP)', completed: false },
]

export default function Tips() {
  const [tips] = useState<Tip[]>(initialTips)
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const xp = missions.reduce((sum, m) => sum + (m.completed ? 5 : 0), 0)

  const toggleMission = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
  }

  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-semibold text-header">Tips rápidos</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tips.map(t => (
              <div key={t.id} className="card flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                  <span aria-hidden>{t.icon}</span>
                </div>
                <p className="text-slate-700 text-sm">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-header">Misiones diarias</h3>
            <span className="badge">XP: {xp}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {missions.map(m => (
              <li key={m.id} className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={m.completed} onChange={() => toggleMission(m.id)} />
                  {m.label}
                </label>
                {m.completed ? (
                  <span className="text-green-600 text-sm font-medium">+5 XP</span>
                ) : (
                  <button className="btn-accent-cyan">Completar</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
