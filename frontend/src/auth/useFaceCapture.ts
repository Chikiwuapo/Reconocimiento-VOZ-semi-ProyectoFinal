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

        // Size canvases: overlay should match DISPLAY size; capture canvas uses SOURCE size
        const alignOverlayToDisplay = () => {
          const rect = v.getBoundingClientRect()
          // Canvas internal pixel size should match CSS display size for crisp drawing
          overlay.width = Math.max(1, Math.round(rect.width))
          overlay.height = Math.max(1, Math.round(rect.height))
        }
        alignOverlayToDisplay()
        if (canvasRef.current) {
          // Keep full video resolution for captured frames
          canvasRef.current.width = v.videoWidth
          canvasRef.current.height = v.videoHeight
        }

        const ctx = overlay.getContext('2d')!

        // Helper: compute transform for object-contain rendering
        function getVisibleTransform() {
          const vv = v!
          const ov = overlay!
          const vidW = Math.max(1, vv.videoWidth || 640)
          const vidH = Math.max(1, vv.videoHeight || 480)
          const scale = Math.min(ov.width / vidW, ov.height / vidH)
          const contentW = vidW * scale
          const contentH = vidH * scale
          const offsetX = (ov.width - contentW) / 2
          const offsetY = (ov.height - contentH) / 2
          return { scale, contentW, contentH, offsetX, offsetY }
        }
        const faceMesh = new window.FaceMesh({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` })
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 })

        faceMesh.onResults((results: any) => {
          ctx.clearRect(0, 0, overlay.width, overlay.height)
          let hasFace = false
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length) {
            const lms = results.multiFaceLandmarks[0]
            const vt = getVisibleTransform()
            const contentW = vt.contentW
            const contentH = vt.contentH
            const offsetX = vt.offsetX
            const offsetY = vt.offsetY
            // Draw white mesh like backend (white lines, no glow)
            const tess = (window as any).FACEMESH_TESSELATION || (window as any).FACEMESH_TESSELLATION
            if (window.drawConnectors && tess) {
              // Manual draw to account for offsets and scaling
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 0.7
              for (const [a, b] of tess) {
                const pa = lms[a]
                const pb = lms[b]
                const ax = offsetX + pa.x * contentW
                const ay = offsetY + pa.y * contentH
                const bx = offsetX + pb.x * contentW
                const by = offsetY + pb.y * contentH
                ctx.beginPath()
                ctx.moveTo(ax, ay)
                ctx.lineTo(bx, by)
                ctx.stroke()
              }
              // Landmarks points
              ctx.fillStyle = '#ffffff'
              for (const p of lms) {
                const x = offsetX + p.x * contentW
                const y = offsetY + p.y * contentH
                ctx.beginPath()
                ctx.arc(x, y, 0.7, 0, Math.PI * 2)
                ctx.fill()
              }
            } else {
              // Fallback: draw points (simple, no glow)
              ctx.lineWidth = 1.0
              ctx.strokeStyle = '#ffffff'
              ctx.fillStyle = '#ffffff'
              for (const p of lms) {
                ctx.beginPath()
                ctx.arc(offsetX + p.x * contentW, offsetY + p.y * contentH, 1.0, 0, Math.PI * 2)
                ctx.fill()
              }
            }
            // Compute bounding box
            let xMin = 1e9, yMin = 1e9, xMax = -1e9, yMax = -1e9
            for (const p of lms) {
              const x = offsetX + p.x * contentW
              const y = offsetY + p.y * contentH
              xMin = Math.min(xMin, x)
              yMin = Math.min(yMin, y)
              xMax = Math.max(xMax, x)
              yMax = Math.max(yMax, y)
            }
            lastBoxRef.current = { xMin, yMin, xMax, yMax }
            // Normalize within the visible content rectangle for consistent status
            const normBox = { xMin: xMin - offsetX, yMin: yMin - offsetY, xMax: xMax - offsetX, yMax: yMax - offsetY }
            const pos = computePositionFromBox(normBox as any, contentW, contentH)
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
        const resizeToDisplay = () => {
          if (!overlay || !v) return
          const rect = v.getBoundingClientRect()
          overlay.width = Math.max(1, Math.round(rect.width))
          overlay.height = Math.max(1, Math.round(rect.height))
        }
        const ro = new ResizeObserver(resizeToDisplay)
        ro.observe(v)
        window.addEventListener('resize', resizeToDisplay)

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
      try {
        const vv = videoRef.current
        if (vv) {
          // @ts-ignore
          if (vv.__ro) vv.__ro.disconnect()
        }
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
    // Map box (overlay coords) into normalized coords relative to visible content rectangle
    let position: PositionData = { x: 0.5, y: 0.5, scale: 0.25 }
    if (box) {
      const rect = v.getBoundingClientRect()
      const ovW = Math.max(1, Math.round(rect.width))
      const ovH = Math.max(1, Math.round(rect.height))
      const scale = Math.min(ovW / w, ovH / h)
      const contentW = w * scale
      const contentH = h * scale
      const offsetX = (ovW - contentW) / 2
      const offsetY = (ovH - contentH) / 2
      const norm = { xMin: box.xMin - offsetX, yMin: box.yMin - offsetY, xMax: box.xMax - offsetX, yMax: box.yMax - offsetY }
      position = computePositionFromBox(norm as any, contentW, contentH)
    }
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
