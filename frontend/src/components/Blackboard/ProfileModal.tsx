import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '../../auth/userStore'
import { useTheme } from '../../App'

type Props = {
  onClose: () => void
  onConfirm: () => void
}

export default function ProfileModal({ onClose, onConfirm }: Props) {
  const { isDarkMode } = useTheme()
  const { user, updateProfile, setAvatar } = useUserStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.profile.name || 'Usuario')
  const [email, setEmail] = useState(user.profile.email || 'usuario@example.com')
  const [avatarPreview, setAvatarPreview] = useState<string>(user.profile.avatarDataUrl || '/src/assets/avatar.svg')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(user.profile.avatarDataUrl)
  const fileInput = useRef<HTMLInputElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // mount animation
  useEffect(() => {
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Sync when user changes
  useEffect(() => {
    setName(user.profile.name || 'Usuario')
    setEmail(user.profile.email || 'usuario@example.com')
    setAvatarPreview(user.profile.avatarDataUrl || '/src/assets/avatar.svg')
    setAvatarDataUrl(user.profile.avatarDataUrl)
  }, [user.profile.name, user.profile.email, user.profile.avatarDataUrl])

  const pickFile = () => fileInput.current?.click()
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : undefined
        if (dataUrl) {
          setAvatarPreview(dataUrl)
          setAvatarDataUrl(dataUrl)
        }
      }
      reader.readAsDataURL(f)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div
        ref={dialogRef}
        className={`relative w-full max-w-lg rounded-xl shadow-soft p-6 transform transition-all duration-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={`text-xl font-semibold text-center ${isDarkMode ? 'text-white' : 'text-header'}`}>Perfil</h2>
        <div className="mt-4 flex flex-col items-center">
          <img src={avatarPreview} alt="Avatar" className={`h-28 w-28 rounded-full object-cover shadow-sm ${isDarkMode ? 'border border-gray-700' : 'border border-slate-200'}`} />
          <button
            className={`mt-3 inline-flex items-center justify-center h-10 w-10 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-primary ${isDarkMode ? 'border border-gray-700 hover:bg-gray-800 text-gray-200' : 'border border-slate-200 hover:bg-slate-50 text-header'}`}
            onClick={pickFile}
            aria-label="Subir imagen"
            title="Subir imagen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 16V4"/>
              <path d="M8 8l4-4 4 4"/>
              <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
            </svg>
          </button>
          <input type="file" accept="image/*" ref={fileInput} onChange={onFile} className="hidden" />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Nombre</label>
            <input disabled={!editing} value={name} onChange={(e) => setName(e.target.value)} className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-200'}`} />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Correo</label>
            <input disabled={!editing} value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-slate-200'}`} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button className="btn" onClick={onClose}>Cerrar</button>
          {!editing ? (
            <button className="btn-accent-cyan" onClick={() => setEditing(true)}>Editar</button>
          ) : (
            <button className="btn-accent-purple" onClick={() => setShowConfirm(true)}>Confirmar cambios</button>
          )}
        </div>

        {showConfirm && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`absolute inset-0 rounded-xl ${isDarkMode ? 'bg-black/40' : 'bg-black/30'}`} />
            <div className={`relative rounded-xl shadow-soft p-5 w-full max-w-sm ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-header'}`}>Confirmar cambios</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>¿Deseas guardar los cambios del perfil?</p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn-accent-purple" onClick={() => { 
                  // persist changes
                  updateProfile({ name, email })
                  setAvatar(avatarDataUrl)
                  setShowConfirm(false)
                  onConfirm()
                }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
