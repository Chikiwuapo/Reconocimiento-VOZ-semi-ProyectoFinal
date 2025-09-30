import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTrainedGesturesAPI, recognizeGestureAPI, saveGestureAPI } from '../services/abecedarioService'

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

export function useAbecedario() {
  // Refs de cámara/canvas
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastFrameRef = useRef<RecordedFrame | null>(null)
  const recordedRef = useRef<RecordedFrame[]>([])
  const recordingRef = useRef<boolean>(false)
  // samplerRef eliminado: ya no se usa; el muestreo ocurre en onResults

  // Estado
  const [mpReady, setMpReady] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [rightDetected, setRightDetected] = useState(false)
  const [leftDetected, setLeftDetected] = useState(false)
  const samplesTarget = 500
  const [samplesCaptured, setSamplesCaptured] = useState(0)
  const [letraVinculada, setLetraVinculada] = useState<string>('A')

  // Reconocimiento
  const [recognizedLetter, setRecognizedLetter] = useState<string | null>(null)
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

  // Eliminamos el sampler: el push de frames ocurrirá en onResults como en Vocales

  // Cargar MediaPipe y configurar cámara
  useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // Cargar MediaPipe Hands
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.min.js'
        script.onload = () => {
          const handsScript = document.createElement('script')
          handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.min.js'
          handsScript.onload = () => {
            const drawingScript = document.createElement('script')
            drawingScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.min.js'
            drawingScript.onload = () => {
              initializeHands()
            }
            document.head.appendChild(drawingScript)
          }
          document.head.appendChild(handsScript)
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('Error loading MediaPipe:', error)
        setError('Error al cargar MediaPipe')
      }
    }

    loadMediaPipe()
  }, [])

  const initializeHands = () => {
    if (!window.Hands) return

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      selfieMode: true,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3
    })

    hands.onResults(onResults)
    handsRef.current = hands
    setMpReady(true)
  }

  const onResults = (results: any) => {
    if (!canvasRef.current) return
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d')
      if (!ctxRef.current) return
    }

    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const video = videoRef.current
    // Igual que Arithmetic/Vocales: sincronizar tamaño del canvas con el video en cada frame
    if (video) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    let leftHand: HandPoint[] | null = null
    let rightHand: HandPoint[] | null = null
    let maxConfidence = 0

    // Reset de flags antes de procesar (como Arithmetic)
    setLeftDetected(false)
    setRightDetected(false)

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i]
        const handedness = results.multiHandedness[i]
        const isLeft = handedness.label === 'Left'
        
        maxConfidence = Math.max(maxConfidence, handedness.score)

        const handPoints: HandPoint[] = landmarks.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z
        }))

        if (isLeft) {
          leftHand = handPoints
          setLeftDetected(true)
        } else {
          rightHand = handPoints
          setRightDetected(true)
        }

        // Dibujar landmarks
        const drawConn = (window as any).drawConnectors
        const drawLm = (window as any).drawLandmarks
        const HAND_CONNECTIONS = (window as any).HAND_CONNECTIONS
        if (drawConn && drawLm && HAND_CONNECTIONS) {
          drawConn(ctx as any, landmarks, HAND_CONNECTIONS, { color: '#22c55e', lineWidth: 2 })
          drawLm(ctx as any, landmarks, { color: '#ef4444', lineWidth: 1, radius: 2 })
        }
      }
    }

    // Actualizar detección
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setLeftDetected(false)
      setRightDetected(false)
      maxConfidence = 0
    }

    // Suavizado de confianza como Arithmetic/Vocales
    setConfidence(prev => Math.max(prev * 0.8, maxConfidence))

    // Guardar frame para grabación (como en Vocales)
    const frame: RecordedFrame = {
      confidence: maxConfidence,
      timestamp: Date.now(),
      leftHand,
      rightHand
    }
    lastFrameRef.current = frame
    if (recordingRef.current && (leftHand || rightHand)) {
      recordedRef.current.push({ ...frame, leftHand: leftHand ? [...leftHand] : null, rightHand: rightHand ? [...rightHand] : null })
      setSamplesCaptured(recordedRef.current.length)
    }

    ctx.restore()
  }

  const startCamera = async () => {
    try {
      if (!videoRef.current || !handsRef.current) return

      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 360
      })

      cameraRef.current = camera
      camera.start()

      // Ajustar canvas cuando el video esté listo
      videoRef.current.onloadedmetadata = () => {
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          ctxRef.current = canvasRef.current.getContext('2d')
        }
      }

      setCameraActive(true)
    } catch (error) {
      console.error('Error starting camera:', error)
      setError('Error al iniciar la cámara')
    }
  }

  const stopCamera = () => {
    if (cameraRef.current) {
      try {
        if (typeof cameraRef.current.stop === 'function') cameraRef.current.stop()
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
      // Calcular mano predominante y arreglos por mano (igual que Vocales)
      let rightCount = 0, leftCount = 0
      recordedRef.current.forEach(f => { if (f.rightHand) rightCount++; if (f.leftHand) leftCount++; })
      const tipo_mano: 'left' | 'right' | 'both' = (rightCount > 0 && leftCount > 0) ? 'both' : (rightCount >= leftCount ? 'right' : 'left')
      const landmarks_izquierda = recordedRef.current.filter(fr => fr.leftHand).map(fr => fr.leftHand)
      const landmarks_derecha = recordedRef.current.filter(fr => fr.rightHand).map(fr => fr.rightHand)

      const payload = {
        frames: recordedRef.current,
        letra: letraVinculada,
        samples: recordedRef.current.length,
        tipo_mano,
        landmarks_izquierda,
        landmarks_derecha,
      }

      const resp = await saveGestureAPI(payload)
      if (resp && (resp.success === false)) {
        throw new Error(resp.error || 'No se pudo guardar el gesto')
      }
      
      // Limpiar después de guardar
      recordedRef.current = []
      setSamplesCaptured(0)
      setRecording(false)
      
      // Recargar/Notificar
      loadTrainedGestures()
      window.dispatchEvent(new CustomEvent('app:dataChanged', { detail: { domain: 'abecedario', action: 'save' } }))
      
      console.log('Gesto guardado exitosamente')
    } catch (error: any) {
      console.error('Error saving gesture:', error)
      setError(error?.message || 'Error al guardar el gesto')
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
      
      if (response.success && response.letra_reconocida) {
        setRecognizedLetter(response.letra_reconocida.letra_vinculada)
        setRecognitionConfidence(response.letra_reconocida.confianza || 0)
        setError(null)
      } else {
        setError(response.error || 'No se pudo reconocer la letra')
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
    
    // Configuración de letra
    letraVinculada,
    setLetraVinculada,
    
    // Reconocimiento
    recognizeCurrentGesture,
    recognizedLetter,
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