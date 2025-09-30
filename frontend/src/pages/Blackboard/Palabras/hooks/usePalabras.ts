import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTrainedGesturesAPI, recognizeGestureAPI, saveGestureAPI } from '../services/palabrasService'

// Tipos base
export type HandPoint = { x: number; y: number; z?: number }
export type RecordedFrame = {
  confidence: number
  timestamp: number
  leftHand: HandPoint[] | null
  rightHand: HandPoint[] | null
}

// Nota: evitamos extender la interfaz global de Window para prevenir conflictos de TS
declare global {
  interface Window {
    Hands: any
    HAND_CONNECTIONS: any
    MP_Camera: any
  }
}

export function usePalabras() {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastFrameRef = useRef<RecordedFrame | null>(null)
  const recordedRef = useRef<RecordedFrame[]>([])
  const recordingRef = useRef<boolean>(false)

  // Estado
  const [mpReady, setMpReady] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [rightDetected, setRightDetected] = useState(false)
  const [leftDetected, setLeftDetected] = useState(false)
  const samplesTarget = 500
  const [samplesCaptured, setSamplesCaptured] = useState(0)
  const [palabraVinculada, setPalabraVinculada] = useState<string>('')
  // Mano preferida para entrenar esta palabra: 'auto' (predominante), 'left' o 'right'
  const [preferredHand, setPreferredHand] = useState<'auto' | 'left' | 'right'>('auto')

  // Reconocimiento
  const [recognizedWord, setRecognizedWord] = useState<string | null>(null)
  const [recognitionConfidence, setRecognitionConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // UI
  const [activeTab, setActiveTab] = useState<'train' | 'test'>('train')
  const [trainedGestures, setTrainedGestures] = useState<any[]>([])

  // Sincroniza pestaña con query param
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'test' || tab === 'train') setActiveTab(tab as 'train' | 'test')
  }, [location.search])

  // Mantener ref de recording actualizado
  useEffect(() => { recordingRef.current = recording }, [recording])

  // Utilidad para cargar scripts
  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Error al cargar script ${src}`))
    document.body.appendChild(s)
  })

  // Inicialización de MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.min.js')
        // cachear clase Camera de MediaPipe para evitar colisiones
        window.MP_Camera = window.Camera

        const canvas = canvasRef.current
        if (canvas) ctxRef.current = canvas.getContext('2d')

        handsRef.current = new window.Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
        handsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3,
          selfieMode: true,
        })
        handsRef.current.onResults(onResults)
        setMpReady(true)
      } catch (e) {
        console.error(e)
        setError('No se pudieron cargar los módulos de MediaPipe')
      }
    }
    init()
    return () => { stopCamera() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Procesamiento de resultados
  const onResults = (results: any) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const video = videoRef.current
    if (!canvas || !ctx || !video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    const multi = results.multiHandLandmarks || []
    const handedness = results.multiHandedness || []
    setLeftDetected(false)
    setRightDetected(false)

    const now = Date.now()
    let frame: RecordedFrame = { confidence: 0, timestamp: now, leftHand: null, rightHand: null }

    for (let i = 0; i < multi.length; i++) {
      const pts: any[] = multi[i]
      const rawLabel = (handedness[i]?.label || '').toString().toLowerCase()
      const handLabel = rawLabel === 'left' || rawLabel === 'right' ? rawLabel : ''
      const score = handedness[i]?.score || 0

      setConfidence(prev => Math.max(prev * 0.8, score))
      if (handLabel === 'left') setLeftDetected(true)
      if (handLabel === 'right') setRightDetected(true)

      try {
        window.drawConnectors(ctx, pts, window.HAND_CONNECTIONS, { color: '#22c55e', lineWidth: 2 })
        window.drawLandmarks(ctx, pts, { color: '#ef4444', lineWidth: 1, radius: 2 })
      } catch {}

      const mapped = pts.map((p: any) => ({ x: p.x, y: p.y, z: p.z }))
      if (handLabel === 'left') frame.leftHand = mapped
      else if (handLabel === 'right') frame.rightHand = mapped
      else {
        if (!frame.rightHand) frame.rightHand = mapped
        else frame.leftHand = mapped
      }
      frame.confidence = Math.max(frame.confidence, score || 0)
    }

    if (frame.leftHand || frame.rightHand) lastFrameRef.current = frame

    if (recordingRef.current && (frame.leftHand || frame.rightHand)) {
      recordedRef.current.push(frame)
      setSamplesCaptured(recordedRef.current.length)
    }

    ctx.restore()
  }

  // Cámara
  const startCamera = async () => {
    if (!videoRef.current || !handsRef.current) return
    if (cameraRef.current) stopCamera()

    try {
      const Cam = window.MP_Camera || window.Camera
      const cam = new Cam(videoRef.current, {
        onFrame: async () => {
          if (!handsRef.current || !videoRef.current) return
          await handsRef.current.send({ image: videoRef.current })
        },
        width: 640,
        height: 360,
      })
      await cam.start()
      cameraRef.current = cam
      setCameraActive(true)
    } catch (error) {
      console.error('Error starting camera:', error)
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (cameraRef.current) {
      try { cameraRef.current.stop() } catch {}
      cameraRef.current = null
    }
    setCameraActive(false)
  }

  const toggleRecording = () => {
    if (!cameraActive) return
    setRecording(prev => {
      const starting = !prev
      if (starting) {
        // reiniciar sólo al iniciar una nueva sesión
        recordedRef.current = []
        setSamplesCaptured(0)
      }
      recordingRef.current = starting
      return starting
    })
  }

  const saveGesture = async () => {
    try {
      // Contabilizar por mano
      let rightCount = 0, leftCount = 0
      recordedRef.current.forEach(f => { if (f.rightHand) rightCount++; if (f.leftHand) leftCount++ })

      // Si el usuario eligió explícitamente una mano, filtramos los frames
      let framesToSend = recordedRef.current
      if (preferredHand === 'left') {
        framesToSend = recordedRef.current
          .filter(f => f.leftHand)
          .map(f => ({ ...f, rightHand: null }))
      } else if (preferredHand === 'right') {
        framesToSend = recordedRef.current
          .filter(f => f.rightHand)
          .map(f => ({ ...f, leftHand: null }))
      }

      // Si no hay frames resultantes por filtro, usar todos los grabados o el último frame disponible
      if (!framesToSend || framesToSend.length === 0) {
        if (recordedRef.current.length > 0) framesToSend = [...recordedRef.current]
        else if (lastFrameRef.current) framesToSend = [lastFrameRef.current]
        else framesToSend = []
      }

      // Determinar tipo_mano final
      let tipo_mano: 'left' | 'right' | 'both'
      if (preferredHand === 'left') tipo_mano = 'left'
      else if (preferredHand === 'right') tipo_mano = 'right'
      else tipo_mano = (rightCount > 0 && leftCount > 0) ? 'both' : (rightCount >= leftCount ? 'right' : 'left')

      const landmarks_izquierda = framesToSend.filter(fr => fr.leftHand).map(fr => fr.leftHand)
      const landmarks_derecha = framesToSend.filter(fr => fr.rightHand).map(fr => fr.rightHand)

      const payload: any = {
        frames: framesToSend,
        palabra: (palabraVinculada || '').toUpperCase(),
        samples: framesToSend.length,
      }
      // Solo añade campos opcionales si hay datos
      if (tipo_mano && (landmarks_izquierda.length > 0 || landmarks_derecha.length > 0)) payload.tipo_mano = tipo_mano
      if (landmarks_izquierda.length > 0) payload.landmarks_izquierda = landmarks_izquierda
      if (landmarks_derecha.length > 0) payload.landmarks_derecha = landmarks_derecha

      const resp = await saveGestureAPI(payload)
      if (resp && resp.success === false) throw new Error(resp.error || 'No se pudo guardar el gesto')

      recordedRef.current = []
      setSamplesCaptured(0)
      setRecording(false)
      window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { domain: 'palabras', action: 'save' } }))
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'No se pudo guardar el gesto')
    }
  }

  const recognizeCurrentGesture = async () => {
    if (!lastFrameRef.current) return
    const points: HandPoint[] = (lastFrameRef.current.rightHand || lastFrameRef.current.leftHand || []).map(p => ({ x: p.x, y: p.y, z: p.z }))
    if (points.length === 0) return

    try {
      const response = await recognizeGestureAPI({ frame: lastFrameRef.current })
      if (response?.success && response?.palabra_reconocida) {
        setRecognizedWord(response.palabra_reconocida.palabra_vinculada)
        setRecognitionConfidence(response.palabra_reconocida.confianza || 0)
        setError('')
      } else {
        setError(response?.error || 'No se pudo reconocer la palabra')
        setRecognizedWord('')
        setRecognitionConfidence(0)
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'No se pudo reconocer la palabra')
      setRecognizedWord('')
      setRecognitionConfidence(0)
    }
  }

  const clearRecording = () => {
    recordedRef.current = []
    setSamplesCaptured(0)
    setRecording(false)
  }

  // Cargar gestos entrenados al montar
  useEffect(() => {
    const load = async () => {
      try {
        const gestures = await getTrainedGesturesAPI()
        setTrainedGestures(gestures)
      } catch { setTrainedGestures([]) }
    }
    load()
  }, [])

  return {
    // refs
    videoRef, canvasRef,
    // estado principal
    mpReady, cameraActive, recording, confidence, rightDetected, leftDetected,
    samplesTarget, samplesCaptured,
    // acciones
    startCamera, stopCamera, toggleRecording, saveGesture, recognizeCurrentGesture, clearRecording,
    // palabra
    palabraVinculada, setPalabraVinculada,
    // ui/errores
    activeTab, setActiveTab, trainedGestures, error, setError,
    recognizedWord, recognitionConfidence,
    // mano preferida
    preferredHand, setPreferredHand,
  }
}