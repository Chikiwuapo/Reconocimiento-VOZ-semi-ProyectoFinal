export default function ProfileQuick() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">U</div>
          <div>
            <h3 className="font-semibold text-header">Usuario Demo</h3>
            <p className="text-sm text-slate-600">usuario@example.com</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="text-sm text-slate-600 hover:text-header transition">Editar perfil</button>
          <button className="text-sm text-slate-600 hover:text-header transition">Cambiar contraseña</button>
        </div>
      </div>
    </section>
  )
}
