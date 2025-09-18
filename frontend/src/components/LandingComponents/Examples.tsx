import { useState } from 'react';

interface ExamplesProps {
  isDarkMode?: boolean;
}

const Examples = ({ isDarkMode = false }: ExamplesProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const examples = [
    {
      title: "Recomendaciones personalizadas",
      description: "Similar a Netflix o Spotify, nuestro sistema aprende de tus preferencias para ofrecerte contenido relevante y personalizado.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: "recommendation.svg"
    },
    {
      title: "Predicciones",
      description: "Anticipa tendencias en clima, ventas o comportamiento de usuarios para tomar decisiones informadas y estratégicas.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      image: "prediction.svg"
    },
    {
      title: "Automatización",
      description: "Clasifica correos, responde consultas con chatbots y automatiza tareas repetitivas para optimizar tu tiempo y recursos.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      image: "automation.svg"
    },
    {
      title: "Detección de anomalías",
      description: "Identifica fraudes, fallos o comportamientos inusuales antes de que se conviertan en problemas mayores.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      image: "anomaly.svg"
    }
  ];

  // SVG para cada ejemplo
  const renderSVG = (index: number) => {
    switch(index) {
      case 0: // Recomendaciones
        return (
          <svg className="w-full h-64" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Pantalla */}
            <rect x="50" y="50" width="300" height="200" rx="5" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Elementos de interfaz */}
            <rect x="70" y="70" width="80" height="120" rx="3" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} opacity="0.8" />
            <rect x="160" y="70" width="80" height="120" rx="3" fill={isDarkMode ? "#6A11CB" : "#1B4965"} opacity="0.8" />
            <rect x="250" y="70" width="80" height="120" rx="3" fill={isDarkMode ? "#F53844" : "#62B6CB"} opacity="0.8" />
            
            {/* Texto de recomendación */}
            <rect x="70" y="200" width="260" height="10" rx="2" fill={isDarkMode ? "#333" : "#E0E0E0"} />
            <rect x="70" y="220" width="180" height="10" rx="2" fill={isDarkMode ? "#333" : "#E0E0E0"} />
            
            {/* Iconos de usuario */}
            <circle cx="85" cy="40" r="10" fill={isDarkMode ? "#6A11CB" : "#1B4965"} />
            <circle cx="115" cy="40" r="10" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="145" cy="40" r="10" fill={isDarkMode ? "#F53844" : "#1B4965"} />
            
            {/* Líneas de conexión */}
            <line x1="85" y1="50" x2="110" y2="70" stroke={isDarkMode ? "#6A11CB" : "#1B4965"} strokeWidth="1" />
            <line x1="115" y1="50" x2="115" y2="70" stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} strokeWidth="1" />
            <line x1="145" y1="50" x2="120" y2="70" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="1" />
          </svg>
        );
      case 1: // Predicciones
        return (
          <svg className="w-full h-64" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Gráfico */}
            <path d="M50,250 L350,250" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            <path d="M50,250 L50,50" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Línea de tendencia */}
            <path d="M50,200 C100,180 150,220 200,150 C250,80 300,120 350,50" 
                  stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
                  strokeWidth="3" 
                  fill="none" />
            
            {/* Área bajo la curva */}
            <path d="M50,200 C100,180 150,220 200,150 C250,80 300,120 350,50 L350,250 L50,250 Z" 
                  fill={isDarkMode ? "#6A11CB" : "#1B4965"} 
                  opacity="0.1" />
            
            {/* Puntos de datos */}
            <circle cx="50" cy="200" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="100" cy="180" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="150" cy="220" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="200" cy="150" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="250" cy="80" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="300" cy="120" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            <circle cx="350" cy="50" r="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
            
            {/* Línea de predicción */}
            <path d="M350,50 L400,30" 
                  stroke={isDarkMode ? "#F53844" : "#62B6CB"} 
                  strokeWidth="2" 
                  strokeDasharray="5,5" />
            
            {/* Etiqueta de predicción */}
            <circle cx="400" cy="30" r="8" fill={isDarkMode ? "#F53844" : "#62B6CB"} />
          </svg>
        );
      case 2: // Automatización
        return (
          <svg className="w-full h-64" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Engranajes */}
            <circle cx="150" cy="150" r="60" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeWidth="3" />
            <circle cx="150" cy="150" r="40" fill="none" stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="150" cy="150" r="20" fill={isDarkMode ? "#3A7BD5" : "#1B4965"} />
            
            <circle cx="250" cy="150" r="40" fill={isDarkMode ? "#121212" : "#FFFFFF"} stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} strokeWidth="3" />
            <circle cx="250" cy="150" r="25" fill="none" stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="250" cy="150" r="10" fill={isDarkMode ? "#6A11CB" : "#62B6CB"} />
            
            {/* Dientes de engranaje */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect 
                key={i}
                x="145" 
                y="80" 
                width="10" 
                height="20" 
                fill={isDarkMode ? "#3A7BD5" : "#1B4965"}
                transform={`rotate(${angle}, 150, 150)`}
              />
            ))}
            
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <rect 
                key={i}
                x="245" 
                y="100" 
                width="10" 
                height="15" 
                fill={isDarkMode ? "#6A11CB" : "#62B6CB"}
                transform={`rotate(${angle}, 250, 150)`}
              />
            ))}
            
            {/* Flechas de flujo */}
            <path d="M50,150 L80,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M75,145 L80,150 L75,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            
            <path d="M210,150 L240,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M235,145 L240,150 L235,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            
            <path d="M290,150 L350,150" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
            <path d="M345,145 L350,150 L345,155" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
          </svg>
        );
      case 3: // Detección de anomalías
        return (
          <svg className="w-full h-64" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fondo */}
            <rect width="400" height="300" rx="10" fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} />
            
            {/* Línea base */}
            <path d="M50,200 L350,200" stroke={isDarkMode ? "#333" : "#E0E0E0"} strokeWidth="2" />
            
            {/* Patrón normal */}
            <path d="M50,200 C70,180 90,220 110,180 C130,140 150,220 170,180 C190,140 210,220 230,180" 
                  stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} 
                  strokeWidth="3" 
                  fill="none" />
            
            {/* Anomalía */}
            <path d="M230,180 C250,140 270,80 290,180" 
                  stroke={isDarkMode ? "#F53844" : "#62B6CB"} 
                  strokeWidth="3" 
                  fill="none" />
            
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
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      id="ejemplos" 
      className={`py-20 ${
        isDarkMode 
          ? 'bg-[#0D0D0D]' 
          : 'bg-white'
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
            Ejemplos de Aplicación
          </h2>
          <p 
            className={`max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Situaciones reales donde el Machine Learning transforma la forma en que trabajamos y tomamos decisiones.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <div 
              className={`sticky top-24 p-4 rounded-lg ${
                isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'
              }`}
            >
              {examples.map((example, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg mb-2 cursor-pointer transition-all ${
                    activeTab === index 
                      ? isDarkMode 
                        ? 'bg-[#121212] border-l-4 border-[#6A11CB]' 
                        : 'bg-white shadow-md border-l-4 border-[#1B4965]'
                      : isDarkMode 
                        ? 'hover:bg-[#121212]' 
                        : 'hover:bg-white hover:shadow-sm'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  <div 
                    className={`${
                      activeTab === index 
                        ? isDarkMode 
                          ? 'text-[#6A11CB]' 
                          : 'text-[#1B4965]'
                        : isDarkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-500'
                    }`}
                  >
                    {example.icon}
                  </div>
                  <div>
                    <h3 
                      className={`font-medium ${
                        activeTab === index 
                          ? isDarkMode 
                            ? 'text-white' 
                            : 'text-[#1B4965]'
                          : isDarkMode 
                            ? 'text-gray-300' 
                            : 'text-gray-700'
                      }`}
                    >
                      {example.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div 
              className={`p-8 rounded-lg ${
                isDarkMode ? 'bg-[#1A1A1A]' : 'bg-white shadow-lg'
              }`}
            >
              <h3 
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-[#1B4965]'
                }`}
              >
                {examples[activeTab].title}
              </h3>
              <p 
                className={`mb-8 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {examples[activeTab].description}
              </p>
              
              <div className="flex justify-center">
                {renderSVG(activeTab)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Examples;