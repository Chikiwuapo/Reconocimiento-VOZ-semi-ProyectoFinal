import Layout from '../../components/Blackboard/Layout'
import { motion } from 'framer-motion'

import ActivityCard from '../../components/Blackboard/ActivityCard'
import CourseCard from '../../components/Course/CourseCard'
import ModelDetailsModal from '../../components/Blackboard/ModelDetailsModal'
import HeroUnified from '../../components/Blackboard/HeroUnified'
import MissionsPanel from '../../components/Blackboard/MissionsPanel'
import { useUserStore } from '../../auth/userStore'
import { Link } from 'react-router-dom'

import { useMemo, useState } from 'react'
export default function Dashboard() { 
  const { user, toggleFavorite, recordCourseCompleted, recordModelTested } = useUserStore()
  const userName = user.profile.name || 'Usuario'
  type ModelView = { id: string; title: string; description: string; emoji: string; imageUrl: string; favorite?: boolean; features: string[] }
  type Course = { id: string; title: string; progress: string; img: string; completed?: boolean }
  type TestedModel = { id: string; title: string; result: string; color: string; tested?: boolean }
  
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
  const testedModels: TestedModel[] = useMemo(() => user.testedModels, [user.testedModels])
  
  const [detailId, setDetailId] = useState<string | null>(null)
  const currentModel = models.find(m => m.id === detailId) || null

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

  const testModel = (modelId: string) => {
    const model = models.find(m => m.id === modelId)
    if (model) {
      const newTestedModel: TestedModel = {
        id: `test_${modelId}`,
        title: model.title,
        result: 'Acc 85%',
        color: '#10B981',
        tested: true
      }
      recordModelTested(newTestedModel)
      window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Modelo probado: ' + model.title }))
    }
  }
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
    
    <Layout>
      <HeroUnified 
        userName={userName} 
        models={models}
        watchedCourses={watchedCourses}
        testedModels={testedModels}
      />

      {/* Panel de Misiones (sincronizado con user store) */}
      <div className="container-page mt-8">
        <MissionsPanel models={models} />
      </div>

      <div className="container-page mt-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-header animate-slide-in-left">Tus modelos creados</h2>
        <p className="text-slate-600 mt-1 animate-slide-in-left delay-100">Explora tus modelos creados</p>
        {models.length === 0 ? (
          <div className="mt-6 card text-center p-8">
            <p className="text-lg font-semibold text-header mb-2">No esperes más, ten la experiencia de probar los modelos que te ofrecemos</p>
            <p className="text-slate-600 mb-4">Crea o prueba modelos y observa cómo se actualiza tu panel en tiempo real.</p>
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
                onTrain={() => window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Entrenamiento iniciado: ' + m.title }))}
                onViewDetails={() => setDetailId(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sección de Modelo Entrenado */}
      <div className="container-page mt-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-header animate-slide-in-left">Modelo Entrenado</h2>
        <p className="text-slate-600 mt-1 animate-slide-in-left delay-100">Listo para probar tu creación</p>
        {models.length === 0 ? (
          <div className="mt-6 card text-center p-8">
            <p className="text-lg font-semibold text-header mb-2">Aquí podras experimentar con tus modelos entrenados</p>
            <p className="text-slate-600 mb-4">Cuando entrenes alguno, aparecerá aquí para que lo pruebes.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {models.map(m => (
              <div key={`test-${m.id}`} className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <span className="text-4xl">{m.emoji}</span>
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Entrenado
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{m.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{m.description}</p>
                  <button 
                    onClick={() => testModel(m.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🧪</span>
                    Probar Modelo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>      
      {/* Sección de Cursos de IA y Reconocimiento */}
        <section className="container-page mt-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-header animate-slide-in-left">Cursos de IA y Reconocimiento</h2>
              <p className="text-slate-600 mt-1 animate-slide-in-left delay-100">Explora nuestros cursos especializados en inteligencia artificial</p>
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
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://i.blogs.es/2b36a7/algoritmo/1366_2000.png"
                  cornerCode="MP"
                  to="/courses/hand-recognition"
                  accent="emerald"
                  onComplete={() => completeCourseByTitle("Reconocimiento de Manos con MediaPipe")}
                  completed={watchedCourses.some(c => c.title.includes("MediaPipe") && c.completed)}
                />
              </motion.div>

              {/* Reconocimiento Facial Avanzado */}
              <motion.div variants={card}>
                <CourseCard
                  title="Reconocimiento Facial Avanzado"
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://png.pngtree.com/background/20231016/original/pngtree-revolutionary-technology-advanced-facial-recognition-system-with-cutting-edge-3d-scanning-picture-image_5574665.jpg"
                  cornerCode="RF"
                  to="/courses/face-recognition"
                  accent="blue"
                  onComplete={() => completeCourseByTitle("Reconocimiento Facial Avanzado")}
                  completed={watchedCourses.some(c => c.title.includes("Facial") && c.completed)}
                />
              </motion.div>

              {/* Reconocimiento de Voz con IA */}
              <motion.div variants={card}>
                <CourseCard
                  title="Reconocimiento de Voz con IA"
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://imgs.elpais.com.uy/dims4/default/e4f9060/2147483647/strip/true/crop/1047x720+116+0/resize/1440x990!/format/webp/quality/90/?url=https%3A%2F%2Fel-pais-uruguay-production-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Ff1%2F2e%2F68a008b24916909823145bf82743%2Fimagen-voz-microsoft-portada.jpg"
                  cornerCode="RV"
                  to="/courses/voice-recognition"
                  accent="purple"
                  onComplete={() => completeCourseByTitle("Reconocimiento de Voz con IA")}
                  completed={watchedCourses.some(c => c.title.includes("Voz") && c.completed)}
                />
              </motion.div>

              {/* Operaciones Matemáticas con Reconocimiento de Manos */}
              <motion.div variants={card}>
                <CourseCard
                  title="Operaciones Matemáticas con Reconocimiento de Manos"
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://i.ytimg.com/vi/-TedLoX7t3s/maxresdefault.jpg"
                  cornerCode="OM"
                  to="/courses/hand-math-ops"
                  accent="orange"
                  onComplete={() => completeCourseByTitle("Operaciones Matemáticas con Reconocimiento de Manos")}
                  completed={watchedCourses.some(c => c.title.includes("Matemáticas") && c.completed)}
                />
              </motion.div>

               {/* Desarrollo de Agente IA */}
              <motion.div variants={card}>
                <CourseCard
                  title="Desarrollo de Agente IA Avanzado"
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://nocodestartup.io/wp-content/uploads/2025/02/o-que-e-um-agente-de-ia-e-como-ele-funciona-1024x701.jpg"
                  cornerCode="AI"
                  to="/courses/ai-agent"
                  accent="indigo"
                  onComplete={() => completeCourseByTitle("Desarrollo de Agente IA Avanzado")}
                  completed={watchedCourses.some(c => c.title.includes("Agente") && c.completed)}
                />
              </motion.div>

               {/* Chatbot Automatizado */}
              <motion.div variants={card}>
                <CourseCard
                  title="Chatbot Automatizado con IA"
                  subtitle="Por Equipo Blackboard • Actualizado 2025"
                  imageUrl="https://website-assets-fd.freshworks.com/attachments/cjr7cheqv01aq92g00a0z7onq-ai-chatbot-04-2x.one-half.png"
                  cornerCode="CB"
                  to="/courses/chatbot-automation"
                  accent="teal"
                  onComplete={() => completeCourseByTitle("Chatbot Automatizado con IA")}
                  completed={watchedCourses.some(c => c.title.includes("Chatbot") && c.completed)}
                />
              </motion.div>

              {/* Detección de Emociones en Voz – PRÓXIMAMENTE */}
              <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-not-allowed opacity-95 h-full">
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
                  <div className="course-subtitle">Por Equipo Blackboard • En desarrollo</div>
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
              <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-not-allowed opacity-95 h-full">
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
                <div className="course-body">
                  <div className="course-title">Traducción Automática en Tiempo Real</div>
                  <div className="course-subtitle">Por Equipo Blackboard • En desarrollo</div>
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
          features={currentModel.features}
          onClose={() => setDetailId(null)}
        />
      )}
    </Layout>
  )
}
