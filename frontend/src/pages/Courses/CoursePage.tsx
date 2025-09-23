import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../../components/Blackboard/Layout'
import InstructorCard from '../../components/Course/InstructorCard.tsx'
import LessonContent from '../../components/Course/LessonContent.tsx'
import Comments from '../../components/Course/Comments.tsx'
import VideoPlayer from '../../components/Course/VideoPlayer.tsx'
import { useTheme } from '../../App'

export type LessonType = 'video' | 'resource' | 'quiz'

export type Lesson = {
  id: string
  title: string
  type: LessonType
  duration?: string
  description: string
  timestamps?: { time: string; label: string }[]
  attachments?: { name: string; url: string }[]
  status: 'pending' | 'completed'
  videoUrl?: string
  videoId?: string
}

// Accordion removed; sidebar now shows fixed chapters list

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const { isDarkMode } = useTheme()
  const courseTitle = useMemo(() => {
    const map: Record<string, string> = {
      'face-recognition': 'Reconocimiento Facial con IA',
      'hand-recognition': 'Reconocimiento de Manos con MediaPipe',
      'voice-recognition': 'Reconocimiento de Voz con IA',
      'hand-math-ops': 'Operaciones Matemáticas con Manos',
      'ai-agent': 'Desarrollo de Agente IA Avanzado',
      'chatbot-automation': 'Chatbot Automatizado con IA',
    }
    return map[slug ?? 'face-recognition'] ?? 'Curso'
  }, [slug])
  // Contenido diferente por curso (slug)
  const catalog: Record<string, { lessons: Lesson[]; instructor: { name: string; avatarUrl: string; bio: string } }> = {
    'hand-recognition': {
      lessons: [
        { id: 'hr-main', title: 'Reconocimiento de Manos', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/ipHKQVtwRas' },
      ],
      instructor: { name: 'Ing. Carlos Díaz', avatarUrl: 'https://i.pravatar.cc/100?img=33', bio: 'ML Engineer enfocado en visión por computadora y XR.' }
    },
    'face-recognition': {
      lessons: [
        { id: 'fr-main', title: 'Reconocimiento Facial Avanzado', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/cTSVYwxHn9g' },
      ],
      instructor: { name: 'Ing. Laura Méndez', avatarUrl: 'https://i.pravatar.cc/100?img=68', bio: 'Ingeniera de Software con especialización en Visión Computacional e IA, con 8+ años de experiencia.' }
    },
    'voice-recognition': {
      lessons: [
        { id: 'vr-main', title: 'Reconocimiento de Voz con IA', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/vMLjbDRXtMM' },
      ],
      instructor: { name: 'Dra. Sofía Ramos', avatarUrl: 'https://i.pravatar.cc/100?img=12', bio: 'Doctora en Procesamiento de Señales, foco en audio e IA.' }
    },
    'hand-math-ops': {
      lessons: [
        { id: 'hm-main', title: 'Operaciones Matemáticas con Manos', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/-TedLoX7t3s' },
      ],
      instructor: { name: 'Ing. Daniela Pérez', avatarUrl: 'https://i.pravatar.cc/100?img=20', bio: 'Educadora y desarrolladora de herramientas educativas con IA.' }
    },
    'ai-agent': {
      lessons: [
        { id: 'aa-main', title: 'Desarrollo de Agente IA', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/DjI7IEGio3s' },
      ],
      instructor: { name: 'MSc. Julio Vera', avatarUrl: 'https://i.pravatar.cc/100?img=49', bio: 'Investigador en sistemas multiagente y LLM apps.' }
    },
    'chatbot-automation': {
      lessons: [
        { id: 'cb-main', title: 'Desarrollo de Chatbot', type: 'video', duration: '—', description: 'Clase principal', status: 'pending', videoUrl: 'https://youtu.be/lCiW3BaOP04' },
      ],
      instructor: { name: 'Lic. Valeria Núñez', avatarUrl: 'https://i.pravatar.cc/100?img=5', bio: 'Especialista en plataformas conversacionales y CX.' }
    },
  }

  const initial = catalog[slug ?? 'face-recognition'] ?? catalog['face-recognition']

  const STORAGE_KEY = `course-progress:${slug ?? 'face-recognition'}`
  const [lessons, setLessons] = useState<Lesson[]>(initial.lessons)

  const CURRENT_KEY = `course-current:${slug ?? 'face-recognition'}`
  const [currentIndex, setCurrentIndex] = useState(0)
  // Progreso en tiempo real desde el reproductor (una sola lección)
  const [watchPct, setWatchPct] = useState(0)
  const total = lessons.length
  const completedCount = useMemo(() => lessons.filter(l => l.status === 'completed').length, [lessons])
  const progressPct = Math.max(watchPct, Math.round((completedCount / total) * 100))

  // Persistencia en localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const completedIds: string[] = JSON.parse(raw)
        setLessons(prev => prev.map(l => completedIds.includes(l.id) ? { ...l, status: 'completed' } : l))
      }
      const curRaw = localStorage.getItem(CURRENT_KEY)
      if (curRaw) {
        const idx = Number(curRaw)
        if (!Number.isNaN(idx)) setCurrentIndex(Math.max(0, Math.min(idx, initial.lessons.length - 1)))
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY, CURRENT_KEY])

  useEffect(() => {
    try {
      const ids = lessons.filter(l => l.status === 'completed').map(l => l.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {}
  }, [lessons, STORAGE_KEY])

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, String(currentIndex))
    } catch {}
  }, [currentIndex, CURRENT_KEY])

  // Scroll automático arriba al entrar al curso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

  const current = lessons[currentIndex]

  // Capítulos ("Lecciones que aprenderás") en base al curso
  const chaptersBySlug: Record<string, { time: string; label: string }[]> = {
    'hand-recognition': [
      { time: '00:00', label: 'Introducción y objetivos' },
      { time: '01:30', label: 'Configuración de entorno' },
      { time: '03:10', label: 'MediaPipe Hands y puntos clave' },
      { time: '06:00', label: 'Demostración práctica' },
    ],
    'face-recognition': [
      { time: '00:00', label: 'Panorama de reconocimiento facial' },
      { time: '02:00', label: 'Modelos y embeddings' },
      { time: '04:30', label: 'Umbrales y comparaciones' },
      { time: '07:45', label: 'Demo en vivo' },
    ],
    'voice-recognition': [
      { time: '00:00', label: 'Fundamentos de STT' },
      { time: '01:20', label: 'Muestreo y features' },
      { time: '03:50', label: 'Inferencia y precisión' },
      { time: '06:10', label: 'Casos de uso' },
    ],
    'hand-math-ops': [
      { time: '00:00', label: 'Gestos y operaciones' },
      { time: '02:10', label: 'Dataset y etiquetado' },
      { time: '04:00', label: 'Entrenamiento y validación' },
      { time: '06:30', label: 'Demo de resultados' },
    ],
    'ai-agent': [
      { time: '00:00', label: '¿Qué es un Agente IA?' },
      { time: '01:30', label: 'Herramientas y memoria' },
      { time: '04:00', label: 'Orquestación y planificación' },
      { time: '07:00', label: 'Demo de agente' },
    ],
    'chatbot-automation': [
      { time: '00:00', label: 'Arquitectura general' },
      { time: '01:40', label: 'NLU/NLG y flujo' },
      { time: '03:30', label: 'Integraciones' },
      { time: '05:50', label: 'Demostración' },
    ],
  }
  const chapters = chaptersBySlug[slug ?? 'face-recognition'] ?? []
  const chaptersSeconds = useMemo(() => {
    const parse = (t: string) => {
      // Expect mm:ss or hh:mm:ss
      const parts = t.split(':').map(n => Number(n))
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
      return 0
    }
    return chapters.map(c => parse(c.time))
  }, [chapters])

  const markCompleted = () => {
    setLessons(prev => prev.map((l, i) => i === currentIndex ? { ...l, status: 'completed' } : l))
    window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Lección marcada como completada' }))
  }

  const markPending = () => {
    setLessons(prev => prev.map((l, i) => i === currentIndex ? { ...l, status: 'pending' } : l))
  }

  const advanceNext = () => {
    setCurrentIndex((idx) => Math.min(idx + 1, lessons.length - 1))
    window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Has avanzado a la siguiente lección' }))
  }

  return (
    <Layout>
      {/* Hero */}
      <section className={`relative overflow-hidden rounded-2xl border p-8 shadow-lg ${
        isDarkMode 
          ? 'border-gray-800 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100'
      }`}>
        {/* Efectos de fondo */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-gray-800/30' 
            : 'bg-gradient-to-r from-gray-100/30 via-gray-200/20 to-gray-300/30'
        }`} />
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-700/40 to-gray-800/40' 
            : 'bg-gradient-to-br from-gray-200/40 to-gray-300/40'
        }`} />
        <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl ${
          isDarkMode 
            ? 'bg-gradient-to-tr from-gray-800/40 to-gray-700/40' 
            : 'bg-gradient-to-tr from-gray-100/40 to-gray-200/40'
        }`} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-400' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-600'
              }`} />
              <span className={`text-sm font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Curso Activo</span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-3 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>{courseTitle}</h1>
            <p className={`text-lg leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Aprende paso a paso con lecciones prácticas, recursos descargables y proyecto final.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className={`text-center text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {completedCount} de {total} lecciones completadas
            </div>
          </div>
        </div>
        
        {/* Barra de progreso mejorada */}
        <div className={`relative z-10 mt-8 p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-gray-800/70 border-gray-700' 
            : 'bg-white/70 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Progreso del curso:</span> {completedCount} de {total} lecciones
            </div>
            <div className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{progressPct}%</div>
          </div>
          <div className={`relative h-3 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`h-3 rounded-full transition-all duration-500 relative ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700' 
                  : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500'
              }`}
              style={{ width: `${progressPct}%` }}
            >
              <div className={`absolute inset-0 rounded-full animate-pulse ${
                isDarkMode ? 'bg-white/20' : 'bg-white/30'
              }`} />
            </div>
          </div>
          <div className={`flex justify-between text-xs mt-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>Iniciado</span>
            <span>En progreso</span>
            <span>Completado</span>
          </div>
        </div>
      </section>

      {/* Acordeón movido al sidebar */}

      <section className="container-page mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <motion.div 
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`lg:col-span-2 rounded-xl p-4 shadow-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <VideoPlayer 
              videoId={current.videoId} 
              src={current.videoUrl}
              onProgress={({ percent, current: currentTime }) => {
                // Calcular progreso por capítulos alcanzados
                if (chaptersSeconds.length > 0) {
                  const reached = chaptersSeconds.filter(s => currentTime >= s).length
                  const pctByChapters = Math.round((reached / chaptersSeconds.length) * 100)
                  setWatchPct(pctByChapters)
                  if (pctByChapters >= 100 && current.status !== 'completed') {
                    setLessons(prev => prev.map((l, i) => i === currentIndex ? { ...l, status: 'completed' } : l))
                  }
                } else {
                  setWatchPct(percent)
                  if (percent >= 90 && current.status !== 'completed') {
                    setLessons(prev => prev.map((l, i) => i === currentIndex ? { ...l, status: 'completed' } : l))
                  }
                }
              }}
              onEnded={() => {
                setLessons(prev => prev.map((l, i) => i === currentIndex ? { ...l, status: 'completed' } : l))
                setWatchPct(100)
              }}
            />

            <div className="mt-4 flex items-center justify-between">
              <button 
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                  }
                }}
                disabled={currentIndex === 0}
              >
                ← Anterior
              </button>
              
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Lección {currentIndex + 1} de {lessons.length}
              </div>
              
              <button 
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
                onClick={advanceNext}
                disabled={currentIndex === lessons.length - 1}
              >
                Siguiente →
              </button>
            </div>

            <LessonContent 
              lesson={current}
              onMarkCompleted={markCompleted}
              onMarkPending={markPending}
              onAdvanceNext={advanceNext}
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Descripción extendida</h3>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {current.description} En esta sección ampliamos la explicación y agregamos recursos de
                  apoyo. Diseñado con una estética limpia y moderna.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Comments />
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-slate-900 rounded-xl p-4 h-fit"
          >
            <InstructorCard 
              name={initial.instructor.name}
              avatarUrl={initial.instructor.avatarUrl}
              bio={initial.instructor.bio}
            />

            <div className="h-3" />

            <div className="h-3" />
            <div className={`rounded-xl p-4 shadow-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Información del curso</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duración total</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>2h 30min</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lecciones</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{lessons.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nivel</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Intermedio</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Certificado</span>
                  <span className="text-green-600 text-sm font-medium">Incluido</span>
                </div>
              </div>
              
              <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>Progreso del curso</h4>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        index === currentIndex 
                          ? isDarkMode 
                            ? 'bg-blue-900/50 border border-blue-700' 
                            : 'bg-blue-50 border border-blue-200'
                          : isDarkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index <= currentIndex 
                            ? 'bg-green-500 text-white' 
                            : isDarkMode 
                              ? 'bg-gray-600 text-gray-300' 
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index <= currentIndex ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${
                          index === currentIndex 
                            ? isDarkMode 
                              ? 'text-blue-300 font-medium' 
                              : 'text-blue-700 font-medium'
                            : isDarkMode 
                              ? 'text-gray-200' 
                              : 'text-gray-700'
                        }`}>
                          {lesson.title}
                        </span>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-3" />

            <div className={`rounded-xl p-4 shadow-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-base font-semibold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Lecciones que aprenderás</h3>
              <ul className="mt-3 space-y-2">
                {chapters.length === 0 ? (
                  <li className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Este curso no tiene capítulos listados.</li>
                ) : (
                  chapters.map((c, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{c.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${
                        isDarkMode 
                          ? 'text-gray-300 bg-gray-700 border border-gray-600' 
                          : 'text-gray-500 bg-gray-50 border border-gray-200'
                      }`}>{c.time}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>
    </Layout>
  )
}
