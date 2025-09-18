import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Blackboard/Dashboard'
import Models from './pages/Blackboard/Models'
import FavoritesPage from './pages/Blackboard/FavoritesPage'
import Profile from './pages/Blackboard/Profile'
import Landing from './pages/landing/Landing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/models" element={<Models />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
