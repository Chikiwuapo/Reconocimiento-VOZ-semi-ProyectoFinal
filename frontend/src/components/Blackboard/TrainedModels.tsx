import ActivityCard from './ActivityCard'

const trained = [
  { id: 't1', title: 'Clasificador v2', description: 'Accuracy 91% • hace 1 día', emoji: '📝', imageUrl: '/src/assets/placeholder.svg' },
  { id: 't2', title: 'Detector YOLO', description: 'mAP 0.57 • hace 3 días', emoji: '🖼️', imageUrl: '/src/assets/placeholder.svg' },
  { id: 't3', title: 'Forecast ARIMA', description: 'RMSE 12.4 • hace 5 días', emoji: '📈', imageUrl: '/src/assets/placeholder.svg' },
]

export default function TrainedModels() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Modelos entrenados</h2>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver historial</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {trained.map((m) => (
          <ActivityCard
            key={m.id}
            title={m.title}
            description={m.description}
            emoji={m.emoji as any}
            imageUrl={m.imageUrl}
            onTrain={() => {/* re-train */}}
          />
        ))}
      </div>
    </section>
  )
}
