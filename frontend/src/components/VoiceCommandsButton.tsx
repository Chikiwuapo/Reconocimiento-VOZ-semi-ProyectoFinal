import { useState } from 'react'

interface VoiceCommandsButtonProps {
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export default function VoiceCommandsButton({ 
  isActive = false, 
  onClick, 
  disabled = false,
  className = ""
}: VoiceCommandsButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex items-center justify-center gap-2
        px-4 py-3 rounded-xl
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
          : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isHovered && !disabled ? 'scale-105' : 'scale-100'}
        ${className}
      `}
      title={isActive ? "Desactivar comandos de voz" : "Activar comandos de voz"}
    >
      {/* Icono de micrófono */}
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path 
          d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" 
          fill="currentColor"
        />
        <path 
          d="M19 10V12C19 16.42 15.42 20 11 20H10V22H14V20H15C19.42 20 23 16.42 23 12V10H19Z" 
          fill="currentColor"
        />
        <path 
          d="M5 10V12C5 16.42 8.58 20 13 20H14V22H10V20H9C4.58 20 1 16.42 1 12V10H5Z" 
          fill="currentColor"
        />
      </svg>

      {/* Texto del botón */}
      <span className="text-white text-sm font-medium">
        {isActive ? "Desactivar comandos" : "Activar comandos"}
      </span>

      {/* Indicador de estado activo */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Efecto de ondas cuando está activo */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-xl bg-red-500 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-xl bg-red-500 animate-pulse opacity-10"></div>
        </>
      )}
    </button>
  )
}