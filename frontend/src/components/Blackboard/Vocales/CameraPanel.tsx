import React from 'react';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraActive: boolean;
  isLeftHandDetected: boolean;
  isRightHandDetected: boolean;
}

const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  isLeftHandDetected,
  isRightHandDetected,
}) => {
  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Status indicators */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">Cámara activa</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Mano izquierda:</span>
          <span className={`text-sm ${isLeftHandDetected ? 'text-green-400' : 'text-red-400'}`}>
            {isLeftHandDetected ? 'Sí' : 'No'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm">Mano derecha:</span>
          <span className={`text-sm ${isRightHandDetected ? 'text-green-400' : 'text-red-400'}`}>
            {isRightHandDetected ? 'Sí' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CameraPanel;