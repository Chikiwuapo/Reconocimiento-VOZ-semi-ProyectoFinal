export default function TrainedModels() {
  const models = [
    { id: 'tm1', name: 'Clasificador de gestos', status: 'Entrenado', acc: '92%' },
    { id: 'tm2', name: 'Embeddings faciales', status: 'Entrenando', acc: '—' },
    { id: 'tm3', name: 'Detector de manos', status: 'Listo', acc: '95%' },
  ]
  return (
    <section className="container-page mt-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-soft p-4 border" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
        <h3 className="text-lg font-semibold text-header">Modelos para entrenar</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {models.map(m => (
            <div key={m.id} className="p-3 rounded-lg border bg-white" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="font-medium text-slate-800">{m.name}</div>
              <div className="text-slate-600 text-sm">Estado: {m.status}</div>
              <div className="text-slate-600 text-sm">Accuracy: {m.acc}</div>
              <div className="mt-2 flex justify-end">
                <button className="btn-secondary">Entrenar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
