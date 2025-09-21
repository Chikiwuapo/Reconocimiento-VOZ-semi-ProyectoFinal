import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    Camera?: any
    FaceMesh?: any
    FACEMESH_TESSELATION?: any
    drawConnectors?: any
    drawLandmarks?: any
  }
}

export type PositionData = { x: number; y: number; scale: number }

function computePositionFromBox(box: { xMin: number; yMin: number; xMax: number; yMax: number }, vw: number, vh: number): PositionData {
  const cx = (box.xMin + box.xMax) / 2 / vw
  const cy = (box.yMin + box.yMax) / 2 / vh
  const scale = Math.min(1, ((box.xMax - box.xMin) / vw) * 1.5)
  return { x: cx, y: cy, scale }
}

async function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export function useFaceCapture() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null) // capture canvas (hidden)
  const overlayRef = useRef<HTMLCanvasElement | null>(null) // drawing canvas (visible)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faceReady, setFaceReady] = useState(false)
  const [status, setStatus] = useState('Inicializando cámara...')
  const lastBoxRef = useRef<{ xMin: number; yMin: number; xMax: number; yMax: number } | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let camera: any | null = null
    let running = true

    async function init() {
      if (startedRef.current) return
      startedRef.current = true
      try {
        // Load MediaPipe helpers from CDN (same as backend template references)
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        const v = videoRef.current
        const overlay = overlayRef.current
        if (!v || !overlay) throw new Error('Video/overlay no disponible')
        v.srcObject = stream
        // ensure sizes once metadata available
        await new Promise<void>((resolve) => {
          const done = () => resolve()
          if (v.readyState >= 2) resolve()
          else v.addEventListener('loadedmetadata', done, { once: true })
        })
        await v.play().catch(() => {})

        overlay.width = v.videoWidth
        overlay.height = v.videoHeight
        if (canvasRef.current) {
          canvasRef.current.width = v.videoWidth
          canvasRef.current.height = v.videoHeight
        }

        const ctx = overlay.getContext('2d')!
        const faceMesh = new window.FaceMesh({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` })
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 })

        faceMesh.onResults((results: any) => {
          ctx.clearRect(0, 0, overlay.width, overlay.height)
          let hasFace = false
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length) {
            const lms = results.multiFaceLandmarks[0]
            // Draw white mesh like backend (white lines, no glow)
            const tess = (window as any).FACEMESH_TESSELATION || (window as any).FACEMESH_TESSELLATION
            if (window.drawConnectors && tess) {
              window.drawConnectors(ctx, lms, tess, { color: '#ffffff', lineWidth: 0.7 })
              if (window.drawLandmarks) {
                window.drawLandmarks(ctx, lms, { color: '#ffffff', radius: 0.7 })
              }
            } else {
              // Fallback: draw points (simple, no glow)
              ctx.lineWidth = 1.0
              ctx.strokeStyle = '#ffffff'
              ctx.fillStyle = '#ffffff'
              for (const p of lms) {
                ctx.beginPath()
                ctx.arc(p.x * overlay.width, p.y * overlay.height, 1.0, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            // Compute bounding box
            let xMin = 1e9, yMin = 1e9, xMax = -1e9, yMax = -1e9
            for (const p of lms) {
              xMin = Math.min(xMin, p.x * overlay.width)
              yMin = Math.min(yMin, p.y * overlay.height)
              xMax = Math.max(xMax, p.x * overlay.width)
              yMax = Math.max(yMax, p.y * overlay.height)
            }
            lastBoxRef.current = { xMin, yMin, xMax, yMax }
            const pos = computePositionFromBox(lastBoxRef.current, overlay.width, overlay.height)
            // Distance/status logic similar to backend
            if (pos.scale < 0.25) {
              setStatus('Muy lejos')
              hasFace = false
            } else {
              setStatus('Rostro listo')
              hasFace = true
            }
          } else {
            setStatus('No se detecta rostro')
            lastBoxRef.current = null
            hasFace = false
          }
          setFaceReady(hasFace)
        })

        camera = new window.Camera(v, {
          onFrame: async () => {
            if (!running) return
            await faceMesh.send({ image: v })
          },
          width: 640,
          height: 400,
        })

        await camera.start()
        // keep sizes in sync if the stream provides them later/changes
        const resize = () => {
          if (!overlay || !v) return
          overlay.width = v.videoWidth
          overlay.height = v.videoHeight
          if (canvasRef.current) {
            canvasRef.current.width = v.videoWidth
            canvasRef.current.height = v.videoHeight
          }
        }
        v.addEventListener('loadedmetadata', resize)
        window.addEventListener('resize', resize)

        setReady(true)
        setStatus('Buscando rostro...')
      } catch (e: any) {
        setError(e?.message || 'No se pudo inicializar FaceMesh')
      }
    }

    init()
    return () => {
      running = false
      if (camera && camera.stop) camera.stop()
      if (stream) stream.getTracks().forEach((t) => t.stop())
      startedRef.current = false
      try {
        window.removeEventListener('resize', () => {})
      } catch {}
    }
  }, [])

  // Visibility handling: pause/resume processing to avoid stalls after tab switches
  useEffect(() => {
    const onVis = () => {
      // Trigger a status refresh; MediaPipe camera resumes automatically
      setStatus(document.hidden ? 'Pausado' : (faceReady ? 'Rostro listo' : 'Buscando rostro'))
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [faceReady])

  function doCapture(): { imageB64: string; position: PositionData } | null {
    const v = videoRef.current
    const c = canvasRef.current
    const overlay = overlayRef.current
    if (!v || !c || !overlay) return null
    const w = v.videoWidth
    const h = v.videoHeight
    if (!w || !h) return null
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    ctx.drawImage(v, 0, 0, w, h)
    const imageB64 = c.toDataURL('image/jpeg', 0.92)
    const box = lastBoxRef.current
    const position = box ? computePositionFromBox(box, overlay.width, overlay.height) : { x: 0.5, y: 0.5, scale: 0.25 }
    return { imageB64, position }
  }

  async function captureMulti(n = 5, delayMs = 220) {
    const frames: string[] = []
    const positions: PositionData[] = []
    for (let i = 0; i < n; i++) {
      const shot = doCapture()
      if (shot) {
        frames.push(shot.imageB64)
        positions.push(shot.position)
      }
      if (i < n - 1) await new Promise((r) => setTimeout(r, delayMs))
    }
    return { frames, positions }
  }

  return { videoRef, canvasRef, overlayRef, ready, error, faceReady, status, capture: doCapture, captureMulti }
}
