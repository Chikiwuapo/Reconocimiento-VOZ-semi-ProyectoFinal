import { Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import Dashboard from './pages/Blackboard/Dashboard'
import Models from './pages/Blackboard/Models'
import Training from './pages/Blackboard/Training'

import CoursePage from './pages/Courses/CoursePage'
import Login from './auth/Login'
import Register from './auth/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/models" element={<Models />} />
      <Route path="/training" element={<Training />} />
      <Route path="/courses/:slug" element={<CoursePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
