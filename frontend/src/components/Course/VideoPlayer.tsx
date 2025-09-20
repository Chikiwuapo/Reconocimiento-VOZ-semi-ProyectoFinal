type Props = { videoId?: string; src?: string }

export default function VideoPlayer({ videoId, src }: Props) {
  const isYouTube = !!videoId || (src && /youtube|youtu\.be/.test(src))
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0`
    : src && /youtu\.be\/(.+)$/.exec(src)?.[1]
      ? `https://www.youtube.com/embed/${/youtu\.be\/(.+)$/.exec(src)![1]}?rel=0`
      : src && /v=([^&]+)/.exec(src)?.[1]
        ? `https://www.youtube.com/embed/${/v=([^&]+)/.exec(src)![1]}?rel=0`
        : undefined

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-lg group">
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 via-gray-300/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Borde brillante animado */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-300/30 via-gray-400/30 to-gray-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {isYouTube && embedSrc ? (
          <iframe
            className="w-full h-full"
            src={embedSrc}
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : src ? (
          <video className="w-full h-full" controls src={src} />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-600">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-50">📹</div>
              <p className="text-sm font-medium">Sin video para esta lección</p>
              <p className="text-xs text-gray-500 mt-1">El contenido estará disponible próximamente</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Indicador de calidad de video */}
      {(isYouTube || src) && (
        <div className="absolute top-3 right-3 bg-gray-800/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
          HD
        </div>
      )}
    </div>
  )
}
