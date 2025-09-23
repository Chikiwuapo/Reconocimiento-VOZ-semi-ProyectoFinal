import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissionEffectsProps {
  isActive: boolean;
  onComplete: () => void;
}

const MissionEffects: React.FC<MissionEffectsProps> = ({ isActive, onComplete }) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowFireworks(true);
      
      // Reproducir sonido de éxito (simulado con Web Audio API)
      playSuccessSound();
      
      // Limpiar efectos después de 4 segundos
      const timeout = setTimeout(() => {
        setShowFireworks(false);
        onComplete();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Crear una secuencia de tonos para simular un sonido de éxito
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
      });
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  const fireworksParticles = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * 2 * Math.PI;
    const distance = 100 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    return (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf'][i % 7],
        }}
        initial={{ 
          x: 0, 
          y: 0, 
          scale: 0,
          opacity: 1
        }}
        animate={{ 
          x: x, 
          y: y, 
          scale: [0, 1, 0],
          opacity: [1, 1, 0]
        }}
        transition={{ 
          duration: 2,
          delay: Math.random() * 0.5,
          ease: "easeOut"
        }}
      />
    );
  });

  const sparkles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={`sparkle-${i}`}
      className="absolute"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ 
        scale: [0, 1, 0], 
        rotate: 360,
        opacity: [0, 1, 0]
      }}
      transition={{ 
        duration: 1.5,
        delay: Math.random() * 2,
        repeat: 2
      }}
    >
      ✨
    </motion.div>
  ));

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {showFireworks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
        >
          {/* Fireworks Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(5)].map((_, burstIndex) => (
              <motion.div
                key={burstIndex}
                className="absolute"
                style={{
                  left: `${20 + burstIndex * 15}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: burstIndex * 0.3 }}
              >
                {fireworksParticles}
              </motion.div>
            ))}
          </div>

          {/* Sparkles */}
          {sparkles}

          {/* Glowing Orbs */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 1,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Success Wave */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Floating Success Text */}
          <motion.div
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: -50, opacity: [0, 1, 0], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ¡INCREÍBLE!
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MissionEffects;