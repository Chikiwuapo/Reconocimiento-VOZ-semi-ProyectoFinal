import { Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import Dashboard from './pages/Blackboard/Dashboard'
import Models from './pages/Blackboard/Models'
import Arithmetic from './pages/Blackboard/Arithmetic/Arithmetic'
import CoursePage from './pages/Courses/CoursePage'
import AuthFlowPage from './auth/AuthFlowPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/auth" element={<AuthFlowPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/models" element={<Models />} />
      <Route path="/arithmetic" element={<Arithmetic />} />
      <Route path="/courses/:slug" element={<CoursePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App