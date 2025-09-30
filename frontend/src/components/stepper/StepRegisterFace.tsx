import { useState } from 'react'
import Modal from './Modal'
import { useFaceCapture } from '../../auth/useFaceCapture'
import { registerUser } from '../../services/authService'
import VoiceButton from '../VoiceButton'
import VoiceCommandsButton from '../VoiceCommandsButton'
import VoiceConsentModal from '../modals/VoiceConsentModal'
import VoiceRecordingModal from '../modals/VoiceRecordingModal'
import VoiceActiveModal from '../modals/VoiceActiveModal'
import { useVoiceCommands } from '../../hooks/useVoiceCommands'

export default function StepRegisterFace({
  baseData,
  onRegistered,
}: {
  baseData: { nombres: string; apellidos: string; email: string; dni: string }
  onRegistered: () => void
}) {
  const { videoRef, canvasRef, overlayRef, ready, error, faceReady, status, captureMulti } = useFaceCapture()
  const [consentOpen, setConsentOpen] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Estados para comandos de voz
  const [voiceActive, setVoiceActive] = useState(true) // Activado por defecto
  const [voiceRegistered, setVoiceRegistered] = useState(true) // Ya registrado por defecto
  
  // Estados para los modales de voz
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [showActiveModal, setShowActiveModal] = useState(false)
  // Removed unused state variables: isRecording, recordingCountdown, recordingProgress

  // Hook para comandos de voz
  const voiceCommands = useVoiceCommands({
    onFieldUpdate: (field: string, value: string) => {
      // En el registro facial no hay campos para actualizar, pero mantenemos la estructura
      console.log(`Campo ${field} actualizado a: ${value}`)
    },
    onError: (error: string) => {
      console.error('Error en comando de voz:', error)
    },
    onCommandProcessed: (command: string) => {
      console.log('Comando procesado:', command)
    },
    onRegisterCommand: handleAutoRegister,
    onTypingEffect: () => {
      // En el registro facial no hay efecto de escritura
      console.log('Efecto de escritura solicitado (no aplicable en registro facial)')
    }
  })

  // Función para registro automático por comando de voz
  async function handleAutoRegister() {
    if (!ready || !faceReady || submitting) return
    await onDoRegister()
  }

  // Función para manejar el click del botón de comandos de voz
  const handleVoiceCommandsClick = () => {
    if (voiceActive) {
      voiceCommands.stopListening()
      setVoiceActive(false)
    } else {
      voiceCommands.startListening()
      setVoiceActive(true)
    }
  }

  // Función para manejar el registro de voz
  const handleVoiceRegistrationClick = () => {
    setShowConsentModal(true)
  }

  // Funciones para manejar los modales de voz
  const handleConsentAccept = () => {
    setShowConsentModal(false)
    setShowRecordingModal(true)
  }

  const handleConsentCancel = () => {
    setShowConsentModal(false)
  }

  const handleRecordingClose = () => {
    setShowRecordingModal(false)
  }

  const handleStartRecording = () => {
    setShowRecordingModal(false)
    setShowActiveModal(true)
  }

  const handleActiveModalClose = () => {
    setShowActiveModal(false)
    setVoiceRegistered(true)
  }

  const handleVoiceRecorded = () => {
    setShowActiveModal(false)
    setVoiceRegistered(true)
  }

  async function onDoRegister() {
    if (!ready || !faceReady || submitting) return
    setSubmitting(true)
    try {
      const samples = await captureMulti(5, 220)
      await registerUser({ ...baseData, samples })
      setConfirmOpen(true)
    } catch (e: any) {
      alert(e?.message || 'Error al registrar')
    } finally {
      setSubmitting(false)
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

      <h2 className="text-2xl md:text-3xl font-semibold">Registro facial</h2>
      <p className="text-neutral-400 text-sm mt-2">Da tu consentimiento y captura 5 muestras de tu rostro.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Camera (70%) */}
        <div className="md:col-span-8">
          <div
            className="relative rounded-2xl overflow-hidden border bg-black/60"
            style={{ height: 420, boxShadow: faceReady ? '0 0 0 2px rgba(34,197,94,.4), 0 0 36px rgba(34,197,94,.25)' : '0 0 0 1px rgba(255,255,255,.1)'}}
          >
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="absolute right-2 top-2 text-xs px-2 py-1 rounded-full border border-white/10 bg-black/40 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: faceReady ? '#22c55e' : '#ef4444' }} />
              {faceReady ? 'Rostro detectado' : 'Buscando rostro'}
            </div>
            <div className="absolute left-2 bottom-2 text-xs px-2 py-1 rounded-full border border-white/10 bg-black/40">
              {ready ? status : (error ? 'Cámara no disponible' : 'Inicializando cámara...')}
            </div>
          </div>
          <div className="mt-4 flex">
            <button onClick={onDoRegister} disabled={!ready || !faceReady || submitting} className="w-full rounded-full bg-[#5227FF] text-white px-6 py-3 text-sm md:text-base disabled:opacity-50">
              {submitting ? 'Registrando…' : 'Registrar rostro'}
            </button>
          </div>
        </div>

        {/* Right: Tips (30%) */}
        <aside className="md:col-span-4 md:pl-2">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-base font-semibold mb-2">Recomendaciones</h3>
            <ul className="text-neutral-300 text-sm space-y-1.5 leading-6">
              <li>💡 Iluminación frontal suave, evita contraluces.</li>
              <li>👤 Rostro centrado y a distancia media.</li>
              <li>⏳ Manténte quieto unos segundos.</li>
              <li>✅ Espera “Rostro detectado” antes de registrar.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Botones de voz posicionados en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3 items-end">
        {/* Botón de comandos de voz - visible cuando está registrado - IZQUIERDA */}
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

      {/* Consent */}
      <Modal open={consentOpen} onClose={()=>setConsentOpen(false)} title="Consentimiento">
        <p>Necesitamos tu autorización para capturar tu imagen facial con fines de autenticación. Tus datos serán tratados según las mejores prácticas.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={()=>{ setConsentOpen(false); onRegistered() }} className="px-3 py-1.5 rounded-md border border-white/15">Omitir</button>
          <button onClick={()=> setConsentOpen(false)} className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white">Aceptar</button>
        </div>
      </Modal>

      {/* Confirmation */}
      <Modal open={confirmOpen} onClose={()=>{ setConfirmOpen(false); onRegistered() }} title="Rostro capturado con éxito">
        <div className="mt-2 flex justify-end">
          <button onClick={()=>{ setConfirmOpen(false); onRegistered() }} className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white">Siguiente</button>
        </div>
      </Modal>

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
        isRecording={false}
        countdown={6}
        progress={0}
      />

      <VoiceActiveModal
        isOpen={showActiveModal}
        onClose={handleActiveModalClose}
        onVoiceRecorded={handleVoiceRecorded}
      />
    </div>
  )
}
