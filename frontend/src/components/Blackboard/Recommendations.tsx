export default function Recommendations() {
  const items = [
    { id: 'r1', title: 'Reconocimiento de Voz con IA', note: 'Curso recomendado por tu interés en audio' },
    { id: 'r2', title: 'Chatbot Automatizado con IA', note: 'Combina NLP con automatización' },
    { id: 'r3', title: 'Agente IA Avanzado', note: 'Arquitecturas de agentes y herramientas' },
  ]
  return (
    <section className="container-page animate-fade-in">
      <div className="bg-white rounded-xl shadow-soft p-4 border" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
        <h3 className="text-lg font-semibold text-header">Recomendaciones para ti</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {items.map(it => (
            <div key={it.id} className="p-3 rounded-lg border bg-white" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
              <div className="font-medium text-slate-800">{it.title}</div>
              <div className="text-slate-600 text-sm">{it.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
