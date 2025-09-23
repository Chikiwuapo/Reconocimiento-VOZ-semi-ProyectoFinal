import { useEffect, useRef, useState } from 'react'

type Props = { videoId?: string; src?: string; onProgress?: (data: { percent: number; current: number; duration: number }) => void; onEnded?: () => void }

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

function extractYouTubeId(videoId?: string, src?: string) {
  if (videoId) return videoId
  const m1 = src && /youtu\.be\/([a-zA-Z0-9_-]{6,})/.exec(src)
  if (m1) return m1[1]
  const m2 = src && /v=([^&]+)/.exec(src || '')
  if (m2) return m2[1]
  const m3 = src && /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/.exec(src)
  if (m3) return m3[1]
  return undefined
}

let ytScriptLoading = false

export default function VideoPlayer({ videoId, src, onProgress, onEnded }: Props) {
  const youTubeId = extractYouTubeId(videoId, src)
  const isYouTube = !!youTubeId
  const [useApi, setUseApi] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any>(null)
  const progressTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isYouTube) return
    // Load IFrame API once
    const ensureApi = () => {
      if (window.YT && window.YT.Player) {
        setUseApi(true)
        return
      }
      if (!ytScriptLoading) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        ytScriptLoading = true
        document.body.appendChild(tag)
        window.onYouTubeIframeAPIReady = () => {
          setUseApi(true)
        }
      } else {
        // Poll until ready
        const id = window.setInterval(() => {
          if (window.YT && window.YT.Player) {
            window.clearInterval(id)
            setUseApi(true)
          }
        }, 200)
      }
    }
    ensureApi()
  }, [isYouTube])

  useEffect(() => {
    if (!useApi || !containerRef.current || !isYouTube || !youTubeId) return
    try {
      // Clean existing
      containerRef.current.innerHTML = ''
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youTubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            // start progress polling
            if (progressTimerRef.current) window.clearInterval(progressTimerRef.current)
            progressTimerRef.current = window.setInterval(() => {
              const p = playerRef.current
              if (!p || typeof p.getDuration !== 'function') return
              const d = p.getDuration()
              const t = p.getCurrentTime()
              if (d > 0 && typeof onProgress === 'function') {
                const percent = Math.min(100, Math.max(0, (t / d) * 100))
                onProgress({ percent: Math.round(percent), current: t, duration: d })
              }
            }, 500) as any
          },
          onStateChange: (e: any) => {
            // 0 = ended
            if (e?.data === 0 && typeof onEnded === 'function') onEnded()
          }
        }
      })
    } catch {
      setUseApi(false)
    }
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [useApi, isYouTube, youTubeId, onProgress, onEnded])

  const embedSrc = isYouTube && !useApi && youTubeId ? `https://www.youtube.com/embed/${youTubeId}?rel=0` : undefined

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 shadow-lg group">
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 via-gray-300/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Borde brillante animado */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-300/30 via-gray-400/30 to-gray-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {isYouTube ? (
          useApi ? (
            <div ref={containerRef} className="w-full h-full" />
          ) : embedSrc ? (
            <iframe
              className="w-full h-full"
              src={embedSrc}
              title="YouTube video player"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-600">Cargando video…</div>
          )
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
