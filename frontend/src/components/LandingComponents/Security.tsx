 
import { motion } from 'framer-motion';

interface SecurityProps {
  isDarkMode?: boolean;
}

const Security = ({ isDarkMode = false }: SecurityProps) => {
  const securityFeatures = [
    {
      title: "Encriptación de datos",
      description: "Toda la información es encriptada de extremo a extremo para garantizar la máxima seguridad.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Privacidad garantizada",
      description: "No almacenamos tus grabaciones de voz sin tu consentimiento explícito.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Cumplimiento normativo",
      description: "Cumplimos con GDPR, CCPA y otras regulaciones internacionales de protección de datos.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // SVG para ilustrar seguridad
  const SecurityShieldSVG = () => (
    <motion.svg
      className="w-full h-64"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
    >
      {/* Escudo base */}
      <path 
        d="M200,50 L300,90 C300,180 260,240 200,270 C140,240 100,180 100,90 L200,50 Z" 
        fill={isDarkMode ? "#1A1A1A" : "#F5F5F5"} 
        stroke={isDarkMode ? "#3A7BD5" : "#1B4965"} 
        strokeWidth="4"
      />
      
      {/* Capas de seguridad */}
      <path 
        d="M200,70 L280,100 C280,180 250,230 200,255 C150,230 120,180 120,100 L200,70 Z" 
        fill="none" 
        stroke={isDarkMode ? "#6A11CB" : "#62B6CB"} 
        strokeWidth="2"
        strokeDasharray="5,5"
      />
      
      {/* Marca de verificación */}
      <path 
        d="M160,150 L185,175 L240,120" 
        fill="none" 
        stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Ondas de datos */}
      <path 
        d="M80,150 C100,130 120,170 140,150" 
        stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
        strokeWidth="2" 
        strokeDasharray="2,2"
      />
      <path 
        d="M260,150 C280,130 300,170 320,150" 
        stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
        strokeWidth="2" 
        strokeDasharray="2,2"
      />
      
      {/* Candado */}
      <rect 
        x="185" 
        y="200" 
        width="30" 
        height="20" 
        rx="5" 
        fill={isDarkMode ? "#6A11CB" : "#1B4965"} 
      />
      <path 
        d="M190,200 L190,190 C190,185 195,180 200,180 C205,180 210,185 210,190 L210,200" 
        stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
        strokeWidth="4"
        fill="none"
      />
    </motion.svg>
  );

  return (
    <section 
      id="seguridad" 
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
            Confianza y Seguridad
          </h2>
          <p 
            className={`max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Tu privacidad y la seguridad de tus datos son nuestra máxima prioridad.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <SecurityShieldSVG />
          </div>
          
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {securityFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`flex gap-4 p-6 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-[#1A1A1A] hover:bg-[#151515] border border-transparent hover:border-[#2a2a2a]'
                      : 'bg-white shadow hover:shadow-lg'
                  }`}
                >
                  <div className={`${isDarkMode ? 'text-[#6A11CB]' : 'text-[#1B4965]'} flex-shrink-0`}>{feature.icon}</div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B4965]'}`}>{feature.title}</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`mt-8 p-4 rounded-lg border-l-4 ${
                isDarkMode 
                  ? 'bg-[#1A1A1A] border-[#6A11CB] text-gray-300' 
                  : 'bg-white border-[#1B4965] text-gray-600 shadow'
              }`}
            >
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Puedes revisar nuestra política de privacidad completa para más detalles sobre cómo protegemos tus datos.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;