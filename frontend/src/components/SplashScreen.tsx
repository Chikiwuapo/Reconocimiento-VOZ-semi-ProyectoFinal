import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

interface SplashScreenProps {
  duration?: number // Duración en milisegundos, por defecto 5000ms (5 segundos)
}

export default function SplashScreen({ duration = 5000 }: SplashScreenProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Timer para la redirección automática
    const timer = setTimeout(() => {
      setIsLoading(false)
      navigate('/blackboard')
    }, duration)

    // Cleanup del timer si el componente se desmonta
    return () => clearTimeout(timer)
  }, [navigate, duration])

  return (
    <div 
      className="splash-screen"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Contenedor de la escena Spline */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <Spline 
          scene="https://prod.spline.design/sGq3NO3ysYCnIK3E/scene.splinecode"
          style={{
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Indicador de carga opcional */}
        {isLoading && (
          <div 
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              opacity: 0.8,
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: '10px' }}>Cargando...</div>
            <div 
              style={{
                width: '60px',
                height: '2px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '1px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  borderRadius: '1px',
                  animation: 'loading-bar 5s linear forwards'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Estilos CSS para la animación de la barra de carga */}
      <style>{`
        @keyframes loading-bar {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  )
}