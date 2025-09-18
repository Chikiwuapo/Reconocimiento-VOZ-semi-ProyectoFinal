import { motion } from 'framer-motion';

interface BenefitsProps {
  isDarkMode?: boolean;
}

const Benefits = ({ isDarkMode = false }: BenefitsProps) => {
  const benefits = [
    {
      title: "Automatización",
      description: "Deja que la IA trabaje por ti.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Precisión",
      description: "Obtén predicciones confiables para mejores decisiones.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Accesibilidad",
      description: "No necesitas ser un científico de datos.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Escalabilidad",
      description: "Crece al ritmo de tus necesidades.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section 
      id="beneficios" 
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
            Beneficios Principales
          </h2>
          <p 
            className={`max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Descubre cómo nuestra tecnología de Machine Learning puede transformar tu forma de trabajar y tomar decisiones.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              variants={item}
              className={`p-6 rounded-lg ${
                isDarkMode 
                  ? 'bg-[#1A1A1A] border border-[#333]' 
                  : 'bg-white shadow-lg'
              } transition-all hover:transform hover:scale-105`}
            >
              <div 
                className={`mb-4 ${
                  isDarkMode 
                    ? index === 0 
                      ? 'text-[#3A7BD5]' 
                      : index === 1 
                        ? 'text-[#6A11CB]' 
                        : index === 2 
                          ? 'text-[#F53844]' 
                          : 'text-[#62B6CB]'
                    : 'text-[#1B4965]'
                }`}
              >
                {benefit.icon}
              </div>
              <h3 
                className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-[#1B4965]'
                }`}
              >
                {benefit.title}
              </h3>
              <p 
                className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;