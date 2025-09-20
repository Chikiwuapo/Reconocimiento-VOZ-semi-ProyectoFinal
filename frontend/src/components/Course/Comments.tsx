import { useState } from 'react'

type Comment = { id: string; author: string; message: string }

export default function Comments() {
  const [items, setItems] = useState<Comment[]>([
    { id: 'c1', author: 'Ana', message: 'Excelente explicación, gracias!' },
    { id: 'c2', author: 'Luis', message: '¿Podrían compartir más recursos de datasets?' },
  ])
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')

  const add = () => {
    if (!author.trim() || !message.trim()) return
    setItems(prev => [{ id: crypto.randomUUID(), author, message }, ...prev])
    setAuthor('')
    setMessage('')
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
      <h3 className="text-gray-800 font-semibold mb-3">Comentarios</h3>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
          placeholder="Tu nombre"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-[2] px-3 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
          placeholder="Escribe un comentario"
        />
        <button onClick={add} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Enviar</button>
      </div>

      <ul className="space-y-2">
        {items.map(c => (
          <li key={c.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="text-gray-800 font-medium">{c.author}</div>
            <div className="text-gray-600 text-sm">{c.message}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
