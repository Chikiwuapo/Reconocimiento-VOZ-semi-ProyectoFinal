export default function Tips() {
  const tips = [
    'Recuerda marcar tus lecciones como completadas para guardar progreso.',
    'Actualiza tus modelos con nuevos datos para mejorar desempeño.',
    'Explora el playground para probar tus modelos rápidamente.',
  ]
  return (
    <section className="container-page animate-fade-in">
      <div className="bg-white rounded-xl shadow-soft p-4 border" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
        <h3 className="text-lg font-semibold text-header">Tips rápidos</h3>
        <ul className="mt-2 list-disc pl-5 text-slate-700 text-sm">
          {tips.map(t => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </section>
  )
}
