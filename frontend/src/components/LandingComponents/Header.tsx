import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Header = ({ isDarkMode = false, toggleDarkMode }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? isDarkMode 
            ? 'bg-[#121212] shadow-lg shadow-purple-900/20' 
            : 'bg-white shadow-lg' 
          : isDarkMode 
            ? 'bg-transparent' 
            : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`}>
            ML Voice
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav>
            <ul className="flex space-x-8">
              <li>
                <a 
                  href="#beneficios" 
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
                  className={`font-medium hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  Cómo Funciona
                </a>
              </li>
            </ul>
          </nav>
          
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
    </header>
  );
};

export default Header;