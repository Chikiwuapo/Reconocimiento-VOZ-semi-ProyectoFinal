import { Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import Blackboard from './pages/Blackboard/Blackboard'
import Models from './pages/Blackboard/Models'
import Arithmetic from './pages/Blackboard/Arithmetic/Arithmetic'
import CaptureSamples from './pages/Blackboard/Arithmetic/CaptureSamples'
import TrainModel from './pages/Blackboard/Arithmetic/TrainModel'
import PracticeModel from './pages/Blackboard/Arithmetic/PracticeModel'
import CoursePage from './pages/Courses/CoursePage'
import AuthFlowPage from './auth/AuthFlowPage'
import Landing from './pages/landing/Landing'

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
          <Route path="/blackboard" element={<Blackboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/arithmetic" element={<Arithmetic />} />
          <Route path="/arithmetic/capture" element={<CaptureSamples />} />
          <Route path="/arithmetic/train" element={<TrainModel />} />
          <Route path="/arithmetic/practice" element={<PracticeModel />} />
          <Route path="/courses/:slug" element={<CoursePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  )
}

export default App