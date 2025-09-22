import { useEffect, useRef, useState } from 'react'
import { apiFetch, calculateAPI, getTrainedGesturesAPI, recognizeGestureAPI, saveGestureAPI } from '../services/arithmeticService'

declare global {
  interface Window {
    Hands: any
    Camera: any
    drawConnectors: any
    drawLandmarks: any
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

export function useArithmetic() {
  // Refs de cámara/canvas
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastFrameRef = useRef<RecordedFrame | null>(null)
  const recordedRef = useRef<RecordedFrame[]>([])
  const currentOperationRef = useRef<string[]>([])

  // Estado
  const [mpReady, setMpReady] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [recording, setRecording] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [rightDetected, setRightDetected] = useState(false)
  const [leftDetected, setLeftDetected] = useState(false)
  const samplesTarget = 50
  const [samplesCaptured, setSamplesCaptured] = useState(0)
  const [gestureMode, setGestureMode] = useState<'numero' | 'operacion'>('operacion')
  const [numeroVinculado, setNumeroVinculado] = useState<number>(1)
  const [operacionVinculada, setOperacionVinculada] = useState<string>('suma')

  // Cálculo
  const [operando1, setOperando1] = useState('')
  const [operador, setOperador] = useState('+')
  const [operando2, setOperando2] = useState('')
  const [loadingCalc, setLoadingCalc] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [expresion, setExpresion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // UI
  const [activeTab, setActiveTab] = useState<'train' | 'test'>('train')
  const [trainedGestures, setTrainedGestures] = useState<any[]>([])
  const [chartData, setChartData] = useState<number[]>([])
  const [showChart, setShowChart] = useState(false)
  const [, forceRender] = useState(0)

  // Scripts MediaPipe
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

  // Cargar gestos entrenados al entrar en prueba
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrainedGesturesAPI()
        setTrainedGestures(res?.gestos || [])
      } catch {
        setTrainedGestures([])
      }
    }
    if (activeTab === 'test') load()
  }, [activeTab])

  const startCamera = async () => {
    if (!videoRef.current || !handsRef.current) {
      console.warn('Camera start attempted before MediaPipe ready')
      return
    }
    const cam = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (!handsRef.current || !videoRef.current) return
        await handsRef.current.send({ image: videoRef.current })
      },
      width: 640,
      height: 360,
    })
    cam.start()
    cameraRef.current = cam
    setCameraActive(true)
  }

  const stopCamera = () => {
    try { cameraRef.current?.stop() } catch {}
    setCameraActive(false)
  }

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

    if (recording && (frame.leftHand || frame.rightHand)) {
      if (recordedRef.current.length % 10 === 0) console.debug('Recording frame', recordedRef.current.length + 1)
      recordedRef.current.push(frame)
      setSamplesCaptured(recordedRef.current.length)
    } else if (recording && multi.length === 0) {
      console.warn('Recording is ON but no hands detected in this frame')
    }

    ctx.restore()
  }

  const toggleRecording = () => {
    if (!cameraActive) return
    if (!recording) recordedRef.current = []
    setSamplesCaptured(0)
    setRecording(v => !v)
  }

  const saveGesture = async () => {
    if (recordedRef.current.length === 0) return
    setError(null)

    let rightCount = 0, leftCount = 0
    recordedRef.current.forEach(f => { if (f.rightHand) rightCount++; if (f.leftHand) leftCount++; })
    const predominant = rightCount >= leftCount ? 'right' : 'left'

    const processed = recordedRef.current.map(f => ({
      confidence: f.confidence,
      timestamp: f.timestamp,
      leftHand: f.leftHand ? f.leftHand.map(p => ({ x: p.x, y: p.y, z: p.z })) : null,
      rightHand: f.rightHand ? f.rightHand.map(p => ({ x: p.x, y: p.y, z: p.z })) : null,
    }))

    const landmarks_izquierda = processed.filter(fr => fr.leftHand).map(fr => fr.leftHand)
    const landmarks_derecha = processed.filter(fr => fr.rightHand).map(fr => fr.rightHand)

    const payload: any = {
      numero_vinculado: gestureMode === 'numero' ? Number(numeroVinculado) : null,
      operacion_vinculada: gestureMode === 'operacion' ? operacionVinculada : null,
      landmarks_data: processed,
      numero_muestras: recordedRef.current.length,
      tipo_mano: predominant,
      landmarks_izquierda,
      landmarks_derecha,
    }

    console.debug('Saving gesture. Samples:', recordedRef.current.length)
    const data = await saveGestureAPI(payload)
    if (!data?.success) throw new Error(data?.error || 'No se pudo guardar el gesto')

    const confidences = recordedRef.current.map(f => Math.round((f.confidence || 0) * 100))
    setChartData(confidences)
    setShowChart(true)

    recordedRef.current = []
    setSamplesCaptured(0)
    setRecording(false)
    window.dispatchEvent(new CustomEvent('app:notify', { detail: 'Gesto guardado exitosamente' }))
  }

  const recognizeCurrent = async () => {
    if (!lastFrameRef.current) return
    setError(null)

    const points: HandPoint[] = (lastFrameRef.current.rightHand || lastFrameRef.current.leftHand || []).map(p => ({ x: p.x, y: p.y, z: p.z }))
    if (points.length === 0) return

    const data = await recognizeGestureAPI(points)
    if (!data?.success) throw new Error(data?.error || 'No se pudo reconocer el gesto')

    const recog = data.gesto_reconocido || {}
    let token = ''
    if (typeof recog.numero_vinculado === 'number') {
      token = String(recog.numero_vinculado)
    } else if (recog.operacion_vinculada) {
      const map: Record<string, string> = { suma: '+', resta: '-', multiplicacion: '*', division: '/' }
      token = map[recog.operacion_vinculada] || recog.valor_display || ''
    } else if (recog.valor_display) {
      token = String(recog.valor_display)
      if (token === '×') token = '*'
      if (token === '÷') token = '/'
    }

    if (token) {
      const seq = currentOperationRef.current
      if (seq[seq.length - 1] !== token) {
        seq.push(token)
        forceRender(x => x + 1)
      }
    }
  }

  const clearOperation = () => {
    currentOperationRef.current = []
    forceRender(x => x + 1)
  }

  const calculateFromOperation = async () => {
    const seq = currentOperationRef.current
    if (seq.length !== 3) {
      setError('La operación debe ser del tipo: número operador número')
      return
    }
    setOperando1(seq[0])
    setOperador(seq[1])
    setOperando2(seq[2])
    await calcular(new Event('submit') as any)
  }

  const calcular = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCalc(true)
    setError(null)
    setResultado(null)
    setExpresion(null)
    try {
      const data = await calculateAPI({ operando1, operador, operando2, gestos_utilizados: [] })
      if (!data?.success) throw new Error(data?.error || 'Error al calcular')
      setResultado(data.resultado)
      setExpresion(data.expresion)
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoadingCalc(false)
    }
  }

  return {
    // refs
    videoRef, canvasRef,
    // estado principal
    cameraActive, recording, confidence, rightDetected, leftDetected,
    samplesTarget, samplesCaptured, gestureMode, numeroVinculado, operacionVinculada,
    operando1, operador, operando2, loadingCalc, resultado, expresion, error,
    activeTab, trainedGestures, chartData, showChart,
    // setters
    setGestureMode, setNumeroVinculado, setOperacionVinculada,
    setOperando1, setOperador, setOperando2,
    setActiveTab, setShowChart, setError,
    // acciones
    startCamera, stopCamera, toggleRecording, saveGesture, recognizeCurrent,
    clearOperation, calculateFromOperation, calcular,
    // util
    currentOperationRef, mpReady,
  }
}
