import { useEffect, useState } from 'react'

type Toast = { id: number; message: string }

export default function NotificationCenter() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    let idCounter = 1
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>
      const msg = typeof custom.detail === 'string' ? custom.detail : 'Acción realizada'
      const id = idCounter++
      setToasts((t) => [...t, { id, message: msg }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
    }
    window.addEventListener('app:notify', handler as EventListener)
    return () => window.removeEventListener('app:notify', handler as EventListener)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="bg-white shadow-lg rounded-lg px-4 py-2 border border-slate-200 animate-slide-in-left">
          <div className="text-sm text-header font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  )
}
