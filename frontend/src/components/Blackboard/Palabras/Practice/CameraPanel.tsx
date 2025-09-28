import React from 'react'

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  cameraActive: boolean
  leftDetected: boolean
  rightDetected: boolean
}

export default function CameraPanel({
  videoRef,
  canvasRef,
  cameraActive,
  leftDetected,
  rightDetected
}: CameraPanelProps) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Video element (hidden) */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      
      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-full"
        style={{ aspectRatio: '4/3' }}
      />
      
      {/* Camera status indicator */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white text-sm font-medium">
          {cameraActive ? 'Cámara activa' : 'Cámara inactiva'}
        </span>
      </div>
      
      {/* Hand detection indicators */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${leftDetected ? 'bg-red-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Mano izquierda</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${rightDetected ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white text-sm">Mano derecha</span>
        </div>
      </div>
      
      {/* No camera message */}
      {!cameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg">Inicia la cámara para comenzar</p>
          </div>
        </div>
      )}
    </div>
  )
}