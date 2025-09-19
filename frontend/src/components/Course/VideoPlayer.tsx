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
    <div className="w-full aspect-video bg-black/60 rounded-lg overflow-hidden border border-slate-800">
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
        <div className="w-full h-full grid place-items-center text-slate-300 text-sm">
          Sin video para esta lección
        </div>
      )}
    </div>
  )
}
