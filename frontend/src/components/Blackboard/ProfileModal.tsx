import { useRef, useState } from 'react'

type Props = {
  onClose: () => void
  onConfirm: () => void
}

export default function ProfileModal({ onClose, onConfirm }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Usuario Demo')
  const [email, setEmail] = useState('usuario@example.com')
  const [avatarPreview, setAvatarPreview] = useState<string>('/src/assets/avatar.svg')
  const fileInput = useRef<HTMLInputElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // mount animation
  useState(() => {
    setTimeout(() => setMounted(true), 0)
  })

  const pickFile = () => fileInput.current?.click()
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const url = URL.createObjectURL(f)
      setAvatarPreview(url)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div ref={dialogRef} className={`relative w-full max-w-lg bg-white rounded-xl shadow-soft p-6 transform transition-all duration-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} role="dialog" aria-modal="true">
        <h2 className="text-xl font-semibold text-header">Perfil</h2>
        <div className="mt-4 flex items-center gap-4">
          <img src={avatarPreview} alt="Avatar" className="h-16 w-16 rounded-full border border-slate-200" />
          <div>
            <div className="text-sm text-slate-600">Foto de perfil</div>
            <div className="mt-2 flex gap-2">
              <button className="btn" onClick={pickFile}>Subir imagen</button>
              <input type="file" accept="image/*" ref={fileInput} onChange={onFile} className="hidden" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nombre</label>
            <input disabled={!editing} value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Correo</label>
            <input disabled={!editing} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button className="btn" onClick={onClose}>Cerrar</button>
          <button className="btn-accent-cyan" onClick={() => setEditing((e) => !e)}>{editing ? 'Bloquear' : 'Editar'}</button>
          <button className="btn-accent-purple" onClick={() => setShowConfirm(true)}>Confirmar Cambios</button>
        </div>

        {showConfirm && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 rounded-xl" />
            <div className="relative bg-white rounded-xl shadow-soft p-5 w-full max-w-sm">
              <h3 className="font-semibold text-header">Confirmar cambios</h3>
              <p className="text-sm text-slate-600 mt-1">¿Deseas guardar los cambios del perfil?</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn-accent-purple" onClick={() => { setShowConfirm(false); onConfirm(); }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
