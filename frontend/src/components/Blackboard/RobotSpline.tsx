import { Suspense } from 'react'
import Spline from '@splinetool/react-spline'

export default function RobotSpline() {
  return (
    <main className="w-full h-screen bg-black relative overflow-hidden">
      {/* Fondo negro sólido */}
      <div className="absolute inset-0 bg-black z-0"></div>
      
      {/* Gradiente negro adicional para asegurar el color */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-10"></div>
      
      {/* Contenedor del robot Spline */}
      <div className="relative z-20 w-full h-full">
        <Suspense 
          fallback={
            <div className="h-full w-full flex items-center justify-center bg-black">
              <div className="text-white text-lg">Cargando robot 3D...</div>
            </div>
          }
        >
          <div className="w-full h-full bg-black">
            <Spline 
              scene="https://prod.spline.design/MkKXGadexYmBSdWO/scene.splinecode"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                background: '#000000'
              }}
            />
          </div>
        </Suspense>
      </div>
      
      {/* Overlay negro semitransparente para oscurecer aún más */}
      <div className="absolute inset-0 bg-black/30 z-30 pointer-events-none"></div>
      
      {/* Bordes negros para asegurar que no se vea nada de color */}
      <div className="absolute top-0 left-0 w-full h-4 bg-black z-40"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-black z-40"></div>
      <div className="absolute top-0 left-0 w-4 h-full bg-black z-40"></div>
      <div className="absolute top-0 right-0 w-4 h-full bg-black z-40"></div>
    </main>
  )
}