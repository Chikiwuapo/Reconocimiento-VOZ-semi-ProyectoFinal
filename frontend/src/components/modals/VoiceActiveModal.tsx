import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

interface VoiceActiveModalProps {
  isOpen: boolean
  onClose: () => void
  onVoiceRecorded?: (audioBlob: Blob) => void
}

export default function VoiceActiveModal({ 
  isOpen, 
  onClose,
  onVoiceRecorded
}: VoiceActiveModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(6)
  const [progress, setProgress] = useState(0)
  const [recordingText, setRecordingText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)
  
  const RECORD_SECONDS = 6

  // Limpiar recursos al cerrar
  useEffect(() => {
    if (!isOpen) {
      stopRecording()
    }
  }, [isOpen])

  // Iniciar grabación automáticamente cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isRecording) {
      startRecording()
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      // Solicitar permiso de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      streamRef.current = stream

      // Configurar MediaRecorder
      const options = { mimeType: 'audio/webm;codecs=opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4'
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Eventos del MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        handleRecordingComplete()
      }

      // Iniciar grabación
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingText(`Grabando… Mantén la voz clara. Quedan ${RECORD_SECONDS}s.`)

      // Configurar timer automático
      recordingTimerRef.current = setTimeout(() => {
        stopRecording()
      }, RECORD_SECONDS * 1000)

      // Iniciar countdown
      startCountdown()

    } catch (error) {
      console.error('Error al acceder al micrófono:', error)
      setRecordingText('❌ No se pudo acceder al micrófono. Verifica los permisos.')
      setTimeout(() => onClose(), 3000)
    }
  }

  const startCountdown = () => {
    let timeLeft = RECORD_SECONDS
    setCountdown(timeLeft)
    setProgress(0)
    
    countdownTimerRef.current = setInterval(() => {
      timeLeft--
      setCountdown(timeLeft)
      
      // Actualizar barra de progreso
      const progressPercent = ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100
      setProgress(progressPercent)
      
      // Actualizar texto
      if (timeLeft > 0) {
        setRecordingText(`Grabando… Mantén la voz clara. Quedan ${timeLeft}s.`)
      }
      
      if (timeLeft <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
        }
      }
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    
    // Limpiar timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    // Detener stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleRecordingComplete = async () => {
    try {
      setIsSaving(true)
      setRecordingText('Guardando...')

      // Crear blob de audio
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      })

      // Validar tamaño del archivo
      if (audioBlob.size === 0) {
        throw new Error('No se grabó audio')
      }

      if (audioBlob.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('El archivo de audio es demasiado grande')
      }

      // Llamar callback con el audio grabado
      if (onVoiceRecorded) {
        await onVoiceRecorded(audioBlob)
      }

      setRecordingText('✅ Voz registrada correctamente')
      
      // Cerrar modal después de un delay
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Error al procesar grabación:', error)
      setRecordingText('❌ Error: no se pudo guardar la voz. Intenta de nuevo.')
      setTimeout(() => {
        onClose()
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  🎤 Grabando voz
                </h3>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white transition-colors p-1"
                  disabled={isRecording}
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

              {/* Recording Indicator */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  {/* Microphone Icon */}
                  <motion.div
                    className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 shadow-lg shadow-red-500/30' 
                        : 'bg-gray-500 shadow-lg shadow-gray-500/30'
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

                  {/* Recording Pulse Animation */}
                  {isRecording && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500/40"
                        animate={{
                          scale: [1, 2],
                          opacity: [0.8, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500/30"
                        animate={{
                          scale: [1, 2.5],
                          opacity: [0.6, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.3
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Countdown */}
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-white mb-2">
                    {countdown}s
                  </div>
                  <p className="text-neutral-300 text-sm">
                    {recordingText}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      progress > 80 ? 'bg-red-500' : 
                      progress > 50 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0s</span>
                  <span>{RECORD_SECONDS}s</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isSaving && (
                  <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Detener grabación
                  </button>
                )}
                {isSaving && (
                  <div className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}