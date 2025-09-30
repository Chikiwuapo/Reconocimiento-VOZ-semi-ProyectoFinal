import { useState } from 'react'
import Modal from './Modal'
import { useFaceCapture } from '../../auth/useFaceCapture'
import { loginFacial } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function StepLoginFace({ email }: { email?: string }) {
  const { videoRef, canvasRef, overlayRef, ready, error, faceReady, status, capture } = useFaceCapture()
  const [askOpen, setAskOpen] = useState(true)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function onValidate() {
    const shot = capture()
    if (!shot || !email) return
    setSubmitting(true)
    try {
      const response = await loginFacial({ email, facialFrame: shot.imageB64, position: shot.position })
      setResult({ ok: true, message: 'Rostro validado con éxito' })
      // Usar la URL de redirección del backend o fallback a blackboard
      const redirectUrl = response.redirect || '/blackboard'
      setTimeout(() => navigate(redirectUrl), 700)
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || 'Rostro no reconocido. Vuelva a intentarlo' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="text-neutral-200">
      <h2 className="text-2xl md:text-3xl font-semibold">Login facial</h2>
      <p className="text-neutral-400 text-sm mt-2">Puedes validar tu ingreso usando tu rostro.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Camera */}
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
            <button onClick={onValidate} disabled={!ready || !faceReady || submitting || !email} className="w-full rounded-full bg-[#5227FF] text-white px-6 py-3 text-sm md:text-base disabled:opacity-50">
              {submitting ? 'Validando…' : 'Validar rostro'}
            </button>
          </div>
        </div>

        {/* Right: Tips */}
        <aside className="md:col-span-4 md:pl-2">
          <div className="h-full w-full flex items-center justify-center">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 w-full max-w-md">
              <h3 className="text-base font-semibold mb-2">Recomendaciones</h3>
              <ul className="text-neutral-300 text-sm space-y-1.5 leading-6">
                <li>💡 Ubícate con iluminación frontal y uniforme.</li>
                <li>👤 Mantén el rostro centrado, mira al frente.</li>
                <li>⏳ Manténte quieto unos segundos para la detección.</li>
                <li>✅ Espera a ver “Rostro detectado” antes de validar.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Ask modal */}
      <Modal open={askOpen} onClose={()=>setAskOpen(false)} title="¿Deseas probar el inicio de sesión facial?">
        <div className="mt-2 flex justify-end gap-2">
          <button onClick={()=>{ setAskOpen(false); navigate('/blackboard') }} className="px-3 py-1.5 rounded-md border border-white/15">Omitir</button>
          <button onClick={()=> setAskOpen(false)} className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white">Continuar</button>
        </div>
      </Modal>

      {/* Result modal */}
      <Modal open={!!result} onClose={()=> setResult(null)} title={result?.ok ? 'Rostro validado con éxito' : 'Validación facial'}>
        <p>{result?.message}</p>
        <div className="mt-3 flex justify-end gap-2">
          {result?.ok ? (
            <button onClick={()=> {
              const redirectUrl = '/blackboard' // Por defecto, pero debería usar la URL del backend
              navigate(redirectUrl)
            }} className="px-3 py-1.5 rounded-md bg-[#5227FF] text-white">Ir al blackboard</button>
          ) : (
            <button onClick={()=> { setResult(null) }} className="px-3 py-1.5 rounded-md border border-white/15">Volver a intentarlo</button>
          )}
        </div>
      </Modal>
    </div>
  )
}
