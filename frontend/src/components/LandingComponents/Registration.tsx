import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface RegistrationProps {
  isDarkMode?: boolean;
}

const Registration = ({ isDarkMode = false }: RegistrationProps) => {

  return (
    <section 
      id="registro" 
      className={`py-20 ${
        isDarkMode 
          ? 'bg-[#0D0D0D]' 
          : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className={`rounded-lg overflow-hidden shadow-lg ${
              isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'
            }`}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 
                  className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-[#1B4965]'
                  }`}
                >
                  ¡Comienza ahora!
                </h2>
                <p 
                  className={`mb-8 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Accede a todas las funcionalidades de reconocimiento de voz y transforma tu forma de trabajar.
                </p>
                
                <div className="flex flex-col items-center">
                  <motion.div
                    className="flex flex-col items-center gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span 
                      className={`text-lg font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Haz click aquí para comenzar
                    </span>
                    <motion.div
                      animate={{ 
                        y: [0, 8, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <svg 
                        className={`w-8 h-8 ${
                          isDarkMode ? 'text-[#6A11CB]' : 'text-[#1B4965]'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                  
                  <Link 
                    to="/auth" 
                    className={`py-3 px-8 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-[#6A11CB] hover:bg-[#5A0CB8] text-white' 
                        : 'bg-[#1B4965] hover:bg-[#0A3954] text-white'
                    }`}
                  >
                    Registrate gratis
                  </Link>
                </div>
                
                <p 
                  className={`mt-4 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Al registrarte, aceptas nuestros términos y condiciones y política de privacidad.
                </p>
              </div>
              
              <div className="md:w-1/2 relative">
                {/* SVG decorativo */}
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Fondo */}
                  <rect width="400" height="400" fill={isDarkMode ? "#121212" : "#1B4965"} />
                  
                  {/* Patrón de ondas */}
                  {[...Array(5)].map((_, i) => (
                    <path 
                      key={i}
                      d={`M0,${100 + i * 50} C100,${80 + i * 50} 200,${120 + i * 50} 400,${100 + i * 50}`}
                      stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"}
                      strokeWidth="2"
                      strokeDasharray={i % 2 === 0 ? "0" : "5,5"}
                      opacity={0.6 - i * 0.1}
                      fill="none"
                    />
                  ))}
                  
                  {/* Círculos decorativos */}
                  <circle cx="300" cy="100" r="30" fill={isDarkMode ? "#6A11CB" : "#BEE9E8"} opacity="0.6" />
                  <circle cx="350" cy="150" r="20" fill={isDarkMode ? "#3A7BD5" : "#62B6CB"} opacity="0.4" />
                  <circle cx="280" cy="200" r="40" fill={isDarkMode ? "#6A11CB" : "#BEE9E8"} opacity="0.2" />
                  
                  {/* Icono de micrófono */}
                  <circle cx="200" cy="200" r="60" fill={isDarkMode ? "#1A1A1A" : "white"} />
                  <path 
                    d="M200,160 L200,240" 
                    stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M180,180 L180,220 C180,231 189,240 200,240 C211,240 220,231 220,220 L220,180 C220,169 211,160 200,160 C189,160 180,169 180,180 Z" 
                    fill="none"
                    stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
                    strokeWidth="4"
                  />
                  <path 
                    d="M170,200 C170,242 200,250 200,250 C200,250 230,242 230,200" 
                    fill="none"
                    stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p 
              className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              ¿Ya tienes una cuenta? 
              <Link 
                to="/auth" 
                className={`ml-2 font-medium ${
                  isDarkMode ? 'text-[#6A11CB] hover:text-[#5A0CB8]' : 'text-[#1B4965] hover:text-[#0A3954]'
                }`}
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registration;