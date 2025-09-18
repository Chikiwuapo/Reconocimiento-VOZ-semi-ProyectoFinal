import { useState } from 'react';

interface TestimonialsProps {
  isDarkMode?: boolean;
}

const Testimonials = ({ isDarkMode = false }: TestimonialsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials = [
    {
      name: "Carlos Rodríguez",
      role: "Estudiante de Ingeniería",
      image: "profile1.svg",
      content: "Esta herramienta ha revolucionado la forma en que tomo apuntes. Ahora puedo concentrarme en entender las clases sin preocuparme por escribir todo."
    },
    {
      name: "María González",
      role: "Profesora de Ciencias",
      image: "profile2.svg",
      content: "Utilizo el reconocimiento de voz para crear material didáctico de manera rápida y eficiente. Mis estudiantes están más comprometidos que nunca."
    },
    {
      name: "Juan Pérez",
      role: "Profesional de TI",
      image: "profile3.svg",
      content: "La precisión del reconocimiento de voz es impresionante. Me ayuda a documentar código y crear informes técnicos en tiempo récord."
    }
  ];

  // Renderizar avatar SVG
  const renderAvatar = (index: number) => {
    const colors = [
      { bg: isDarkMode ? "#3A7BD5" : "#62B6CB", accent: isDarkMode ? "#6A11CB" : "#1B4965" },
      { bg: isDarkMode ? "#6A11CB" : "#1B4965", accent: isDarkMode ? "#3A7BD5" : "#62B6CB" },
      { bg: isDarkMode ? "#F53844" : "#BEE9E8", accent: isDarkMode ? "#6A11CB" : "#1B4965" }
    ];
    
    return (
      <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={colors[index].bg} />
        <circle cx="50" cy="40" r="18" fill={colors[index].accent} />
        <path d="M20,85 C20,65 80,65 80,85" stroke={colors[index].accent} strokeWidth="8" fill="none" />
      </svg>
    );
  };

  // Navegación a testimonio anterior
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  // Navegación a testimonio siguiente
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      id="testimonios" 
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
            Lo que dicen nuestros usuarios
          </h2>
          <p 
            className={`max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Experiencias reales de personas que han transformado su forma de trabajar con nuestra tecnología de reconocimiento de voz.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div 
            className={`relative p-8 rounded-lg ${
              isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'
            }`}
          >
            {/* Comillas decorativas */}
            <div 
              className={`absolute top-4 left-4 text-6xl ${
                isDarkMode ? 'text-[#333]' : 'text-[#E0E0E0]'
              }`}
            >
              "
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                {renderAvatar(activeIndex)}
              </div>
              
              <div className="md:w-2/3">
                <p 
                  className={`text-lg mb-6 relative z-10 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {testimonials[activeIndex].content}
                </p>
                
                <div>
                  <h4 
                    className={`font-bold text-xl ${
                      isDarkMode ? 'text-white' : 'text-[#1B4965]'
                    }`}
                  >
                    {testimonials[activeIndex].name}
                  </h4>
                  <p 
                    className={`${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Controles de navegación */}
            <div className="flex justify-center mt-8 gap-4">
              <button 
                onClick={prevTestimonial}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#121212] text-white hover:bg-[#333]' 
                    : 'bg-white text-[#1B4965] hover:bg-gray-100'
                } transition-colors`}
                aria-label="Testimonio anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    activeIndex === index 
                      ? isDarkMode ? 'bg-[#6A11CB]' : 'bg-[#1B4965]' 
                      : isDarkMode ? 'bg-[#333]' : 'bg-gray-300'
                  }`}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
              
              <button 
                onClick={nextTestimonial}
                className={`p-2 rounded-full ${
                  isDarkMode 
                    ? 'bg-[#121212] text-white hover:bg-[#333]' 
                    : 'bg-white text-[#1B4965] hover:bg-gray-100'
                } transition-colors`}
                aria-label="Testimonio siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;