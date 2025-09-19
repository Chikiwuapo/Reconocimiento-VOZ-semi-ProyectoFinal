import Layout from '../../components/Blackboard/Layout'
import { useState } from 'react'

export default function Models() {
  const [trainingProgress, setTrainingProgress] = useState<{[key: string]: number}>({})
  const [isTraining, setIsTraining] = useState<{[key: string]: boolean}>({})

  const startTraining = (modelId: string) => {
    setIsTraining(prev => ({...prev, [modelId]: true}))
    setTrainingProgress(prev => ({...prev, [modelId]: 0}))
    
    // Simular progreso de entrenamiento
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const currentProgress = prev[modelId] || 0
        if (currentProgress >= 100) {
          clearInterval(interval)
          setIsTraining(prevTraining => ({...prevTraining, [modelId]: false}))
          return prev
        }
        return {...prev, [modelId]: currentProgress + 2}
      })
    }, 100)
  }

  return (
    <Layout pageTitle="Mis Modelos de Voz" pageSubtitle="Gestiona y entrena tus modelos de reconocimiento de voz personalizados.">
      
      {/* Sección de Modelos Pre-entrenados */}
      <section className="container-page mt-6 animate-slide-up">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-header">🎯 Modelos Pre-entrenados Disponibles</h2>
            <button className="btn-accent-green btn-lg">Explorar más modelos</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card p-0 overflow-hidden h-[300px] flex flex-col border-2 border-accent-green/20">
              <div className="h-28 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-4xl">🎤</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Whisper Base</h3>
                <p className="text-sm text-slate-600">Modelo OpenAI multiidioma</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge">Español</span>
                  <span className="badge">Inglés</span>
                </div>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-green">Usar modelo</button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden h-[300px] flex flex-col border-2 border-accent-purple/20">
              <div className="h-28 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Wav2Vec2</h3>
                <p className="text-sm text-slate-600">Facebook AI Research</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge">Español</span>
                  <span className="badge">Fine-tuning</span>
                </div>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-purple">Usar modelo</button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden h-[300px] flex flex-col border-2 border-primary/20">
              <div className="h-28 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-4xl">⚡</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">DeepSpeech</h3>
                <p className="text-sm text-slate-600">Mozilla Open Source</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge">Rápido</span>
                  <span className="badge">Ligero</span>
                </div>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-primary">Usar modelo</button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden h-[300px] flex flex-col border-2 border-slate-200">
              <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-4xl">➕</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Crear Nuevo</h3>
                <p className="text-sm text-slate-600">Entrena tu propio modelo</p>
                <div className="mt-2 flex gap-2">
                  <span className="badge">Personalizado</span>
                </div>
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button className="btn-accent-purple btn-lg w-full">Crear modelo</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Mis Modelos Personalizados */}
      <section className="container-page mt-8 animate-slide-up">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-header">🔧 Mis Modelos Personalizados</h2>
            <button className="btn-accent-purple btn-lg">Nuevo modelo personalizado</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="card p-0 overflow-hidden h-[320px] flex flex-col">
              <div className="h-28 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-4xl">🎙️</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Reconocedor Médico</h3>
                <p className="text-sm text-slate-600">Especializado en terminología médica</p>
                <p className="text-xs text-slate-500 mt-1">Última ejecución: hace 2 días</p>
                
                {isTraining['medical'] && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entrenando...</span>
                      <span>{trainingProgress['medical'] || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-accent-purple h-2 rounded-full transition-all duration-300" 
                        style={{width: `${trainingProgress['medical'] || 0}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button 
                  className="btn-accent-purple"
                  onClick={() => startTraining('medical')}
                  disabled={isTraining['medical']}
                >
                  {isTraining['medical'] ? 'Entrenando...' : 'Entrenar'}
                </button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden h-[320px] flex flex-col">
              <div className="h-28 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-4xl">📞</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Asistente Telefónico</h3>
                <p className="text-sm text-slate-600">Optimizado para llamadas</p>
                <p className="text-xs text-slate-500 mt-1">Última ejecución: hace 5 días</p>
                
                {isTraining['phone'] && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entrenando...</span>
                      <span>{trainingProgress['phone'] || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-accent-green h-2 rounded-full transition-all duration-300" 
                        style={{width: `${trainingProgress['phone'] || 0}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button 
                  className="btn-accent-green"
                  onClick={() => startTraining('phone')}
                  disabled={isTraining['phone']}
                >
                  {isTraining['phone'] ? 'Entrenando...' : 'Entrenar'}
                </button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden h-[320px] flex flex-col">
              <div className="h-28 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-header">Transcriptor Musical</h3>
                <p className="text-sm text-slate-600">Para letras y notas musicales</p>
                <p className="text-xs text-slate-500 mt-1">Última ejecución: hace 1 semana</p>
                
                {isTraining['music'] && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Entrenando...</span>
                      <span>{trainingProgress['music'] || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{width: `${trainingProgress['music'] || 0}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-auto p-5 pt-0 flex gap-3">
                <button 
                  className="btn-primary"
                  onClick={() => startTraining('music')}
                  disabled={isTraining['music']}
                >
                  {isTraining['music'] ? 'Entrenando...' : 'Entrenar'}
                </button>
                <button className="btn-accent-cyan">Probar</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
