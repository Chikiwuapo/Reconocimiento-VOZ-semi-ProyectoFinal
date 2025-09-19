import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from '../../components/Blackboard/Layout'
import InstructorCard from '../../components/Course/InstructorCard.tsx'
import LessonSidebar from '../../components/Course/LessonSidebar.tsx'
import LessonContent from '../../components/Course/LessonContent.tsx'
import Comments from '../../components/Course/Comments.tsx'
import VideoPlayer from '../../components/Course/VideoPlayer.tsx'

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

function AccordionRow({ idx, lesson, onSelect }: { idx: number; lesson: Lesson; onSelect: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        className="w-full flex items-center justify-between py-3 text-left"
        onClick={() => { setOpen(o => !o); onSelect() }}
      >
        <div>
          <div className="font-medium text-header">{idx + 1}. {lesson.title}</div>
          <div className="text-xs text-slate-500">Tipo: {lesson.type}{lesson.duration ? ` • ${lesson.duration}` : ''}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${lesson.status === 'completed' ? 'bg-green-100 text-green-700' : ''}`}>{lesson.status === 'completed' ? 'Completada' : 'Pendiente'}</span>
          <svg viewBox="0 0 20 20" className={`h-5 w-5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}><path d="M5 8l5 5 5-5" fill="currentColor"/></svg>
        </div>
      </button>
      {open && (
        <div className="pb-3 pl-1 text-sm text-slate-600">
          <p>{lesson.description}</p>
          {lesson.timestamps && lesson.timestamps.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-slate-500">Marcadores</div>
              <ul className="mt-1 grid grid-cols-2 gap-2">
                {lesson.timestamps.map((t, i) => (
                  <li key={i} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700">{t.time} — {t.label}</li>
                ))}
              </ul>
            </div>
          )}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-slate-500">Adjuntos</div>
              <ul className="mt-1 grid grid-cols-2 gap-2">
                {lesson.attachments.map((a, i) => (
                  <li key={i}><a href={a.url} className="text-primary hover:underline text-xs">{a.name}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
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
    'face-recognition': {
      lessons: [
        { id: 'fr-1', title: 'Introducción al Reconocimiento Facial', type: 'video', duration: '10:20', description: 'Panorama general del curso y objetivos.', timestamps: [{ time: '00:01:23', label: 'Introducción' }], attachments: [{ name: 'apuntes-introduccion.pdf', url: '#' }], status: 'pending', videoId: 'ysz5S6PUM-U' },
        { id: 'fr-2', title: 'Instalación (OpenCV, dlib)', type: 'video', duration: '08:20', description: 'Instalación y verificación de dependencias.', attachments: [{ name: 'requirements.txt', url: '#' }], status: 'pending', videoId: 'aqz-KE-bpKQ' },
        { id: 'fr-3', title: 'Dataset y Preprocesamiento', type: 'video', duration: '12:15', description: 'Selección de dataset y pipeline de preprocesamiento.', status: 'pending', videoId: 'sBws8MSXN7A' },
        { id: 'fr-4', title: 'Detección con Haar Cascades', type: 'video', duration: '09:05', description: 'Detección de rostros en imágenes y video.', status: 'pending', videoId: 'kXYiU_JCYtU' },
        { id: 'fr-5', title: 'Embeddings y Reconocimiento', type: 'video', duration: '16:40', description: 'Embeddings, métricas y umbrales.', status: 'pending', videoId: 'kJQP7kiw5Fk' },
        { id: 'fr-6', title: 'Proyecto final', type: 'resource', duration: '—', description: 'Enunciado del proyecto final.', attachments: [{ name: 'guia-proyecto.pdf', url: '#' }], status: 'pending' },
      ],
      instructor: { name: 'Ing. Laura Méndez', avatarUrl: 'https://i.pravatar.cc/100?img=68', bio: 'Ingeniera de Software con especialización en Visión Computacional e IA, con 8+ años de experiencia.' }
    },
    'hand-recognition': {
      lessons: [
        { id: 'hr-1', title: 'Introducción a MediaPipe Hands', type: 'video', duration: '07:10', description: 'Qué es MediaPipe y cómo usarlo.', status: 'pending', videoId: 'ysz5S6PUM-U' },
        { id: 'hr-2', title: 'Lectura de landmarks', type: 'video', duration: '11:00', description: 'Coordenadas y normalización.', status: 'pending', videoId: 'aqz-KE-bpKQ' },
      ],
      instructor: { name: 'Ing. Carlos Díaz', avatarUrl: 'https://i.pravatar.cc/100?img=33', bio: 'ML Engineer enfocado en visión por computadora y XR.' }
    },
    'voice-recognition': {
      lessons: [
        { id: 'vr-1', title: 'Fundamentos de Speech-to-Text', type: 'video', duration: '09:10', description: 'STT, sampling y features básicos.', status: 'pending', videoId: 'ysz5S6PUM-U' },
      ],
      instructor: { name: 'Dra. Sofía Ramos', avatarUrl: 'https://i.pravatar.cc/100?img=12', bio: 'Doctora en Procesamiento de Señales, foco en audio e IA.' }
    },
    'hand-math-ops': {
      lessons: [
        { id: 'hm-1', title: 'Representación de gestos numéricos', type: 'video', duration: '06:30', description: 'Construcción del diccionario de gestos.', status: 'pending', videoId: 'ysz5S6PUM-U' },
      ],
      instructor: { name: 'Ing. Daniela Pérez', avatarUrl: 'https://i.pravatar.cc/100?img=20', bio: 'Educadora y desarrolladora de herramientas educativas con IA.' }
    },
    'ai-agent': {
      lessons: [
        { id: 'aa-1', title: 'Qué es un Agente IA', type: 'video', duration: '08:50', description: 'Conceptos, herramientas y memoria.', status: 'pending', videoId: 'aqz-KE-bpKQ' },
      ],
      instructor: { name: 'MSc. Julio Vera', avatarUrl: 'https://i.pravatar.cc/100?img=49', bio: 'Investigador en sistemas multiagente y LLM apps.' }
    },
    'chatbot-automation': {
      lessons: [
        { id: 'cb-1', title: 'Arquitectura de un chatbot', type: 'video', duration: '10:00', description: 'NLU, NLG y orquestación.', status: 'pending', videoId: 'sBws8MSXN7A' },
      ],
      instructor: { name: 'Lic. Valeria Núñez', avatarUrl: 'https://i.pravatar.cc/100?img=5', bio: 'Especialista en plataformas conversacionales y CX.' }
    },
  }

  const initial = catalog[slug ?? 'face-recognition'] ?? catalog['face-recognition']

  const STORAGE_KEY = `course-progress:${slug ?? 'face-recognition'}`
  const [lessons, setLessons] = useState<Lesson[]>(initial.lessons)

  const CURRENT_KEY = `course-current:${slug ?? 'face-recognition'}`
  const [currentIndex, setCurrentIndex] = useState(0)

  const completedCount = useMemo(
    () => lessons.filter(l => l.status === 'completed').length,
    [lessons]
  )
  const total = lessons.length
  const progressPct = Math.round((completedCount / total) * 100)

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

  const current = lessons[currentIndex]

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
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">{courseTitle}</h1>
            <p className="text-slate-300 mt-1">Aprende paso a paso con lecciones prácticas, recursos descargables y proyecto final.</p>
          </div>
          <button className="btn-accent-cyan btn-lg">Iniciar curso</button>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300"><span className="font-semibold text-slate-100">Progreso:</span> {completedCount} de {total} lecciones</div>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-slate-400 w-10 text-right">{progressPct}%</div>
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
            className="lg:col-span-2 bg-slate-900 rounded-xl p-4 shadow-soft border border-slate-800"
          >
            <VideoPlayer videoId={current.videoId} src={current.videoUrl} />

            <div className="mt-4 flex items-center gap-2">
              <button className="btn-accent-purple" onClick={markCompleted}>Marcar completada</button>
              <button className="btn-accent-cyan" onClick={advanceNext}>Continuar</button>
            </div>

            <LessonContent 
              lesson={current}
              onMarkCompleted={markCompleted}
              onMarkPending={markPending}
              onAdvanceNext={advanceNext}
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-white text-lg font-semibold mb-2">Descripción extendida</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {current.description} En esta sección ampliamos la explicación y agregamos recursos de
                  apoyo. Diseñado con una estética tecnológica oscura y acentos azules/púrpura.
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

            <LessonSidebar 
              lessons={lessons}
              currentId={current.id}
              onSelect={() => {
                // No cambia el video; sólo informativo
                window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Lección seleccionada (vista previa)' }))
              }}
            />

            <div className="h-3" />
            <div className="bg-white rounded-xl p-4 shadow-soft">
              <h3 className="text-header text-base font-semibold">Lecciones que aprenderás</h3>
              <ul className="mt-3 divide-y divide-slate-100">
                {lessons.map((l, i) => (
                  <AccordionRow key={l.id} idx={i} lesson={l} onSelect={() => { /* no cambia video */ }} />
                ))}
              </ul>
            </div>
          </motion.aside>
        </div>
      </section>
    </Layout>
  )
}
