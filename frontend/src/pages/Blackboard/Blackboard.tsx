import Layout from '../../components/Blackboard/Layout'
import { motion } from 'framer-motion'
import ActivityCard from '../../components/Blackboard/ActivityCard'
import CourseCard from '../../components/Course/CourseCard'
import ModelDetailsModal from '../../components/Blackboard/ModelDetailsModal'
import HeroUnified from '../../components/Blackboard/HeroUnified'
import MissionsPanel from '../../components/Blackboard/MissionsPanel'
import { useUserStore } from '../../auth/userStore'
import { useTheme } from '../../App'
import { Link, useNavigate } from 'react-router-dom'

import { useMemo, useState} from 'react'
export default function Dashboard() {
  // Usar el contexto global de tema
  const { isDarkMode } = useTheme(); 
  const { user, toggleFavorite, recordCourseCompleted } = useUserStore()
  const userName = user.profile.name || 'Usuario'
  type ModelView = { id: string; title: string; description: string; emoji: string; imageUrl: string; favorite?: boolean; features: string[] }
  type Course = { id: string; title: string; progress: string; img: string; completed?: boolean }
  // TestedModel UI was removed; keeping only models and courses
  
  // Map user models to dashboard visuals
  const models: ModelView[] = useMemo(() => (
    user.models.map(m => ({
      id: m.id,
      title: m.name,
      description: m.description,
      emoji: m.icon || '🧠',
      imageUrl: m.image || '/src/assets/placeholder.svg',
      favorite: !!m.favorite,
      features: [m.type, m.status || 'pending']
    }))
  ), [user.models])
  
  const watchedCourses: Course[] = useMemo(() => user.watchedCourses, [user.watchedCourses])
  
  const [detailId, setDetailId] = useState<string | null>(null) 
  const currentModel = models.find(m => m.id === detailId) || null
  const navigate = useNavigate()

  // Favoritos se gestionan dentro de los componentes cuando sea necesario usando toggleFavorite

  const completeCourseByTitle = (title: string) => {
    const newCourse: Course = {
      id: `c_${Date.now()}`,
      title: title,
      progress: '100%',
      img: 'https://via.placeholder.com/300x200',
      completed: true
    }
    recordCourseCompleted(newCourse)
    window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Curso completado: ' + title }))
  }

  // Counter of trained models (UI metric) - count each model only once per user
  const TRAINED_IDS_KEY = 'trained_models_ids'
  const ensureCountForModel = (modelId: string) => {
    try {
      const raw = localStorage.getItem(TRAINED_IDS_KEY)
      const set: string[] = raw ? JSON.parse(raw) : []
      if (!set.includes(modelId)) {
        const next = [...set, modelId]
        localStorage.setItem(TRAINED_IDS_KEY, JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('trained:updated'))
      }
    } catch {}
  }
  // testModel removed with 'Modelo Entrenado' section
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }
  const card = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  }
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
      <div className="min-h-screen">
        <Layout>
          {/* Tema: se controla desde el Navbar (icono junto al botón de notificaciones) */}

          <HeroUnified 
            userName={userName} 
            models={models}
            watchedCourses={watchedCourses}
            isDarkMode={isDarkMode}
          />

          {/* Panel de Misiones (sincronizado con user store) */}
          <div className="container-page mt-8">
            <MissionsPanel models={models} isDarkMode={isDarkMode} />
          </div>

          <div className="container-page mt-8 animate-slide-up">
            <h2 className={`text-2xl font-bold animate-slide-in-left ${isDarkMode ? 'text-white' : 'text-header'}`}>Tus modelos creados</h2>
            <p className={`mt-1 animate-slide-in-left delay-100 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Explora tus modelos creados</p>
            {models.length === 0 ? (
              <div className={`mt-6 card text-center p-8 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-200'}`}>
                <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-header'}`}>No esperes más, ten la experiencia de probar los modelos que te ofrecemos</p>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Crea o prueba modelos y observa cómo se actualiza tu panel en tiempo real.</p>
            <Link to="/models" className="inline-block px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium shadow-soft hover:bg-emerald-700 transition-transform hover:-translate-y-0.5">
              Quiero crear un modelo!! 🤯
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {models.map(m => (
              <ActivityCard
                key={m.id}
                title={m.title}
                description={m.description}
                emoji={m.emoji}
                imageUrl={m.imageUrl}
                favorite={m.favorite}
                onToggleFavorite={() => toggleFavorite(m.id)}
                onTrain={() => {
                  ensureCountForModel(m.id)
                  const base = (m.features?.[0] || m.title || '').toLowerCase()
                  let path = '/arithmetic/practice/operaciones'
                  if (base.includes('vocal')) path = '/arithmetic/practice/vocales'
                  else if (base.includes('letra') || base.includes('abecedario')) path = '/arithmetic/practice/abecedario'
                  else if (base.includes('númer') || base.includes('numero') || base.includes('numeros')) path = '/arithmetic/practice/numeros'
                  else if (base.includes('aritm') || base.includes('operacion') || base.includes('operación') || base.includes('operaciones') || base.includes('matem')) path = '/arithmetic/practice/operaciones'
                  else if (base.includes('palabra')) path = '/arithmetic/practice/palabras'
                  navigate(path)
                }}
                onViewDetails={() => setDetailId(m.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

          {/* Sección de Modelo Entrenado eliminada por requerimiento */}
          {/* Sección de Cursos de IA y Reconocimiento */}
          <section className="container-page mt-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <div>
                <h2 className={`text-2xl font-bold animate-slide-in-left ${isDarkMode ? 'text-white' : 'text-header'}`}>Cursos de IA y Reconocimiento</h2>
                <p className={`mt-1 animate-slide-in-left delay-100 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>Explora nuestros cursos especializados en inteligencia artificial</p>
              </div>
            </div>
          
          {/* Grid estático de cursos con animaciones */}
          <div id="cursos" className="courses-grid">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={card}>
                <CourseCard
                  title="Reconocimiento de Manos con MediaPipe"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://i.blogs.es/2b36a7/algoritmo/1366_2000.png"
                  cornerCode="MP"
                  to="/courses/hand-recognition"
                  accent="emerald"
                  onComplete={() => completeCourseByTitle("Reconocimiento de Manos con MediaPipe")}
                  completed={watchedCourses.some(c => c.title.includes("MediaPipe") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              {/* Reconocimiento Facial Avanzado */}
              <motion.div variants={card}>
                <CourseCard
                  title="Reconocimiento Facial Avanzado"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://png.pngtree.com/background/20231016/original/pngtree-revolutionary-technology-advanced-facial-recognition-system-with-cutting-edge-3d-scanning-picture-image_5574665.jpg"
                  cornerCode="RF"
                  to="/courses/face-recognition"
                  accent="blue"
                  onComplete={() => completeCourseByTitle("Reconocimiento Facial Avanzado")}
                  completed={watchedCourses.some(c => c.title.includes("Facial") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              {/* Reconocimiento de Voz con IA */}
              <motion.div variants={card}>
                <CourseCard
                  title="Reconocimiento de Voz con IA"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://imgs.elpais.com.uy/dims4/default/e4f9060/2147483647/strip/true/crop/1047x720+116+0/resize/1440x990!/format/webp/quality/90/?url=https%3A%2F%2Fel-pais-uruguay-production-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Ff1%2F2e%2F68a008b24916909823145bf82743%2Fimagen-voz-microsoft-portada.jpg"
                  cornerCode="RV"
                  to="/courses/voice-recognition"
                  accent="purple"
                  onComplete={() => completeCourseByTitle("Reconocimiento de Voz con IA")}
                  completed={watchedCourses.some(c => c.title.includes("Voz") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              {/* Operaciones Matemáticas con Reconocimiento de Manos */}
              <motion.div variants={card}>
                <CourseCard
                  title="Operaciones Matemáticas con Reconocimiento de Manos"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://i.ytimg.com/vi/-TedLoX7t3s/maxresdefault.jpg"
                  cornerCode="OM"
                  to="/courses/hand-math-ops"
                  accent="orange"
                  onComplete={() => completeCourseByTitle("Operaciones Matemáticas con Reconocimiento de Manos")}
                  completed={watchedCourses.some(c => c.title.includes("Matemáticas") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

               {/* Desarrollo de Agente IA */}
              <motion.div variants={card}>
                <CourseCard
                  title="Desarrollo de Agente IA Avanzado"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://nocodestartup.io/wp-content/uploads/2025/02/o-que-e-um-agente-de-ia-e-como-ele-funciona-1024x701.jpg"
                  cornerCode="AI"
                  to="/courses/ai-agent"
                  accent="indigo"
                  onComplete={() => completeCourseByTitle("Desarrollo de Agente IA Avanzado")}
                  completed={watchedCourses.some(c => c.title.includes("Agente") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

               {/* Chatbot Automatizado */}
              <motion.div variants={card}>
                <CourseCard
                  title="Chatbot Automatizado con IA"
                  subtitle="Por AresDigitalAcademy • Actualizado 2025"
                  imageUrl="https://website-assets-fd.freshworks.com/attachments/cjr7cheqv01aq92g00a0z7onq-ai-chatbot-04-2x.one-half.png"
                  cornerCode="CB"
                  to="/courses/chatbot-automation"
                  accent="teal"
                  onComplete={() => completeCourseByTitle("Chatbot Automatizado con IA")}
                  completed={watchedCourses.some(c => c.title.includes("Chatbot") && c.completed)}
                  isDarkMode={isDarkMode}
                />
              </motion.div>

              {/* Detección de Emociones en Voz – PRÓXIMAMENTE */}
              <motion.div variants={card} className={`course-card udemy rounded-lg overflow-hidden group cursor-not-allowed opacity-95 h-full ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="relative h-40 bg-gradient-to-br from-fuchsia-500 to-rose-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">PRÓXIMAMENTE</div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-6xl"><img src="https://files.maldita.es/maldita/uploads/2024/04/6613b6af5d9f8main-17-png.png" alt="Deteccion-emociones" /></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-fuchsia-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">EV</div>
                   </div>
                </div>
                <div className="course-body">
                  <div className="course-title">Detección de Emociones en Voz</div>
                  <div className="course-subtitle">Por AresDigitalAcademy • En desarrollo</div>
                  <div className="course-meta">
                    <span className="badge-udemy">PRÓXIMAMENTE</span>
                    <span className="badge-udemy neutral">Audio • NLP</span>
                  </div>
                  <div className="course-footer">
                    <div className="price">—</div>
                    <button className="btn w-full opacity-60 cursor-not-allowed" disabled>Próximamente</button>
                  </div>
                </div>
              </motion.div>

              {/* Traducción Automática en Tiempo Real – PRÓXIMAMENTE */}
              <motion.div variants={card} className={`course-card udemy rounded-lg overflow-hidden group cursor-not-allowed opacity-95 h-full ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
                <div className="relative h-40 bg-gradient-to-br from-cyan-500 to-blue-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">PRÓXIMAMENTE</div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-6xl"><img src="https://nuriamasdeu.com/wp-content/uploads/2023/04/1-800x450.jpg" alt="Traduccion-automática" /></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-cyan-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">TR</div>
                   </div>
                </div>
                <div className={`course-body ${isDarkMode ? 'bg-gray-900 text-gray-100' : ''}`}>
                  <div className={`course-title ${isDarkMode ? 'text-gray-100' : ''}`}>Traducción Automática en Tiempo Real</div>
                  <div className={`course-subtitle ${isDarkMode ? 'text-gray-400' : ''}`}>Por AresDigitalAcademy • En desarrollo</div>
                  <div className="course-meta">
                    <span className="badge-udemy">PRÓXIMAMENTE</span>
                    <span className="badge-udemy neutral">Streaming • Speech</span>
                  </div>
                  <div className="course-footer">
                    <div className="price">—</div>
                    <button className="btn w-full opacity-60 cursor-not-allowed" disabled>Próximamente</button>
                  </div>
                </div>
              </motion.div>
             </motion.div>
           </div>
      </section>      
      {currentModel && (
        <ModelDetailsModal
          title={currentModel.title}
          description={currentModel.description}
          imageUrl={currentModel.imageUrl}
          features={[
            // elimina 'pending' y normaliza
            ...currentModel.features.filter(f => (f || '').toLowerCase() !== 'pending'),
            `Creado: ${new Date().toLocaleDateString()}`,
            'Origen: AresDigitalAcademy'
          ]}
          onClose={() => setDetailId(null)}
          isDarkMode={isDarkMode}
        />
      )}
        </Layout>
      </div>
    </div>
  )
}
