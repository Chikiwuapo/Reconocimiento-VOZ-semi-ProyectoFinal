import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromoCarouselProps {
  isDarkMode?: boolean;
}

const PromoCarousel: React.FC<PromoCarouselProps> = ({ isDarkMode = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const promociones = [
    {
      id: 1,
      titulo: "Descubre el poder del Machine Learning en tus decisiones diarias",
      descripcion: "Convierte datos en soluciones inteligentes sin necesidad de ser experto.",
      imagen: "",
      color: isDarkMode ? "#6A11CB" : "#1B4965",
      showShield: true
    },
    {
      id: 2,
      titulo: "Promoción 2", 
      descripcion: "Aprovecha nuestras herramientas avanzadas de ML",
      imagen: "https://i.blogs.es/41fcbf/190512-reconocimiento-voz/1366_2000.webp",
      color: isDarkMode ? "#3A7BD5" : "#62B6CB"
    },
    {
      id: 3,
      titulo: "Promoción 3",
      descripcion: "Transforma tu forma de trabajar con IA",
      imagen: "https://images.unsplash.com/photo-1534759846116-57970eda9f9e?q=80&w=1600&auto=format&fit=crop",
      color: isDarkMode ? "#F53844" : "#62B6CB"
    },
    {
      id: 4,
      titulo: "Promoción 4",
      descripcion: "Soluciones inteligentes para tu negocio",
      imagen: "https://i.blogs.es/41fcbf/190512-reconocimiento-voz/1366_2000.webp",
      color: isDarkMode ? "#6A11CB" : "#1B4965"
    },
    {
      id: 5,
      titulo: "Promoción 5",
      descripcion: "Únete a la revolución del Machine Learning",
      imagen: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1600&auto=format&fit=crop",
      color: isDarkMode ? "#3A7BD5" : "#62B6CB"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promociones.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, promociones.length]);


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promociones.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promociones.length) % promociones.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <section className={`py-0 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
      <div className="w-full">
        <div className="relative w-full">
          {/* Carousel Container */}
          <div 
            className="relative overflow-hidden w-full"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Slides */}
            <div className="relative h-[70vh] md:h-[80vh] w-full">
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
                      <div className="container mx-auto px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                          {/* Texto lado izquierdo */}
                          <div className="text-left">
                            <motion.h3 
                              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
                                isDarkMode ? 'text-white' : 'text-[#1B4965]'
                              }`}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {promociones[currentSlide].titulo}
                            </motion.h3>
                            
                            <motion.p 
                              className={`text-xl md:text-2xl mb-8 ${
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
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <button 
                                  className={`px-8 py-4 text-lg rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-[#6A11CB] to-[#3A7BD5] hover:from-[#5A0CB8] hover:to-[#2A6BCB]' 
                                      : 'bg-gradient-to-r from-[#1B4965] to-[#62B6CB] hover:from-[#0A3954] hover:to-[#4A9CA8]'
                                  }`}
                                >
                                  Pruébalo gratis
                                </button>
                                <button 
                                  className={`px-8 py-4 text-lg rounded-lg font-semibold border-2 transition-all transform hover:scale-105 ${
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
                              className="flex justify-center lg:justify-end"
                              initial={{ opacity: 0, x: 50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 }}
                            >
                              <div className={`relative ${isDarkMode ? 'hero-image-dark' : 'hero-image-light'}`}>
                                <svg 
                                  className="w-[450px] h-[360px] md:w-[550px] md:h-[440px] lg:w-[650px] lg:h-[520px] mx-auto" 
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


            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full transition-all ${
                isDarkMode 
                  ? 'bg-black/30 text-white hover:bg-black/50' 
                  : 'bg-black/30 text-white hover:bg-black/50'
              } shadow-2xl hover:scale-110 backdrop-blur-sm`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className={`absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full transition-all ${
                isDarkMode 
                  ? 'bg-black/30 text-white hover:bg-black/50' 
                  : 'bg-black/30 text-white hover:bg-black/50'
              } shadow-2xl hover:scale-110 backdrop-blur-sm`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots Navigation and Pause Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 z-20">
            {/* Botón de pausa */}
            <button
              onClick={togglePause}
              className={`p-3 rounded-full transition-all ${
                isDarkMode 
                  ? 'bg-black/30 text-white hover:bg-black/50' 
                  : 'bg-white/80 text-[#1B4965] hover:bg-white'
              } shadow-2xl hover:scale-110 backdrop-blur-sm`}
            >
              {isPaused ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              )}
            </button>

            {/* Puntos de navegación */}
            <div className="flex space-x-3">
              {promociones.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all backdrop-blur-sm ${
                    index === currentSlide
                      ? isDarkMode 
                        ? 'bg-[#6A11CB] scale-125 shadow-lg' 
                        : 'bg-[#1B4965] scale-125 shadow-lg'
                      : isDarkMode 
                        ? 'bg-white/30 hover:bg-white/50' 
                        : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCarousel;
