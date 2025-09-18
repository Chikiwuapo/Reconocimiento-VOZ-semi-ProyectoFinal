type WelcomeProps = {
  userName: string
  progress: number // 0-100
}

export default function Welcome({ userName, progress }: WelcomeProps) {
  return (
    <section className="container-page mt-6 animate-slide-up">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Hola, {userName} 👋
            </h1>
            <p className="text-slate-600 mt-1">
              Este es tu espacio para entrenar y experimentar con Machine Learning.
            </p>
          </div>
          <button className="btn-primary self-start md:self-auto">Nuevo proyecto</button>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progreso general</span>
            <span className="font-medium text-header">{progress}%</span>
          </div>
          <div className="h-3 bg-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
