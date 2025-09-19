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

  const openConfirm = () => setShowConfirm(true)
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
    <div className="mt-4">
      <h2 className="text-white text-xl font-bold">{lesson.title}</h2>
      <p className="text-slate-300 mt-1 text-sm">{lesson.description}</p>

      {lesson.timestamps && lesson.timestamps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-white font-semibold">Índice de la lección</h3>
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {lesson.timestamps.map(t => (
              <li key={t.time} className="text-slate-300">
                <span className="font-mono text-blue-400 mr-2">{t.time}</span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button 
          onClick={openConfirm}
          className={`btn-accent-cyan`}
        >
          {lesson.status === 'completed' ? 'Quitar completado' : 'Marcar como completada'}
        </button>
        {lesson.attachments && lesson.attachments.length > 0 && (
          <button
            onClick={() => setShowAttachments(v => !v)}
            className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Archivos adjuntos ({lesson.attachments.length})
          </button>
        )}
      </div>

      {showAttachments && lesson.attachments && lesson.attachments.length > 0 && (
        <div className="mt-3 border border-slate-800 rounded-md p-3 bg-slate-900">
          <ul className="text-sm text-slate-300 list-disc pl-4">
            {lesson.attachments.map((a) => (
              <li key={a.name}><a className="underline hover:text-blue-400" href={a.url}>{a.name}</a></li>
            ))}
          </ul>
        </div>
      )}

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
