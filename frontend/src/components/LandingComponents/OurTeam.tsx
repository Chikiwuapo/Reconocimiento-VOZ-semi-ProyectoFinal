import React from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

interface OurTeamProps {
  isDarkMode?: boolean;
}

const OurTeam: React.FC<OurTeamProps> = ({ isDarkMode = false }) => {
  const teamMembers = [
    {
      id: 1,
      name: "Daniel",
      role: "Desarrollador Frontend",
      description: "Especialista en React y TypeScript, responsable de crear interfaces de usuario intuitivas y responsivas.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
      skills: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"]
    },
    {
      id: 2,
      name: "María",
      role: "Desarrolladora Backend",
      description: "Experta en Python y Django, encargada de la arquitectura del servidor y las APIs.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1000&auto=format&fit=crop",
      skills: ["Python", "Django", "PostgreSQL", "REST APIs"]
    },
    {
      id: 3,
      name: "Carlos",
      role: "Especialista en Machine Learning",
      description: "Investigador en IA y reconocimiento de voz, desarrolla los algoritmos de procesamiento de audio.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop",
      skills: ["Python", "TensorFlow", "PyTorch", "Audio Processing"]
    },
    {
      id: 4,
      name: "Ana",
      role: "Diseñadora UX/UI",
      description: "Creadora de experiencias de usuario excepcionales, diseña interfaces que conectan tecnología y personas.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"]
    },
    {
      id: 5,
      name: "Luis",
      role: "DevOps Engineer",
      description: "Responsable de la infraestructura y despliegue, asegura que todo funcione de manera eficiente y segura.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
      skills: ["Docker", "AWS", "CI/CD", "Linux"]
    },
    {
      id: 6,
      name: "Sofia",
      role: "Project Manager",
      description: "Coordina el equipo y gestiona los tiempos del proyecto, asegurando que todos trabajemos hacia el mismo objetivo.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
      skills: ["Agile", "Scrum", "Team Leadership", "Project Planning"]
    }
  ];

  return (
    <section
      id="nuestro-equipo"
      className={`min-h-screen py-16 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}
    >
      <div className="container mx-auto px-4">
        {/* Encabezado arriba y centrado */}
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-[#1B4965]'
            }`}
          >
            Nuestro Equipo
          </h2>
          <p
            className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } max-w-3xl mx-auto`}
          >
            Conoce al equipo de desarrolladores que está trabajando en este proyecto de reconocimiento de voz.
          </p>
        </div>

        {/* Contenedor centrado y más ancho para el ScrollStack */}
        <div className="mx-auto w-full max-w-6xl">
          <div className={`rounded-2xl ${
            isDarkMode ? 'bg-[#0F0F0F] border border-[#1f1f1f]' : 'bg-white shadow-soft'
          } h-[64vh] overflow-hidden`}>
            <ScrollStack 
              useWindowScroll={false}
              itemDistance={150}
              itemScale={0.06}
              itemStackDistance={50}
              stackPosition="25%"
              scaleEndPosition="15%"
              baseScale={0.78}
              rotationAmount={2}
              blurAmount={1.2}
              className={`h-full no-scrollbar ${isDarkMode ? 'bg-[#0F0F0F]' : 'bg-white'}`}
            >
              {teamMembers.map((member) => (
                <ScrollStackItem 
                  key={member.id}
                  itemClassName={`${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white' 
                      : 'bg-gradient-to-br from-white to-gray-50 text-gray-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full object-cover shadow-lg"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <h3 
                        className={`text-2xl font-bold mb-2 ${
                          isDarkMode ? 'text-white' : 'text-[#1B4965]'
                        }`}
                      >
                        {member.name}
                      </h3>
                      
                      <p 
                        className={`text-lg font-semibold mb-4 ${
                          isDarkMode ? 'text-[#6A11CB]' : 'text-[#62B6CB]'
                        }`}
                      >
                        {member.role}
                      </p>
                      
                      <p 
                        className={`text-base mb-6 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {member.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {member.skills.map((skill, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode 
                                ? 'bg-[#6A11CB]/20 text-[#6A11CB] border border-[#6A11CB]/30' 
                                : 'bg-[#62B6CB]/20 text-[#62B6CB] border border-[#62B6CB]/30'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
