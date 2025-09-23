import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HowItWorksProps {
  isDarkMode?: boolean;
}

const HowItWorks = ({ isDarkMode = false }: HowItWorksProps) => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  
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

  const toggleCard = (index: number) => {
    setExpandedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  return (
    <section 
      id="como-funciona" 
      className={`py-20 ${
        isDarkMode 
          ? 'bg-[#121212]' 
          : 'bg-[#EAF6F9]'
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
            className={`max-w-2xl mx-auto mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Nuestro sistema de reconocimiento de voz utiliza tecnología de punta para transformar tu voz en datos accionables.
          </p>
          <motion.p 
            className={`text-lg font-semibold ${
              isDarkMode ? 'text-[#6A11CB]' : 'text-[#1B4965]'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            ✨ Descubre cómo funciona, haz click en las tarjetas
          </motion.p>
        </div>
        
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={`p-6 rounded-lg cursor-pointer transition-all ${
                expandedCards.includes(index)
                  ? isDarkMode 
                    ? 'bg-[#1A1A1A] border-b-4 border-[#6A11CB]' 
                    : 'bg-white shadow-lg border-b-4 border-[#1B4965]'
                  : isDarkMode 
                    ? 'bg-[#1A1A1A] hover:bg-[#0D0D0D]' 
                    : 'bg-white shadow hover:shadow-md'
              }`}
              onClick={() => toggleCard(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className={`flex justify-center mb-4 ${
                  expandedCards.includes(index)
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
              <AnimatePresence>
                {expandedCards.includes(index) && (
                  <motion.p 
                    className={`text-center ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;