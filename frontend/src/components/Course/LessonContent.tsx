import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Lesson } from '../../pages/Courses/CoursePage'

type Props = {
  lesson: Lesson
  onMarkCompleted: () => void
  onMarkPending: () => void
  onAdvanceNext?: () => void
}

export default function LessonContent({ lesson, onMarkCompleted, onMarkPending, onAdvanceNext }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)

  const closeConfirm = () => setShowConfirm(false)

  const confirmAction = () => {
    if (lesson.status === 'completed') {
      onMarkPending()
    } else {
      onMarkCompleted()
      onAdvanceNext?.()
    }
    closeConfirm()
  }

  return (
    <div className="mt-6">
      {/* Header de la lección */}
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${lesson.status === 'completed' ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
              <h2 className="text-gray-800 text-2xl font-bold">{lesson.title}</h2>
            </div>
            <p className="text-gray-600 text-base leading-relaxed">{lesson.description}</p>
          </div>
          
          {/* Estado de la lección */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            lesson.status === 'completed' 
              ? 'bg-gray-200 text-gray-700 border border-gray-300' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {lesson.status === 'completed' ? '✓ Completada' : '⏳ En progreso'}
          </div>
        </div>
      </div>

      {/* Índice de la lección */}
      {lesson.timestamps && lesson.timestamps.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-700 text-sm">📋</span>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg">Índice de la lección</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.timestamps.map((t, idx) => (
              <div key={t.time} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-blue-400 text-sm font-medium">{t.time}</div>
                  <div className="text-slate-300 text-sm">{t.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {lesson.attachments && lesson.attachments.length > 0 && (
          <button
            onClick={() => setShowAttachments(v => !v)}
            className="px-4 py-3 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-all duration-200 flex items-center gap-2"
          >
            <span>📎</span>
            Archivos adjuntos ({lesson.attachments.length})
          </button>
        )}
      </div>

      {/* Archivos adjuntos */}
      <AnimatePresence>
        {showAttachments && lesson.attachments && lesson.attachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
          >
            <div className="p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📁</span>
                Recursos descargables
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lesson.attachments.map((a) => (
                  <a 
                    key={a.name} 
                    href={a.url}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400">📄</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium group-hover:text-white">{a.name}</div>
                      <div className="text-slate-400 text-xs">Hacer clic para descargar</div>
                    </div>
                    <div className="text-slate-400 group-hover:text-blue-400">
                      <span>⬇️</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60"
              onClick={closeConfirm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-slate-900 border border-slate-700 rounded-xl p-5 w-[90vw] max-w-md"
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-2">Confirmación</h4>
              <p className="text-slate-300 text-sm">
                {lesson.status === 'completed' 
                  ? '¿Quieres quitar el estado de completada para esta lección?'
                  : '¿Confirmas que terminaste esta lección? Pasaremos a la siguiente.'}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={closeConfirm} className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800">Cancelar</button>
                <button onClick={confirmAction} className="btn-accent-cyan">Confirmar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
