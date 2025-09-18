export default function Recommendations() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Recomendaciones personalizadas</h2>
        <p className="text-slate-600 text-sm">
          Ya que probaste modelos de texto, te recomendamos este de reconocimiento de imágenes.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary">Probar reconocimiento de imágenes</button>
          <button className="text-sm text-slate-600 hover:text-header transition">Ver más sugerencias</button>
        </div>
      </div>
    </section>
  )
}
