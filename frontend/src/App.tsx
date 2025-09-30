import { Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import Blackboard from './pages/Blackboard/Blackboard'
import Models from './pages/Blackboard/Models'
import CaptureSamples from './pages/Blackboard/Arithmetic/CaptureSamples'
import TrainModel from './pages/Blackboard/Arithmetic/TrainModel'
import PracticeOperations from './pages/Blackboard/Arithmetic/practice/PracticeOperations'
import PracticeVocales from './pages/Blackboard/Vocales/practice/PracticeVocales'
import PracticeAbecedario from './pages/Blackboard/Abecedario/practice/PracticeAbecedario'
import PracticeNumeros from './pages/Blackboard/Arithmetic/practice/PracticeNumeros'
import PracticePalabras from './pages/Blackboard/Palabras/practice/PracticePalabras'
import CaptureSamplesVocales from './pages/Blackboard/Vocales/CaptureSamples'
import TrainModelVocales from './pages/Blackboard/Vocales/TrainModel'
import CaptureSamplesAbecedario from './pages/Blackboard/Abecedario/CaptureSamples'
import TrainModelAbecedario from './pages/Blackboard/Abecedario/TrainModel'
import CaptureSamplesPalabras from './pages/Blackboard/Palabras/CaptureSamples'
import TrainModelPalabras from './pages/Blackboard/Palabras/TrainModel'
import AuthFlowPage from './auth/AuthFlowPage'
import Landing from './pages/landing/Landing'
import Dashboard_admin from './pages/Dashboard-admin/UI/Dashboard_admin'

// Contexto global para tema oscuro profundo
interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false, // Por defecto tema claro
  toggleDarkMode: () => {}
})

export const useTheme = () => useContext(ThemeContext)

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false) // Siempre tema claro por defecto

  useEffect(() => {
    // Aplicar clases globales al body para tema oscuro profundo
    if (isDarkMode) {
      document.body.className = 'bg-[#0A0A0A] text-gray-100 min-h-screen'
      document.documentElement.style.backgroundColor = '#0A0A0A'
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.body.className = 'bg-gray-50 text-gray-900 min-h-screen'
      document.documentElement.style.backgroundColor = '#f9fafb'
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0A] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthFlowPage />} />
          {/* Ruta para usuarios @senati.pe - Dashboard Admin */}
          <Route path="/estadistica" element={<Dashboard_admin />} />
          {/* Ruta para usuarios @gmail.com y otros - Blackboard */}
          <Route path="/blackboard" element={<Blackboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/arithmetic/capture" element={<CaptureSamples />} />
          <Route path="/arithmetic/train" element={<TrainModel />} />
          <Route path="/arithmetic/practice/operaciones" element={<PracticeOperations />} />
          <Route path="/arithmetic/practice/vocales" element={<PracticeVocales />} />
          <Route path="/arithmetic/practice/abecedario" element={<PracticeAbecedario />} />
          <Route path="/arithmetic/practice/numeros" element={<PracticeNumeros />} />
          <Route path="/arithmetic/practice/palabras" element={<PracticePalabras />} />
          {/* Rutas dedicadas por categoría */}
          <Route path="/vocales/capture" element={<CaptureSamplesVocales />} />
          <Route path="/vocales/train" element={<TrainModelVocales />} />
          <Route path="/abecedario/capture" element={<CaptureSamplesAbecedario />} />
          <Route path="/abecedario/train" element={<TrainModelAbecedario />} />
          <Route path="/palabras/capture" element={<CaptureSamplesPalabras />} />
          <Route path="/palabras/train" element={<TrainModelPalabras />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  )
}

export default App
