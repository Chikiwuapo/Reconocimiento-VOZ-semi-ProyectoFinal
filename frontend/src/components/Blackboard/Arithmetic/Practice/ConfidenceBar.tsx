interface Props {
  value: number | undefined
  isDarkMode?: boolean
}

export default function ConfidenceBar({ value = 0, isDarkMode = false }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((value || 0) * 100)))
  return (
    <div className="w-full">
      <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Confianza</div>
      <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
        <div className="h-3 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
