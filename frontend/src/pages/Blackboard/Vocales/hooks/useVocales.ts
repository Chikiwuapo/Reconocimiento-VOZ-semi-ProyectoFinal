import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTrainedGesturesAPI, recognizeGestureAPI, saveGestureAPI } from '../services/vocalesService'

// Nota: evitamos extender la interfaz global de Window para prevenir conflictos de TS
declare global {
  interface Window {
    Hands: any
    HAND_CONNECTIONS: any
  }
}

export type HandPoint = { x: number; y: number; z?: number }
export type RecordedFrame = {
  confidence: number
  timestamp: number
  leftHand: HandPoint[] | null
  rightHand: HandPoint[] | null
}

export function useVocales() {
  // Refs de cámara/canvas
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastFrameRef = useRef<RecordedFrame | null>(null)
  const recordedRef = useRef<RecordedFrame[]>([])
  const recordingRef = useRef<boolean>(false)
  const samplerRef = useRef<number | null>(null)

  // Estado
  const [mpReady, setMpReady] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [rightDetected, setRightDetected] = useState(false)
  const [leftDetected, setLeftDetected] = useState(false)
  const samplesTarget = 500
  const [samplesCaptured, setSamplesCaptured] = useState(0)
  const [vocalVinculada, setVocalVinculada] = useState<string>('A')

  // Reconocimiento
  const [recognizedVocal, setRecognizedVocal] = useState<string | null>(null)
  const [recognitionConfidence, setRecognitionConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // UI
  const [activeTab, setActiveTab] = useState<'train' | 'test'>('train')
  const [trainedGestures, setTrainedGestures] = useState<any[]>([])
  const [, forceRender] = useState(0)

  // Sincroniza la pestaña con el query param ?tab=train|test
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'test' || tab === 'train') {
      setActiveTab(tab as 'train' | 'test')
    }
  }, [location.search])

  // Mantener un ref sincronizado con el estado de recording para evitar cierres obsoletos en onResults
  useEffect(() => {
    recordingRef.current = recording
  }, [recording])

  // Fallback: mientras está grabando, muestrear el último frame detectado cada ~120ms
  useEffect(() => {
    if (samplerRef.current) {
      window.clearInterval(samplerRef.current)
      samplerRef.current = null
    }
    if (recording) {
      samplerRef.current = window.setInterval(() => {
        const lf = lastFrameRef.current
        if (!lf) return
        if (!lf.leftHand && !lf.rightHand) return
        recordedRef.current.push({ ...lf, leftHand: lf.leftHand ? [...lf.leftHand] : null, rightHand: lf.rightHand ? [...lf.rightHand] : null })
        setSamplesCaptured(recordedRef.current.length)
      }, 120)
    }
    return () => {
      if (samplerRef.current) {
        window.clearInterval(samplerRef.current)
        samplerRef.current = null
      }
    }
  }, [recording])

  // Cargar MediaPipe y configurar cámara (igual que Arithmetic)
  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Error al cargar script ${src}`))
    document.body.appendChild(script)
  })

  useEffect(() => {
    const init = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.min.js')

        const canvas = canvasRef.current
        if (canvas) ctxRef.current = canvas.getContext('2d')

        handsRef.current = new (window as any).Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
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

  // initializeHands ya no es necesario: usamos el init anterior

  const onResults = (results: any) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const video = videoRef.current
    if (!canvas || !ctx || !video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

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

  const startCamera = async () => {
    if (!videoRef.current || !handsRef.current) {
      console.warn('Camera start attempted before MediaPipe ready')
      return
    }
    if (cameraRef.current) stopCamera()
    try {
      const cam = new (window as any).Camera(videoRef.current, {
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
      setError('Error al iniciar la cámara')
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (cameraRef.current) {
      try {
        // MediaPipe Camera instance
        if (typeof cameraRef.current.stop === 'function') {
          cameraRef.current.stop()
        }
      } catch (e) {
        console.warn('Error stopping camera:', e)
      } finally {
        cameraRef.current = null
      }
    }
    setCameraActive(false)
  }

  const toggleRecording = () => {
    if (!cameraActive) return
    // Si vamos a iniciar (recording actualmente false), reiniciamos buffers y contador
    setRecording(prev => {
      const starting = !prev
      if (starting) {
        recordedRef.current = []
        setSamplesCaptured(0)
      }
      recordingRef.current = starting
      return starting
    })
  }

  const saveGesture = async () => {
    if (recordedRef.current.length === 0) {
      setError('No hay frames grabados para guardar')
      return
    }

    try {
      // Calcular mano predominante y arreglos por mano
      let rightCount = 0, leftCount = 0
      recordedRef.current.forEach(f => { if (f.rightHand) rightCount++; if (f.leftHand) leftCount++; })
      const tipo_mano: 'left' | 'right' | 'both' = (rightCount > 0 && leftCount > 0) ? 'both' : (rightCount >= leftCount ? 'right' : 'left')
      const landmarks_izquierda = recordedRef.current.filter(fr => fr.leftHand).map(fr => fr.leftHand)
      const landmarks_derecha = recordedRef.current.filter(fr => fr.rightHand).map(fr => fr.rightHand)

      const payload = {
        frames: recordedRef.current,
        vocal: vocalVinculada,
        samples: recordedRef.current.length,
        tipo_mano,
        landmarks_izquierda,
        landmarks_derecha,
      }

      await saveGestureAPI(payload)

      // Limpiar después de guardar
      recordedRef.current = []
      setSamplesCaptured(0)
      setRecording(false)
      
      // Notificar a la app para que otras vistas refresquen (p.ej. /vocales/train)
      window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { domain: 'vocales', action: 'save' } }))
      
      console.log('Gesto guardado exitosamente')
    } catch (error) {
      console.error('Error saving gesture:', error)
      setError('Error al guardar el gesto')
    }
  }

  const recognizeCurrentGesture = async () => {
    if (!lastFrameRef.current || (!lastFrameRef.current.leftHand && !lastFrameRef.current.rightHand)) {
      setError('No se detecta ninguna mano')
      return
    }

    try {
      const payload = {
        frame: lastFrameRef.current
      }

      const response = await recognizeGestureAPI(payload)
      
      if (response.success && response.vocal_reconocida) {
        setRecognizedVocal(response.vocal_reconocida.vocal_vinculada)
        setRecognitionConfidence(response.vocal_reconocida.confianza || 0)
        setError(null)
      } else {
        setError(response.error || 'No se pudo reconocer la vocal')
      }
    } catch (error) {
      console.error('Error recognizing gesture:', error)
      setError('Error al reconocer el gesto')
    }
  }

  const loadTrainedGestures = async () => {
    try {
      const gestures = await getTrainedGesturesAPI()
      setTrainedGestures(gestures)
    } catch (error) {
      console.error('Error loading trained gestures:', error)
    }
  }

  const clearRecording = () => {
    recordedRef.current = []
    setSamplesCaptured(0)
    setRecording(false)
  }

  // Cargar gestos entrenados al montar
  useEffect(() => {
    loadTrainedGestures()
  }, [])

  return {
    // Refs
    videoRef,
    canvasRef,
    
    // Estado de MediaPipe y cámara
    mpReady,
    cameraActive,
    startCamera,
    stopCamera,
    
    // Grabación
    recording,
    toggleRecording,
    samplesCaptured,
    samplesTarget,
    saveGesture,
    clearRecording,
    
    // Detección de manos
    leftDetected,
    rightDetected,
    confidence,
    
    // Configuración de vocal
    vocalVinculada,
    setVocalVinculada,
    
    // Reconocimiento
    recognizeCurrentGesture,
    recognizedVocal,
    recognitionConfidence,
    
    // UI
    activeTab,
    setActiveTab,
    trainedGestures,
    error,
    setError,
    
    // Utilidades
    forceRender: () => forceRender(prev => prev + 1)
  }
}