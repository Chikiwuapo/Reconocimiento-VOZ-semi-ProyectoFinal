import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Recommendations() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Recomendaciones personalizadas</h2>
        <p className="text-slate-600 text-sm">
          Ya que probaste modelos de texto, te recomendamos este de reconocimiento de imágenes.
        </p>
        
        {/* Gráfico animado */}
        <div className="mt-6 h-32 flex items-end justify-center space-x-2">
          {[40, 60, 35, 80, 45, 70, 55].map((height, index) => (
            <motion.div
              key={index}
              className="bg-primary rounded-t"
              style={{ width: '20px' }}
              initial={{ height: 0 }}
              animate={isVisible ? { height: `${height}px` } : { height: 0 }}
              transition={{
                duration: 1.2,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-primary">Probar reconocimiento de imágenes</button>
          <button className="text-sm text-slate-600 hover:text-header transition">Ver más sugerencias</button>
        </div>
      </div>
    </section>
  )
}
