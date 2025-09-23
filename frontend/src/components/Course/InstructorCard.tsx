type Props = {
  name: string
  avatarUrl: string
  bio: string
}

export default function InstructorCard({ name, avatarUrl, bio }: Props) {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl p-6 border border-gray-300 shadow-xl relative overflow-hidden">
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100/30 via-gray-200/20 to-gray-300/30 opacity-50" />
      
      <div className="relative">
        {/* Header con icono */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👨‍🏫</span>
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Tu Instructor</h3>
        </div>
        
        {/* Contenido principal */}
        <div className="flex items-start gap-4">
          {/* Avatar con efectos */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full blur-sm opacity-30"></div>
            <img 
              src={avatarUrl} 
              alt={name} 
              className="relative h-16 w-16 rounded-full border-2 border-gray-300 shadow-lg object-cover" 
            />
            {/* Indicador online */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Información del instructor */}
          <div className="flex-1 min-w-0">
            <div className="text-gray-800 font-semibold text-lg mb-1">{name}</div>
            <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
            
            {/* Estadísticas del instructor */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <span>⭐</span>
                <span>4.9</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>👥</span>
                <span>2.5k estudiantes</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span>🎓</span>
                <span>15 cursos</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón de contacto */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-lg text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:border-gray-400 transition-all duration-200 text-sm font-medium">
            💬 Enviar mensaje
          </button>
        </div>
      </div>
    </div>
  )
}
