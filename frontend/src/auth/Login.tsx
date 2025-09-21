import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFaceCapture } from './useFaceCapture'
import { loginFacial } from '../services/authService'

// Palette
const BG = '#0d0d0f'
const TEXT = '#E4E4E7'
const PRIMARY = '#6C63FF'
const SECONDARY = '#00D4FF'
const gradient = 'linear-gradient(135deg, #6C63FF 0%, #6A11CB 45%, #F53844 100%)'

export default function Login() {
  const { videoRef, canvasRef, overlayRef, ready, error, faceReady, status, capture } = useFaceCapture()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email])

  async function onLogin() {
    if (!emailValid) return
    const shot = capture()
    if (!shot) return
    setSubmitting(true)
    try {
      await loginFacial({ email, facialFrame: shot.imageB64, position: shot.position })
      navigate('/dashboard')
    } catch (e: any) {
      alert(e?.message || 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', position: 'relative', overflow: 'hidden' }}>
      {/* Aurora background */}
      <div style={{ position: 'absolute', inset: '-20% -10% auto -10%', height: '60%', background: 'radial-gradient(60% 60% at 20% 20%, rgba(108,99,255,.25), transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 'auto -20% -10% -10%', height: '60%', background: 'radial-gradient(50% 60% at 80% 80%, rgba(0,212,255,.18), transparent 60%)' }} />

      <div style={{ width: 'min(1040px, 96vw)', borderRadius: 24, overflow: 'hidden', background: 'rgba(18,18,22,.8)', boxShadow: '0 30px 80px rgba(20,20,40,.6)', border: '1px solid rgba(255,255,255,.06)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 0 }}>
          <div style={{ position: 'relative', padding: 32 }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(800px 400px at 20% -10%, rgba(106,17,203,.25), transparent 70%), radial-gradient(600px 300px at 120% 110%, rgba(58,123,213,.25), transparent 70%)' }} />
            <header style={{ marginBottom: 10 }}>
              <h1 style={{ margin: 0, fontFamily: 'Montserrat, Inter, system-ui', fontWeight: 800, letterSpacing: 0.3, fontSize: 36, background: gradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Login Facial</h1>
              <p style={{ opacity: .75, marginTop: 6, color: '#c7c7d1' }}>Posiciona tu rostro al centro y mira al frente.</p>
            </header>

            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${faceReady ? 'rgba(34,197,94,.6)' : 'rgba(244,63,94,.5)'}`, background: '#0f0f10', boxShadow: faceReady ? '0 0 0 2px rgba(34,197,94,.25), 0 20px 50px rgba(0,0,0,.4)' : '0 0 0 2px rgba(244,63,94,.2), 0 20px 50px rgba(0,0,0,.4)', transition: 'box-shadow .3s, border-color .3s', height: 380 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', zIndex: 0, position: 'relative' }} />
              {/* Overlay for mesh mask */}
              <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {/* Animated frame glow */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', boxShadow: `inset 0 0 40px ${faceReady ? 'rgba(0,255,170,.08)' : 'rgba(255,0,80,.06)'}`, zIndex: 1 }} />
              {/* Animated green ring when face is ready */}
              {faceReady && (
                <>
                  <style>{`@keyframes pulseGreen{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.35)}50%{box-shadow:0 0 0 6px rgba(34,197,94,.12)}}`}</style>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 20, border: '2px solid rgba(34,197,94,.65)', animation: 'pulseGreen 1.6s ease-in-out infinite', pointerEvents: 'none', zIndex: 2 }} />
                </>
              )}
              {/* Camera indicator */}
              <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cfd3e1', background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.08)', padding: '6px 10px', borderRadius: 999 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: faceReady ? '#22c55e' : '#ef4444', boxShadow: `0 0 12px ${faceReady ? 'rgba(34,197,94,.8)' : 'rgba(239,68,68,.8)'}` }} />
                {faceReady ? 'Rostro detectado' : 'Buscando rostro'}
              </div>
              {/* Status pill */}
              <div style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.08)', fontSize: 12, letterSpacing: .2 }}>{ready ? status : (error ? 'Cámara no disponible' : 'Inicializando cámara...')}</div>
            </div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .75 }}>✉️</span>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Tu email"
                  type="email"
                  style={{ width: '100%', height: 50, padding: '12px 14px 12px 36px', borderRadius: 12, background: '#0e0e10', color: TEXT, border: `1px solid ${emailValid ? 'rgba(255,255,255,.15)' : 'rgba(244,63,94,.35)'}`, outline: 'none', transition: 'box-shadow .2s, border-color .2s' }}
                  onFocus={(e) => { (e.currentTarget.style.boxShadow = `0 0 0 3px ${PRIMARY}44`) }}
                  onBlur={(e) => { (e.currentTarget.style.boxShadow = 'none') }}
                />
              </div>
              <button
                onClick={onLogin}
                disabled={!ready || !emailValid || submitting || !faceReady}
                style={{ width: '100%', height: 54, borderRadius: 12, border: 'none', color: '#fff', background: gradient, cursor: (!ready || !emailValid || submitting || !faceReady) ? 'not-allowed' : 'pointer', opacity: (!ready || !emailValid || submitting || !faceReady) ? .6 : 1, fontWeight: 700, fontSize: 16, transform: 'translateZ(0)', boxShadow: '0 10px 30px rgba(108,99,255,.25)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 14px 36px rgba(108,99,255,.35)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(108,99,255,.25)' }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
              >{submitting ? 'Ingresando…' : 'Iniciar sesión'}</button>
            </div>

            <div style={{ marginTop: 10, fontSize: 14, color: '#b8bdcc' }}>
              ¿No tienes cuenta? <Link to="/register" style={{ color: SECONDARY, textDecoration: 'none' }}>Regístrate</Link>
            </div>
          </div>

          <aside style={{ padding: 32, borderLeft: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(108,99,255,.12), rgba(106,17,203,.08) 40%, rgba(0,212,255,.10))' }}>
            <h3 style={{ marginTop: 4, fontFamily: 'Montserrat, Inter', letterSpacing: .5, fontWeight: 800 }}>Como usar el login facial</h3>
            <div style={{ display: 'grid', gap: 6, marginTop: 8, marginBottom: 20 }}>
              <TipCard icon="✅" text="Posiciona tu rostro al centro y mira al frente." small />
              <TipCard icon="✅" text="Mantente quieto mirando al frente" small />
              <TipCard icon="✅" text="Ingresa tu correo electronico" small />
              <TipCard icon="✅" text="Presiona el boton de iniciar sesión" small />
            </div>
            <h3 style={{ marginTop: 4, fontFamily: 'Montserrat, Inter', letterSpacing: .5, fontWeight: 800 }}>Consejos</h3>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              <TipCard icon="✅" text="Iluminación frontal suave" small />
              <TipCard icon="✅" text="Rostro centrado en el recuadro" small />
              <TipCard icon="✅" text="Mantente quieto mirando al frente" small />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function TipCard({ icon, text, small }: { icon: string; text: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: small ? '6px 8px' : '10px 12px', boxShadow: '0 6px 16px rgba(0,0,0,.18)' }}>
      <span style={{ fontSize: small ? 14 : 16 }}>{icon}</span>
      <span style={{ color: '#d8dbe7', fontSize: small ? 13 : 14 }}>{text}</span>
    </div>
  )
}
