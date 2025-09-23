import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface PromoCarouselProps {
  isDarkMode?: boolean;
}

const PromoCarousel: React.FC<PromoCarouselProps> = ({ isDarkMode = false }) => {
  const [currentSlide] = useState(0);

  const promociones = [
    {
      id: 1,
      titulo: "Descubre el poder del Machine Learning en tus decisiones diarias",
      descripcion: "Convierte datos en soluciones inteligentes sin necesidad de ser experto.",
      imagen: "",
      color: isDarkMode ? "#6A11CB" : "#1B4965",
      showShield: true
    },
  ];

  return (
    <section className={`pt-16 sm:pt-20 md:pt-0 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
      <div className="w-full">
        <div className="relative w-full">
          {/* Carousel Container */}
          <div 
            className="relative overflow-hidden w-full"
          >
            {/* Slides */}
            <div className="relative h-[56vh] sm:h-[64vh] md:h-[72vh] lg:h-[80vh] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <div className="relative h-full">
                    {/* Background */}
                    {promociones[currentSlide].showShield ? (
                      <div className={`absolute inset-0 ${
                        isDarkMode ? 'bg-black' : 'bg-white'
                      }`} />
                    ) : promociones[currentSlide].imagen ? (
                      <div className="absolute inset-0">
                        <img 
                          src={promociones[currentSlide].imagen}
                          alt={promociones[currentSlide].titulo}
                          className="w-full h-full object-cover object-center"
                          decoding="async"
                          loading="eager"
                        />
                        {/* Overlay */}
                        <div className={`absolute inset-0 ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-black/70 via-black/50 to-black/70' 
                            : 'bg-gradient-to-r from-black/30 via-black/20 to-black/30'
                        }`} />
                      </div>
                    ) : null}

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center">
                      <div className="container mx-auto px-4 sm:px-6 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-center">
                          {/* Texto lado izquierdo */}
                          <div className="text-left">
                            <motion.h3 
                              className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-6 ${
                                isDarkMode ? 'text-white' : 'text-[#1B4965]'
                              }`}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {promociones[currentSlide].titulo}
                            </motion.h3>
                            
                            <motion.p 
                              className={`text-sm sm:text-base md:text-xl mb-4 md:mb-8 max-w-xl ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-600'
                              }`}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              {promociones[currentSlide].descripcion}
                            </motion.p>

                            {promociones[currentSlide].showShield && (
                              <motion.div
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <Link to="/dashboard">
                                <button 
                                  className={`w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-[#6A11CB] to-[#3A7BD5] hover:from-[#5A0CB8] hover:to-[#2A6BCB]' 
                                      : 'bg-gradient-to-r from-[#1B4965] to-[#62B6CB] hover:from-[#0A3954] hover:to-[#4A9CA8]'
                                  }`}
                                >
                                  Pruébalo gratis
                                </button>
                                </Link>
                                <button 
                                  className={`w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-lg font-semibold border-2 transition-all transform hover:scale-105 ${
                                    isDarkMode 
                                      ? 'border-white text-white hover:bg-white hover:text-black' 
                                      : 'border-[#1B4965] text-[#1B4965] hover:bg-[#1B4965] hover:text-white'
                                  }`}
                                >
                                  Saber más
                                </button>
                              </motion.div>
                            )}
                          </div>

                          {/* Escudo lado derecho */}
                          {promociones[currentSlide].showShield && (
                            <motion.div
                              className="hidden lg:flex justify-center lg:justify-end"
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 }}
                            >
                              <div className={`relative ${isDarkMode ? 'hero-image-dark' : 'hero-image-light'}`}>
                                <svg 
                                  className="w-[320px] h-[260px] sm:w-[420px] sm:h-[320px] md:w-[520px] md:h-[420px] lg:w-[640px] lg:h-[500px] mx-auto" 
                                  viewBox="0 0 500 400" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  {/* Fondo abstracto */}
                                  <circle 
                                    cx="250" 
                                    cy="200" 
                                    r="150" 
                                    fill={isDarkMode ? "url(#gradient-dark)" : "#F8FAFC"} 
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
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromoCarousel;
