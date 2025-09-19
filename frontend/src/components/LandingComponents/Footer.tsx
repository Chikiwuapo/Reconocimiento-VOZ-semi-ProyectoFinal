import React from 'react';

interface FooterProps {
  isDarkMode?: boolean;
}

const Footer = ({ isDarkMode = false }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Producto",
      links: [
        { name: "Características", href: "#beneficios" },
        { name: "Ejemplos", href: "#ejemplos" },
        { name: "Cómo funciona", href: "#como-funciona" },
        { name: "Actualizaciones", href: "#" }
      ]
    },
    {
      title: "Empresa",
      links: [
        { name: "Acerca de", href: "#" },
        { name: "Equipo", href: "#" },
        { name: "Contacto", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Términos de servicio", href: "#" },
        { name: "Política de privacidad", href: "#" },
        { name: "Cookies", href: "#" }
      ]
    }
  ];

  // Logo SVG
  const LogoSVG = () => (
    <svg className="h-10 w-auto" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ondas de sonido */}
      <path 
        d="M30,30 C35,20 35,40 40,30 C45,20 45,40 50,30" 
        stroke={isDarkMode ? "#6A11CB" : "#1B4965"} 
        strokeWidth="3" 
        fill="none"
      />
      <path 
        d="M20,30 C30,10 30,50 40,30 C50,10 50,50 60,30" 
        stroke={isDarkMode ? "#3A7BD5" : "#62B6CB"} 
        strokeWidth="2" 
        fill="none"
        opacity="0.6"
      />
      
      {/* Texto */}
      <text 
        x="70" 
        y="35" 
        fontFamily="Arial" 
        fontSize="18" 
        fontWeight="bold" 
        fill={isDarkMode ? "white" : "#1B4965"}
      >
        Ares digital soft
      </text>
      <text 
        x="70" 
        y="50" 
        fontFamily="Arial" 
        fontSize="12" 
        fill={isDarkMode ? "#A0AEC0" : "#62B6CB"}
      >
        Reconocimiento de voz
      </text>
    </svg>
  );

  // Iconos de redes sociales
  const socialIcons = [
    {
      name: "Facebook",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
        </svg>
      )
    },
    {
      name: "Twitter",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      )
    },
    {
      name: "Instagram",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
        </svg>
      )
    },
    {
      name: "GitHub",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )
    }
  ];

  return (
    <footer 
      className={`pt-16 pb-8 ${
        isDarkMode 
          ? 'bg-[#0D0D0D] text-gray-300' 
          : 'bg-[#F5F5F5] text-gray-600'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2">
            <div className="mb-6">
              <LogoSVG />
            </div>
            <p className="mb-4 max-w-xs">
              Transformando la forma en que interactuamos con la tecnología a través del reconocimiento de voz avanzado.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((social, index) => (
                <a 
                  key={index}
                  href="#" 
                  className={`${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-[#1B4965]'
                  } transition-colors`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column, index) => (
            <div key={index} className="col-span-1">
              <h3 
                className={`font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-[#1B4965]'
                }`}
              >
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className={`${
                        isDarkMode 
                          ? 'hover:text-white' 
                          : 'hover:text-[#1B4965]'
                      } transition-colors`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div 
          className={`pt-8 border-t ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">
              &copy; {currentYear} VoiceRec. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className={`${
                  isDarkMode 
                    ? 'hover:text-white' 
                    : 'hover:text-[#1B4965]'
                } transition-colors`}
              >
                Términos
              </a>
              <a 
                href="#" 
                className={`${
                  isDarkMode 
                    ? 'hover:text-white' 
                    : 'hover:text-[#1B4965]'
                } transition-colors`}
              >
                Privacidad
              </a>
              <a 
                href="#" 
                className={`${
                  isDarkMode 
                    ? 'hover:text-white' 
                    : 'hover:text-[#1B4965]'
                } transition-colors`}
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;