import Layout from '../../components/Blackboard/Layout'

export default function Profile() {
  return (
    <Layout pageTitle="Perfil" pageSubtitle="Gestiona tus datos y preferencias.">
      <section className="container-page mt-6 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold text-header">Información de cuenta</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nombre</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="Usuario Demo" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Correo</label>
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="usuario@example.com" />
              </div>
            </div>
            <div className="mt-4">
              <button className="btn-primary">Guardar cambios</button>
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold text-header">Seguridad</h2>
            <p className="text-sm text-slate-600 mt-1">Actualiza tu contraseña periódicamente.</p>
            <div className="mt-4 flex flex-col gap-3">
              <button className="btn-primary">Cambiar contraseña</button>
              <button className="text-sm text-slate-600 hover:text-header transition">Configurar 2FA</button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
