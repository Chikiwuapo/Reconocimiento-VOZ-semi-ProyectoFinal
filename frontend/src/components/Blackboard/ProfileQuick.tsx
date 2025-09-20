export default function ProfileQuick() {
  return (
    <section className="container-page animate-fade-in">
      <div className="bg-white rounded-xl shadow-soft p-4 border" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-hero-solid" />
          <div>
            <div className="text-header font-semibold">Tu perfil</div>
            <div className="text-slate-600 text-sm">Nivel 1 • Explorador de IA</div>
          </div>
        </div>
      </div>
    </section>
  )
}
