import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Blackboard/Layout'
import type { ModelType, TrainingSession, ModelStats } from '../../types'
import { useUserStore } from '../../auth/userStore'
import { useTheme } from '../../App'
import { useModelContext } from '../../contexts/ModelContext'

export default function Models() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { setSelectedModel } = useModelContext()
  
  // Estados principales
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [showModelSelection, setShowModelSelection] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [selectedModelLocal, setSelectedModelLocal] = useState<ModelType | null>(null)
  const { user, addModel, updateModel, removeModel, setModels } = useUserStore()
  const createdModels = user.models as unknown as ModelType[]
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([])
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [modelStats, setModelStats] = useState<ModelStats>({
    totalModels: 0,
    activeModels: 0,
    totalTrainingSessions: 0,
    averageAccuracy: 0
  })
  const [recordsCount, setRecordsCount] = useState<number>(0)

  // Registrar modelo entrenado (único por id) en localStorage
  const markModelTypeTrained = (id: string) => {
    try {
      const key = 'trained_models_ids'
      const raw = localStorage.getItem(key)
      const arr: string[] = raw ? JSON.parse(raw) : []
      if (!arr.includes(id)) {
        const next = [...arr, id]
        localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('trained:updated'))
      }
    } catch {}
  }

  // Cargar datos del localStorage (solo sesiones) al inicializar y scroll automático arriba
  useEffect(() => {
    loadDataFromStorage()
    // Scroll automático arriba al cargar el componente
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Guardar datos en localStorage cuando cambien (solo sesiones)
  useEffect(() => {
    saveDataToStorage()
    updateStats()
  }, [user.models, trainingSessions])

  // Cargar cantidad de registros guardados desde backend (gestos entrenados)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/operaciones/gestos_entrenados')
        if (!res.ok) throw new Error('No se pudo obtener registros')
        const data = await res.json()
        const count = Array.isArray(data?.gestos) ? data.gestos.length : (Array.isArray(data) ? data.length : 0)
        setRecordsCount(count)
      } catch {
        setRecordsCount(0)
      }
    }
    load()
  }, [])

  // Bloquear scroll cuando el modal esté abierto
  useEffect(() => {
    if (showModelSelection || showConfirmationModal || isTraining) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModelSelection, showConfirmationModal, isTraining])

  // Funciones de persistencia (solo para sesiones de entrenamiento)
  const loadDataFromStorage = () => {
    try {
      const savedSessions = localStorage.getItem('trainingSessions')
      
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }))
        setTrainingSessions(sessions)
      }
    } catch (error) {
      console.error('Error loading data from storage:', error)
    }
  }

  const saveDataToStorage = () => {
    try {
      localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions))
    } catch (error) {
      console.error('Error saving data to storage:', error)
    }
  }

  const updateStats = () => {
    const totalModels = createdModels.length
    const activeModels = createdModels.filter(model => (model as any).isActive).length
    // Leer ids únicos de modelos entrenados
    let totalTrainingSessions = 0
    try {
      const raw = localStorage.getItem('trained_models_ids')
      const arr: string[] = raw ? JSON.parse(raw) : []
      totalTrainingSessions = Array.isArray(arr) ? arr.length : 0
    } catch { totalTrainingSessions = 0 }
    const averageAccuracy = 0

    setModelStats({
      totalModels,
      activeModels,
      totalTrainingSessions,
      averageAccuracy
    })
  }

  const availableModels: ModelType[] = [
    {
      id: 'vocales',
      name: 'Modelo de Vocales',
      description: 'Entrenamiento para reconocimiento de vocales habladas (A, E, I, O, U)',
      icon: '🗣️',
      color: 'emerald',
      bgColor: 'from-emerald-400 to-emerald-600',
      duration: '~10 min',
      difficulty: 'Básica',
      type: 'Vocales',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'abecedario',
      name: 'Modelo de Abecedario',
      description: 'Entrenamiento para reconocimiento de letras del abecedario completo',
      icon: '🔤',
      color: 'blue',
      bgColor: 'from-blue-400 to-blue-600',
      duration: '~25 min',
      difficulty: 'Intermedia',
      type: 'Letras',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'palabras',
      name: 'Modelo de Palabras',
      description: 'Entrenamiento para reconocimiento de palabras clave y vocabulario',
      icon: '📝',
      color: 'purple',
      bgColor: 'from-purple-400 to-purple-600',
      duration: '~20 min',
      difficulty: 'Intermedia',
      type: 'Palabras',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop&crop=center'
    },
    {
      id: 'aritmeticas',
      name: 'Operaciones Aritméticas',
      description: 'Entrenamiento para reconocimiento de operaciones matemáticas básicas',
      icon: '➕',
      color: 'orange',
      bgColor: 'from-orange-400 to-orange-600',
      duration: '~15 min',
      difficulty: 'Básica',
      type: 'Matemáticas',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop&crop=center'
    }
  ]

  // Funciones de manejo de modelos
  const handleStartTraining = () => {
    setShowModelSelection(true)
  }

  const handleModelSelect = (model: ModelType) => {
    // Crear un nuevo modelo en el store centralizado
    addModel({
      name: model.name,
      description: model.description,
      type: model.type,
      icon: model.icon,
      image: model.image,
      bgColor: model.bgColor,
      color: model.color,
      status: 'pending',
      accuracy: 0,
      isActive: false,
      duration: model.duration,
      difficulty: model.difficulty,
    })

    // Cerrar el modal
    setShowModelSelection(false)

    // Establecer el modelo seleccionado en el contexto
    if (model.id === 'vocales') {
      setSelectedModel({
        id: 'vocales',
        name: 'Vocales',
        type: 'vocales',
        basePath: '/vocales'
      })
      navigate('/vocales/capture')
    } else if (model.id === 'abecedario') {
      setSelectedModel({
        id: 'abecedario',
        name: 'Abecedario',
        type: 'abecedario',
        basePath: '/abecedario'
      })
      navigate('/abecedario/capture')
    } else if (model.id === 'palabras') {
      setSelectedModel({
        id: 'palabras',
        name: 'Palabras',
        type: 'palabras',
        basePath: '/palabras'
      })
      navigate('/palabras/capture')
    } else {
      setSelectedModel({
        id: 'arithmetic',
        name: 'Aritmética',
        type: 'arithmetic',
        basePath: '/arithmetic'
      })
      navigate('/arithmetic/capture')
    }

    // Notificación
    window.dispatchEvent(new CustomEvent('app:notify', { detail: `Modelo creado: ${model.name}` }))
  }

  const handleConfirmModel = () => {
    if (selectedModelLocal) {
      const newModel: ModelType = {
        ...selectedModelLocal,
        id: `${selectedModelLocal.id}_${Date.now()}`,
        status: 'Entrenando',
        accuracy: 0,
        createdAt: new Date(),
        isActive: false,
        trainingData: []
      }
      
      addModel({
        id: newModel.id,
        name: newModel.name,
        description: newModel.description,
        type: newModel.type,
        icon: newModel.icon,
        image: newModel.image,
        bgColor: newModel.bgColor,
        color: newModel.color,
        status: 'Entrenando' as any,
        accuracy: 0,
        isActive: false,
        duration: newModel.duration,
        difficulty: newModel.difficulty,
      })
      setShowConfirmationModal(false)
      setSelectedModelLocal(null)
      startTraining(newModel)
    }
  }

  const startTraining = (model: ModelType) => {
    // Asegurar contador único por tipo/modelo al entrar a entrenar
    if (model?.id) markModelTypeTrained(model.id)
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      modelId: model.id,
      startTime: new Date(),
      progress: 0,
      status: 'training',
      samples: 0
    }

    setTrainingSessions(prev => [...prev, session])
    setCurrentSession(session)
    setIsTraining(true)
    setTrainingProgress(0)
    
    // Simular progreso de entrenamiento realista
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 3 + 1
        
        // Actualizar sesión
        setTrainingSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === session.id 
              ? { ...s, progress: newProgress, samples: Math.floor(newProgress * 10) }
              : s
          )
        )

        if (newProgress >= 100) {
          clearInterval(interval)
          completeTraining(model, session)
          return 100
        }
        return newProgress
      })
    }, 150)
  }

  const completeTraining = (model: ModelType, session: TrainingSession) => {
    const accuracy = Math.floor(Math.random() * 20 + 80) // 80-99%
    
    // Actualizar modelo en store
    updateModel(model.id, { status: 'Completado' as any, accuracy, isActive: true })

    // Finalizar sesión
    setTrainingSessions(prev => 
      prev.map(s => 
        s.id === session.id 
          ? { 
              ...s, 
              endTime: new Date(), 
              status: 'completed', 
              progress: 100 
            }
          : s
      )
    )

    setIsTraining(false)
    setCurrentSession(null)
    setTrainingProgress(0)
  }

  const deleteModel = (modelId: string) => {
    removeModel(modelId)
    setTrainingSessions(prev => prev.filter(session => session.modelId !== modelId))
  }

  const toggleModelActive = (modelId: string) => {
    const found = createdModels.find(m => m.id === modelId) as any
    updateModel(modelId, { isActive: !found?.isActive })
  }

  // useModel removido: flujo ahora va hacia Arithmetic



  // viewModel removido

  // Funciones de filtrado y búsqueda
  const filteredModels = createdModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && model.isActive) ||
                         (filterType === 'inactive' && !model.isActive) ||
                         (filterType === 'completed' && model.status === 'Completado')
    
    return matchesSearch && matchesFilter
  })

  const clearAllData = () => {
    setShowClearConfirm(true)
  }

  const doClearAll = () => {
    setModels([] as any)
    setTrainingSessions([])
    try { localStorage.removeItem('trainingSessions') } catch {}
    setShowClearConfirm(false)
  }

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: any } = {
      emerald: {
        bg: 'bg-emerald-600 hover:bg-emerald-700',
        text: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-800'
      },
      blue: {
        bg: 'bg-blue-600 hover:bg-blue-700',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      },
      purple: {
        bg: 'bg-purple-600 hover:bg-purple-700',
        text: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      orange: {
        bg: 'bg-orange-600 hover:bg-orange-700',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      }
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <Layout>
      <div className={`min-h-[80vh] p-4 md:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        <div className="w-full max-w-none">
          {/* Header */}
          <div className="text-center mb-12">
      
          </div>

          {/* Tarjeta grande para crear modelo - ANCHO COMPLETO */}
          <div className="mb-8 md:mb-10 w-full">
            <div className="rounded-2xl p-8 w-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1" style={{ backgroundColor: '#00FFFF', color: '#0b2c3a' }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">🎤 Crea tu Modelo Personalizado</h2>
                  <p className="text-xl opacity-80 mb-6 max-w-3xl">
                    Entrena un modelo de reconocimiento de voz único con tu propia voz. 
                    Obtén mayor precisión y personalización para tus necesidades específicas.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="bg-white/40 text-[#0b2c3a] px-4 py-2 rounded-full text-sm font-medium">
                      ✨ Alta Precisión
                    </span>
                    <span className="bg-white/40 text-[#0b2c3a] px-4 py-2 rounded-full text-sm font-medium">
                      🚀 Entrenamiento Rápido
                    </span>
                    <span className="bg-white/40 text-[#0b2c3a] px-4 py-2 rounded-full text-sm font-medium">
                      🎯 Personalizado
                    </span>
                  </div>
                </div>
               
              </div>
            </div>
          </div>

          {/* Panel de Estadísticas */}
          {createdModels.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Modelos</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{modelStats.totalModels}</p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Modelos Activos</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{modelStats.activeModels}</p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                    <span className="text-2xl">🗂️</span>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Registros guardados</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{recordsCount}</p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
                    <span className="text-2xl">🏃</span>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Entrenamientos</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{modelStats.totalTrainingSessions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección: Tus modelos creados */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                🎯 Tus Modelos Creados
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleStartTraining}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
                >
                  Agregar modelo
                </button>
                {createdModels.length > 0 && (
                  <button 
                    onClick={clearAllData}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
            </div>

            {/* Controles de búsqueda y filtros */}
            {createdModels.length > 0 && (
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar modelos por nombre o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="completed">Completados</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Mostrar modelos creados o mensaje vacío */}
            {createdModels.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <span className={`text-4xl ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}>🎤</span>
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No tienes modelos creados aún
                </h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Haz clic en "Comenzar Entrenamiento" para crear tu primer modelo personalizado
                </p>
                <button 
                  onClick={handleStartTraining}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Crear mi primer modelo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredModels.map((model) => {
                  const colors = getColorClasses(model.color)
                  const isTraining = currentSession?.modelId === model.id
                  
                  return (
                    <div key={model.id} className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      {/* Header con gradiente y círculo blanco */}
                      <div className={`bg-gradient-to-r ${model.bgColor} h-16 relative`}>
                        <div className="absolute top-2 left-2 w-5 h-5 bg-white/30 rounded-full"></div>
                        <div className="absolute top-2 right-2 w-10 h-1.5 bg-white/40 rounded-full"></div>
                        
                        {/* Indicadores de estado */}
                        {model.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                            ✓ LISTO
                          </div>
                        )}
                        {isTraining && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg animate-pulse">
                            🔄 ENTRENANDO
                          </div>
                        )}
                        {!model.isActive && model.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                            INACTIVO
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        {/* Imagen del modelo */}
                        <div className="mb-3">
                          <img 
                            src={model.image} 
                            alt={model.name}
                            className="w-full h-16 object-cover rounded-lg shadow-md"
                          />
                        </div>
                        
                        {/* Ícono del modelo y controles */}
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 flex items-center justify-center mr-2">
                            <span className="text-lg">{model.icon}</span>
                          </div>
                          <div className="ml-auto flex gap-1">
                            {/* Botón activar/desactivar */}
                            <button
                              onClick={() => toggleModelActive(model.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                                model.isActive 
                                  ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600')
                                  : (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400')
                              }`}
                              title={model.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {model.isActive ? '●' : '○'}
                            </button>
                            {/* Botón eliminar */}
                            <button
                              onClick={() => deleteModel(model.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${isDarkMode ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                              title="Eliminar modelo"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{model.name}</h3>
                        <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {model.description}
                        </p>
                        
                        {/* Información resumida */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completado</div>
                            <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{(model as any).status === 'Completado' || (model as any).status === 'completed' ? 'Sí' : 'No'}</div>
                          </div>
                          <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Registros guardados</div>
                            <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{recordsCount}</div>
                          </div>
                        </div>
                        
                        {/* Se removió barra de entrenamiento */}
                        
                        {/* Botones de acción */}
                        <div className="flex flex-col gap-2 mt-auto">
                          {model.status === 'completed' ? (
                            <>
                              <button 
                                onClick={() => { updateModel(model.id, { isActive: true }); navigate('/arithmetic?tab=test') }}
                                className={`w-full ${colors.bg} text-white py-2 px-3 rounded-lg text-xs font-medium transition-all transform hover:scale-105 shadow-md`}
                                disabled={!model.isActive}
                              >
                                {model.isActive ? 'Usar' : 'Inactivo'}
                              </button>
                              <button 
                                onClick={() => {
                                  updateModel(model.id, { status: 'Completado' as any, isActive: true })
                                  const orig = (model.type || '').toLowerCase()
                                  if (orig.includes('vocal')) navigate('/vocales/capture')
                                  else if (orig.includes('letra') || orig.includes('abecedario')) navigate('/abecedario/capture')
                                  else if (orig.includes('palabra')) navigate('/palabras/capture')
                                  else navigate('/arithmetic/capture')
                                }}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-md ${isDarkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              >
                                Comenzar
                              </button>
                              <button
                                onClick={() => {
                                  const orig = (model.type || '').toLowerCase()
                                  let path = '/arithmetic/practice'
                                  if (orig.includes('vocal')) path = '/arithmetic/practice/vocales'
                                  else if (orig.includes('letra') || orig.includes('abecedario')) path = '/arithmetic/practice/abecedario'
                                  else if (orig.includes('númer') || orig.includes('numero') || orig.includes('numeros')) path = '/arithmetic/practice/numeros'
                                  else if (orig.includes('aritm') || orig.includes('operacion') || orig.includes('operación') || orig.includes('operaciones') || orig.includes('matem')) path = '/arithmetic/practice/operaciones'
                                  else if (orig.includes('palabra')) path = '/arithmetic/practice/palabras'
                                  navigate(path)
                                }}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-alt text-header hover:opacity-90'}`}
                              >
                                Ir a practicar
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  updateModel(model.id, { status: 'Completado' as any, isActive: true })
                                  const orig = (model.type || '').toLowerCase()
                                  if (orig.includes('vocal')) navigate('/vocales/capture')
                                  else if (orig.includes('letra') || orig.includes('abecedario')) navigate('/abecedario/capture')
                                  else if (orig.includes('palabra')) navigate('/palabras/capture')
                                  else navigate('/arithmetic/capture')
                                }}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-md ${isDarkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              >
                                Comenzar
                              </button>
                              <button
                                onClick={() => {
                                  const orig = (model.type || '').toLowerCase()
                                  let path = '/arithmetic/practice'
                                  if (orig.includes('vocal')) path = '/arithmetic/practice/vocales'
                                  else if (orig.includes('letra') || orig.includes('abecedario')) path = '/arithmetic/practice/abecedario'
                                  else if (orig.includes('númer') || orig.includes('numero') || orig.includes('numeros')) path = '/arithmetic/practice/numeros'
                                  else if (orig.includes('aritm') || orig.includes('operacion') || orig.includes('operación') || orig.includes('operaciones') || orig.includes('matem')) path = '/arithmetic/practice/operaciones'
                                  else if (orig.includes('palabra')) path = '/arithmetic/practice/palabras'
                                  navigate(path)
                                }}
                                className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' : 'bg-alt text-header hover:opacity-90'}`}
                              >
                                Ir a practicar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de selección de modelos */}
      {showModelSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header del modal */}
            <div className="p-6 rounded-t-2xl" style={{ backgroundColor: '#00FFFF', color: '#0b2c3a' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🎯 Selecciona el Tipo de Modelo</h2>
                  <p className="opacity-80">Elige qué tipo de modelo de voz quieres entrenar</p>
                </div>
                <button 
                  onClick={() => setShowModelSelection(false)}
                  className="text-[#0b2c3a] hover:text-[#06202b] text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/30 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableModels.map((model) => (
                  <div 
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border cursor-pointer hover:border-blue-300 overflow-hidden ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}
                  >
                    {/* Header con gradiente y círculo blanco */}
                    <div className={`bg-gradient-to-r ${model.bgColor} h-16 relative`}>
                      <div className="absolute top-2 left-2 w-5 h-5 bg-white/30 rounded-full"></div>
                      <div className="absolute top-2 right-2 w-10 h-1.5 bg-white/40 rounded-full"></div>
                      {/* Etiqueta "NUEVO" si es necesario */}
                      {model.id === 'vocales' && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-bl-lg">
                          NUEVO
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      {/* Imagen del modelo */}
                      <div className="mb-3">
                        <img 
                          src={model.image} 
                          alt={model.name}
                          className="w-full h-16 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      
                      {/* Ícono del modelo y estrella */}
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 flex items-center justify-center mr-2">
                          <span className="text-lg">{model.icon}</span>
                        </div>
                        {/* Estrella de favorito */}
                        <div className="ml-auto">
                          <svg className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                      </div>
                      
                      <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{model.name}</h3>
                      <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {model.description}
                      </p>
                      
                      {/* Información adicional */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duración</div>
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{model.duration}</div>
                        </div>
                        <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <div className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nivel</div>
                          <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{model.difficulty}</div>
                        </div>
                      </div>
                      
                      {/* Indicador de selección */}
                      <div className="mt-auto pt-2">
                        <div className={`text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Haz clic para seleccionar
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación para Limpiar Todo */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowClearConfirm(false)} />
          <div className={`relative w-full max-w-md rounded-xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>¿Limpiar todos los modelos?</h3>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Esta acción eliminará tus modelos locales y sesiones de entrenamiento. No se puede deshacer.</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn" onClick={() => setShowClearConfirm(false)}>Cancelar</button>
              <button className="btn-accent-purple" onClick={doClearAll}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmationModal && selectedModelLocal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-md w-full shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header del modal */}
            <div className={`bg-gradient-to-r ${selectedModelLocal.bgColor} text-white p-6 rounded-t-2xl`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{selectedModelLocal.icon}</span>
                </div>
                <h2 className="text-xl font-bold">Confirmar Creación</h2>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  ¿Crear {selectedModelLocal.name}?
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Estás a punto de crear un modelo de entrenamiento para {selectedModelLocal.type.toLowerCase()}. 
                  Este proceso tomará aproximadamente {selectedModelLocal.duration}.
                </p>
              </div>

              <div className={`rounded-lg p-4 mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Detalles del modelo:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tipo:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedModelLocal.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Duración estimada:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedModelLocal.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Nivel de dificultad:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedModelLocal.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowConfirmationModal(false)
                    setSelectedModelLocal(null)
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmModel}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r ${selectedModelLocal.bgColor} text-white rounded-lg hover:opacity-90 transition-all font-medium`}
                >
                  Crear Modelo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de progreso de entrenamiento */}
      {isTraining && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-md w-full shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">🎤 Entrenando Modelo</h2>
                <p className="text-blue-100">Creando tu modelo personalizado...</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progreso del entrenamiento</span>
                  <span className="text-sm font-bold text-blue-600">{trainingProgress}%</span>
                </div>
                <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{width: `${trainingProgress}%`}}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Por favor espera mientras entrenamos tu modelo...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
