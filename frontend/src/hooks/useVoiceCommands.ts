import { useState, useEffect, useRef, useCallback } from 'react'

interface VoiceCommandsConfig {
  onFieldUpdate: (field: string, value: string) => void
  onError?: (error: string) => void
  onCommandProcessed?: (command: string) => void
  onRegisterCommand?: () => void  // Nuevo: callback para comando de registro
  onTypingEffect?: (field: string, text: string) => void  // Nuevo: callback para efecto de escritura
}

interface VoiceCommandsState {
  isListening: boolean
  transcript: string
  lastCommand: string
  isProcessing: boolean
  error: string | null
  isSupported: boolean
}

// Declaración de tipos para SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives?: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

export function useVoiceCommands(config: VoiceCommandsConfig) {
  const [state, setState] = useState<VoiceCommandsState>({
    isListening: false,
    transcript: '',
    lastCommand: '',
    isProcessing: false,
    error: null,
    isSupported: false
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // Verificar soporte del navegador
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    setState(prev => ({ ...prev, isSupported: !!SpeechRecognitionAPI }))
  }, [])

  // Procesar comandos de voz
  const processVoiceCommand = useCallback((transcript: string) => {
    setState(prev => ({ ...prev, isProcessing: true }))
    
    const lowerTranscript = transcript.toLowerCase().trim()
    
    // Limpiar ruido común pero mantener información importante
    const cleanTranscript = lowerTranscript
      .replace(/[.,;:!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    console.log('Procesando comando:', cleanTranscript)

    try {
      // Comando de registro automático
      if (cleanTranscript.includes('registrar') || cleanTranscript.includes('registro')) {
        config.onRegisterCommand?.()
        setState(prev => ({ ...prev, lastCommand: 'Comando de registro ejecutado' }))
        config.onCommandProcessed?.('Registro automático activado')
        return
      }

      // Función auxiliar para efecto de escritura
      const typeText = (field: string, text: string) => {
        if (config.onTypingEffect) {
          config.onTypingEffect(field, text)
          // Simular escritura gradual
          let currentText = ''
          const chars = text.split('')
          chars.forEach((char, index) => {
            setTimeout(() => {
              currentText += char
              config.onFieldUpdate(field, currentText)
            }, index * 50) // 50ms entre cada carácter
          })
        } else {
          config.onFieldUpdate(field, text)
        }
      }

      // Patrones más flexibles para reconocer comandos
      // Nombres seguido de cualquier texto
      if (cleanTranscript.includes('nombres') || cleanTranscript.includes('nombre')) {
        const nameMatch = cleanTranscript.match(/(?:nombres?)\s+(.+)/)
        if (nameMatch && nameMatch[1]) {
          let name = nameMatch[1].trim()
          
          // Procesar nombre con correcciones específicas y capitalización
          name = processNameTranscription(name)
          
          typeText('nombres', name)
          setState(prev => ({ ...prev, lastCommand: `Nombres: ${name}` }))
          config.onCommandProcessed?.(`Nombres actualizados: ${name}`)
          return
        }
      }

      // Apellidos seguido de cualquier texto
      if (cleanTranscript.includes('apellidos')) {
        const surnameMatch = cleanTranscript.match(/apellidos\s+(.+)/)
        if (surnameMatch && surnameMatch[1]) {
          let surname = surnameMatch[1].trim()
          
          // Procesar apellido con correcciones específicas y capitalización
          surname = processNameTranscription(surname)
          
          typeText('apellidos', surname)
          setState(prev => ({ ...prev, lastCommand: `Apellidos: ${surname}` }))
          config.onCommandProcessed?.(`Apellidos actualizados: ${surname}`)
          return
        }
      }

      // Correo seguido de cualquier texto
      if (cleanTranscript.includes('correo') || cleanTranscript.includes('email')) {
        const emailMatch = cleanTranscript.match(/(?:correo|email)\s+(.+)/)
        if (emailMatch && emailMatch[1]) {
          let email = emailMatch[1].trim()
          
          // Procesar email con correcciones avanzadas
          email = processEmailTranscription(email)
          
          typeText('email', email)
          setState(prev => ({ ...prev, lastCommand: `Email: ${email}` }))
          config.onCommandProcessed?.(`Email actualizado: ${email}`)
          return
        }
      }

      // DNI seguido de cualquier texto
      if (cleanTranscript.includes('dni') || cleanTranscript.includes('documento')) {
        const dniMatch = cleanTranscript.match(/(?:dni|documento)\s+(.+)/)
        if (dniMatch && dniMatch[1]) {
          const dni = dniMatch[1].trim().replace(/\s+/g, '')
          typeText('dni', dni)
          setState(prev => ({ ...prev, lastCommand: `DNI: ${dni}` }))
          config.onCommandProcessed?.(`DNI actualizado: ${dni}`)
          return
        }
      }

      // Comandos para limpiar campos
      if (cleanTranscript.includes('limpiar nombres') || cleanTranscript.includes('borrar nombres')) {
        config.onFieldUpdate('nombres', '')
        setState(prev => ({ ...prev, lastCommand: 'Nombres limpiados' }))
        config.onCommandProcessed?.('Campo nombres limpiado')
        return
      }

      if (cleanTranscript.includes('limpiar apellidos') || cleanTranscript.includes('borrar apellidos')) {
        config.onFieldUpdate('apellidos', '')
        setState(prev => ({ ...prev, lastCommand: 'Apellidos limpiados' }))
        config.onCommandProcessed?.('Campo apellidos limpiado')
        return
      }

      if (cleanTranscript.includes('limpiar correo') || cleanTranscript.includes('limpiar email') || cleanTranscript.includes('borrar correo') || cleanTranscript.includes('borrar email')) {
        config.onFieldUpdate('email', '')
        setState(prev => ({ ...prev, lastCommand: 'Email limpiado' }))
        config.onCommandProcessed?.('Campo email limpiado')
        return
      }

      if (cleanTranscript.includes('limpiar dni') || cleanTranscript.includes('borrar dni')) {
        config.onFieldUpdate('dni', '')
        setState(prev => ({ ...prev, lastCommand: 'DNI limpiado' }))
        config.onCommandProcessed?.('Campo DNI limpiado')
        return
      }

      // Si no se reconoce el comando
      setState(prev => ({ ...prev, lastCommand: 'Comando no reconocido' }))
      config.onError?.(`Comando no reconocido: "${cleanTranscript}"`)
      
    } catch (error) {
      console.error('Error procesando comando:', error)
      config.onError?.('Error procesando el comando de voz')
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }))
    }
  }, [config])

  // Inicializar reconocimiento de voz
  const initializeRecognition = useCallback(() => {
    if (!state.isSupported) return null

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()

    // Configuración mejorada
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'es-ES'
    
    // Configurar maxAlternatives si está disponible
    if ('maxAlternatives' in recognition) {
      recognition.maxAlternatives = 1
    }

    // Eventos
    recognition.onstart = () => {
      console.log('Reconocimiento de voz iniciado')
      setState(prev => ({ ...prev, isListening: true, error: null }))
    }

    recognition.onend = () => {
      console.log('Reconocimiento de voz terminado')
      setState(prev => ({ ...prev, isListening: false }))
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setState(prev => ({ ...prev, transcript: currentTranscript }))

      // Procesar comando final
      if (finalTranscript.trim()) {
        console.log('Comando final recibido:', finalTranscript)
        processVoiceCommand(finalTranscript)
        
        // Limpiar transcript después de un tiempo
        setTimeout(() => {
          setState(prev => ({ ...prev, transcript: '' }))
        }, 3000)
      }
    }

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error)
      let errorMessage = 'Error en el reconocimiento de voz'
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó voz'
          break
        case 'audio-capture':
          errorMessage = 'No se pudo acceder al micrófono'
          break
        case 'not-allowed':
          errorMessage = 'Permisos de micrófono denegados'
          break
        case 'network':
          errorMessage = 'Error de conexión'
          break
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isListening: false 
      }))
      config.onError?.(errorMessage)
    }

    return recognition
  }, [state.isSupported, processVoiceCommand, config])

  // Iniciar escucha
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      config.onError?.('Reconocimiento de voz no soportado en este navegador')
      return
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      const recognition = initializeRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
      }
    } catch (error) {
      console.error('Error iniciando reconocimiento:', error)
      config.onError?.('Error iniciando el reconocimiento de voz')
    }
  }, [state.isSupported, initializeRecognition, config])

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setState(prev => ({ ...prev, isListening: false }))
  }, [])

  // Alternar escucha
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening
  }
}

