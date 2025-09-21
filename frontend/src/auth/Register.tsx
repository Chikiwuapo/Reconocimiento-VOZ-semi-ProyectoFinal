import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFaceCapture } from './useFaceCapture'
import { registerUser } from '../services/authService'

const BG = '#0d0d0f'
const TEXT = '#E4E4E7'
const PRIMARY = '#6C63FF'
const SECONDARY = '#00D4FF'
const gradient = 'linear-gradient(135deg, #6C63FF 0%, #6A11CB 45%, #F53844 100%)'
    
export default function Register() {
  const { videoRef, canvasRef, overlayRef, ready, error, faceReady, status, captureMulti } = useFaceCapture()
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [email, setEmail] = useState('')
  const [dni, setDni] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const canSubmit = nombres && apellidos && /.+@.+\..+/.test(email) && dni && ready && !submitting

  async function onCaptureRegister() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const samples = await captureMulti(5, 220)
      await registerUser({ nombres, apellidos, email, dni, samples })
      alert('Registro exitoso. Ahora puedes iniciar sesión facial.')
      navigate('/login')
    } catch (e: any) {
      alert(e?.message || 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '-20% -10% auto -10%', height: '60%', background: 'radial-gradient(60% 60% at 20% 20%, rgba(108,99,255,.25), transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 'auto -20% -10% -10%', height: '60%', background: 'radial-gradient(50% 60% at 80% 80%, rgba(0,212,255,.18), transparent 60%)' }} />

      <div style={{ width: 'min(1040px, 96vw)', borderRadius: 24, overflow: 'hidden', background: 'rgba(18,18,22,.8)', boxShadow: '0 30px 80px rgba(20,20,40,.6)', border: '1px solid rgba(255,255,255,.06)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 0 }}>
          <div style={{ padding: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(900px 420px at -20% -10%, rgba(106,17,203,.22), transparent 70%), radial-gradient(700px 320px at 120% 110%, rgba(245,56,68,.12), transparent 70%)' }} />
            <header style={{ marginBottom: 10 }}>
              <h1 style={{ margin: 0, fontFamily: 'Montserrat, Inter, system-ui', fontWeight: 800, letterSpacing: 0.3, fontSize: 36, background: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Registro Facial</h1>
              <p style={{ opacity: .85, marginTop: 6, color: '#c7c7d1' }}>Completa tus datos y captura 5 muestras de tu rostro.</p>
            </header>

            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${faceReady ? 'rgba(34,197,94,.6)' : 'rgba(244,63,94,.5)'}`, background: '#0f0f10', boxShadow: faceReady ? '0 0 0 2px rgba(34,197,94,.25), 0 20px 50px rgba(0,0,0,.4)' : '0 0 0 2px rgba(244,63,94,.2), 0 20px 50px rgba(0,0,0,.4)', transition: 'box-shadow .3s, border-color .3s', height: 380 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', zIndex: 0, position: 'relative' }} />
              <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', boxShadow: `inset 0 0 40px ${faceReady ? 'rgba(0,255,170,.08)' : 'rgba(255,0,80,.06)'}`, zIndex: 1 }} />
              {faceReady && (
                <>
                  <style>{`@keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.35)}50%{box-shadow:0 0 0 6px rgba(34,197,94,.12)}}`}</style>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '2px solid rgba(34,197,94,.65)', animation: 'pulseGreen 1.6s ease-in-out infinite', pointerEvents: 'none', zIndex: 2 }} />
                </>
              )}
              <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cfd3e1', background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.08)', padding: '6px 10px', borderRadius: 999 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: faceReady ? '#22c55e' : '#ef4444', boxShadow: `0 0 12px ${faceReady ? 'rgba(34,197,94,.8)' : 'rgba(239,68,68,.8)'}` }} />
                {faceReady ? 'Rostro detectado' : 'Buscando rostro'}
              </div>
              <div style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.08)', fontSize: 12, letterSpacing: .2 }}>{ready ? status : (error ? 'Cámara no disponible' : 'Inicializando cámara...')}</div>
            </div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Nombres" style={{ ...fieldStyle, height: 50 }} onFocus={(e)=>{ e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}44` }} onBlur={(e)=>{ e.currentTarget.style.boxShadow = 'none' }} />
                <input value={apellidos} onChange={e => setApellidos(e.target.value)} placeholder="Apellidos" style={{ ...fieldStyle, height: 50 }} onFocus={(e)=>{ e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}44` }} onBlur={(e)=>{ e.currentTarget.style.boxShadow = 'none' }} />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ ...fieldStyle, gridColumn: 'span 2', height: 50 }} onFocus={(e)=>{ e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}44` }} onBlur={(e)=>{ e.currentTarget.style.boxShadow = 'none' }} />
                <input value={dni} onChange={e => setDni(e.target.value)} placeholder="DNI" style={{ ...fieldStyle, gridColumn: 'span 2', height: 50 }} onFocus={(e)=>{ e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}44` }} onBlur={(e)=>{ e.currentTarget.style.boxShadow = 'none' }} />
              </form>
              <button onClick={onCaptureRegister} disabled={!canSubmit || !faceReady} style={{ ...primaryButtonStyle, width: '100%', height: 54, fontSize: 16 }}>{submitting ? 'Registrando...' : 'Registrar rostro (5 muestras)'}</button>
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: '#b8bdcc' }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: SECONDARY, textDecoration: 'none' }}>Ir a login</Link>
            </div>
          </div>

          <aside style={{ padding: 32, borderLeft: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(108,99,255,.12), rgba(106,17,203,.08) 40%, rgba(0,212,255,.10))' }}>
            <h3 style={{ marginTop: 4, fontFamily: 'Montserrat, Inter', letterSpacing: .5, fontWeight: 800 }}>Consejos</h3>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              <Tip icon="✅" text="Iluminación frontal y rostro dentro del cuadro" small />
              <Tip icon="✅" text="Espera a ver 'Rostro detectado' antes de capturar" small />
              <Tip icon="✅" text="Mantén postura estable para muestras consistentes" small />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  background: '#0e0e10',
  color: TEXT,
  border: '1px solid rgba(255,255,255,.1)',
  outline: 'none',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  border: 'none',
  color: '#fff',
  background: gradient,
  cursor: 'pointer',
  fontWeight: 700,
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  color: '#fff',
  border: '1px solid rgba(255,255,255,.18)',
  background: 'transparent',
  textDecoration: 'none',
}

function Tip({ icon, text, small }: { icon: string; text: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: small ? '6px 8px' : '10px 12px', boxShadow: '0 6px 16px rgba(0,0,0,.18)' }}>
      <span style={{ fontSize: small ? 14 : 16 }}>{icon}</span>
      <span style={{ color: '#d8dbe7', fontSize: small ? 13 : 14 }}>{text}</span>
    </div>
  )
}
