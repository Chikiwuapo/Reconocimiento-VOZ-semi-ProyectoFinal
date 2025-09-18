import Layout from '../../components/Blackboard/Layout'

export default function Models() {
  return (
    <Layout pageTitle="Mis Modelos" pageSubtitle="Gestiona y revisa tus proyectos y entrenamientos recientes.">
      <section className="container-page mt-6 animate-slide-up">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-header">Proyectos recientes</h2>
            <button className="btn-accent-purple btn-lg">Nuevo modelo</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="card p-0 overflow-hidden h-[280px] flex flex-col">
              <img src="/src/assets/placeholder.svg" alt="Modelo" className="h-28 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-header">Clasificador de Sentimientos</h3>
                <p className="text-sm text-slate-600">Última ejecución: hace 2 días</p>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-purple">Entrenar</button>
                <button className="btn-accent-cyan">Resultados</button>
              </div>
            </div>
            <div className="card p-0 overflow-hidden h-[280px] flex flex-col">
              <img src="/src/assets/placeholder.svg" alt="Modelo" className="h-28 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-header">Detección de Objetos</h3>
                <p className="text-sm text-slate-600">Última ejecución: hace 5 días</p>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-purple">Entrenar</button>
                <button className="btn-accent-cyan">Resultados</button>
              </div>
            </div>
            <div className="card p-0 overflow-hidden h-[280px] flex flex-col">
              <img src="/src/assets/placeholder.svg" alt="Modelo" className="h-28 w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-header">Series Temporales</h3>
                <p className="text-sm text-slate-600">Última ejecución: hace 1 semana</p>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-purple">Entrenar</button>
                <button className="btn-accent-cyan">Resultados</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
