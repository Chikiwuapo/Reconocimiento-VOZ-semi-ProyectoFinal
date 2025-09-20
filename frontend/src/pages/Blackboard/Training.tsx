import Layout from '../../components/Blackboard/Layout'
import { useState, useEffect } from 'react'
import type { ModelType } from '../../types'

export default function Training() {
  const [selectedDataset, setSelectedDataset] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedModelInfo, setSelectedModelInfo] = useState<ModelType | null>(null)
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001,
    modelName: ''
  })
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [trainingLogs, setTrainingLogs] = useState<string[]>([])

  // Cargar modelo seleccionado desde localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('selectedModelForTraining')
    if (savedModel) {
      try {
        const modelInfo = JSON.parse(savedModel)
        setSelectedModelInfo(modelInfo)
        setTrainingConfig(prev => ({
          ...prev,
          modelName: modelInfo.name || ''
        }))
        // Limpiar el localStorage después de cargar
        localStorage.removeItem('selectedModelForTraining')
      } catch (error) {
        console.error('Error al cargar el modelo seleccionado:', error)
      }
    }
  }, [])

  const startTraining = () => {
    if (!selectedDataset || !selectedModel || !trainingConfig.modelName) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)
    setCurrentEpoch(0)
    setTrainingLogs(['🚀 Iniciando entrenamiento...', '📊 Cargando dataset...', '🔧 Configurando modelo...'])

    // Simular entrenamiento
    const totalEpochs = trainingConfig.epochs
    let currentEpochCount = 0
    
    const trainingInterval = setInterval(() => {
      currentEpochCount++
      setCurrentEpoch(currentEpochCount)
      setTrainingProgress((currentEpochCount / totalEpochs) * 100)
      
      // Agregar logs simulados
      setTrainingLogs(prev => [...prev, 
        `📈 Época ${currentEpochCount}/${totalEpochs} - Loss: ${(Math.random() * 0.5 + 0.1).toFixed(4)} - Accuracy: ${(85 + Math.random() * 10).toFixed(2)}%`
      ])

      if (currentEpochCount >= totalEpochs) {
        clearInterval(trainingInterval)
        setIsTraining(false)
        setTrainingLogs(prev => [...prev, 
          '✅ Entrenamiento completado exitosamente!',
          '💾 Guardando modelo...',
          '🎉 Modelo guardado como: ' + trainingConfig.modelName
        ])
      }
    }, 2000)
  }

  return (
    <Layout pageTitle="Entrenar Modelo" pageSubtitle="Crea y entrena tu propio modelo de reconocimiento de voz personalizado.">
      
      {/* Información del Modelo Seleccionado */}
      {selectedModelInfo && (
        <section className="container-page mt-6 animate-slide-up">
          <div className="card">
            <h2 className="text-lg font-semibold text-header mb-4">🎯 Modelo Seleccionado</h2>
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className={`w-16 h-16 bg-gradient-to-r ${selectedModelInfo.bgColor} rounded-xl flex items-center justify-center text-2xl`}>
                {selectedModelInfo.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{selectedModelInfo.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedModelInfo.description}</p>
                <div className="flex space-x-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    📊 {selectedModelInfo.type}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ⏱️ {selectedModelInfo.duration}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    🎓 {selectedModelInfo.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Configuración del Entrenamiento */}
      <section className="container-page mt-6 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel de Configuración */}
          <div className="card">
            <h2 className="text-lg font-semibold text-header mb-4">⚙️ Configuración del Entrenamiento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Modelo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mi modelo personalizado"
                  value={trainingConfig.modelName}
                  onChange={(e) => setTrainingConfig(prev => ({...prev, modelName: e.target.value}))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dataset de Entrenamiento</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                >
                  <option value="">Seleccionar dataset...</option>
                  <option value="common-voice">Common Voice Español (1000h)</option>
                  <option value="librispeech">LibriSpeech Español (500h)</option>
                  <option value="custom">Dataset personalizado</option>
                  <option value="medical">Dataset médico (200h)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Modelo Base</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="">Seleccionar modelo base...</option>
                  <option value="whisper-small">Whisper Small</option>
                  <option value="wav2vec2">Wav2Vec2 Base</option>
                  <option value="deepspeech">DeepSpeech</option>
                  <option value="custom-cnn">CNN Personalizada</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Épocas</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={trainingConfig.epochs}
                    onChange={(e) => setTrainingConfig(prev => ({...prev, epochs: parseInt(e.target.value)}))}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Batch Size</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={trainingConfig.batchSize}
                    onChange={(e) => setTrainingConfig(prev => ({...prev, batchSize: parseInt(e.target.value)}))}
                    min="1"
                    max="128"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={trainingConfig.learningRate}
                  onChange={(e) => setTrainingConfig(prev => ({...prev, learningRate: parseFloat(e.target.value)}))}
                  min="0.0001"
                  max="0.1"
                />
              </div>

              <button 
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isTraining 
                    ? 'bg-slate-400 text-white cursor-not-allowed' 
                    : 'bg-accent-purple text-white hover:bg-accent-purple/90'
                }`}
                onClick={startTraining}
                disabled={isTraining}
              >
                {isTraining ? '🔄 Entrenando...' : '🚀 Iniciar Entrenamiento'}
              </button>
            </div>
          </div>

          {/* Panel de Progreso */}
          <div className="card">
            <h2 className="text-lg font-semibold text-header mb-4">📊 Progreso del Entrenamiento</h2>
            
            {!isTraining && trainingProgress === 0 && (
              <div className="text-center py-12 text-slate-500">
                <span className="text-6xl mb-4 block">🎯</span>
                <p>Configura los parámetros y presiona "Iniciar Entrenamiento"</p>
              </div>
            )}

            {(isTraining || trainingProgress > 0) && (
              <div className="space-y-6">
                {/* Barra de Progreso Principal */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progreso General</span>
                    <span className="text-accent-purple font-bold">{trainingProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-accent-purple to-primary h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                      style={{width: `${trainingProgress}%`}}
                    >
                      {trainingProgress > 10 && (
                        <span className="text-white text-xs font-bold">
                          {trainingProgress.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de Época Actual */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Época Actual</div>
                    <div className="text-2xl font-bold text-primary">{currentEpoch}</div>
                    <div className="text-sm text-slate-500">de {trainingConfig.epochs}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-sm text-slate-600">Estado</div>
                    <div className="text-lg font-semibold text-accent-green">
                      {isTraining ? '🔄 Entrenando' : trainingProgress === 100 ? '✅ Completado' : '⏸️ Pausado'}
                    </div>
                  </div>
                </div>

                {/* Logs de Entrenamiento */}
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">📝 Logs de Entrenamiento</h3>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm">
                    {trainingLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                    ))}
                    {isTraining && (
                      <div className="animate-pulse">
                        <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> ⏳ Procesando...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección de Modelos Recientes */}
      <section className="container-page mt-8 animate-slide-up">
        <div className="card">
          <h2 className="text-lg font-semibold text-header mb-4">🕒 Entrenamientos Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Modelo Médico v2</h3>
                <span className="badge bg-green-100 text-green-800">Completado</span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <div>Dataset: Medical Spanish (200h)</div>
                <div>Accuracy: 94.2%</div>
                <div>Hace 2 días</div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Asistente v3</h3>
                <span className="badge bg-yellow-100 text-yellow-800">En progreso</span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <div>Dataset: Common Voice (1000h)</div>
                <div>Época: 7/15</div>
                <div>Hace 1 hora</div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '47%'}}></div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Transcriptor Musical</h3>
                <span className="badge bg-red-100 text-red-800">Error</span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <div>Dataset: Music Lyrics (50h)</div>
                <div>Error: Out of memory</div>
                <div>Hace 3 días</div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '23%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}