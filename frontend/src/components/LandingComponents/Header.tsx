import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Header = ({ isDarkMode = false, toggleDarkMode }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Función para ocultar/mostrar el header al hacer scroll
  const hideOnScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const threshold = 5; // Umbral para evitar cambios con scroll mínimos
    
    // No ocultar si estamos muy cerca del top
    if (currentScrollY < 50) {
      setIsVisible(true);
      setScrolled(false);
    } else {
      setScrolled(true);
      
      // Comparar posición actual con la anterior
      if (currentScrollY > lastScrollY + threshold) {
        // Scroll hacia abajo - ocultar header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - threshold) {
        // Scroll hacia arriba - mostrar header
        setIsVisible(true);
      }
    }
    
    // Actualizar la última posición de scroll
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  // Implementar debounce para limitar la frecuencia de ejecución
  useEffect(() => {
    let timeoutId: number | null = null;
    
    const handleScroll = () => {
      if (timeoutId) {
        window.cancelAnimationFrame(timeoutId);
      }
      
      // Usar requestAnimationFrame para optimización del rendimiento
      timeoutId = window.requestAnimationFrame(() => {
        hideOnScroll();
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        window.cancelAnimationFrame(timeoutId);
      }
    };
  }, [hideOnScroll]);

  // Resetear la visibilidad cuando se hace click en enlaces de anchor
  const handleAnchorClick = () => {
    setIsVisible(true);
    setMobileOpen(false);
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-transform duration-300 ${
        scrolled 
          ? isDarkMode 
            ? 'bg-[#121212] shadow-lg shadow-purple-900/20' 
            : 'bg-white shadow-lg' 
          : isDarkMode 
            ? 'bg-transparent' 
            : 'bg-transparent'
      } ${isVisible ? 'transform-none' : 'transform -translate-y-full'}`}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Icono idéntico al de la primera promo del PromoCarousel, escalado al header */}
          <svg 
            className="h-12 w-16 animate-[pulse_2.2s_ease-in-out_infinite]"
            viewBox="0 0 500 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{
              filter: isDarkMode
                ? 'drop-shadow(0 0 10px rgba(106,17,203,0.55)) drop-shadow(0 0 18px rgba(58,123,213,0.45))'
                : 'drop-shadow(0 0 8px rgba(98,182,203,0.55)) drop-shadow(0 0 14px rgba(27,73,101,0.35))'
            }}
          >
            {/* Fondo abstracto */}
            <circle 
              cx="250" 
              cy="200" 
              r="150" 
              fill={isDarkMode ? 'url(#gradient-dark-header)' : '#F8FAFC'}
              opacity="0.8" 
            />
            {/* Nodos y conexiones */}
            <circle cx="180" cy="150" r="10" fill={isDarkMode ? '#3A7BD5' : '#1B4965'} />
            <circle cx="250" cy="120" r="15" fill={isDarkMode ? '#6A11CB' : '#62B6CB'} />
            <circle cx="320" cy="150" r="10" fill={isDarkMode ? '#F53844' : '#1B4965'} />
            <circle cx="200" cy="220" r="12" fill={isDarkMode ? '#6A11CB' : '#62B6CB'} />
            <circle cx="300" cy="220" r="12" fill={isDarkMode ? '#3A7BD5' : '#1B4965'} />
            <circle cx="250" cy="280" r="15" fill={isDarkMode ? '#F53844' : '#62B6CB'} />
            {/* Líneas de conexión */}
            <line x1="180" y1="150" x2="250" y2="120" stroke={isDarkMode ? '#3A7BD5' : '#1B4965'} strokeWidth="2" />
            <line x1="250" y1="120" x2="320" y2="150" stroke={isDarkMode ? '#6A11CB' : '#62B6CB'} strokeWidth="2" />
            <line x1="180" y1="150" x2="200" y2="220" stroke={isDarkMode ? '#F53844' : '#1B4965'} strokeWidth="2" />
            <line x1="320" y1="150" x2="300" y2="220" stroke={isDarkMode ? '#3A7BD5' : '#62B6CB'} strokeWidth="2" />
            <line x1="200" y1="220" x2="250" y2="280" stroke={isDarkMode ? '#6A11CB' : '#1B4965'} strokeWidth="2" />
            <line x1="300" y1="220" x2="250" y2="280" stroke={isDarkMode ? '#F53844' : '#62B6CB'} strokeWidth="2" />
            <line x1="250" y1="120" x2="250" y2="280" stroke={isDarkMode ? '#3A7BD5' : '#1B4965'} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="5 5" />
            {/* Datos y resultados (rectángulos) */}
            <rect x="120" y="100" width="40" height="20" rx="5" fill={isDarkMode ? '#3A7BD5' : '#1B4965'} />
            <rect x="340" y="100" width="40" height="20" rx="5" fill={isDarkMode ? '#F53844' : '#62B6CB'} />
            <rect x="120" y="280" width="40" height="20" rx="5" fill={isDarkMode ? '#6A11CB' : '#1B4965'} />
            <rect x="340" y="280" width="40" height="20" rx="5" fill={isDarkMode ? '#3A7BD5' : '#62B6CB'} />
            {/* Gradiente para modo oscuro */}
            <defs>
              <linearGradient id="gradient-dark-header" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3A7BD5" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#6A11CB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F53844" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`}>
            AriasDigitalSoft
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <a 
                  href="#beneficios" 
                  onClick={handleAnchorClick}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  Beneficios
                </a>
              </li>
              <li>
                <a 
                  href="#ejemplos" 
                  onClick={handleAnchorClick}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  Ejemplos
                </a>
              </li>
              <li>
                <a 
                  href="#como-funciona" 
                  onClick={handleAnchorClick}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a 
                  href="#nuestro-equipo" 
                  onClick={handleAnchorClick}
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  Nuestro Equipo
                </a>
              </li>
            </ul>
          </nav>
          
          {/* Menú móvil */}
          <button 
            className="md:hidden p-2" 
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          <div className="flex items-center gap-4">
            {toggleDarkMode && (
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                aria-label="Cambiar tema"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
            
            <Link
              to="/dashboard"
              className={`px-5 py-2 rounded-md font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#3A7BD5] to-[#6A11CB] text-white hover:opacity-90' 
                  : 'bg-[#62B6CB] text-white hover:bg-[#1B4965]'
              }`}
            >
              Ir al Blackboard
            </Link>
          </div>
        </div>
      </div>

      {/* Panel deslizante móvil (no afecta layout) */}
      <div className="relative md:hidden">
        <div 
          className={`absolute left-0 top-full w-full overflow-hidden transition-[max-height,opacity] duration-200 ${
            mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          } ${isDarkMode ? 'bg-[#111111] text-white' : 'bg-white text-[#1B4965]'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} shadow-lg`}
          aria-hidden={!mobileOpen}
        >
          <nav className="container mx-auto px-4 py-3">
            <ul className="flex flex-col gap-3">
              <li><a href="#beneficios" onClick={handleAnchorClick} className="py-2">Beneficios</a></li>
              <li><a href="#ejemplos" onClick={handleAnchorClick} className="py-2">Ejemplos</a></li>
              <li><a href="#como-funciona" onClick={handleAnchorClick} className="py-2">Cómo Funciona</a></li>
              <li><a href="#nuestro-equipo" onClick={handleAnchorClick} className="py-2">Nuestro Equipo</a></li>
              <li><a href="#contacto" onClick={handleAnchorClick} className="py-2">Contacto</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;