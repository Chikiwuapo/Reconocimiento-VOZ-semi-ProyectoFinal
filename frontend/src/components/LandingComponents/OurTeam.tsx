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
      avatar: 'https://cdn.discordapp.com/attachments/1129926951394627785/1419900519576768623/Imagen_de_WhatsApp_2025-09-22_a_las_23.15.37_b4351cd9.jpg?ex=68d370e8&is=68d21f68&hm=0848d1df0bb6d235e73c5bf0fb92535fe6e48472eac01639345c73938c4dc65a&' 
    },
    { 
      id: 2, 
      name: 'Dev Frontend',   
      handle: 'ct-leo',  
      status: 'Online',  
      avatar: 'https://media.discordapp.net/attachments/1129926951394627785/1419905544361087036/AJfQ9KRuR9SQ5ws56XOwwxDvlt80HQRtQduQYsrEhP-UTFGUwy2bnJX835sYPN_Bd_bHw21Rj9-v_05RemRlvkLkfbrauFUC6Q911dOEMOvd5s1_q1HwM0rMgemBeWt9pkT2fJ2EfBlE5bIDw0sP3cMj3P1x8Pb83YkQ8VrjaKeimiHwR3ljngs1024.png?ex=68d37596&is=68d22416&hm=c7cb3d36df70b6e4062795a3b845ba1478209e2a9efcb6248ab38e5985c49806&=&format=webp&quality=lossless&width=728&height=1050'
    },
    { 
      id: 3, 
      name: 'Dev Frontend',  
      handle: 'DanielTX',    
      status: 'Online',    
      avatar: 'https://cdn.discordapp.com/attachments/1129926951394627785/1419912419597357107/Imagen_de_WhatsApp_2025-09-23_a_las_00.02.11_0ecaec80.jpg?ex=68d37bfd&is=68d22a7d&hm=cfab50e1ffebe77902a7add595bfdc186b5792757c19723159557bba324e82d8&' 
    },
    { 
      id: 4, 
      name: 'Dev Backend',     
      handle: 'Edduq1', 
      status: 'Online',  
      avatar: 'https://media.discordapp.net/attachments/1129926951394627785/1419906197833781310/AJfQ9KR9GgW4NqgGTN_wzVd1oYSCcl16UjNQpr9hxvVq7-imdMP0yic2JPll0lXbZh147-asDNnpA4uXdbYdwUq4XzVzGiI8Q3rylSGxvYt5wQtUcs9Khnn1FtGBBZBuk0zKkf_8oQ5vNoz45caZhytNzvZQn98GeXJ2jDKtuFMzzmCEEE1NXgs1024.png?ex=68d37632&is=68d224b2&hm=b6e21bea652f99055cd116e347a0da7fc19dee8fb8834bb3689b5fe95e7b0db2&=&format=webp&quality=lossless&width=728&height=1050' 
    },
    { 
      id: 5, 
      name: 'Dev Backend',    
      handle: 'Specter-nim',
      status: 'Online',  
      avatar: 'https://cdn.discordapp.com/attachments/1129926951394627785/1419909834332962897/Imagen_de_WhatsApp_2025-09-22_a_las_23.50.52_8ad0b13a.jpg?ex=68d37995&is=68d22815&hm=cca4a7a34ef7181f732ea5edcf41b413aff80f14f4528aa258c3a983d3cd0621&' 
    },
    { 
      id: 6, 
      name: 'Dev Backend',   
      handle: 'CH4IS7IANFLOO',   
      status: 'Online',  
      avatar: 'https://cdn.discordapp.com/attachments/1129926951394627785/1419906176682033222/Imagen_de_WhatsApp_2025-09-22_a_las_23.31.29_2f61327a.jpg?ex=68d3762d&is=68d224ad&hm=e5b152dee35981e6d6dc71ae40f05069290532a8086c5b32d520642475d01a01&' 
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
