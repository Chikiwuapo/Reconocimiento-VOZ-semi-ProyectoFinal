import { useMemo, useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion'

interface ExamplesProps {
  isDarkMode?: boolean;
}

const Examples = ({ isDarkMode = false }: ExamplesProps) => {
  // Slides del carrusel estilo TRAE (drag horizontal)
  const slides = useMemo(
    () => [
      {
        title: 'Recomendaciones personalizadas',
        description:
          'Aprende de tus preferencias para ofrecerte contenido relevante y personalizado.',
        tint: isDarkMode ? '#6A11CB' : '#1B4965',
        kind: 'Recomendador',
      },
      {
        title: 'Predicciones',
        description:
          'Anticipa tendencias en clima, ventas o comportamiento para mejores decisiones.',
        tint: isDarkMode ? '#3A7BD5' : '#62B6CB',
        kind: 'Forecasting',
      },
      {
        title: 'Automatización',
        description:
          'Chatbots, clasificación y workflows para ahorrar tiempo y recursos.',
        tint: isDarkMode ? '#F53844' : '#1B4965',
        kind: 'Automatización',
      },
      {
        title: 'Detección de anomalías',
        description:
          'Identifica fraudes, fallos o comportamientos inusuales antes que ocurran.',
        tint: isDarkMode ? '#6A11CB' : '#62B6CB',
        kind: 'Anomalías',
      },
    ],
    [isDarkMode],
  )

  // Draggable – ancho por slide y snapping simple
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [current, setCurrent] = useState(0)
  const total = slides.length
  const [slideWidth, setSlideWidth] = useState(360)
  const [sidePad, setSidePad] = useState(0)

  // calcular ancho de slide para peeks laterales y centrado exacto
  useEffect(() => {
    const calc = () => {
      const w = containerRef.current?.offsetWidth || window.innerWidth || 1200
      let ratio = 0.78
      if (w < 640) ratio = 0.92 // móviles: tarjeta más ancha
      else if (w < 1024) ratio = 0.86 // tablets: un poco más ancha
      const sw = Math.round(w * ratio)
      setSlideWidth(sw)
      setSidePad(Math.max(0, Math.round((w - sw) / 2)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // sincroniza desplazamiento cuando cambia current
  useEffect(() => {
    fmAnimate(x, -current * slideWidth, { type: 'spring', stiffness: 320, damping: 34 })
  }, [current, x, slideWidth])

  // SVG para cada ejemplo con animaciones (se reutiliza dentro de tarjetas grandes)
  const renderSVG = (index: number) => {

    switch(index) {
      case 0: // Recomendaciones
        return (
          <motion.svg 
            key={`svg-${index}`}
            className="w-full h-64" 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Pantalla */}
            <rect x="50" y="50" width="300" height="200" rx="5" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Elementos de interfaz (barras + puntos animados) */}
            <motion.rect
              x="70" y="70" width="80" height="120" rx="3"
              fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ scaleY: [1, 1.12, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ originY: 1, transformBox: 'fill-box' }}
              opacity="0.9"
            />
            <motion.rect
              x="160" y="70" width="80" height="120" rx="3"
              fill={isDarkMode ? "#6A11CB" : "#7B2CBF"}
              animate={{ scaleY: [1, 1.16, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              style={{ originY: 1, transformBox: 'fill-box' }}
              opacity="0.9"
            />
            <motion.rect
              x="250" y="70" width="80" height="120" rx="3"
              fill={isDarkMode ? "#F53844" : "#E63946"}
              animate={{ scaleY: [1, 1.1, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{ originY: 1, transformBox: 'fill-box' }}
              opacity="0.9"
            />

            {/* Puntos superiores eliminados según solicitud */}
            
            {/* Texto de recomendación (líneas con pulso) */}
            <motion.rect x="70" y="200" width="260" height="10" rx="2" fill={isDarkMode ? "#333" : "#E0E0E0"}
              animate={{ scaleX: [1, 1.05, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} style={{ originX: 0, transformBox: 'fill-box' }} />
            <motion.rect x="70" y="220" width="180" height="10" rx="2" fill={isDarkMode ? "#333" : "#E0E0E0"}
              animate={{ scaleX: [1, 1.09, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} style={{ originX: 0, transformBox: 'fill-box' }} />
            
            {/* Elementos superiores removidos */}
          </motion.svg>
        );
      case 1: // Predicciones
        return (
          <motion.svg 
            key={`svg-${index}`}
            className="w-full h-64" 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Gráfico */}
            <path d="M50,250 L350,250" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            <path d="M50,250 L50,50" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Línea de tendencia animada (sin morph de d) */}
            <motion.path
              d="M50,200 C100,180 150,220 200,150 C250,80 300,120 350,50"
              stroke={isDarkMode ? "#6A11CB" : "#1B4965"}
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 6"
              animate={{ strokeDashoffset: [0, 14, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Área bajo la curva (pulso suave) */}
            <motion.path
              d="M50,200 C100,180 150,220 200,150 C250,80 300,120 350,50 L350,250 L50,250 Z"
              fill={isDarkMode ? "#6A11CB" : "#1B4965"}
              opacity="0.08"
              animate={{ opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Puntos de datos */}
            <motion.circle cx="50" cy="200" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -4, 4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="100" cy="180" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -5, 5, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="150" cy="220" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -5, 5, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="200" cy="150" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -5, 5, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="250" cy="80" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -5, 5, 0] }} transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="300" cy="120" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -5, 5, 0] }} transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx="350" cy="50" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"}
              animate={{ y: [0, -3, 3, 0] }} transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }} />
            
            {/* Línea de predicción */}
            <path d="M350,50 L400,30" 
                  stroke={isDarkMode ? "#F53844" : "#62B6CB"} 
                  strokeWidth="2" 
                  strokeDasharray="5,5" />
            
            {/* Etiqueta de predicción */}
            <circle cx="400" cy="30" r="8" fill={isDarkMode ? "#F53844" : "#62B6CB"} />
          </motion.svg>
        );
      case 2: // Automatización
        return (
          <motion.svg 
            key={`svg-${index}`}
            className="w-full h-64" 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Engranaje grande (rotación continua a la derecha, más lento) */}
            <motion.g
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '150px 150px' }}
            >
              <circle cx="150" cy="150" r="60" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeWidth="3" />
              <circle cx="150" cy="150" r="40" fill="none" stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="150" cy="150" r="20" fill={isDarkMode ? "#3A7BD5" : "#1B4965"} />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <rect 
                  key={`tg-${i}`}
                  x="145" 
                  y="80" 
                  width="10" 
                  height="20" 
                  fill={isDarkMode ? "#3A7BD5" : "#1B4965"}
                  transform={`rotate(${angle}, 150, 150)`}
                />
              ))}
            </motion.g>

            {/* Engranaje pequeño (rotación continua a la izquierda/antihorario, más lento) */}
            <motion.g
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '250px 150px' }}
            >
              <circle cx="250" cy="150" r="40" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} strokeWidth="3" />
              <circle cx="250" cy="150" r="25" fill="none" stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="250" cy="150" r="10" fill={isDarkMode ? "#6A11CB" : "#62B6CB"} />
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <rect 
                  key={`tp-${i}`}
                  x="245" 
                  y="100" 
                  width="10" 
                  height="15" 
                  fill={isDarkMode ? "#6A11CB" : "#62B6CB"}
                  transform={`rotate(${angle}, 250, 150)`}
                />
              ))}
            </motion.g>
            
            {/* Flechas de flujo */}
            <path d="M50,150 L80,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M75,145 L80,150 L75,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            
            <path d="M210,150 L240,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M235,145 L240,150 L235,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            
            <path d="M290,150 L350,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M345,145 L350,150 L345,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
          </motion.svg>
        );
      case 3: // Detección de anomalías con línea líquida
        return (
          <motion.svg 
            key={`svg-${index}`}
            className="w-full h-64" 
            viewBox="0 0 400 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Línea base */}
            <path d="M50,200 L350,200" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Patrón normal (sin morph de d) */}
            <motion.path
              d="M50,200 C70,180 90,220 110,180 C130,140 150,220 170,180 C190,140 210,220 230,180"
              stroke={isDarkMode ? '#3A7BD5' : '#1B4965'} strokeWidth="3" fill="none"
              strokeDasharray="10 8"
              animate={{ strokeDashoffset: [0, 18, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            {/* Anomalía (sin morph de d) */}
            <motion.path
              d="M230,180 C250,140 270,80 290,180"
              stroke={isDarkMode ? '#F53844' : '#62B6CB'} strokeWidth="3" fill="none"
              strokeDasharray="8 6"
              animate={{ strokeDashoffset: [0, 14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            {/* Continuación del patrón normal */}
            <path d="M290,180 C310,220 330,140 350,180" 
                  stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} 
                  strokeWidth="3" 
                  fill="none" />
            
            {/* Círculo de detección */}
            <circle cx="270" cy="80" r="20" fill="none" stroke={isDarkMode ? "#F53844" : "#62B6CB"} strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Símbolo de alerta */}
            <path d="M270,70 L270,85" stroke={isDarkMode ? "#F53844" : "#62B6CB"} strokeWidth="2" />
            <circle cx="270" cy="90" r="1" fill={isDarkMode ? "#F53844" : "#62B6CB"} />
          </motion.svg>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="ejemplos"
      className={`py-20 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Títulos */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`}
          >
            Ejemplos de Aplicación
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Situaciones reales donde el Machine Learning transforma la forma en que trabajamos y tomamos decisiones.
          </p>
        </div>

        {/* Carrusel estilo TRAE (drag para navegar) a ancho completo */}
        <div className={`w-full ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'} mb-10 md:mb-12`}>
          <div ref={containerRef} className="overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{ left: -slideWidth * (total - 1), right: 0 }}
              onDragEnd={(_, info) => {
                const threshold = 60
                if (info.offset.x < -threshold && current < total - 1) setCurrent(current + 1)
                else if (info.offset.x > threshold && current > 0) setCurrent(current - 1)
                else setCurrent(current)
              }}
              style={{ x }}
              className="flex gap-4 sm:gap-6 md:gap-10 select-none cursor-grab active:cursor-grabbing px-0"
            >
              {/* Espaciadores para centrar primera y última tarjeta */}
              <div style={{ minWidth: `${sidePad}px` }} />
              {slides.map((s, idx) => {
                const isFocused = idx === current
                const isNeighbor = idx === current - 1 || idx === current + 1
                const scaleVal = isFocused ? 1 : isNeighbor ? 0.92 : 0.86
                const zIndexVal = isFocused ? 30 : isNeighbor ? 20 : 10
                const shadow = isDarkMode ? 'shadow-[0_30px_70px_rgba(0,0,0,0.45)]' : 'shadow-[0_30px_70px_rgba(0,0,0,0.18)]'
                return (
                  <motion.div
                    key={idx}
                    animate={{ scale: scaleVal, zIndex: zIndexVal }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className={`rounded-2xl p-5 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-center ${
                      isDarkMode ? 'bg-[#111111] border border-[#262626]' : 'bg-white'
                    } ${shadow}`}
                    style={{ minWidth: `${slideWidth}px` }}
                  >
                    <div>
                      <h3 className={`text-2xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-header'}`}>{s.title}</h3>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-3 mb-6 text-base md:text-lg`}>
                        {s.description}
                      </p>
                      {/* Información adicional relevante por tarjeta */}
                      <ul className={`list-disc ml-5 mb-0 text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {idx === 0 && (
                        <>
                          <li>Filtrado por preferencias, historial y contexto.</li>
                          <li>Métricas: CTR, cobertura y diversidad.</li>
                          <li>Aplicable a contenidos, productos o cursos.</li>
                        </>
                      )}
                      {idx === 1 && (
                        <>
                          <li>Modelos ARIMA/Prophet/Redes neuronales.</li>
                          <li>Intervalos de confianza y alertas de desvío.</li>
                          <li>Exportación a dashboards y APIs.</li>
                        </>
                      )}
                      {idx === 2 && (
                        <>
                          <li>Workflows event-driven con disparadores.</li>
                          <li>Integración con APIs y colas de trabajo.</li>
                          <li>Logs, métricas y reintentos automáticos.</li>
                        </>
                      )}
                      {idx === 3 && (
                        <>
                          <li>Métodos estadísticos y ML para outliers.</li>
                          <li>Umbrales adaptativos por segmento.</li>
                          <li>Notificaciones y reporte de incidentes.</li>
                        </>
                      )}
                      </ul>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      {renderSVG(idx)}
                    </div>
                  </motion.div>
                )
              })}
              <div style={{ minWidth: `${sidePad}px` }} />
            </motion.div>
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            className={`px-4 py-2 rounded-md border ${isDarkMode ? 'border-[#2a2a2a] text-white' : 'border-gray-300 text-header'} disabled:opacity-40`}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            aria-label="Anterior"
          >
            ←
          </button>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{current + 1} / {total}</span>
          <button
            className={`px-4 py-2 rounded-md border ${isDarkMode ? 'border-[#2a2a2a] text-white' : 'border-gray-300 text-header'} disabled:opacity-40`}
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            disabled={current === total - 1}
            aria-label="Siguiente"
          >
            →
          </button>
        </div>

        {/* Se eliminó grid y modal de agentes según solicitud */}
      </div>
    </section>
  )
};

export default Examples;