import { useState } from 'react';

interface HowItWorksProps {
  isDarkMode?: boolean;
}

const HowItWorks = ({ isDarkMode = false }: HowItWorksProps) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: "Captura de voz",
      description: "Nuestro sistema captura tu voz a través del micrófono de tu dispositivo con alta fidelidad y precisión.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      title: "Procesamiento de audio",
      description: "El audio es procesado y optimizado para eliminar ruidos y mejorar la calidad de la señal de voz.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Transcripción a texto",
      description: "Utilizamos algoritmos avanzados de Machine Learning para convertir la voz en texto con alta precisión.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Análisis y resultados",
      description: "El texto es analizado para extraer información relevante y presentar resultados útiles y accionables.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // SVG para ilustrar el proceso
  const renderProcessSVG = () => {
    return (
      <svg className="w-full h-64" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Línea de proceso */}
        <path 
          d="M100,150 L700,150" 
          stroke={isDarkMode ? "#333" : "#E0E0E0"} 
          strokeWidth="4" 
          strokeDasharray="1,10"
        />
        
        {/* Círculos de pasos */}
        {steps.map((_, index) => {
          const x = 100 + index * 200;
          return (
            <g key={index}>
              <circle 
                cx={x} 
                cy="150" 
                r="40" 
                fill={
                  index === activeStep 
                    ? isDarkMode ? "#6A11CB" : "#1B4965" 
                    : index < activeStep 
                      ? isDarkMode ? "#3A7BD5" : "#62B6CB" 
                      : isDarkMode ? "#1A1A1A" : "#F5F5F5"
                } 
                stroke={
                  index === activeStep 
                    ? isDarkMode ? "#6A11CB" : "#1B4965" 
                    : isDarkMode ? "#333" : "#E0E0E0"
                }
                strokeWidth="2"
              />
              <text 
                x={x} 
                y="155" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill={
                  index <= activeStep 
                    ? "white" 
                    : isDarkMode ? "#666" : "#999"
                }
                fontSize="20"
                fontWeight="bold"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
        
        {/* Animación específica para cada paso */}
        {activeStep === 0 && (
          <>
            {/* Ondas de sonido */}
            <path 
              d="M100,150 C120,120 120,180 140,150 C160,120 160,180 180,150" 
              stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
              strokeWidth="3" 
              fill="none"
            />
            <path 
              d="M80,150 C110,100 110,200 140,150 C170,100 170,200 200,150" 
              stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
              strokeWidth="2" 
              fill="none"
              opacity="0.6"
            />
          </>
        )}
        
        {activeStep === 1 && (
          <>
            {/* Procesamiento de señal */}
            <path 
              d="M300,180 L280,160 L290,150 L280,140 L290,130 L280,120 L300,100" 
              stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
              strokeWidth="3" 
              fill="none"
            />
            <path 
              d="M320,180 L340,160 L330,150 L340,140 L330,130 L340,120 L320,100" 
              stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
              strokeWidth="3" 
              fill="none"
            />
          </>
        )}
        
        {activeStep === 2 && (
          <>
            {/* Texto emergiendo */}
            <text 
              x="500" 
              y="120" 
              fill={isDarkMode ? "#6A11CB" : "#1B4965"} 
              fontSize="14"
            >
              "Hola mundo"
            </text>
            <text 
              x="480" 
              y="140" 
              fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
              fontSize="14"
            >
              "Reconocimiento de voz"
            </text>
            <text 
              x="510" 
              y="160" 
              fill={isDarkMode ? "#6A11CB" : "#1B4965"} 
              fontSize="14"
            >
              "Machine Learning"
            </text>
            <text 
              x="490" 
              y="180" 
              fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
              fontSize="14"
            >
              "Inteligencia Artificial"
            </text>
          </>
        )}
        
        {activeStep === 3 && (
          <>
            {/* Gráficos de análisis */}
            <rect x="680" y="120" width="10" height="60" fill={isDarkMode ? "#6A11CB" : "#1B4965"} />
            <rect x="700" y="100" width="10" height="80" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <rect x="720" y="130" width="10" height="50" fill={isDarkMode ? "#6A11CB" : "#1B4965"} />
            <rect x="740" y="90" width="10" height="90" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <rect x="760" y="110" width="10" height="70" fill={isDarkMode ? "#6A11CB" : "#1B4965"} />
          </>
        )}
      </svg>
    );
  };

  return (
    <section 
      id="como-funciona" 
      className={`py-20 ${
        isDarkMode 
          ? 'bg-[#121212]' 
          : 'bg-[#F5F5F5]'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode 
                ? 'text-white' 
                : 'text-[#1B4965]'
            }`}
          >
            Cómo Funciona
          </h2>
          <p 
            className={`max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Nuestro sistema de reconocimiento de voz utiliza tecnología de punta para transformar tu voz en datos accionables.
          </p>
        </div>
        
        <div className="mb-16">
          {renderProcessSVG()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`p-6 rounded-lg cursor-pointer transition-all ${
                activeStep === index 
                  ? isDarkMode 
                    ? 'bg-[#1A1A1A] border-b-4 border-[#6A11CB]' 
                    : 'bg-white shadow-lg border-b-4 border-[#1B4965]'
                  : isDarkMode 
                    ? 'bg-[#1A1A1A] hover:bg-[#0D0D0D]' 
                    : 'bg-white shadow hover:shadow-md'
              }`}
              onClick={() => setActiveStep(index)}
            >
              <div 
                className={`flex justify-center mb-4 ${
                  activeStep === index 
                    ? isDarkMode 
                      ? 'text-[#6A11CB]' 
                      : 'text-[#1B4965]'
                    : isDarkMode 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                }`}
              >
                {step.icon}
              </div>
              <h3 
                className={`text-xl font-bold text-center mb-2 ${
                  isDarkMode ? 'text-white' : 'text-[#1B4965]'
                }`}
              >
                {step.title}
              </h3>
              <p 
                className={`text-center ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;