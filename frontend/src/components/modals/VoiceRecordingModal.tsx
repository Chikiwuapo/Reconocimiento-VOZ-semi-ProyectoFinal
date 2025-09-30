import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface VoiceRecordingModalProps {
  isOpen: boolean
  onClose: () => void
  onStartRecording?: () => void
  isRecording?: boolean
  countdown?: number
  progress?: number
}

export default function VoiceRecordingModal({ 
  isOpen, 
  onClose, 
  onStartRecording,
  isRecording = false,
  countdown = 6,
  progress = 0
}: VoiceRecordingModalProps) {
  const [pulseKey, setPulseKey] = useState(0)

  // Reiniciar animación de pulso cuando cambia el estado de grabación
  useEffect(() => {
    if (isRecording) {
      setPulseKey(prev => prev + 1)
    }
  }, [isRecording])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {isRecording ? 'Grabando...' : 'Preparando grabación'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white transition-colors p-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Microphone Icon with Animations */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  {/* Microphone Icon */}
                  <motion.div
                    key={pulseKey}
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 shadow-lg shadow-red-500/30' 
                        : 'bg-blue-500 shadow-lg shadow-blue-500/30'
                    }`}
                    animate={isRecording ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: isRecording ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <svg 
                      width="36" 
                      height="36" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="text-white"
                    >
                      <path 
                        d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" 
                        fill="currentColor"
                      />
                      <path 
                        d="M19 10V12C19 16.42 15.42 20 11 20H10V22H14V20H15C19.42 20 23 16.42 23 12V10H19Z" 
                        fill="currentColor"
                      />
                      <path 
                        d="M5 10V12C5 16.42 8.58 20 13 20H14V22H10V20H9C4.58 20 1 16.42 1 12V10H5Z" 
                        fill="currentColor"
                      />
                    </svg>
                  </motion.div>

                  {/* Pulse Rings */}
                  {isRecording && (
                    <>
                      <motion.div
                        key={`ring1-${pulseKey}`}
                        className="absolute inset-0 rounded-full border-2 border-red-500/30"
                        animate={{
                          scale: [1, 2],
                          opacity: [0.6, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                      <motion.div
                        key={`ring2-${pulseKey}`}
                        className="absolute inset-0 rounded-full border-2 border-red-500/20"
                        animate={{
                          scale: [1, 2.5],
                          opacity: [0.4, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.5
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Status Text */}
                <motion.p 
                  className="text-neutral-300 text-center mt-4"
                  animate={{ opacity: isRecording ? [1, 0.7, 1] : 1 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: isRecording ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {isRecording 
                    ? 'Habla claramente al micrófono...' 
                    : 'Presiona el botón para comenzar'
                  }
                </motion.p>
              </div>

              {/* Countdown */}
              {isRecording && (
                <div className="text-center mb-6">
                  <motion.div
                    className="text-4xl font-bold text-white mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {countdown}
                  </motion.div>
                  <p className="text-neutral-400 text-sm">segundos restantes</p>
                </div>
              )}

              {/* Progress Bar */}
              {isRecording && (
                <div className="mb-6">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>Progreso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h4 className="text-blue-300 font-medium mb-2">Instrucciones:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Habla con claridad y volumen normal</li>
                  <li>• Mantén el micrófono cerca</li>
                  <li>• Evita ruidos de fondo</li>
                  <li>• La grabación durará 6 segundos</li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={onStartRecording}
                    className="px-6 py-3 rounded-xl bg-[#5227FF] text-white hover:bg-[#4318FF] transition-colors shadow-lg shadow-[#5227FF]/25"
                  >
                    Comenzar grabación
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                  >
                    Detener grabación
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}