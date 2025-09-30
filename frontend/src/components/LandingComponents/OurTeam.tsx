import React from 'react';
import ProfileCard from './ProfileCard';

interface OurTeamProps {
  isDarkMode?: boolean;
}

const OurTeam: React.FC<OurTeamProps> = ({ isDarkMode = false }) => {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Dev Frontend',  
      handle: 'Chikiwuapo',  
      status: 'Online',  
      avatar: 'https://external-preview.redd.it/how-to-stop-cat-clawing-at-my-monitor-v0-M3J3aHR1cTV0eWNlMdTIZGe0VZoSFCS5tsL98iD3vVUkTn7NP-UYOJY0xTnZ.png?format=pjpg&auto=webp&s=2238162112d8c55a882da38b4c7ffc1a1c910c92' 
    },
    { 
      id: 2, 
      name: 'Dev Frontend',   
      handle: 'ct-leo',  
      status: 'Online',  
      avatar: 'https://i.redd.it/30ddiqj9xh9f1.jpeg'
    },
    { 
      id: 3, 
      name: 'Dev Frontend',  
      handle: 'DanielTX',    
      status: 'Online',    
      avatar: 'https://preview.redd.it/once-a-meowchanic-now-a-purrgrammer-v0-z5262fswbh7e1.png?width=1169&auto=webp&s=41c7ab7e833af1a933949b59442b09c59c695150' 
    },
    { 
      id: 4, 
      name: 'Dev Backend',     
      handle: 'Edduq1', 
      status: 'Online',  
      avatar: 'https://i.redd.it/bshux4pxl0wc1.jpeg' 
    },
    { 
      id: 5, 
      name: 'Dev Backend',    
      handle: 'Specter-nim',
      status: 'Online',  
      avatar: 'https://i.pinimg.com/736x/6f/93/82/6f9382f56bcecc25e8ba4dec7744ab1f.jpg' 
    },
    { 
      id: 6, 
      name: 'Dev Backend',   
      handle: 'CH4IS7IANFLOO',   
      status: 'Online',  
      avatar: 'https://i.redd.it/hjx35o1555g91.jpg' 
    },
  ];

  return (
    <section
      id="nuestro-equipo"
      className={`py-12 sm:py-16 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}
    >
      <div className="w-full px-2 sm:px-4 lg:px-10">
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

        {/* Grid de Profile Cards ajustado */}
        <div className="w-full overflow-x-hidden">
          <div className="relative">
            {/* Grid responsivo para las 6 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 sm:gap-6 lg:gap-6 justify-items-center">
              {teamMembers.map((m) => (
                <div key={m.id} className="w-full max-w-[260px] sm:max-w-[280px] flex justify-center">
                  <div className="transform origin-center scale-[0.8] sm:scale-[0.85] lg:scale-[0.9] xl:scale-[0.75] hover:scale-[0.85] sm:hover:scale-[0.9] lg:hover:scale-[0.95] xl:hover:scale-[0.8] transition-transform duration-300 ease-in-out">
                    <ProfileCard
                      name={m.name}
                      handle={m.handle}
                      status={m.status}
                      avatarUrl={m.avatar}
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => {
                        if (m.handle === "Chikiwuapo") {window.location.href = "https://github.com/Chikiwuapo"}
                        else if (m.handle === "ct-leo") {window.location.href = "https://github.com/ct-leo"}
                        else if (m.handle === "DanielTX") {window.location.href = "https://github.com/DanielTX"}
                        else if (m.handle === "Edduq1") {window.location.href = "https://github.com/Edduq1"}
                        else if (m.handle === "Specter-nim") {window.location.href = "https://github.com/Specter-nim"}
                        else if (m.handle === "CH4IS7IANFLOO") {window.location.href = "https://github.com/CH4IS7IANFLOO"}
                      }}
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
