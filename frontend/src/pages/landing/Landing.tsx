import { useState, useEffect } from 'react';
import Header from '../../components/LandingComponents/Header';
import Benefits from '../../components/LandingComponents/Benefits';
import Examples from '../../components/LandingComponents/Examples';
import HowItWorks from '../../components/LandingComponents/HowItWorks';
import OurTeam from '../../components/LandingComponents/OurTeam';
import Security from '../../components/LandingComponents/Security';
import Registration from '../../components/LandingComponents/Registration';
import Contact from '../../components/LandingComponents/Contact';
import Footer from '../../components/LandingComponents/Footer';
import PromoCarousel from '../../components/LandingComponents/PromoCarousel';


const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar preferencia de tema del sistema
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
  }, []);

  // Manejar cambio de tema
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0D0D0D] text-white' : 'bg-white text-gray-800'}`}>
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main>
          <PromoCarousel isDarkMode={isDarkMode} />
          <Benefits isDarkMode={isDarkMode} />
          <Examples isDarkMode={isDarkMode} />
          <HowItWorks isDarkMode={isDarkMode} />
          {/* Nuestro equipo */}
          <section id="team-wrapper" className="mt-12 md:mt-16">
            <OurTeam isDarkMode={isDarkMode} />
          </section>
          <Security isDarkMode={isDarkMode} />
          <Registration isDarkMode={isDarkMode} />
          <Contact isDarkMode={isDarkMode} />
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default Landing;