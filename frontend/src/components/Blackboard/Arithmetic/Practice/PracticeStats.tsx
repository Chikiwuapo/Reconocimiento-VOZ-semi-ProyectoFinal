import { useEffect, useState } from 'react'

interface Props {
  isDarkMode?: boolean
  model: 'operaciones' | 'vocales' | 'abecedario' | 'numeros' | 'palabras'
}

export default function PracticeStats({ isDarkMode = false, model }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [countTrainings, setCountTrainings] = useState(0)
  const [countRecords, setCountRecords] = useState(0)
  const [trainedItems, setTrainedItems] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/operaciones/gestos_entrenados')
        if (!res.ok) throw new Error('err')
        const data = await res.json()
        const gestos: any[] = Array.isArray(data?.gestos) ? data.gestos : (Array.isArray(data) ? data : [])

        // Filtrar y sintetizar por modelo
        const labels = new Set<string>()
        const isVowel = (s: string) => ['A','E','I','O','U'].includes(s?.toUpperCase?.())
        const isLetter = (s: string) => /^[A-Z]$/.test(s?.toUpperCase?.())
        const isDigit = (s: string) => /^\d+$/.test(s || '')
        const isOp = (s: string) => ['+','-','×','÷','*','/'].includes(s || '')

        for (const g of gestos) {
          const label = String(g?.label ?? '').trim()
          if (!label) continue
          if (model === 'vocales' && isVowel(label)) labels.add(label.toUpperCase())
          else if (model === 'abecedario' && isLetter(label) && !isVowel(label)) labels.add(label.toUpperCase())
          else if (model === 'numeros' && isDigit(label)) labels.add(label)
          else if (model === 'operaciones' && isOp(label)) labels.add(label)
          else if (model === 'palabras' && !isLetter(label) && !isDigit(label) && !isOp(label)) labels.add(label)
        }

        setTrainedItems(Array.from(labels).slice(0, 20))
        setCountRecords(gestos.length)
        // Entrenamientos: usar localStorage trained_models_ids como aproximación
        try {
          const raw = localStorage.getItem('trained_models_ids')
          const arr: string[] = raw ? JSON.parse(raw) : []
          setCountTrainings(arr.length)
        } catch { setCountTrainings(0) }
        setLoaded(true)
      } catch {
        setLoaded(true)
        setCountRecords(0)
        setCountTrainings(0)
        setTrainedItems([])
      }
    }
    load()
  }, [model])

  const card = (title: string, value: string | number, icon: string, extra?: string) => (
    <div className={`rounded-xl p-4 shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{title}</div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-header'}`}>{loaded ? value : '—'}</div>
          {extra && <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>{extra}</div>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {card('Entrenamientos realizados', countTrainings, '🏁')}
      {card('Registros cargados', countRecords, '🗂️')}
      <div className={`rounded-xl p-4 shadow ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Modelo: {model}</div>
        <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          {trainedItems.length === 0 ? 'Sin elementos entrenados aún' : (
            <div className="flex flex-wrap gap-2">
              {trainedItems.map((t) => (
                <span key={t} className={`${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-slate-50 text-slate-800 border-slate-200'} border rounded-md px-2 py-1`}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
