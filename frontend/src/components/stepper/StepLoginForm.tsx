import { useMemo, useState } from 'react'
import Modal from './Modal'
import { validateUserTraditional } from '../../services/authService'
import VoiceCommandsButton from '../VoiceCommandsButton'
import { useVoiceCommands } from '../../hooks/useVoiceCommands'

export default function StepLoginForm({
  onNext,
}: {
  onNext: (data: { email: string; dni: string }) => void
}) {
  const [email, setEmail] = useState('')
  const [dni, setDni] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [notFoundOpen, setNotFoundOpen] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)

  const emailValid = useMemo(() => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email), [email])
  const dniValid = useMemo(() => /^\d{8,12}$/.test(dni), [dni])
  const valid = emailValid && dniValid

  // Configuración de comandos de voz
  const voiceCommands = useVoiceCommands({
    onFieldUpdate: (field: string, value: string) => {
      if (field === 'correo' || field === 'email') {
        setEmail(value)
      } else if (field === 'dni') {
        setDni(value)
      }
    },
    onError: (error: string) => {
      console.error('Error en comandos de voz:', error)
    },
    onCommandProcessed: (command: string) => {
      console.log('Comando procesado:', command)
    }
  })

  // Función para manejar el botón de comandos de voz
  const handleVoiceCommandsClick = () => {
    if (voiceActive) {
      // Si ya está activo, desactivar
      setVoiceActive(false)
      voiceCommands.stopListening()
    } else {
      // Si no está activo, activar comandos
      setVoiceActive(true)
      voiceCommands.startListening()
    }
  }

  function handleLogin() {
    setError(null)
    setNotFound(false)
    setOpen(true)
  }

  return (
    <div className="text-neutral-200">
      <h2 className="text-2xl md:text-3xl font-semibold">Login tradicional</h2>
      <p className="text-neutral-400 text-sm mt-2">Ingresa tus credenciales para continuar.</p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <input
            className={`w-full h-14 text-base bg-[#0e0e10] border ${
              notFound ? 'border-red-500' : email ? (emailValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'
            } rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`}
            placeholder="Correo"
            type="email"
            value={email}
            onChange={e=>{ setEmail(e.target.value); if (notFound) setNotFound(false) }}
          />
        </div>
        <div>
          <input
            className={`w-full h-14 text-base bg-[#0e0e10] border ${
              notFound ? 'border-red-500' : dni ? (dniValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'
            } rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`}
            placeholder="DNI (8-12 dígitos)"
            value={dni}
            onChange={e=>{ setDni(e.target.value); if (notFound) setNotFound(false) }}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <div className="mt-6 flex justify-center">
        <button onClick={handleLogin} disabled={!valid || loading} className="w-full max-w-xs sm:max-w-sm rounded-full bg-[#5227FF] text-white px-6 py-3 text-sm md:text-base disabled:opacity-50 transition transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(82,39,255,0.35)]">{loading ? 'Verificando…' : 'Iniciar sesión'}</button>
      </div>

      {/* Botón de comandos de voz */}
      <div className="mt-4 flex justify-center">
        <VoiceCommandsButton
          isActive={voiceActive}
          onClick={handleVoiceCommandsClick}
          disabled={loading}
        />
      </div>

      <Modal open={open} onClose={()=>{ if (!loading) setOpen(false) }} title="Verificación de credenciales">
        <p className="text-neutral-300">Verificaremos tu email y DNI contra la base de datos antes de continuar.</p>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={()=>{ if (!loading) setOpen(false) }} className="px-3 py-1.5 rounded-md border border-white/15">Cancelar</button>
          <button
            onClick={async()=>{
              try {
                setLoading(true)
                setError(null)
                await validateUserTraditional({ email, dni })
                setOpen(false)
                onNext({ email, dni })
              } catch (e: any) {
                if (e?.status === 404) {
                  setOpen(false)
                  setNotFound(true)
                  setNotFoundOpen(true)
                } else {
                  setError(e?.message || 'Credenciales inválidas')
                }
              } finally {
                setLoading(false)
              }
            }}
            className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white"
          >Confirmar</button>
        </div>
      </Modal>

      {/* Not Found Modal */}
      <Modal open={notFoundOpen} onClose={()=>setNotFoundOpen(false)} title="Usuario no encontrado">
        <p>Asegúrate de que tu correo y DNI sean correctos. Si aún no te has registrado, completa el Registro tradicional o facial.</p>
        <div className="mt-3 flex justify-end">
          <button onClick={()=>setNotFoundOpen(false)} className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white">Entendido</button>
        </div>
      </Modal>
    </div>
  )
}
