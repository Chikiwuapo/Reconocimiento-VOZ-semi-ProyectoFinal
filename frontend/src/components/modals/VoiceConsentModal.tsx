import { motion, AnimatePresence } from 'framer-motion'

interface VoiceConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onCancel: () => void
}

export default function VoiceConsentModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  onCancel 
}: VoiceConsentModalProps) {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Consentimiento de Voz
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

              {/* Content */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
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
                  </div>
                </div>

                <p className="text-neutral-300 text-center leading-relaxed">
                  Para habilitar los comandos de voz, necesitamos grabar una muestra de tu voz. 
                  Esta información será utilizada únicamente para mejorar el reconocimiento de 
                  comandos y será tratada de forma segura.
                </p>

                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    ✓ Tu voz será procesada localmente<br/>
                    ✓ Los datos se almacenan de forma segura<br/>
                    ✓ Puedes revocar el consentimiento en cualquier momento
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#5227FF] text-white hover:bg-[#4318FF] transition-colors shadow-lg shadow-[#5227FF]/25"
                >
                  Aceptar y grabar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}