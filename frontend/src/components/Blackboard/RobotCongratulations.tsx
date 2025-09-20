import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Zap, Heart, CheckCircle } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RobotCongratulationsProps {
  mission: Mission | null;
  isVisible: boolean;
  onClose: () => void;
}

const RobotCongratulations: React.FC<RobotCongratulationsProps> = ({ 
  mission, 
  isVisible, 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [robotEmotion, setRobotEmotion] = useState('happy');

  const congratulationMessages = {
    easy: [
      "¡Increíble trabajo! 🤖✨",
      "¡Eres fantástico! Sigue así 🚀",
      "¡Misión completada con éxito! 🎯",
      "¡Excelente progreso! 💪"
    ],
    medium: [
      "¡WOW! ¡Eso fue impresionante! 🤖🔥",
      "¡Nivel medio dominado! ¡Eres increíble! ⚡",
      "¡Tu dedicación es admirable! 🌟",
      "¡Sigue brillando así! ✨"
    ],
    hard: [
      "¡ÉPICO! ¡Eres un verdadero maestro! 🤖👑",
      "¡INCREÍBLE! ¡Nivel experto desbloqueado! 🚀",
      "¡Tu habilidad es extraordinaria! 💎",
      "¡Eres una leyenda! ¡Sigue conquistando! 🏆"
    ]
  };

  const robotFaces = {
    happy: "😊",
    excited: "🤩",
    proud: "😎",
    amazed: "🤯"
  };

  useEffect(() => {
    if (isVisible && mission) {
      setShowConfetti(true);
      setRobotEmotion('excited');
      
      // Cambiar emociones del robot
      const emotionSequence = ['excited', 'happy', 'proud', 'amazed'];
      let currentIndex = 0;
      
      const emotionInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % emotionSequence.length;
        setRobotEmotion(emotionSequence[currentIndex]);
      }, 1000);

      // Limpiar confetti después de 3 segundos
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => {
        clearInterval(emotionInterval);
        clearTimeout(confettiTimeout);
      };
    }
  }, [isVisible, mission]);

  const getRandomMessage = (difficulty: string) => {
    const messages = congratulationMessages[difficulty as keyof typeof congratulationMessages];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const confettiParticles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][i % 6],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ 
        scale: 0, 
        rotate: 0,
        y: -100
      }}
      animate={{ 
        scale: [0, 1, 0], 
        rotate: 360,
        y: window.innerHeight + 100
      }}
      transition={{ 
        duration: 3,
        delay: Math.random() * 2,
        ease: "easeOut"
      }}
    />
  ));

  if (!isVisible || !mission) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {confettiParticles}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300,
            duration: 0.6
          }}
          className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full border border-purple-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Robot Avatar */}
          <motion.div
            className="text-center mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative inline-block">
              {/* Robot Body */}
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-gray-900 to-black rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.5)",
                    "0 0 40px rgba(147, 51, 234, 0.8)",
                    "0 0 20px rgba(147, 51, 234, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🤖
              </motion.div>
              
              {/* Robot Face Expression */}
              <motion.div
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {robotFaces[robotEmotion as keyof typeof robotFaces]}
              </motion.div>

              {/* Floating particles around robot */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * 60) * 30}%`,
                    left: `${20 + Math.cos(i * 60) * 30}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Congratulations Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-6"
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-2"
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(255, 255, 255, 0.5)",
                  "0 0 20px rgba(255, 255, 255, 0.8)",
                  "0 0 10px rgba(255, 255, 255, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ¡MISIÓN COMPLETADA!
            </motion.h2>
            
            <motion.p
              className="text-xl text-purple-200 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {getRandomMessage(mission.difficulty)}
            </motion.p>
          </motion.div>

          {/* Mission Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
            </div>
            
            <p className="text-purple-200 mb-4">{mission.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">+{mission.reward} puntos</span>
              </div>
              
              <motion.div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mission.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  mission.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {mission.difficulty.toUpperCase()}
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <motion.button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ¡Continuar!
            </motion.button>
            
            <motion.button
              className="px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Floating Success Icons */}
          <div className="absolute inset-0 pointer-events-none">
            {[CheckCircle, Star, Sparkles, Zap].map((Icon, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RobotCongratulations;