// Función especializada para procesar emails hablados
function processEmailTranscription(text: string): string {
  let processedEmail = text.toLowerCase().trim()
  
  // 1. Eliminar espacios y convertir palabras clave
  processedEmail = processedEmail
    .replace(/\s+/g, '')
    .replace(/arroba/g, '@')
    .replace(/punto/g, '.')
  
  // 2. Correcciones específicas de nombres comunes
  processedEmail = processedEmail
    .replace(/carrillo/g, 'tarrillo')
    .replace(/carillo/g, 'tarrillo')
  
  // 3. Correcciones PRIORITARIAS de dominios más comunes
  // GMAIL - Correcciones más agresivas y prioritarias
  processedEmail = processedEmail
    .replace(/@gmailcom$/i, '@gmail.com')    // MÁS COMÚN - PRIORIDAD MÁXIMA
    .replace(/gmailcom/gi, 'gmail.com')      // Sin @ también
    .replace(/@gmacom$/i, '@gmail.com')
    .replace(/gmacom/gi, 'gmail.com')
    .replace(/@gmallcom$/i, '@gmail.com')
    .replace(/@gmalcom$/i, '@gmail.com')
    .replace(/@jmailcom$/i, '@gmail.com')
    .replace(/@gemailcom$/i, '@gmail.com')
    .replace(/@gmailco$/i, '@gmail.com')
    .replace(/@gmaico$/i, '@gmail.com')
    .replace(/@gmailc$/i, '@gmail.com')
  
  // SENATI - Correcciones más agresivas y prioritarias
  processedEmail = processedEmail
    .replace(/@sennedypeo$/i, '@senati.pe')  // NUEVO: PRIORIDAD MÁXIMA para sennedypeo
    .replace(/sennedypeo/gi, 'senati.pe')    // Sin @ también
    .replace(/@senatipe$/i, '@senati.pe')    // MÁS COMÚN - PRIORIDAD MÁXIMA
    .replace(/senatipe/gi, 'senati.pe')      // Sin @ también
    .replace(/@senatip$/i, '@senati.pe')     // SEGUNDO MÁS COMÚN
    .replace(/senatip/gi, 'senati.pe')       // Sin @ también
    .replace(/@sennatipeo$/i, '@senati.pe')
    .replace(/@senaltipe$/i, '@senati.pe')
    .replace(/@senattipe$/i, '@senati.pe')
    .replace(/@sennattipe$/i, '@senati.pe')
    .replace(/@senattip$/i, '@senati.pe')
    .replace(/@snatipe$/i, '@senati.pe')
    .replace(/@satipe$/i, '@senati.pe')
    .replace(/@saltipe$/i, '@senati.pe')
    .replace(/@sennatipe$/i, '@senati.pe')
    .replace(/@sennaltipe$/i, '@senati.pe')
    .replace(/@senattipeo$/i, '@senati.pe')
    .replace(/@senatipeo$/i, '@senati.pe')
  
  // 5. Correcciones de dominios sin punto - Hotmail
  processedEmail = processedEmail
    .replace(/@hotmailcom$/i, '@hotmail.com')
    .replace(/@otmailcom$/i, '@hotmail.com')
    .replace(/@hotmalcom$/i, '@hotmail.com')
    .replace(/@hotmeilcom$/i, '@hotmail.com')
  
  // 6. Correcciones de dominios sin punto - Outlook
  processedEmail = processedEmail
    .replace(/@outlookcom$/i, '@outlook.com')
    .replace(/@outlukcom$/i, '@outlook.com')
    .replace(/@outlokcom$/i, '@outlook.com')
    .replace(/@outlookco$/i, '@outlook.com')
  
  // 7. Agregar punto si falta en dominios conocidos
  if (processedEmail.includes('@senati') && !processedEmail.includes('.pe')) {
    processedEmail = processedEmail.replace(/@senati$/, '@senati.pe')
  }
  if (processedEmail.includes('@gmail') && !processedEmail.includes('.com')) {
    processedEmail = processedEmail.replace(/@gmail$/, '@gmail.com')
  }
  if (processedEmail.includes('@hotmail') && !processedEmail.includes('.com')) {
    processedEmail = processedEmail.replace(/@hotmail$/, '@hotmail.com')
  }
  if (processedEmail.includes('@outlook') && !processedEmail.includes('.com')) {
    processedEmail = processedEmail.replace(/@outlook$/, '@outlook.com')
  }
  
  // 8. Correcciones de variaciones de pronunciación de dominios
  processedEmail = processedEmail
    .replace(/\bsennatipeo\b/gi, 'senati.pe')  // Nuevo: corrige sennatipeo completo
    .replace(/\bsenaltipe\b/gi, 'senati.pe')   // Nuevo: corrige senaltipe completo
    .replace(/\bsennatipe\b/gi, 'senati.pe')   // Nuevo: corrige sennatipe completo
    .replace(/\bsennaltipe\b/gi, 'senati.pe')  // Nuevo: corrige sennaltipe completo
    .replace(/\bsenattipeo\b/gi, 'senati.pe')  // Nuevo: corrige senattipeo completo
    .replace(/\bsenatipeo\b/gi, 'senati.pe')   // Nuevo: corrige senatipeo completo
    .replace(/\bsnati\b/gi, 'senati')
    .replace(/\bsati\b/gi, 'senati')
    .replace(/\bsalti\b/gi, 'senati')
    .replace(/\bsaltti\b/gi, 'senati')
    .replace(/\bsalty\b/gi, 'senati')
    .replace(/\bsaltie\b/gi, 'senati')
    .replace(/\bgmai\b/gi, 'gmail')
    .replace(/\bgmeil\b/gi, 'gmail')
    .replace(/\bgmaill\b/gi, 'gmail')
    .replace(/\bgmall\b/gi, 'gmail')
    .replace(/\bjmail\b/gi, 'gmail')
  
  // 9. Validación final
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(processedEmail) ? processedEmail : text
}

// Función para procesar nombres con correcciones específicas
function processNameTranscription(text: string): string {
  let processedName = text.trim()
  
  // 1. Correcciones específicas de nombres
  processedName = processedName
    .replace(/\brosell\b/gi, 'rosel')        // Corrige rosell -> rosel
    .replace(/\bedward\b/gi, 'Eduard')       // Corrige edward -> Eduard
    .replace(/\beduardo\b/gi, 'Eduard')      // Corrige eduardo -> Eduard
  
  // 2. Capitalizar primera letra solamente
  if (processedName.length > 0) {
    processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1).toLowerCase()
  }
  
  return processedName
}