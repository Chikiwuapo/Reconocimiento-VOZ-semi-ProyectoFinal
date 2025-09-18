export default function ProfileQuick() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/src/assets/avatar.svg" alt="Avatar" className="h-12 w-12 rounded-full border border-slate-200" />
          <div>
            <h3 className="font-semibold text-header">Usuario Demo</h3>
            <p className="text-sm text-slate-600">usuario@example.com</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-accent-cyan">✏️ Editar perfil</button>
          <button className="btn-accent-cyan">🔑 Cambiar contraseña</button>
        </div>
      </div>
    </section>
  )
}
