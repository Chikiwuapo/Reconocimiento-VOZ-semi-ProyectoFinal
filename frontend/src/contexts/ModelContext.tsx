import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export interface SelectedModel {
  id: string
  name: string
  type: string
  basePath: string
}

interface ModelContextType {
  selectedModel: SelectedModel | null
  setSelectedModel: (model: SelectedModel | null) => void
  isModelSelected: boolean
  clearSelectedModel: () => void
}

const ModelContext = createContext<ModelContextType | undefined>(undefined)

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(null)
  const location = useLocation()

  // Función para limpiar el modelo seleccionado
  const clearSelectedModel = () => {
    setSelectedModel(null)
  }

  // Detectar automáticamente el modelo basado en la ruta actual
  useEffect(() => {
    const path = location.pathname
    
    // Si estamos en una ruta de modelo específico, establecer el modelo seleccionado
    if (path.startsWith('/vocales/')) {
      setSelectedModel({
        id: 'vocales',
        name: 'Vocales',
        type: 'vocales',
        basePath: '/vocales'
      })
    } else if (path.startsWith('/abecedario/')) {
      setSelectedModel({
        id: 'abecedario',
        name: 'Abecedario',
        type: 'abecedario',
        basePath: '/abecedario'
      })
    } else if (path.startsWith('/palabras/')) {
      setSelectedModel({
        id: 'palabras',
        name: 'Palabras',
        type: 'palabras',
        basePath: '/palabras'
      })
    } else if (path.startsWith('/arithmetic/')) {
      setSelectedModel({
        id: 'arithmetic',
        name: 'Aritmética',
        type: 'arithmetic',
        basePath: '/arithmetic'
      })
    } else if (path === '/blackboard' || path === '/blackboard/models' || path === '/') {
      // Si estamos en la página principal, de modelos o inicio, limpiar la selección
      setSelectedModel(null)
    }
  }, [location.pathname])

  const isModelSelected = selectedModel !== null

  return (
    <ModelContext.Provider value={{
      selectedModel,
      setSelectedModel,
      isModelSelected,
      clearSelectedModel
    }}>
      {children}
    </ModelContext.Provider>
  )
}

export function useModelContext() {
  const context = useContext(ModelContext)
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider')
  }
  return context
}