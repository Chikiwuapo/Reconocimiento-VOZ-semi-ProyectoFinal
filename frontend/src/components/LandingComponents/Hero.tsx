import { useState } from 'react';

interface HeroProps {
  isDarkMode?: boolean;
}

const Hero = ({ isDarkMode = false }: HeroProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={`pt-32 pb-20 ${isDarkMode ? 'bg-[#121212]' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#3A7BD5] via-[#6A11CB] to-[#F53844] text-transparent bg-clip-text' 
                  : 'text-[#1B4965]'
              }`}
            >
              Descubre el poder del Machine Learning en tus decisiones diarias
            </h1>
            
            <p 
              className={`text-xl mb-8 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Convierte datos en soluciones inteligentes sin necesidad de ser experto.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`px-8 py-3 rounded-md font-medium text-white transition-all transform ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#3A7BD5] to-[#6A11CB] hover:from-[#3A7BD5] hover:to-[#F53844]' 
                    : 'bg-[#62B6CB] hover:bg-[#1B4965]'
                } ${isHovered ? 'scale-105' : 'scale-100'}`}
              >
                Pruébalo gratis
              </button>
              
              <button 
                className={`px-8 py-3 rounded-md font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-transparent text-white border border-[#6A11CB] hover:bg-[#6A11CB]/10' 
                    : 'bg-transparent text-[#1B4965] border border-[#1B4965] hover:bg-[#1B4965]/10'
                }`}
              >
                Saber más
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className={`relative ${isDarkMode ? 'hero-image-dark' : 'hero-image-light'}`}>
              <svg 
                className="w-full h-auto max-w-lg mx-auto" 
                viewBox="0 0 500 400" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Fondo abstracto */}
                <circle 
                  cx="250" 
                  cy="200" 
                  r="150" 
                  fill={isDarkMode ? "url(#gradient-dark)" : "#F5F5F5"} 
                  opacity="0.8" 
                />
                
                {/* Nodos y conexiones */}
                <circle cx="180" cy="150" r="10" fill={isDarkMode ? "#3A7BD5" : "#1B4965"} />
                <circle cx="250" cy="120" r="15" fill={isDarkMode ? "#6A11CB" : "#62B6CB"} />
                <circle cx="320" cy="150" r="10" fill={isDarkMode ? "#F53844" : "#1B4965"} />
                <circle cx="200" cy="220" r="12" fill={isDarkMode ? "#6A11CB" : "#62B6CB"} />
                <circle cx="300" cy="220" r="12" fill={isDarkMode ? "#3A7BD5" : "#1B4965"} />
                <circle cx="250" cy="280" r="15" fill={isDarkMode ? "#F53844" : "#62B6CB"} />
                
                {/* Líneas de conexión */}
                <line x1="180" y1="150" x2="250" y2="120" stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeWidth="2" />
                <line x1="250" y1="120" x2="320" y2="150" stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} strokeWidth="2" />
                <line x1="180" y1="150" x2="200" y2="220" stroke={isDarkMode ? "#F53844" : "#1B4965"} strokeWidth="2" />
                <line x1="320" y1="150" x2="300" y2="220" stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} strokeWidth="2" />
                <line x1="200" y1="220" x2="250" y2="280" stroke={isDarkMode ? "#6A11CB" : "#1B4965"} strokeWidth="2" />
                <line x1="300" y1="220" x2="250" y2="280" stroke={isDarkMode ? "#F53844" : "#62B6CB"} strokeWidth="2" />
                <line x1="250" y1="120" x2="250" y2="280" stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="5 5" />
                
                {/* Datos y resultados */}
                <rect x="120" y="100" width="40" height="20" rx="5" fill={isDarkMode ? "#3A7BD5" : "#1B4965"} />
                <rect x="340" y="100" width="40" height="20" rx="5" fill={isDarkMode ? "#F53844" : "#62B6CB"} />
                <rect x="120" y="280" width="40" height="20" rx="5" fill={isDarkMode ? "#6A11CB" : "#1B4965"} />
                <rect x="340" y="280" width="40" height="20" rx="5" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} />
                
                {/* Gradiente para modo oscuro */}
                <defs>
                  <linearGradient id="gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3A7BD5" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#6A11CB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#F53844" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Efecto de animación */}
              <div className={`absolute inset-0 rounded-full ${
                isDarkMode ? 'bg-[#6A11CB]' : 'bg-[#62B6CB]'
              } opacity-20 blur-3xl -z-10 animate-pulse`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;