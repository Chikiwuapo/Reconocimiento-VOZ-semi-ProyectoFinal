import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { calculateAPI, getTrainedGesturesAPI, recognizeGestureAPI, saveGestureAPI } from '../services/arithmeticService'

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
  const currentGestureIdsRef = useRef<number[]>([])
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

  // Nuevos estados para reconocimiento automático y secuencia
  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  const [autoRecognition, setAutoRecognition] = useState(false)
  const [lastGestureTime, setLastGestureTime] = useState<number>(0)

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
    // limpiar cualquier intervalo previo
    if (samplerRef.current) {
      window.clearInterval(samplerRef.current)
      samplerRef.current = null
    }

    if (recording) {
      samplerRef.current = window.setInterval(() => {
        const lf = lastFrameRef.current
        if (!lf) return
        if (!lf.leftHand && !lf.rightHand) return
        // Empuja una copia ligera del último frame
        recordedRef.current.push({ ...lf, leftHand: lf.leftHand ? [...lf.leftHand] : null, rightHand: lf.rightHand ? [...lf.rightHand] : null })
        setSamplesCaptured(recordedRef.current.length)
        if (recordedRef.current.length % 5 === 0) console.debug('Sampler pushed frames:', recordedRef.current.length)
      }, 120)
    }
    return () => {
      if (samplerRef.current) {
        window.clearInterval(samplerRef.current)
        samplerRef.current = null
      }
    }
  }, [recording])

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
    
    // Detener cámara existente si hay una
    if (cameraRef.current) {
      stopCamera()
    }
    
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
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (cameraRef.current) {
      try { 
        cameraRef.current.stop() 
        cameraRef.current = null
      } catch (e) {
        console.warn('Error stopping camera:', e)
      }
    }
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

    if (recordingRef.current && (frame.leftHand || frame.rightHand)) {
      if (recordedRef.current.length % 10 === 0) console.debug('Recording frame', recordedRef.current.length + 1)
      recordedRef.current.push(frame)
      setSamplesCaptured(recordedRef.current.length)
    } else if (recordingRef.current && multi.length === 0) {
      console.warn('Recording is ON but no hands detected in this frame')
    }

    ctx.restore()
  }

  const toggleRecording = () => {
    if (!cameraActive) return
    if (!recording) recordedRef.current = []
    setSamplesCaptured(0)
    setRecording(v => {
      const next = !v
      recordingRef.current = next
      return next
    })
  }

  // Helper para construir y enviar payload; si requireTwoHands=true exige frames con ambas manos
  const saveGestureInternal = async (requireTwoHands: boolean) => {
    if (!cameraActive) {
      setError('La cámara no está activa')
      return
    }
    if (recordedRef.current.length === 0) {
      setError('No hay muestras grabadas. Presiona "Grabar Gesto" y realiza el gesto frente a la cámara.')
      return
    }
    setError(null)

    let rightCount = 0, leftCount = 0
    recordedRef.current.forEach(f => { if (f.rightHand) rightCount++; if (f.leftHand) leftCount++; })
    const predominant = rightCount >= leftCount ? 'right' : 'left'
    if (rightCount + leftCount === 0) {
      setError('No se detectaron manos en las muestras grabadas. Acerca tu mano y vuelve a intentarlo.')
      return
    }

    // Normaliza frames y evita payloads gigantes
    const normalized = recordedRef.current.map(f => ({
      confidence: f.confidence || 0,
      timestamp: f.timestamp,
      leftHand: f.leftHand ? f.leftHand.map(p => ({ x: p.x, y: p.y, z: p.z })) : null,
      rightHand: f.rightHand ? f.rightHand.map(p => ({ x: p.x, y: p.y, z: p.z })) : null,
    }))
    const MAX_SAMPLES = 600
    const processed = normalized.slice(0, MAX_SAMPLES)

    const framesBoth = processed.filter(fr => fr.leftHand && fr.rightHand)
    const leftOnly = processed.filter(fr => fr.leftHand && !fr.rightHand)
    const rightOnly = processed.filter(fr => fr.rightHand && !fr.leftHand)
    const landmarks_izquierda = processed.filter(fr => fr.leftHand).map(fr => fr.leftHand)
    const landmarks_derecha = processed.filter(fr => fr.rightHand).map(fr => fr.rightHand)

    if (requireTwoHands && framesBoth.length === 0) {
      setError('Para entrenar con 2 manos, asegúrate de que ambas estén visibles en la cámara durante la grabación.')
      return
    }

    // Construir payload base
    const payload: any = {
      numero_vinculado: gestureMode === 'numero' ? Number(numeroVinculado) : null,
      operacion_vinculada: gestureMode === 'operacion' ? operacionVinculada : null,
      landmarks_data: processed,
      numero_muestras: processed.length,
      tipo_mano: predominant,
      landmarks_izquierda,
      landmarks_derecha,
      dos_manos: framesBoth.length > 0,
      frames_dos_manos: framesBoth,
      frames_izquierda_solo: leftOnly,
      frames_derecha_solo: rightOnly,
    }

    // Si se requiere entrenar con 2 manos, normalizar explícitamente a 'both' y
    // enviar sólo los frames donde aparecen ambas manos como landmarks_data
    if (requireTwoHands) {
      payload.tipo_mano = 'both'
      payload.landmarks_data = framesBoth
      payload.numero_muestras = framesBoth.length
    }

    try {
      const data = await saveGestureAPI(payload)
      if (!data?.success) throw new Error(data?.error || 'No se pudo guardar el gesto')

      const confidences = recordedRef.current.map(f => Math.round((f.confidence || 0) * 100))
      setChartData(confidences)
      setShowChart(true)

      recordedRef.current = []
      setSamplesCaptured(0)
      setRecording(false)
      window.dispatchEvent(new CustomEvent('app:notify', { detail: data?.message || 'Gesto guardado exitosamente' }))
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'No se pudo guardar el gesto')
      window.dispatchEvent(new CustomEvent('app:notify', { detail: e?.message || 'No se pudo guardar el gesto' }))
    }
  }

  // Exponer funciones públicas de guardado
  const saveGesture = async () => saveGestureInternal(false)
  const saveGestureTwoHands = async () => saveGestureInternal(true)

  const recognizeCurrent = async () => {
    if (!lastFrameRef.current) return
    setError(null)

    const points: HandPoint[] = (lastFrameRef.current.rightHand || lastFrameRef.current.leftHand || []).map(p => ({ x: p.x, y: p.y, z: p.z }))
    if (points.length === 0) return

    try {
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
          // asociar id de gesto si está presente
          const gid = typeof recog.id === 'number' ? recog.id : null
          if (gid != null) currentGestureIdsRef.current.push(gid)
          else currentGestureIdsRef.current.push(-1)
          forceRender(x => x + 1)
        }
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'No se pudo reconocer el gesto')
      window.dispatchEvent(new CustomEvent('app:notify', { detail: e?.message || 'No se pudo reconocer el gesto' }))
    }
  }

  const clearOperation = () => {
    currentOperationRef.current = []
    currentGestureIdsRef.current = []
    setCurrentSequence([])
    forceRender(x => x + 1)
  }

  const calculateFromOperation = async () => {
    const seq = currentOperationRef.current
    if (seq.length !== 3) {
      setError('La operación debe ser del tipo: número operador número')
      return
    }
    
    // Validar que la secuencia tenga el formato correcto: número, operador, número
    const [num1, op, num2] = seq
    const isValidNumber = (val: string) => !isNaN(Number(val)) && val !== ''
    const isValidOperator = (val: string) => ['+', '-', '×', '÷', '*', '/'].includes(val)
    
    if (!isValidNumber(num1) || !isValidOperator(op) || !isValidNumber(num2)) {
      setError('Formato de operación inválido. Debe ser: número → operador → número')
      return
    }
    
    // Actualiza UI
    setOperando1(num1)
    setOperador(op)
    setOperando2(num2)

    // Ejecuta cálculo directamente con los valores actuales para evitar condición de carrera
    setLoadingCalc(true)
    setError(null)
    setResultado(null)
    setExpresion(null)
    try {
      const ids = currentGestureIdsRef.current.filter(id => typeof id === 'number' && id > 0).slice(0, 3)
      const data = await calculateAPI({ operando1: num1, operador: op, operando2: num2, gestos_utilizados: ids })
      if (!data?.success) throw new Error(data?.error || 'Error al calcular')
      setResultado(data.resultado)
      setExpresion(data.expresion)
      
      // Limpiar la operación después del cálculo exitoso
      setTimeout(() => {
        clearOperation()
      }, 3000) // Esperar 3 segundos para mostrar el resultado
      
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoadingCalc(false)
    }
  }

  const calcular = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCalc(true)
    setError(null)
    setResultado(null)
    setExpresion(null)
    try {
      // tomar hasta 3 ids válidos de los gestos reconocidos para asociar con la operación
      const ids = currentGestureIdsRef.current.filter(id => typeof id === 'number' && id > 0).slice(0, 3)
      const data = await calculateAPI({ operando1, operador, operando2, gestos_utilizados: ids })
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
    currentSequence, autoRecognition, lastGestureTime,
    // setters
    setGestureMode, setNumeroVinculado, setOperacionVinculada,
    setOperando1, setOperador, setOperando2,
    setActiveTab, setShowChart, setError,
    setCurrentSequence, setAutoRecognition, setLastGestureTime,
    // acciones
    startCamera, stopCamera, toggleRecording, saveGesture, saveGestureTwoHands, recognizeCurrent,
    clearOperation, calculateFromOperation, calcular,
    // util
    currentOperationRef, mpReady,
  }
}