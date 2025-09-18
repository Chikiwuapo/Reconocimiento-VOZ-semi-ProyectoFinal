import Layout from '../../components/Blackboard/Layout'
import Favorites from '../../components/Blackboard/Favorites'

export default function FavoritesPage() {
  return (
    <Layout pageTitle="Favoritos" pageSubtitle="Modelos marcados para acceso rápido.">
      <section className="bg-alt/60 py-2">
        <Favorites />
      </section>
      <section className="container-page mt-8 animate-slide-up">
        <div className="card">
          <h2 className="text-lg font-semibold text-header">Sugerencias</h2>
          <p className="text-sm text-slate-600 mt-1">Añade más modelos a favoritos para verlos aquí.</p>
        </div>
      </section>
    </Layout>
  )
}
