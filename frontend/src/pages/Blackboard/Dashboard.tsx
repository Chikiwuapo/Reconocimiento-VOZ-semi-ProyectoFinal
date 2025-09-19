import Layout from '../../components/Blackboard/Layout'
import { motion } from 'framer-motion'
import Welcome from '../../components/Blackboard/Welcome'
import ActivityCard from '../../components/Blackboard/ActivityCard'
import CourseCard from '../../components/Course/CourseCard'
import ModelDetailsModal from '../../components/Blackboard/ModelDetailsModal'
import { useState } from 'react'

export default function Dashboard() { 
  const userName = 'Usuario'
  type Model = { id: string; title: string; description: string; emoji: string; imageUrl: string; favorite?: boolean; features: string[] }
  const [models, setModels] = useState<Model[]>([
    { id: 'm1', title: 'Modelo de entrenamiento para Vocales', description: 'Crea un modelo para reconocer vocales habladas.', emoji: '🗣️', imageUrl: '/src/assets/placeholder.svg', favorite: true, features: ['Dataset: 1200 audios', 'Precisión esperada: 90%', 'Arquitectura: CNN 1D'] },
    { id: 'm2', title: 'Modelo de entrenamiento para Abecedario', description: 'Entrena un modelo para letras del abecedario.', emoji: '🔤', imageUrl: '/src/assets/placeholder.svg', features: ['Clases: 27 (A-Z + Ñ)', 'MFCC + Augment', 'Batch size: 32'] },
    { id: 'm3', title: 'Modelo de entrenamiento para Palabras', description: 'Reconoce palabras clave frecuentes.', emoji: '📝', imageUrl: '/src/assets/placeholder.svg', features: ['Wake words', 'Latencia baja', 'Streaming-ready'] },
    { id: 'm4', title: 'Modelo de entrenamiento para Operaciones aritméticas básicas', description: 'Suma, resta, multiplicación y división.', emoji: '➕', imageUrl: '/src/assets/placeholder.svg', features: ['4 clases básicas', 'Post-procesado con reglas', 'Visor de resultados'] },
  ])
  const [detailId, setDetailId] = useState<string | null>(null)
  const currentModel = models.find(m => m.id === detailId) || null

  const toggleFavorite = (id: string) => {
    setModels(prev => {
      const next = prev.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m)
      next.sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite))
      return next
    })
    const m = models.find(m => m.id === id)
    if (m) window.dispatchEvent(new CustomEvent('app:notify', { detail: (!m.favorite ? 'Añadido a favoritos: ' : 'Quitado de favoritos: ') + m.title }))
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
    <Layout notifications={3}>
      
      <Welcome userName={userName} progress={64} models={models} />
      <div className="container-page mt-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-header animate-slide-in-left">Tus modelos creados</h2>
        <p className="text-slate-600 mt-1 animate-slide-in-left delay-100">Explora tus modelos creados</p>
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
