import { useState } from 'react'
import Modal from './Modal'
import { useFaceCapture } from '../../auth/useFaceCapture'
import { registerUser } from '../../services/authService'

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
    </div>
  )
}
