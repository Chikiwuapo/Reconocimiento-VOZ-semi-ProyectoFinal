import { useMemo, useState } from 'react'
import { registerBasic, registerVoice } from '../../services/authService'
import VoiceButton from '../VoiceButton'
import VoiceCommandsButton from '../VoiceCommandsButton'
import VoiceConsentModal from '../modals/VoiceConsentModal'
import VoiceRecordingModal from '../modals/VoiceRecordingModal'
import VoiceActiveModal from '../modals/VoiceActiveModal'
import { useVoiceCommands } from '../../hooks/useVoiceCommands'

export interface RegisterFormData {
  nombres: string
  apellidos: string
  email: string
  dni: string
}

export default function StepRegisterForm({
  initial,
  onNext,
  onGoToLogin,
}: {
  initial?: Partial<RegisterFormData>
  onNext: (data: RegisterFormData) => void
  onGoToLogin: () => void
}) {
  const [form, setForm] = useState<RegisterFormData>({
    nombres: initial?.nombres || '',
    apellidos: initial?.apellidos || '',
    email: initial?.email || '',
    dni: initial?.dni || '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceRegistered, setVoiceRegistered] = useState(false) // Nuevo estado para saber si ya se registró la voz
  
  // Estados para los modales de voz
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [showActiveModal, setShowActiveModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingCountdown, setRecordingCountdown] = useState(6)
  const [recordingProgress, setRecordingProgress] = useState(0)

  // Hook para comandos de voz
  const voiceCommands = useVoiceCommands({
    onFieldUpdate: (field: string, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }))
    },
    onError: (error: string) => {
      console.error('Error en comando de voz:', error)
    },
    onCommandProcessed: (command: string) => {
      console.log('Comando procesado:', command)
    },
    onRegisterCommand: () => {
      // Ejecutar registro automático si el formulario es válido
      if (valid && !submitting) {
        handleAutoRegister()
      }
    },
    onTypingEffect: (field: string, text: string) => {
      // Mostrar indicador visual de que se está escribiendo
      console.log(`Escribiendo en ${field}: ${text}`)
    }
  })

  // Función para registro automático (mejorada para coincidir con el botón principal)
  const handleAutoRegister = async () => {
    if (!valid || submitting) return
    
    try {
      setSubmitting(true)
      setError(null)
      await registerBasic(form)
      onNext(form)
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar tus datos')
    } finally {
      setSubmitting(false)
    }
  }

  // Función principal de registro (extraída para reutilización)
  const handleMainRegister = async () => {
    if (!valid || submitting) return
    
    try {
      setSubmitting(true)
      setError(null)
      await registerBasic(form)
      onNext(form)
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar tus datos')
    } finally {
      setSubmitting(false)
    }
  }

  const emailValid = useMemo(() => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email), [form.email])
  const dniValid = useMemo(() => /^\d{8,12}$/.test(form.dni), [form.dni])
  const valid = Boolean(form.nombres && form.apellidos && emailValid && dniValid)

  // Función para manejar el botón de registro de voz
  const handleVoiceRegistrationClick = () => {
    // Siempre mostrar modal de consentimiento para registro
    setShowConsentModal(true)
  }

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

  const handleConsentAccept = () => {
    setShowConsentModal(false)
    // Mostrar el modal de preparación para grabación
    setShowRecordingModal(true)
  }

  const handleConsentCancel = () => {
    setShowConsentModal(false)
  }

  const handleRecordingClose = () => {
    setShowRecordingModal(false)
    setIsRecording(false)
    setRecordingCountdown(6)
    setRecordingProgress(0)
  }

  const handleStartRecording = () => {
    setShowRecordingModal(false)
    setShowActiveModal(true)
  }

  const handleActiveModalClose = () => {
    setShowActiveModal(false)
    setVoiceRegistered(true) // Marcar que ya se registró la voz
    // No activar automáticamente los comandos de voz
  }

  const handleVoiceRecorded = async (audioBlob: Blob) => {
    try {
      console.log('Guardando audio en la base de datos...')
      await registerVoice(audioBlob)
      console.log('Audio guardado exitosamente')
      
      // Mostrar mensaje de éxito (opcional)
      // setSuccessMessage('Voz registrada correctamente')
    } catch (error) {
      console.error('Error al guardar el audio:', error)
      // Mostrar mensaje de error (opcional)
      // setError('No se pudo guardar la voz. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="text-neutral-200">
      {/* Indicador de comandos de voz activados */}
      {voiceActive && (
        <div className="fixed top-6 right-6 z-40 bg-green-500/20 border border-green-500/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">Comandos de voz activados</span>
          </div>
        </div>
      )}

      <h2 className="text-2xl md:text-3xl font-semibold">Registro tradicional</h2>
      <p className="text-neutral-400 text-sm mt-2">Completa tus datos. Continuarás con el registro facial.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="h-14 text-base bg-[#0e0e10] border border-white/10 rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30" placeholder="Nombres" value={form.nombres} onChange={e=>setForm(v=>({...v,nombres:e.target.value}))} />
        <input className="h-14 text-base bg-[#0e0e10] border border-white/10 rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30" placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm(v=>({...v,apellidos:e.target.value}))} />
        <div className="md:col-span-2">
          <input className={`w-full h-14 text-base bg-[#0e0e10] border ${form.email ? (emailValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'} rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`} placeholder="Correo" type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} />
        </div>
        <div className="md:col-span-2">
          <input className={`w-full h-14 text-base bg-[#0e0e10] border ${form.dni ? (dniValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'} rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`} placeholder="DNI (8-12 dígitos)" value={form.dni} onChange={e=>setForm(v=>({...v,dni:e.target.value}))} />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <div className="mt-6 flex items-center">
        <span className="text-xs text-neutral-400 hover:text-neutral-200">¿Ya tienes una cuenta?</span>
        <button onClick={onGoToLogin} className="ml-2 text-sm text-[#00D4FF] hover:underline">Iniciar sesión</button>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleMainRegister}
          disabled={!valid || submitting}
          className="w-full max-w-xs sm:max-w-sm rounded-full bg-[#5227FF] text-white px-6 py-3 text-sm md:text-base disabled:opacity-50 transition transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(82,39,255,0.35)]"
        >
          {submitting ? 'Guardando…' : 'Registrar y continuar'}
        </button>
      </div>

      {/* Botones de voz posicionados en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3 items-end">
        {/* Botón de comandos de voz - solo visible después del registro - IZQUIERDA */}
        {voiceRegistered && (
          <VoiceCommandsButton 
            isActive={voiceActive}
            onClick={handleVoiceCommandsClick}
            disabled={submitting}
          />
        )}
        
        {/* Botón de registro de voz - siempre visible - DERECHA */}
        <VoiceButton 
          isActive={false}
          onClick={handleVoiceRegistrationClick}
          disabled={submitting}
        />
      </div>

      {/* Modales de voz */}
      <VoiceConsentModal
        isOpen={showConsentModal}
        onClose={handleConsentCancel}
        onAccept={handleConsentAccept}
        onCancel={handleConsentCancel}
      />

      <VoiceRecordingModal
        isOpen={showRecordingModal}
        onClose={handleRecordingClose}
        onStartRecording={handleStartRecording}
        isRecording={isRecording}
        countdown={recordingCountdown}
        progress={recordingProgress}
      />

      <VoiceActiveModal
        isOpen={showActiveModal}
        onClose={handleActiveModalClose}
        onVoiceRecorded={handleVoiceRecorded}
      />
    </div>
  )
}
