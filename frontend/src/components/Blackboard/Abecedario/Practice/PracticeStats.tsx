import React from 'react';

interface PracticeStatsProps {
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  bestStreak: number;
}

const PracticeStats: React.FC<PracticeStatsProps> = ({
  totalAttempts,
  correctAttempts,
  currentStreak,
  bestStreak,
}) => {
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Práctica</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalAttempts}</div>
          <div className="text-sm text-gray-600">Intentos Totales</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
          <div className="text-sm text-gray-600">Precisión</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-sm text-gray-600">Racha Actual</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{bestStreak}</div>
          <div className="text-sm text-gray-600">Mejor Racha</div>
        </div>
      </div>
    </div>
  );
};

export default PracticeStats;