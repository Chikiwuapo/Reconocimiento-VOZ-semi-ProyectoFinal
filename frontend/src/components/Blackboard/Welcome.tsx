type WelcomeProps = {
  userName: string
  progress: number // 0-100
}

export default function Welcome({ userName, progress }: WelcomeProps) {
  return (
    <section className="mt-6 animate-slide-up">
      <div className="bg-hero-gradient">
        <div className="container-page py-8">
          <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl font-bold text-header">
                  Hola, {userName} 👋
                </h1>
                <p className="text-slate-700 mt-2 font-inter">
                  ¡Explora el mundo del Machine Learning con tus propios modelos!
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Ilustración/ícono grande */}
                <div className="h-20 w-20 rounded-2xl bg-hero-solid shadow-soft flex items-center justify-center text-3xl" aria-hidden>
                  🤖
                </div>
                <button className="btn-accent-purple">Nuevo proyecto</button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Progreso general</span>
                <span className="font-medium text-header">{progress}%</span>
              </div>
              <div className="h-3 bg-alt rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%`, backgroundColor: 'var(--accent-green)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
