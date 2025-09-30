import React from 'react';

interface ConfidenceBarProps {
  confidence: number;
  label?: string;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, label = "Confianza" }) => {
  const percentage = Math.round(confidence * 100);
  
  const getColorClass = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getColorClass(confidence)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceBar;