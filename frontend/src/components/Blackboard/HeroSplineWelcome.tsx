import { Suspense } from 'react'
// IMPORTANT: In Vite (React), prefer '@splinetool/react-spline'
// The 'next' export is for Next.js. We'll use the generic package.
import Spline from '@splinetool/react-spline'

export default function HeroSplineWelcome() {
  return (
    <section className="mt-6 animate-slide-up">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'rgba(15,23,42,0.08)' }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
            <div className="p-6 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-header">Explora nuestra Academia con un toque 3D</h2>
              <p className="text-slate-600 mt-2">Una vista interactiva creada con Spline para dar la bienvenida y mostrar la identidad tecnológica del proyecto.</p>
            </div>
            <div className="min-h-[320px] lg:min-h-[420px] bg-blue">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-slate-500">Cargando escena 3D…</div>}>
                {/* Spline scene */}
                <Spline scene="https://prod.spline.design/ipCRjZJLB7I3rCDj/scene.splinecode" />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
