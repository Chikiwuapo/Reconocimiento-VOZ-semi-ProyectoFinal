interface PracticeStatsProps {
  totalAttempts: number
  correctAttempts: number
  averageConfidence: number
}

export default function PracticeStats({ totalAttempts, correctAttempts, averageConfidence }: PracticeStatsProps) {
  const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Práctica</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalAttempts}</div>
          <div className="text-sm text-gray-600">Intentos totales</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{correctAttempts}</div>
          <div className="text-sm text-gray-600">Aciertos</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{Math.round(averageConfidence * 100)}%</div>
          <div className="text-sm text-gray-600">Confianza promedio</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600">{accuracy.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Precisión</div>
        </div>
      </div>
    </div>
  )
}