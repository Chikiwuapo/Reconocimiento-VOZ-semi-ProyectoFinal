import type { RefObject } from 'react'

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  isDarkMode?: boolean
  cameraActive: boolean
  rightDetected?: boolean
  leftDetected?: boolean
}

export default function CameraPanel({ videoRef, canvasRef, isDarkMode = false, cameraActive, rightDetected, leftDetected }: CameraPanelProps) {
  return (
    <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-[#0F0F0F] border-gray-800' : 'bg-white border-slate-200'} shadow-soft`}> 
      <div className="relative w-full aspect-video">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
        {!cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`px-4 py-2 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>Cámara inactiva</div>
          </div>
        )}
      </div>
      <div className={`flex items-center justify-between px-4 py-2 ${isDarkMode ? 'bg-[#0B0B0B] text-gray-300' : 'bg-slate-50 text-slate-700'}`}>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-flex h-2 w-2 rounded-full ${cameraActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{cameraActive ? 'Cámara activa' : 'Cámara detenida'}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="opacity-70">Mano izquierda:</span>
            <span className={`font-semibold ${leftDetected ? 'text-emerald-500' : 'opacity-60'}`}>{leftDetected ? 'Detectada' : 'No'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="opacity-70">Mano derecha:</span>
            <span className={`font-semibold ${rightDetected ? 'text-emerald-500' : 'opacity-60'}`}>{rightDetected ? 'Detectada' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
