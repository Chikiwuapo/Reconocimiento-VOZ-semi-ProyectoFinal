import React from 'react';
import ProfileCard from './ProfileCard';

interface OurTeamProps {
  isDarkMode?: boolean;
}

const OurTeam: React.FC<OurTeamProps> = ({ isDarkMode = false }) => {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Favio Arias',  
      role: 'CEO & Founder',  
      handle: 'favio-arias',  
      status: 'Online',  
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' 
    },
    { 
      id: 2, 
      name: 'María González',   
      role: 'AI/ML Engineer',   
      handle: 'maria-ai',  
      status: 'Online',  
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=300&auto=format&fit=crop' 
    },
    { 
      id: 3, 
      name: 'Carlos Mendoza',  
      role: 'Backend Developer',        
      handle: 'carlos-backend',    
      status: 'Busy',    
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop' 
    },
    { 
      id: 4, 
      name: 'Ana Rodríguez',     
      role: 'UX/UI Designer',     
      handle: 'ana-design', 
      status: 'Online',  
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop' 
    },
    { 
      id: 5, 
      name: 'Luis Fernández',    
      role: 'Frontend Developer',    
      handle: 'luis-frontend',
      status: 'Online',  
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' 
    },
    { 
      id: 6, 
      name: 'Sofía Martínez',   
      role: 'QA Engineer',    
      handle: 'sofia-qa',   
      status: 'Online',  
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' 
    },
  ];

  return (
    <section
      id="nuestro-equipo"
      className={`min-h-screen py-16 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}
    >
      <div className="w-full px-2 sm:px-4 lg:px-6">
        {/* Encabezado arriba y centrado */}
        <div className="text-center mb-12">
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-[#1B4965]'
            }`}
          >
            Nuestro Equipo
          </h2>
          <p
            className={`text-lg ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } max-w-4xl mx-auto leading-relaxed`}
          >
            Conoce al talentoso equipo de profesionales que está desarrollando las mejores soluciones de reconocimiento de voz e inteligencia artificial.
          </p>
        </div>

        {/* Grid de Profile Cards mejorado */}
        <div className="w-full overflow-x-hidden">
          <div className="relative">
            {/* Grid responsivo para las 6 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 justify-items-center">
              {teamMembers.map((m) => (
                <div key={m.id} className="w-full max-w-[280px] flex justify-center">
                  <div className="transform origin-center scale-[0.65] sm:scale-[0.7] lg:scale-[0.75] xl:scale-[0.6] hover:scale-[0.7] sm:hover:scale-[0.75] lg:hover:scale-[0.8] xl:hover:scale-[0.65] transition-transform duration-300 ease-in-out">
                    <ProfileCard
                      name={m.name}
                      title={m.role}
                      handle={m.handle}
                      status={m.status}
                      avatarUrl={m.avatar}
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => window.alert(`Contactar a ${m.name} - ${m.role}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
