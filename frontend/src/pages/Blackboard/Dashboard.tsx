import Layout from '../../components/Blackboard/Layout'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Welcome from '../../components/Blackboard/Welcome'
import ActivitiesGrid from '../../components/Blackboard/ActivitiesGrid'
import UserProgress from '../../components/Blackboard/UserProgress'
import Recommendations from '../../components/Blackboard/Recommendations'
import ProfileQuick from '../../components/Blackboard/ProfileQuick'
import Tips from '../../components/Blackboard/Tips'
import TrainedModels from '../../components/Blackboard/TrainedModels'

export default function Dashboard() {
  const userName = 'Usuario'
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
      
      <Welcome userName={userName} progress={64} />

      {/* Modelos para entrenar (movido arriba) */}
      <TrainedModels />

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
              {/* Reconocimiento de Manos con MediaPipe */}
              <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-teal-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    Más de 3 millones de estudiantes
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-6xl"><img src="https://i.blogs.es/2b36a7/algoritmo/1366_2000.png" alt="manos" /></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">MP</div>
                   </div>
                 </div>
                <div className="course-body">
                  <div className="course-title group-hover:text-emerald-600 transition-colors duration-300">Reconocimiento de Manos con MediaPipe</div>
                  <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                  <div className="rating-row">
                    <span className="score">4.9</span>
                    <div className="flex ml-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="count">(1,247)</span>
                  </div>
                  <div className="course-meta">
                    <span className="badge-udemy">Lo más visto</span>
                    <span className="badge-udemy neutral">34 clases</span>
                    <span className="badge-udemy neutral">Principiante</span>
                  </div><br />
                  <div className="course-footer">
                    <div className="price">S/ 64.90</div>
                    <Link to="/courses/hand-recognition" className="cta">Ver curso</Link>
                  </div>
                </div>
              </motion.div>

              {/* Reconocimiento Facial Avanzado */}
              <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-700 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    Más de 2.5 millones de estudiantes
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-6xl"><img src="https://png.pngtree.com/background/20231016/original/pngtree-revolutionary-technology-advanced-facial-recognition-system-with-cutting-edge-3d-scanning-picture-image_5574665.jpg" alt="Reconocimiento-facial" /></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">RF</div>
                   </div>
                 </div>
                 <div className="course-body">
                   <div className="course-title group-hover:text-blue-600 transition-colors duration-300">Reconocimiento Facial Avanzado</div>
                   <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                   <div className="rating-row">
                     <span className="score">4.8</span>
                     <div className="flex ml-1">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                           <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                         </svg>
                       ))}
                     </div>
                     <span className="count">(2,156)</span>
                   </div>
                   <div className="course-meta">
                     <span className="badge-udemy">Lo más visto</span>
                     <span className="badge-udemy neutral">27 clases</span>
                     <span className="badge-udemy neutral">Intermedio</span>
                   </div>
                   <div className="course-footer">
                    <div className="price">S/ 46.90</div>
                    <Link to="/courses/face-recognition" className="cta">Ver curso</Link>
                  </div>
                 </div>
               </motion.div>

              {/* Reconocimiento de Voz con IA */}
              <div className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                <div className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    Más de 1.8 millones de estudiantes
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-6xl"><img src="https://imgs.elpais.com.uy/dims4/default/e4f9060/2147483647/strip/true/crop/1047x720+116+0/resize/1440x990!/format/webp/quality/90/?url=https%3A%2F%2Fel-pais-uruguay-production-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Ff1%2F2e%2F68a008b24916909823145bf82743%2Fimagen-voz-microsoft-portada.jpg" alt="Reconocimiento-voz" /></div>

                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">RV</div>
                   </div>
                 </div>
                 <div className="course-body">
                   <div className="course-title group-hover:text-purple-600 transition-colors duration-300">Reconocimiento de Voz con IA</div>
                   <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                   <div className="rating-row">
                     <span className="score">4.7</span>
                     <div className="flex ml-1">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                           <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                         </svg>
                       ))}
                     </div>
                     <span className="count">(1,834)</span>
                   </div>
                   <div className="course-meta">
                     <span className="badge-udemy neutral">20 clases</span>
                     <span className="badge-udemy neutral">Todos los niveles</span>
                   </div>
                   <div className="course-footer">
                    <div className="price">S/ 38.90</div>
                    <Link to="/courses/voice-recognition" className="cta">Ver curso</Link>
                  </div>
                 </div>
               </div>

              {/* Operaciones Matemáticas con Reconocimiento de Manos */}
              <div className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                <div className="relative h-40 bg-gradient-to-br from-orange-500 to-red-600 overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    Más de 950,000 estudiantes
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="text-6xl"><img src="https://i.ytimg.com/vi/-TedLoX7t3s/maxresdefault.jpg" alt="Operaciones-matematicas-manos" /></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                     <div className="w-12 h-12 rounded-full border-2 border-white bg-orange-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">OM</div>
                   </div>
                 </div>
                 <div className="course-body">
                   <div className="course-title group-hover:text-orange-600 transition-colors duration-300">Operaciones Matemáticas con Reconocimiento de Manos</div>
                   <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                   <div className="rating-row">
                     <span className="score">4.6</span>
                     <div className="flex ml-1">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                           <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                         </svg>
                       ))}
                     </div>
                     <span className="count">(892)</span>
                   </div>
                   <div className="course-meta">
                     <span className="badge-udemy neutral">18 clases</span>
                     <span className="badge-udemy neutral">Principiante</span>
                   </div>
                    <div className="course-footer">
                      <div className="price">S/ 29.90</div>
                      <Link to="/courses/hand-math-ops" className="cta">Ver curso</Link>
                    </div>
                 </div>
               </div>

               {/* Desarrollo de Agente IA */}
               <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                  <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-purple-700 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                   <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                     Más de 1.2 millones de estudiantes
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <div className="text-6xl"><img src="https://nocodestartup.io/wp-content/uploads/2025/02/o-que-e-um-agente-de-ia-e-como-ele-funciona-1024x701.jpg" alt="Agente-IA" /></div>
                   </div>
                   <div className="absolute bottom-3 right-3">
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">AI</div>
                    </div>
                  </div>
                  <div className="course-body">
                    <div className="course-title group-hover:text-indigo-600 transition-colors duration-300">Desarrollo de Agente IA Avanzado</div>
                    <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                    <div className="rating-row">
                      <span className="score">4.8</span>
                      <div className="flex ml-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="count">(1,456)</span>
                    </div>
                    <div className="course-meta">
                      <span className="badge-udemy">Lo más visto</span>
                      <span className="badge-udemy neutral">32 clases</span>
                      <span className="badge-udemy neutral">Intermedio</span>
                    </div>
                    <div className="course-footer">
                      <div className="price">S/ 59.90</div>
                      <Link to="/courses/ai-agent" className="cta">Ver curso</Link>
                    </div>
                  </div>
                </motion.div>

               {/* Chatbot Automatizado */}
               <motion.div variants={card} className="course-card udemy bg-white rounded-lg overflow-hidden group cursor-pointer h-full">
                  <div className="relative h-40 bg-gradient-to-br from-teal-500 to-cyan-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300"></div>
                   <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                     Más de 800,000 estudiantes
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <div className="text-6xl"><img src="https://website-assets-fd.freshworks.com/attachments/cjr7cheqv01aq92g00a0z7onq-ai-chatbot-04-2x.one-half.png" alt="Chatbot-Automatizado" /></div>
                   </div>
                   <div className="absolute bottom-3 right-3">
                      <div className="w-12 h-12 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">CB</div>
                    </div>
                  </div>
                  <div className="course-body">
                    <div className="course-title group-hover:text-teal-600 transition-colors duration-300">Chatbot Automatizado con IA</div>
                    <div className="course-subtitle">Por Equipo Blackboard • Actualizado 2025</div>
                    <div className="rating-row">
                      <span className="score">4.7</span>
                      <div className="flex ml-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="count">(1,123)</span>
                    </div>
                    <div className="course-meta">
                      <span className="badge-udemy neutral">24 clases</span>
                      <span className="badge-udemy neutral">Todos los niveles</span>
                    </div>
                    <div className="course-footer">
                      <div className="price">S/ 39.90</div>
                      <Link to="/courses/chatbot-automation" className="cta">Ver curso</Link>
                    </div>
                  </div>
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
                    <button className="cta disabled" disabled>Próximamente</button>
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
                    <button className="cta disabled" disabled>Próximamente</button>
                  </div>
                </div>
              </motion.div>
             </motion.div>
           </div>
      </section>

      <ActivitiesGrid />
      <TrainedModels />
      <UserProgress trained={8} completed={15} progressPercent={64} level="Nivel 1 – Explorador de IA" />
      <Tips />
      <div className="bg-alt/60 py-2">
        <Recommendations />
      </div>
      <ProfileQuick />
    </Layout>
  )
}
