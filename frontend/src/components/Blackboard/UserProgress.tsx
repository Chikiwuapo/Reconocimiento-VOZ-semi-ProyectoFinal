import { useEffect, useState } from 'react'

type Stats = {
  trained: number
  completed: number
  progressPercent: number // 0-100
  level: string
}

export default function UserProgress({ trained, completed, progressPercent, level }: Stats) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, progressPercent))
  const targetDash = (progress / 100) * circumference
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDash(targetDash), 50)
    return () => clearTimeout(t)
  }, [targetDash])

  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card flex items-center gap-5">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <circle cx="60" cy="60" r={radius} stroke="#F1F5F9" strokeWidth="10" fill="none" />
              <circle
                cx="60" cy="60" r={radius}
                stroke="#62B6CB" strokeWidth="10" fill="none"
                style={{ transition: 'stroke-dasharray 800ms ease-out' }}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-poppins font-semibold text-header">{progress}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-header">Progreso del usuario</h3>
            <p className="text-sm text-slate-600">Número de modelos y actividades completadas.</p>
            <div className="mt-3 flex gap-4">
              <span className="badge">Modelos: {trained}</span>
              <span className="badge">Actividades: {completed}</span>
            </div>
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/src/assets/avatar.svg" alt="Avatar" className="h-10 w-10 rounded-full" />
            <div>
              <h3 className="font-semibold text-header">Nivel actual</h3>
              <p className="text-sm text-slate-600">Sigue aprendiendo para subir de nivel.</p>
            </div>
          </div>
          <span className="badge">{level}</span>
        </div>

        <div className="card">
          <h3 className="font-semibold text-header">Tips rápidos</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Usa datos balanceados para mejores resultados.</li>
            <li>Separa entrenamiento y validación.</li>
            <li>Guarda checkpoints para reproducibilidad.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
