import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

interface ActionCard {
  key: 'capture' | 'train' | 'practice'
  title: string
  subtitle: string
  imageUrl: string
  icon: string
  gradient: string
}

interface Props {
  open: boolean
  onClose: () => void
  isDarkMode?: boolean
  // Optional custom images
  images?: Partial<Record<ActionCard['key'], string>>
  modelType?: 'vocales' | 'abecedario' | 'numeros' | 'operaciones'
}

const DEFAULTS: Record<ActionCard['key'], ActionCard> = {
  capture: {
    key: 'capture',
    title: 'Capturar Muestras',
    subtitle: 'Graba ejemplos con tu cámara',
    imageUrl: 'https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=600&h=300&fit=crop&crop=center',
    icon: '📸',
    gradient: 'from-emerald-400 to-emerald-600'
  },
  train: {
    key: 'train',
    title: 'Entrenar Modelo',
    subtitle: 'Entrena con las muestras registradas',
    imageUrl: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=300&fit=crop&crop=center',
    icon: '🧠',
    gradient: 'from-blue-400 to-blue-600'
  },
  practice: {
    key: 'practice',
    title: 'Prácticar Modelo',
    subtitle: 'Pon a prueba tu modelo',
    imageUrl: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&h=300&fit=crop&crop=center',
    icon: '🎯',
    gradient: 'from-orange-400 to-orange-600'
  }
}

const ModelActionsModal: FC<Props> = ({ open, onClose, isDarkMode = false, images, modelType }) => {
  const navigate = useNavigate()
  if (!open) return null

  const cards: ActionCard[] = (['capture','train','practice'] as const).map(k => ({
    ...DEFAULTS[k],
    imageUrl: images?.[k] || DEFAULTS[k].imageUrl
  }))

  const go = (k: ActionCard['key']) => {
    const q = modelType ? `?model=${modelType}` : ''
    switch (k) {
      case 'capture': navigate(`/arithmetic/capture${q}`); break
      case 'train': navigate(`/arithmetic/train${q}`); break
      case 'practice': navigate(`/arithmetic/practice${q}`); break
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header del modal - replica del estilo en Models */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎛️ Acciones del Modelo</h2>
              <p className="text-blue-100">Elige qué deseas hacer con tu modelo</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
        {/* Tarjetas */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map(card => (
              <button
                key={card.key}
                onClick={() => go(card.key)}
                className={`text-left rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border overflow-hidden ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}
              >
                <div className={`bg-gradient-to-r ${card.gradient} h-16 relative`}>
                  <div className="absolute top-2 left-2 w-5 h-5 bg-white/30 rounded-full" />
                  <div className="absolute top-2 right-2 w-10 h-1.5 bg-white/40 rounded-full" />
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <img src={card.imageUrl} alt={card.title} className="w-full h-20 object-cover rounded-lg shadow-md" />
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 flex items-center justify-center mr-2"><span className="text-lg">{card.icon}</span></div>
                  </div>
                  <h3 className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-sm font-bold`}>{card.title}</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>{card.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelActionsModal
