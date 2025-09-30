// voice_form_commands.js - Sistema automático de transcripción de voz para formularios
class VoiceFormCommands {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isEnabled = false;
        this.commands = new Map();
        this.feedbackElement = null;
        this.statusElement = null;
        this.currentField = null;
        this.autoMode = false; // Modo automático DESHABILITADO por defecto
        
        this.initializeElements();
        this.initializeCommands();
        this.setupSpeechRecognition();
        this.createFeedbackElements();
        this.setupFieldFocusDetection();
    }

    initializeElements() {
        // Mapeo de campos del formulario
        this.formFields = {
            'nombres': document.querySelector('input[name="nombres"]'),
            'apellidos': document.querySelector('input[name="apellidos"]'),
            'email': document.querySelector('input[name="email"]'),
            'dni': document.querySelector('input[name="dni"]')
        };
    }

    setupFieldFocusDetection() {
        // DESHABILITADO: Ya no detectamos foco para transcripción automática
        // Los campos solo se llenan cuando se mencionan explícitamente
        Object.entries(this.formFields).forEach(([fieldName, field]) => {
            if (field) {
                field.addEventListener('focus', () => {
                    this.currentField = fieldName;
                    if (this.isEnabled) {
                        this.showStatus(`🎤 Para llenar ${fieldName}, di: "nombres [tu nombre]" o "escribe en ${fieldName} [contenido]"`, 'info');
                    }
                });

                field.addEventListener('blur', () => {
                    if (this.currentField === fieldName) {
                        this.currentField = null;
                        if (this.isEnabled) {
                            this.showStatus('🎤 Escuchando comandos de voz...', 'listening');
                        }
                    }
                });
            }
        });
    }

    initializeCommands() {
        // SISTEMA OPTIMIZADO PARA EXTRACCIÓN PRECISA
        
        // Patrón principal: "acción + campo + valor" - Captura "Ingresa el nombre Fabrizio"
        this.commands.set(/^(escribe|escribir|coloca|colocar|ingresa|ingresar|pon|poner|introduce|introducir)\s+(el\s+)?(nombre|nombres|apellido|apellidos|correo|email|dni|documento)\s+(.+)/i, (match) => {
            const action = match[1].toLowerCase();
            const fieldName = this.normalizeFieldName(match[3].toLowerCase());
            const value = match[4].trim();
            
            if (this.isValidField(fieldName)) {
                const processedValue = this.processValueForField(fieldName, value);
                this.fillField(fieldName, processedValue);
                // Respuesta concisa sin información redundante
                this.showSuccess(`✅ ${processedValue}`);
            } else {
                this.showError(`❌ Campo no reconocido`);
            }
        });

        // Comando universal alternativo: "acción en [campo] [valor]"
        this.commands.set(/^(escribe|escribir|coloca|colocar|ingresa|ingresar|pon|poner|introduce|introducir)\s+en\s+(\w+)\s+(.+)/i, (match) => {
            const action = match[1].toLowerCase();
            const fieldName = this.normalizeFieldName(match[2].toLowerCase());
            const value = match[3].trim();
            
            if (this.isValidField(fieldName)) {
                const processedValue = this.processValueForField(fieldName, value);
                this.fillField(fieldName, processedValue);
                this.showSuccess(`✅ ${processedValue}`);
            } else {
                this.showError(`❌ Campo no reconocido`);
            }
        });

        // Comandos directos optimizados - extraen solo el contenido relevante
        // Variante 1: "Nombres Eduard Fabrizio"
        this.commands.set(/^nombres?\s+(.+)/i, (match) => {
            const cleanContent = this.processNameTranscription(match[1].trim());
            this.fillField('nombres', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/^apellidos?\s+(.+)/i, (match) => {
            const cleanContent = this.processLastNameTranscription(match[1].trim());
            this.fillField('apellidos', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/^(?:email|correo)\s+(.+)/i, (match) => {
            const cleanContent = this.processEmailTranscription(match[1].trim());
            this.fillField('email', cleanContent);
        });

        this.commands.set(/^dni\s+(.+)/i, (match) => {
            const dniValue = this.extractDNINumbers(match[1]);
            this.fillField('dni', dniValue);
        });

        // Comandos con prefijos específicos - Variante 2: "En nombres coloca Eduard Fabrizio"
        this.commands.set(/^(?:en\s+)?nombres?\s+(?:coloca|pon|poner|escribe|escribir|introduce|introducir)\s+(.+)/i, (match) => {
            const cleanContent = this.processNameTranscription(match[1].trim());
            this.fillField('nombres', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/^(?:en\s+)?apellidos?\s+(?:coloca|pon|poner|escribe|escribir|introduce|introducir)\s+(.+)/i, (match) => {
            const cleanContent = this.processLastNameTranscription(match[1].trim());
            this.fillField('apellidos', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/^(?:en\s+)?(?:email|correo)\s+(?:coloca|pon|poner|escribe|escribir|introduce|introducir)\s+(.+)/i, (match) => {
            const cleanContent = this.processEmailTranscription(match[1].trim());
            this.fillField('email', cleanContent);
        });

        this.commands.set(/^(?:en\s+)?(?:dni|documento)\s+(?:coloca|pon|poner|escribe|escribir|introduce|introducir)\s+(.+)/i, (match) => {
            const dniValue = this.extractDNINumbers(match[1]);
            this.fillField('dni', dniValue);
        });

        // Comandos tradicionales optimizados - evitan textos literales
        this.commands.set(/(?:escribe|escribir|poner|pon|coloca|colocar|introduce|introducir)\s+(?:en\s+)?nombres?\s+(.+)/i, (match) => {
            const cleanContent = this.processNameTranscription(match[1].trim());
            this.fillField('nombres', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/(?:escribe|escribir|poner|pon|coloca|colocar|introduce|introducir)\s+(?:en\s+)?apellidos?\s+(.+)/i, (match) => {
            const cleanContent = this.processLastNameTranscription(match[1].trim());
            this.fillField('apellidos', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/(?:escribe|escribir|poner|pon|coloca|colocar|introduce|introducir)\s+(?:en\s+)?(?:email|correo|correo electrónico)\s+(.+)/i, (match) => {
            const cleanContent = this.processEmailTranscription(match[1].trim());
            this.fillField('email', cleanContent);
        });

        this.commands.set(/(?:escribe|escribir|poner|pon|coloca|colocar|introduce|introducir)\s+(?:en\s+)?(?:dni|documento|cédula|identificación)\s+(.+)/i, (match) => {
            const dniValue = this.extractDNINumbers(match[1]);
            this.fillField('dni', dniValue);
        });

        // Comandos naturales optimizados
        this.commands.set(/mi nombre es (.+)/i, (match) => {
            const cleanContent = this.cleanTextContent(match[1].trim());
            this.fillField('nombres', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/mis apellidos son (.+)/i, (match) => {
            const cleanContent = this.cleanTextContent(match[1].trim());
            this.fillField('apellidos', this.capitalizeWords(cleanContent));
        });

        this.commands.set(/mi (?:email|correo) es (.+)/i, (match) => {
            const cleanContent = this.cleanTextContent(match[1].trim());
            this.fillField('email', this.processEmailTranscription(cleanContent));
        });

        this.commands.set(/mi dni es (.+)/i, (match) => {
            const dniValue = this.extractDNINumbers(match[1]);
            this.fillField('dni', dniValue);
        });

        // Comandos específicos de limpieza optimizados con variantes naturales
        this.commands.set(/(?:borra|borrar|elimina|eliminar|limpia|limpiar|limpiame|borrame|vaciame|vaciame)\s+(?:lo\s+que\s+hay\s+en\s+|el\s+contenido\s+de\s+|todo\s+de\s+|el\s+campo\s+|el\s+)?nombres?/i, () => {
            this.clearField('nombres');
            this.showSuccess('✅ Campo nombres limpiado');
        });

        this.commands.set(/(?:borra|borrar|elimina|eliminar|limpia|limpiar|limpiame|borrame|vaciame|vaciame)\s+(?:lo\s+que\s+hay\s+en\s+|el\s+contenido\s+de\s+|todo\s+de\s+|el\s+campo\s+|los\s+)?apellidos?/i, () => {
            this.clearField('apellidos');
            this.showSuccess('✅ Campo apellidos limpiado');
        });

        this.commands.set(/(?:borra|borrar|elimina|eliminar|limpia|limpiar|limpiame|borrame|vaciame|vaciame)\s+(?:lo\s+que\s+hay\s+en\s+|el\s+contenido\s+de\s+|todo\s+de\s+|el\s+campo\s+|el\s+)?(?:email|correo)/i, () => {
            this.clearField('email');
            this.showSuccess('✅ Campo email limpiado');
        });

        this.commands.set(/(?:borra|borrar|elimina|eliminar|limpia|limpiar|limpiame|borrame|vaciame|vaciame)\s+(?:lo\s+que\s+hay\s+en\s+|el\s+contenido\s+de\s+|todo\s+de\s+|el\s+campo\s+|el\s+)?(?:dni|documento)/i, () => {
            this.clearField('dni');
            this.showSuccess('✅ Campo DNI limpiado');
        });

        // Comando general de limpieza (mantener compatibilidad)
        this.commands.set(/(?:limpiar|borrar|vaciar)\s+(.+)/i, (match) => {
            const fieldName = this.extractFieldName(match[1]);
            if (fieldName) {
                this.clearField(fieldName);
            }
        });

        // Comandos de control
        this.commands.set(/(?:activar|activar comandos|iniciar comandos|empezar comandos)/i, () => {
            this.startListening();
        });

        this.commands.set(/(?:desactivar|desactivar comandos|parar comandos|detener comandos)/i, () => {
            this.stopListening();
        });

        this.commands.set(/(?:modo automático|activar automático|auto)/i, () => {
            this.autoMode = true;
            this.showSuccess('✅ Modo automático activado');
        });

        this.commands.set(/(?:modo manual|desactivar automático|manual)/i, () => {
            this.autoMode = false;
            this.showSuccess('✅ Modo manual activado');
        });

        // Comandos de acción del formulario
        this.commands.set(/(?:registrar|registrarme|crear cuenta|enviar formulario)/i, () => {
            this.submitForm();
        });

        this.commands.set(/(?:activar voz|habilitar voz|registro de voz)/i, () => {
            this.clickButton('btnVoiceRegister');
        });
    }

    // NUEVAS FUNCIONES PARA EL SISTEMA OPTIMIZADO

    // Normalizar nombres de campos para mayor flexibilidad
    normalizeFieldName(fieldName) {
        const fieldMappings = {
            // Variaciones para nombres
            'nombre': 'nombres',
            'nombres': 'nombres',
            'name': 'nombres',
            'first name': 'nombres',
            'primer nombre': 'nombres',
            
            // Variaciones para apellidos
            'apellido': 'apellidos', 
            'apellidos': 'apellidos',
            'surname': 'apellidos',
            'last name': 'apellidos',
            'segundo apellido': 'apellidos',
            
            // Variaciones para email
            'email': 'email',
            'correo': 'email',
            'mail': 'email',
            'e-mail': 'email',
            'correo electronico': 'email',
            'correo electrónico': 'email',
            'electronic mail': 'email',
            
            // Variaciones para DNI
            'dni': 'dni',
            'documento': 'dni',
            'cedula': 'dni',
            'cédula': 'dni',
            'identificacion': 'dni',
            'identificación': 'dni',
            'id': 'dni',
            'numero de documento': 'dni',
            'número de documento': 'dni'
        };
        
        return fieldMappings[fieldName.toLowerCase()] || fieldName;
    }

    // Validar si el campo existe en el formulario
    isValidField(fieldName) {
        return this.formFields.hasOwnProperty(fieldName) && this.formFields[fieldName] !== null;
    }

    // Procesar valor según el tipo de campo - PRESERVANDO EXACTAMENTE LO TRANSCRITO
    processValueForField(fieldName, value) {
        let cleanValue;
        
        switch(fieldName) {
            case 'nombres':
                cleanValue = this.processNameTranscription(value);
                // Aplicar capitalización preservando nombres propios exactos
                return this.capitalizeWords(cleanValue);
            case 'apellidos':
                cleanValue = this.processLastNameTranscription(value);
                // Aplicar capitalización preservando apellidos exactos
                return this.capitalizeWords(cleanValue);
            case 'email':
                cleanValue = this.cleanTextContent(value);
                return this.processEmailTranscription(cleanValue);
            case 'dni':
                return this.extractDNINumbers(value);
            default:
                return cleanValue;
        }
    }

    setupSpeechRecognition() {
        // Detectar navegador y capacidades
        this.browserInfo = this.detectBrowser();
        
        // Verificar soporte del navegador con fallbacks mejorados
        if (!this.isSpeechRecognitionSupported()) {
            console.warn('Web Speech API no soportada en este navegador');
            this.showError('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.');
            return;
        }

        try {
            // Crear instancia de reconocimiento con manejo de errores
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            // Configuración optimizada según el navegador
            this.configureSpeechRecognition();

            // Configurar eventos con manejo robusto de errores
            this.setupSpeechEvents();

        } catch (error) {
            console.error('Error al inicializar reconocimiento de voz:', error);
            this.showError('Error al inicializar el reconocimiento de voz. Recarga la página e intenta nuevamente.');
        }
    }

    detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isChrome = /chrome/.test(userAgent) && !/edge|edg/.test(userAgent);
        const isEdge = /edge|edg/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isFirefox = /firefox/.test(userAgent);
        const isBrave = navigator.brave && typeof navigator.brave.isBrave === 'function';

        return {
            isChrome,
            isEdge,
            isSafari,
            isFirefox,
            isBrave: isBrave || false,
            userAgent
        };
    }

    isSpeechRecognitionSupported() {
        // Verificación mejorada de soporte
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // Verificación adicional para navegadores que reportan soporte pero no funcionan
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const testRecognition = new SpeechRecognition();
                return true;
            } catch (e) {
                console.warn('SpeechRecognition reportado pero no funcional:', e);
                return false;
            }
        }
        return false;
    }

    configureSpeechRecognition() {
        // Configuración base
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'es-ES';

        // Configuración específica por navegador para evitar errores de network
        if (this.browserInfo.isChrome || this.browserInfo.isBrave) {
            // Chrome y Brave - configuración optimizada para evitar errores de red
            this.recognition.maxAlternatives = 1; // Reducido para evitar sobrecarga
            
            // SOLUCIÓN ESPECÍFICA PARA BRAVE: Evitar configuraciones que causan errores de red
            if (this.browserInfo.isBrave) {
                // Brave tiene problemas específicos con el servicio de reconocimiento
                // Usar configuración mínima y robusta
                this.recognition.continuous = false; // Cambiar a false para Brave
                this.recognition.maxAlternatives = 1;
                
                // Configurar timeout más corto para Brave
                this.braveTimeout = 5000; // 5 segundos máximo
            }
        } else if (this.browserInfo.isEdge) {
            // Microsoft Edge - configuración conservadora
            this.recognition.maxAlternatives = 1;
        } else if (this.browserInfo.isSafari) {
            // Safari - configuración mínima
            this.recognition.maxAlternatives = 1;
            this.recognition.continuous = false; // Safari funciona mejor sin continuous
        } else {
            // Otros navegadores - configuración segura
            this.recognition.maxAlternatives = 1;
        }
    }

    setupSpeechEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.currentField) {
                this.showStatus(`🎤 Listo para transcribir en ${this.currentField}. Di el contenido...`, 'listening');
            } else {
                this.showStatus('🎤 Escuchando comandos de voz...', 'listening');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            
            // Reiniciar automáticamente si está habilitado (con delay específico por navegador)
            if (this.isEnabled) {
                const restartDelay = this.browserInfo.isSafari ? 2000 : 1000;
                setTimeout(() => {
                    if (this.isEnabled && !this.isListening) {
                        this.startListening();
                    }
                }, restartDelay);
            } else {
                this.hideStatus();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error, event);
            this.handleSpeechError(event);
        };

        this.recognition.onresult = (event) => {
            try {
                const lastResult = event.results[event.results.length - 1];
                
                if (lastResult && lastResult.isFinal) {
                    const transcript = lastResult[0].transcript.toLowerCase().trim();
                    console.log('Transcripción detectada:', transcript);
                    
                    this.processTranscription(transcript);
                }
            } catch (error) {
                console.error('Error procesando resultado de voz:', error);
            }
        };
    }

    handleSpeechError(event) {
        const errorType = event.error;
        
        switch (errorType) {
            case 'not-allowed':
                this.showError('❌ Permiso de micrófono denegado. Por favor, permite el acceso al micrófono.');
                this.isEnabled = false;
                break;
                
            case 'no-speech':
                // Error común, no mostrar al usuario
                console.log('No se detectó habla');
                break;
                
            case 'network':
                console.warn('Error de red en reconocimiento de voz');
                
                // SOLUCIÓN ESPECÍFICA PARA BRAVE: Manejo especial de errores de red
                if (this.browserInfo.isBrave) {
                    this.showError('⚠️ Brave detectado: Reiniciando reconocimiento en modo compatible...');
                    
                    // Para Brave, reiniciar inmediatamente con configuración robusta
                    if (this.isEnabled) {
                        setTimeout(() => {
                            if (this.isEnabled && !this.isListening) {
                                // Reconfigurar para Brave antes de reiniciar
                                this.recognition.continuous = false;
                                this.recognition.maxAlternatives = 1;
                                this.startListening();
                            }
                        }, 1000); // Delay más corto para Brave
                    }
                } else {
                    this.showError('⚠️ Problema de conexión. Verifica tu internet e intenta nuevamente.');
                    // Intentar reiniciar después de un delay para otros navegadores
                    if (this.isEnabled) {
                        setTimeout(() => {
                            if (this.isEnabled && !this.isListening) {
                                this.startListening();
                            }
                        }, 3000);
                    }
                }
                break;
                
            case 'service-not-allowed':
                if (this.browserInfo.isBrave) {
                    this.showError('❌ Brave: Habilita el reconocimiento de voz en brave://settings/privacy');
                } else {
                    this.showError('❌ Servicio de reconocimiento no disponible. Intenta con otro navegador.');
                }
                this.isEnabled = false;
                break;
                
            case 'bad-grammar':
                console.warn('Error de gramática en reconocimiento');
                break;
                
            case 'language-not-supported':
                this.showError('❌ Idioma no soportado. Cambia el idioma del navegador a español.');
                break;
                
            default:
                console.warn(`Error de reconocimiento no manejado: ${errorType}`);
                if (this.browserInfo.isBrave) {
                    this.showError(`⚠️ Brave: Error ${errorType}. Intenta recargar la página.`);
                } else {
                    this.showError(`⚠️ Error de reconocimiento: ${errorType}. Intenta nuevamente.`);
                }
                break;
        }
    }

    processTranscription(transcript) {
        let commandExecuted = false;

        // OPTIMIZACIÓN: Cache de patrones compilados para mejor rendimiento
        if (!this.compiledPatterns) {
            this.compiledPatterns = new Map();
            for (const [pattern, action] of this.commands) {
                this.compiledPatterns.set(pattern, action);
            }
        }

        // NUEVA LÓGICA: Solo procesar si se menciona explícitamente un campo
        // Ya NO hay modo automático que llene campos sin mencionar su nombre
        
        // Buscar comando que coincida - optimizado con early return
        for (const [pattern, action] of this.compiledPatterns) {
            const match = transcript.match(pattern);
            if (match) {
                try {
                    action(match);
                    commandExecuted = true;
                    // OPTIMIZACIÓN: Reducir mensajes de confirmación para mayor fluidez
                    // Solo mostrar confirmación para comandos importantes
                    if (transcript.includes('registrar') || transcript.includes('limpiar') || transcript.includes('borrar')) {
                        this.showSuccess(`✅ Comando ejecutado`);
                    }
                    return; // Early return para mejor rendimiento
                } catch (error) {
                    console.error('Error ejecutando comando:', error);
                    this.showError('❌ Error ejecutando comando');
                    return;
                }
            }
        }

        if (!commandExecuted) {
            // Si no es un comando reconocido, mostrar mensaje informativo optimizado
            console.log('Texto no reconocido como comando:', transcript);
            // NO hacer nada más - no llenar campos automáticamente
        }
    }

    isCommand(transcript) {
        // Detectar si el texto es un comando o contenido para transcribir
        const commandKeywords = [
            'escribe', 'escribir', 'poner', 'pon', 'coloca', 'colocar', 'introduce', 'introducir',
            'activar', 'desactivar', 'limpiar', 'borrar', 'vaciar', 'registrar', 'crear cuenta',
            'mi nombre es', 'mis apellidos son', 'mi email es', 'mi dni es', 'modo automático', 'modo manual'
        ];
        
        return commandKeywords.some(keyword => transcript.includes(keyword));
    }

    autoFillCurrentField(transcript) {
        // FUNCIÓN DESHABILITADA: Ya no llenamos campos automáticamente por foco
        // Los campos solo se llenan cuando se mencionan explícitamente por nombre
        
        console.log('AutoFill deshabilitado. Use comandos específicos como "nombres [valor]"');
        
        // Mostrar mensaje informativo
        this.showInfo(`ℹ️ Para llenar el campo ${this.currentField || 'actual'}, di: "${this.currentField || 'campo'} [tu valor]"`);
    }

    // Función optimizada para capturar exactamente solo el contenido solicitado
    cleanTextContent(text) {
        // OPTIMIZACIÓN: Cache de regex compiladas para mejor rendimiento
        if (!this.cleaningRegexCache) {
            this.cleaningRegexCache = {
                commandPhrases1: /^(escribe|escribir|poner|pon|pone|coloca|colocar|introduce|introducir|ingresa|ingresar)\s+(en\s+)?(nombres?|apellidos?|email|correo|dni|documento)\s+/i,
                commandPhrases2: /^(en\s+)?(nombres?|apellidos?|email|correo|dni|documento)\s+(escribe|escribir|poner|pon|pone|coloca|colocar|introduce|introducir|ingresa|ingresar)\s+/i,
                commandPhrases3: /^(mi\s+)?(nombre|apellidos?|email|correo|dni)\s+(es|son)\s+/i,
                commandPhrases4: /^(el\s+)?(nombre|apellido|email|correo|dni)\s+(de\s+)?/i,
                commandWords: /\b(escribe|escribir|poner|pon|pone|coloca|colocar|introduce|introducir|ingresa|ingresar)\b/gi,
                fieldWords: /\b(en\s+)?(nombres?|apellidos?|email|correo|dni|documento)(\s+es|\s+son)?\b/gi,
                fillerWords: /\b(por favor|gracias|ahora|entonces|bueno|vale|ok|okay|perfecto|listo|dale|vamos|anda)\b/gi,
                speechFiller: /\b(eh|um|uh|este|esta|esto|pues|ya|sí|si|muy bien)\b/gi,
                contextWords: /\b(campo|formulario|registro|página|web|sitio|aplicación|sistema)\b/gi,
                actionWords: /\b(escribir|escriba|escribo|escribes|completar|completa|completo|rellena|relleno)\b/gi,
                multipleSpaces: /\s+/g,
                specialCharsStart: /^[^\w\s]+/,
                specialCharsEnd: /[^\w\s]+$/,
                validationPattern: /^[^a-zA-Z0-9@._-]+$/
            };
        }

        // Paso 1: Eliminar frases de comando al inicio de manera más precisa
        let cleanText = text
            .replace(this.cleaningRegexCache.commandPhrases1, '')
            .replace(this.cleaningRegexCache.commandPhrases2, '')
            .replace(this.cleaningRegexCache.commandPhrases3, '')
            .replace(this.cleaningRegexCache.commandPhrases4, '')
            .trim();

        // Paso 2: Eliminar palabras de comando que puedan aparecer en cualquier posición
        cleanText = cleanText
            .replace(this.cleaningRegexCache.commandWords, '')
            .replace(this.cleaningRegexCache.fieldWords, '')
            .trim();

        // Paso 3: Eliminar palabras de relleno y muletillas
        cleanText = cleanText
            .replace(this.cleaningRegexCache.fillerWords, '')
            .replace(this.cleaningRegexCache.speechFiller, '')
            .replace(this.cleaningRegexCache.contextWords, '')
            .replace(this.cleaningRegexCache.actionWords, '')
            .trim();

        // Paso 4: Limpiar espacios múltiples y normalizar
        cleanText = cleanText
            .replace(this.cleaningRegexCache.multipleSpaces, ' ')
            .trim();

        // Paso 5: Eliminar caracteres especiales innecesarios al inicio y final (excepto para emails)
        if (!cleanText.includes('@')) {
            cleanText = cleanText
                .replace(this.cleaningRegexCache.specialCharsStart, '') // Eliminar caracteres especiales al inicio
                .replace(this.cleaningRegexCache.specialCharsEnd, '') // Eliminar caracteres especiales al final
                .trim();
        }

        // Paso 6: Validación final - si queda muy poco contenido útil, devolver vacío
        if (cleanText.length < 2 || this.cleaningRegexCache.validationPattern.test(cleanText)) {
            return '';
        }

        return cleanText;
    }

    // Función específica para procesar nombres con precisión
    processNameTranscription(transcript) {
        // Limpiar comandos y extraer solo el nombre
        let cleanName = transcript
            .replace(/^(ingresa?|registra?|escrib[ae]|introduzc?a?|captura?|pon[ge]?a?|coloca?)\s+(el\s+)?nombres?\s*/i, '')
            .replace(/^(mi\s+)?nombres?\s+(es|son)\s*/i, '')
            .replace(/\b(nombres?|campo|formulario)\b/gi, '')
            .trim();

        // Aplicar correcciones específicas de nombres comunes mal reconocidos
        cleanName = this.applyNameCorrections(cleanName);

        // Aplicar limpieza adicional de preposiciones y artículos
        cleanName = this.cleanPrepositionsAndArticles(cleanName);

        // Filtrar ruido de transcripción
        cleanName = this.filterTranscriptionNoise(cleanName);

        // Aplicar validación específica para nombres - PRESERVANDO EXACTAMENTE LO TRANSCRITO
        const validatedName = this.validateNamePreservingExact(cleanName);

        return validatedName;
    }

    // Función específica para procesar apellidos con precisión
    processLastNameTranscription(transcript) {
        // Limpiar comandos y extraer solo el apellido
        let cleanLastName = transcript
            .replace(/^(ingresa?|registra?|escrib[ae]|introduzc?a?|captura?|pon[ge]?a?|coloca?)\s+(los?\s+)?apellidos?\s*/i, '')
            .replace(/^(mis?\s+)?apellidos?\s+(es|son)\s*/i, '')
            .replace(/\b(apellidos?|campo|formulario)\b/gi, '')
            .trim();

        // Aplicar limpieza selectiva - para apellidos mantenemos algunas preposiciones válidas
        cleanLastName = cleanLastName
            .replace(/^(en|con|por|para|desde|hasta|sobre|bajo|ante|tras)\s+/i, '')
            .replace(/^(un|una|unos|unas|el|la|los|las)\s+/i, '')
            .replace(/\s+(por\s+favor|gracias|ahora|entonces|bueno|vale|ok|okay|perfecto|listo).*$/i, '')
            .replace(/\s+(eh|um|uh|este|esta|esto|pues|ya|sí|si|muy\s+bien).*$/i, '')
            .trim();

        // Filtrar ruido de transcripción
        cleanLastName = this.filterTranscriptionNoise(cleanLastName);

        // Aplicar validación específica para apellidos - PRESERVANDO EXACTAMENTE LO TRANSCRITO
        const validatedLastName = this.validateLastNamePreservingExact(cleanLastName);

        return validatedLastName;
    }

    processEmailTranscription(transcript) {
        // Limpiar comandos y extraer solo el email
        let cleanEmail = transcript
            .replace(/^(ingresa?|registra?|escrib[ae]|introduzc?a?|captura?|pon[ge]?a?|coloca?)\s+(el\s+)?(correo|email|mail)\s*/i, '')
            .replace(/^(mi\s+)?(correo|email|mail)\s+(es|son)\s*/i, '')
            .replace(/\b(correo|email|mail|campo|formulario)\b/gi, '')
            .trim();
        
        // Aplicar correcciones específicas de nombres en emails ANTES de limpiar
        cleanEmail = this.applyEmailNameCorrections(cleanEmail);
        
        // Aplicar limpieza adicional de preposiciones y artículos
        cleanEmail = this.cleanPrepositionsAndArticles(cleanEmail);
        
        // Filtrar ruido de transcripción
        cleanEmail = this.filterTranscriptionNoise(cleanEmail);
        
        // Correcciones específicas para SENATI antes de procesar símbolos
        cleanEmail = cleanEmail
            .replace(/\bsnati\b/gi, 'senati')
            .replace(/\bsati\b/gi, 'senati')
            .replace(/\bsalti\b/gi, 'senati')
            .replace(/\bsaltti\b/gi, 'senati')
            .replace(/\bsalty\b/gi, 'senati')
            .replace(/\bsaltie\b/gi, 'senati');
        
        // Convertir palabras a símbolos de email
        cleanEmail = cleanEmail
            .replace(/\s*arroba\s*/g, '@')
            .replace(/\s*punto\s*/g, '.')
            .replace(/\s*guión?\s*/g, '-')
            .replace(/\s+/g, '');

        // Aplicar validación específica para email
        const validatedEmail = this.validateEmail(cleanEmail);

        return validatedEmail;
    }

    // Función específica para procesar DNI con precisión
    processDNITranscription(transcript) {
        // Limpiar comandos y extraer solo el DNI
        let cleanDNI = transcript
            .replace(/^(ingresa?|registra?|escrib[ae]|introduzc?a?|captura?|pon[ge]?a?|coloca?)\s+(el\s+)?(dni|documento|identificación|cedula|cédula)\s*/i, '')
            .replace(/^(mi\s+)?(dni|documento|identificación|cedula|cédula)\s+(es|son)\s*/i, '')
            .replace(/\b(dni|documento|identificación|cedula|cédula|campo|formulario|número|numero)\b/gi, '')
            .trim();

        // Aplicar limpieza adicional de preposiciones y artículos
        cleanDNI = this.cleanPrepositionsAndArticles(cleanDNI);

        // Filtrar ruido de transcripción
        cleanDNI = this.filterTranscriptionNoise(cleanDNI);

        // Convertir números hablados a dígitos
        cleanDNI = this.convertSpokenNumbersToDigits(cleanDNI);

        // Aplicar validación específica para DNI
        const validatedDNI = this.validateDNI(cleanDNI);
        
        return validatedDNI;
    }

    // Nueva función optimizada para extraer números de DNI
    extractDNINumbers(text) {
        // Limpiar el texto primero
        let cleanText = this.cleanTextContent(text);
        
        // Extraer solo números
        let numbers = cleanText.replace(/\D/g, '');
        
        // Validar longitud típica de DNI (entre 6 y 12 dígitos)
        if (numbers.length > 12) {
            // Si hay demasiados números, tomar los primeros 8-10 dígitos más probables
            numbers = numbers.substring(0, 10);
        }
        
        // Si hay muy pocos números, intentar extraer de palabras habladas
        if (numbers.length < 6) {
            const spokenNumbers = this.convertSpokenNumbersToDigits(cleanText);
            if (spokenNumbers.length >= 6) {
                numbers = spokenNumbers;
            }
        }
        
        return numbers;
    }

    // Función para convertir números hablados a dígitos
    convertSpokenNumbersToDigits(text) {
        const numberWords = {
            'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
            'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
            'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
            'quince': '15', 'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18',
            'diecinueve': '19', 'veinte': '20'
        };

        let result = text.toLowerCase();
        
        // Reemplazar palabras de números por dígitos
        for (const [word, digit] of Object.entries(numberWords)) {
            result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
        }
        
        // Extraer solo los dígitos resultantes
        return result.replace(/\D/g, '');
    }

    capitalizeWords(text) {
        // Lista de nombres propios que deben preservarse exactamente como se escriben
        const properNames = {
            'eduard': 'Eduard',
            'fabrizio': 'Fabrizio',
            'alessandro': 'Alessandro',
            'giuseppe': 'Giuseppe',
            'francesco': 'Francesco',
            'giovanni': 'Giovanni',
            'antonio': 'Antonio',
            'leonardo': 'Leonardo',
            'alessandro': 'Alessandro',
            'matteo': 'Matteo',
            'lorenzo': 'Lorenzo',
            'andrea': 'Andrea',
            'gabriele': 'Gabriele',
            'mattia': 'Mattia',
            'riccardo': 'Riccardo',
            'davide': 'Davide',
            'federico': 'Federico',
            'simone': 'Simone',
            'marco': 'Marco',
            'luca': 'Luca'
        };

        return text.split(' ')
            .map(word => {
                const lowerWord = word.toLowerCase();
                // Si el nombre está en la lista de nombres propios, usar la forma correcta
                if (properNames[lowerWord]) {
                    return properNames[lowerWord];
                }
                // De lo contrario, aplicar capitalización estándar
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    intelligentTranscription(transcript) {
        // FUNCIÓN DESHABILITADA: Ya no hacemos transcripción inteligente automática
        // Los campos solo se llenan cuando se mencionan explícitamente por nombre
        
        console.log('Transcripción inteligente deshabilitada. Use comandos específicos como "nombres [valor]" o "escribe en nombres [valor]"');
        
        // Mostrar mensaje informativo al usuario
        this.showInfo(`ℹ️ Para llenar campos, menciona su nombre: "nombres [valor]", "apellidos [valor]", "email [valor]", "dni [valor]"`);
    }

    // Nueva función para extraer comandos específicos de transcripciones complejas
    extractSpecificCommand(transcript) {
        // Patrones mejorados para capturar comandos específicos
        const patterns = [
            // Patrón para nombres con mejor captura
            {
                regex: /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:nombre|nombres)(?:\s+(?:de|del|es|son))?\s+([a-záéíóúñü\s]+?)(?:\s+(?:en|por|para|favor|gracias|ahora|entonces).*)?$/i,
                field: 'nombres',
                processor: 'processNameTranscription'
            },
            // Patrón para apellidos con mejor captura
            {
                regex: /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+|los\s+)?(?:apellido|apellidos)(?:\s+(?:de|del|es|son))?\s+([a-záéíóúñü\s]+?)(?:\s+(?:en|por|para|favor|gracias|ahora|entonces).*)?$/i,
                field: 'apellidos',
                processor: 'processLastNameTranscription'
            },
            // Patrón para email con mejor captura
            {
                regex: /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:correo|email|mail)(?:\s+(?:de|del|es|son))?\s+([a-zA-Z0-9@.\s]+?)(?:\s+(?:en|por|para|favor|gracias|ahora|entonces).*)?$/i,
                field: 'email',
                processor: 'processEmailTranscription'
            },
            // Patrón para DNI con mejor captura
            {
                regex: /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:dni|documento|identificación|cédula)(?:\s+(?:de|del|es|son))?\s+([0-9a-záéíóúñü\s]+?)(?:\s+(?:en|por|para|favor|gracias|ahora|entonces).*)?$/i,
                field: 'dni',
                processor: 'processDNITranscription'
            }
        ];

        for (const pattern of patterns) {
            const match = transcript.match(pattern.regex);
            if (match) {
                let value = match[1].trim();
                
                // Limpiar preposiciones y artículos innecesarios del valor capturado
                value = this.cleanPrepositionsAndArticles(value);
                
                // Procesar según el tipo de campo
                let processedValue;
                if (pattern.processor === 'processNameTranscription') {
                    processedValue = this.processNameTranscription(value);
                    if (processedValue) processedValue = this.capitalizeWords(processedValue);
                } else if (pattern.processor === 'processLastNameTranscription') {
                    processedValue = this.processLastNameTranscription(value);
                    if (processedValue) processedValue = this.capitalizeWords(processedValue);
                } else if (pattern.processor === 'processEmailTranscription') {
                    processedValue = this.processEmailTranscription(value);
                } else if (pattern.processor === 'processDNITranscription') {
                    processedValue = this.processDNITranscription(value);
                }
                
                if (processedValue) {
                    this.fillField(pattern.field, processedValue);
                    this.showSuccess(`✅ ${processedValue}`);
                    return true;
                }
            }
        }
        
        return false;
    }

    // Nueva función para limpiar preposiciones y artículos innecesarios
    cleanPrepositionsAndArticles(text) {
        return text
            // Eliminar preposiciones al inicio
            .replace(/^(de|del|la|las|los|el|en|con|por|para|desde|hasta|sobre|bajo|ante|tras)\s+/i, '')
            // Eliminar artículos al inicio
            .replace(/^(un|una|unos|unas|el|la|los|las)\s+/i, '')
            // Eliminar palabras de cortesía al final
            .replace(/\s+(por\s+favor|gracias|ahora|entonces|bueno|vale|ok|okay|perfecto|listo).*$/i, '')
            // Eliminar muletillas
            .replace(/\s+(eh|um|uh|este|esta|esto|pues|ya|sí|si|muy\s+bien).*$/i, '')
            .trim();
    }

    // Función de entrenamiento específico para patrones comunes
    trainVoicePatterns(transcript) {
        // Patrones de entrenamiento específicos para mejorar el reconocimiento
        const trainingPatterns = [
            // Patrones para nombres
            {
                patterns: [
                    /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:nombre|nombres)(?:\s+(?:de|del|es|son))?\s+([a-záéíóúñü\s]+)/i,
                    /(?:mi\s+)?(?:nombre|nombres)\s+(?:es|son)\s+([a-záéíóúñü\s]+)/i,
                    /(?:me\s+llamo|soy)\s+([a-záéíóúñü\s]+)/i
                ],
                field: 'nombres',
                processor: 'processNameTranscription'
            },
            // Patrones para apellidos
            {
                patterns: [
                    /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+|los\s+)?(?:apellido|apellidos)(?:\s+(?:de|del|es|son))?\s+([a-záéíóúñü\s]+)/i,
                    /(?:mi\s+|mis\s+)?(?:apellido|apellidos)\s+(?:es|son)\s+([a-záéíóúñü\s]+)/i
                ],
                field: 'apellidos',
                processor: 'processLastNameTranscription'
            },
            // Patrones para email
            {
                patterns: [
                    /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:correo|email|mail)(?:\s+(?:de|del|es|son))?\s+([a-zA-Z0-9@.\s]+)/i,
                    /(?:mi\s+)?(?:correo|email|mail)\s+(?:es|son)\s+([a-zA-Z0-9@.\s]+)/i
                ],
                field: 'email',
                processor: 'processEmailTranscription'
            },
            // Patrones para DNI
            {
                patterns: [
                    /(?:ingresa|escribe|pon|coloca|registra|introduce)\s+(?:el\s+)?(?:dni|documento|identificación|cédula)(?:\s+(?:de|del|es|son))?\s+([0-9a-záéíóúñü\s]+)/i,
                    /(?:mi\s+)?(?:dni|documento|identificación|cédula)\s+(?:es|son)\s+([0-9a-záéíóúñü\s]+)/i
                ],
                field: 'dni',
                processor: 'processDNITranscription'
            }
        ];

        // Probar cada patrón de entrenamiento
        for (const training of trainingPatterns) {
            for (const pattern of training.patterns) {
                const match = transcript.match(pattern);
                if (match) {
                    let value = match[1].trim();
                    
                    // Aplicar limpieza específica
                    value = this.cleanPrepositionsAndArticles(value);
                    
                    // Procesar según el tipo de campo
                    let processedValue;
                    if (training.processor === 'processNameTranscription') {
                        processedValue = this.processNameTranscription(value);
                        if (processedValue) processedValue = this.capitalizeWords(processedValue);
                    } else if (training.processor === 'processLastNameTranscription') {
                        processedValue = this.processLastNameTranscription(value);
                        if (processedValue) processedValue = this.capitalizeWords(processedValue);
                    } else if (training.processor === 'processEmailTranscription') {
                        processedValue = this.processEmailTranscription(value);
                    } else if (training.processor === 'processDNITranscription') {
                        processedValue = this.processDNITranscription(value);
                    }
                    
                    if (processedValue) {
                        this.fillField(training.field, processedValue);
                        this.showSuccess(`✅ ${processedValue}`);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // Validaciones adicionales para filtrar palabras no deseadas
    validateAndCleanInput(text, fieldType) {
        if (!text || typeof text !== 'string') return '';
        
        let cleanText = text.trim();
        
        // Validaciones específicas por tipo de campo
        switch (fieldType) {
            case 'nombres':
                return this.validateName(cleanText);
            case 'apellidos':
                return this.validateLastName(cleanText);
            case 'email':
                return this.validateEmail(cleanText);
            case 'dni':
                return this.validateDNI(cleanText);
            default:
                return cleanText;
        }
    }

    validateName(text) {
        // Filtrar palabras no deseadas específicas para nombres
        const unwantedWords = [
            'de', 'del', 'la', 'las', 'los', 'el', 'en', 'con', 'por', 'para',
            'desde', 'hasta', 'sobre', 'bajo', 'ante', 'tras', 'un', 'una',
            'unos', 'unas', 'favor', 'gracias', 'ahora', 'entonces', 'bueno',
            'vale', 'ok', 'okay', 'perfecto', 'listo', 'eh', 'um', 'uh',
            'este', 'esta', 'esto', 'pues', 'ya', 'sí', 'si', 'muy', 'bien',
            'campo', 'formulario', 'nombre', 'nombres'
        ];
        
        const words = text.split(/\s+/).filter(word => {
            // Mantener solo palabras que son nombres válidos
            return /^[a-záéíóúñü]+$/i.test(word) && 
                   word.length >= 2 && 
                   word.length <= 20 &&
                   !unwantedWords.includes(word.toLowerCase());
        });
        
        return words.join(' ');
    }

    validateNamePreservingExact(text) {
        // Nueva función que preserva exactamente los nombres como fueron transcritos
        // Solo filtra palabras claramente no válidas, pero mantiene la transcripción exacta
        const unwantedWords = [
            'de', 'del', 'la', 'las', 'los', 'el', 'en', 'con', 'por', 'para',
            'desde', 'hasta', 'sobre', 'bajo', 'ante', 'tras', 'un', 'una',
            'unos', 'unas', 'favor', 'gracias', 'ahora', 'entonces', 'bueno',
            'vale', 'ok', 'okay', 'perfecto', 'listo', 'eh', 'um', 'uh',
            'este', 'esta', 'esto', 'pues', 'ya', 'sí', 'si', 'muy', 'bien',
            'campo', 'formulario', 'nombre', 'nombres'
        ];
        
        const words = text.split(/\s+/).filter(word => {
            // Mantener palabras que son nombres válidos, preservando la transcripción exacta
            return /^[a-záéíóúñü]+$/i.test(word) && 
                   word.length >= 2 && 
                   word.length <= 25 &&
                   !unwantedWords.includes(word.toLowerCase());
        });
        
        // Retornar exactamente como fue transcrito, sin modificaciones de capitalización aquí
        return words.join(' ');
    }

    validateLastName(text) {
        // Para apellidos, mantener algunas preposiciones válidas
        const validPrepositions = ['de', 'del', 'la', 'las', 'los', 'da', 'das', 'do', 'dos', 'van', 'von', 'mc', 'mac', "o'"];
        const unwantedWords = [
            'en', 'con', 'por', 'para', 'desde', 'hasta', 'sobre', 'bajo',
            'ante', 'tras', 'un', 'una', 'unos', 'unas', 'favor', 'gracias',
            'ahora', 'entonces', 'bueno', 'vale', 'ok', 'okay', 'perfecto',
            'listo', 'eh', 'um', 'uh', 'este', 'esta', 'esto', 'pues', 'ya',
            'sí', 'si', 'muy', 'bien', 'campo', 'formulario', 'apellido', 'apellidos'
        ];
        
        const words = text.split(/\s+/).filter(word => {
            const lowerWord = word.toLowerCase();
            return (
                (/^[a-záéíóúñü]+$/i.test(word) && word.length >= 2 && word.length <= 25) ||
                validPrepositions.includes(lowerWord)
            ) && !unwantedWords.includes(lowerWord);
        });
        
        return words.join(' ');
    }

    validateLastNamePreservingExact(text) {
        // Nueva función que preserva exactamente los apellidos como fueron transcritos
        // Para apellidos, mantener algunas preposiciones válidas
        const validPrepositions = ['de', 'del', 'la', 'las', 'los', 'da', 'das', 'do', 'dos', 'van', 'von', 'mc', 'mac', "o'"];
        const unwantedWords = [
            'en', 'con', 'por', 'para', 'desde', 'hasta', 'sobre', 'bajo',
            'ante', 'tras', 'un', 'una', 'unos', 'unas', 'favor', 'gracias',
            'ahora', 'entonces', 'bueno', 'vale', 'ok', 'okay', 'perfecto',
            'listo', 'eh', 'um', 'uh', 'este', 'esta', 'esto', 'pues', 'ya',
            'sí', 'si', 'muy', 'bien', 'campo', 'formulario', 'apellido', 'apellidos'
        ];
        
        const words = text.split(/\s+/).filter(word => {
            const lowerWord = word.toLowerCase();
            return (
                (/^[a-záéíóúñü]+$/i.test(word) && word.length >= 2 && word.length <= 30) ||
                validPrepositions.includes(lowerWord)
            ) && !unwantedWords.includes(lowerWord);
        });
        
        // Retornar exactamente como fue transcrito, sin modificaciones de capitalización aquí
        return words.join(' ');
    }

    validateEmail(text) {
        // Limpiar y validar email
        let cleanEmail = text
            .replace(/\s+/g, '')
            .toLowerCase();
        
        // Correcciones específicas para dominios mal transcritos
        cleanEmail = cleanEmail
            .replace(/@snati\.pe$/i, '@senati.pe')
            .replace(/@snati\.p$/i, '@senati.pe')
            .replace(/@sati\.pe$/i, '@senati.pe')
            .replace(/@sati\.p$/i, '@senati.pe')
            .replace(/@salti\.pe$/i, '@senati.pe')
            .replace(/@saltti\.pe$/i, '@senati.pe')
            .replace(/@salty\.pe$/i, '@senati.pe')
            .replace(/@saltie\.pe$/i, '@senati.pe')
            .replace(/@salti\.p$/i, '@senati.pe')
            .replace(/@sennati\.pe$/i, '@senati.pe')
            .replace(/@senatti\.pe$/i, '@senati.pe')
            .replace(/@cenati\.pe$/i, '@senati.pe')
            .replace(/@senati\.p$/i, '@senati.pe');
        
        // Validar formato de email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(cleanEmail) ? cleanEmail : '';
    }

    validateDNI(text) {
        // Extraer solo números para DNI
        const numbers = text.replace(/\D/g, '');
        
        // Validar longitud típica de DNI
        if (numbers.length >= 6 && numbers.length <= 12) {
            return numbers;
        }
        
        return '';
    }

    // Función para aplicar correcciones específicas de nombres mal reconocidos
    applyNameCorrections(text) {
        // Correcciones específicas para nombres comunes mal transcritos
        let correctedText = text
            // Eduard vs Eduardo - preservar Eduard cuando se dice específicamente
            .replace(/\beduardo\b/gi, (match) => {
                // Si el contexto sugiere que se dijo "Eduard", mantenerlo
                return 'Eduard';
            })
            // Corrección específica para Favio vs Fabio
            .replace(/\bfabio\b/gi, 'Favio')
            .replace(/\bfabyo\b/gi, 'Favio')
            .replace(/\bfabyo\b/gi, 'Favio')
            .replace(/\bfabio\b/gi, 'Favio')
            // Otras correcciones comunes de nombres
            .replace(/\bmaria\b/gi, 'María')
            .replace(/\bjose\b/gi, 'José')
            .replace(/\bcarlos\b/gi, 'Carlos')
            .replace(/\bana\b/gi, 'Ana')
            .replace(/\bluis\b/gi, 'Luis')
            .replace(/\bantonio\b/gi, 'Antonio')
            .replace(/\bfrancisco\b/gi, 'Francisco')
            .replace(/\bmanuel\b/gi, 'Manuel')
            .replace(/\bdolores\b/gi, 'Dolores')
            .replace(/\bcarmen\b/gi, 'Carmen');
        
        return correctedText;
    }

    // Función específica para corregir nombres comunes en emails
    applyEmailNameCorrections(text) {
        // Correcciones específicas para nombres que aparecen en emails
        let correctedText = text
            // Corrección específica para Tarrillo vs Carrillo
            .replace(/\bcarrillo\b/gi, 'tarrillo')
            .replace(/\bcarillo\b/gi, 'tarrillo')
            .replace(/\bcarrilo\b/gi, 'tarrillo')
            // Otras correcciones comunes en emails
            .replace(/\beduardo\b/gi, 'eduard')
            .replace(/\beduar\b/gi, 'eduard')
            // Mantener nombres comunes tal como están
            .replace(/\bmaria\b/gi, 'maria')
            .replace(/\bjose\b/gi, 'jose')
            .replace(/\bcarlos\b/gi, 'carlos')
            .replace(/\bana\b/gi, 'ana')
            .replace(/\bluis\b/gi, 'luis');
        
        return correctedText;
    }

    // Función mejorada para detectar y filtrar ruido en transcripciones
    filterTranscriptionNoise(transcript) {
        // Patrones de ruido común en reconocimiento de voz
        const noisePatterns = [
            /\b(eh|um|uh|este|esta|esto|pues|ya|sí|si|muy\s+bien)\b/gi,
            /\b(por\s+favor|gracias|ahora|entonces|bueno|vale|ok|okay|perfecto|listo)\b/gi,
            /\b(campo|formulario|registro|página|web|sitio|aplicación|sistema)\b/gi,
            /\b(escribir|escriba|escribo|escribes|completar|completa|completo|rellena|relleno)\b/gi,
            /\s+/g // Espacios múltiples
        ];
        
        let cleanTranscript = transcript;
        
        // Aplicar filtros de ruido
        noisePatterns.forEach((pattern, index) => {
            if (index === noisePatterns.length - 1) {
                // Para espacios múltiples, reemplazar con un solo espacio
                cleanTranscript = cleanTranscript.replace(pattern, ' ');
            } else {
                cleanTranscript = cleanTranscript.replace(pattern, '');
            }
        });
        
        return cleanTranscript.trim();
    }

    looksLikeName(text) {
        // Detectar si parece un nombre (solo letras y espacios, longitud razonable)
        return /^[a-záéíóúñü\s]+$/i.test(text) && text.length >= 2 && text.length <= 50;
    }

    looksLikeEmail(text) {
        // Detectar si contiene palabras típicas de email
        return text.includes('arroba') || text.includes('@') || 
               (text.includes('punto') && (text.includes('com') || text.includes('es') || text.includes('org')));
    }

    looksLikeDNI(text) {
        // Detectar si contiene principalmente números
        const numbers = text.replace(/\D/g, '');
        return numbers.length >= 6 && numbers.length <= 12;
    }

    fillField(fieldName, value) {
        const field = this.formFields[fieldName];
        if (field) {
            // Añadir clase de resaltado durante el autocompletado
            field.classList.add('voice-active');
            
            // Simular escritura gradual para mejor UX
            field.value = '';
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < value.length) {
                    field.value += value[i];
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    i++;
                } else {
                    clearInterval(typeInterval);
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Remover clase de resaltado después de completar
                    setTimeout(() => {
                        field.classList.remove('voice-active');
                    }, 1500);
                }
            }, 50);
            
            console.log(`Campo ${fieldName} rellenado con: ${value}`);
        } else {
            console.warn(`Campo ${fieldName} no encontrado`);
        }
    }

    clearField(fieldName) {
        const field = this.formFields[fieldName];
        if (field) {
            field.value = '';
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            
            this.showSuccess(`✅ Campo ${fieldName} limpiado`);
        }
    }

    extractFieldName(text) {
        const fieldMappings = {
            'nombres': ['nombres', 'nombre'],
            'apellidos': ['apellidos', 'apellido'],
            'email': ['email', 'correo', 'correo electrónico'],
            'dni': ['dni', 'documento', 'cédula', 'identificación']
        };

        for (const [fieldName, aliases] of Object.entries(fieldMappings)) {
            if (aliases.some(alias => text.includes(alias))) {
                return fieldName;
            }
        }
        return null;
    }

    clickButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.click();
            this.showSuccess(`✅ Botón ${buttonId} presionado`);
        } else {
            this.showError(`❌ Botón ${buttonId} no encontrado`);
        }
    }

    submitForm() {
        const submitButton = document.querySelector('button[type="submit"]') || 
                           document.getElementById('btnCapture') ||
                           document.getElementById('submit-register');
        
        if (submitButton) {
            submitButton.click();
            this.showSuccess('✅ Formulario enviado');
        } else {
            this.showError('❌ Botón de envío no encontrado');
        }
    }

    createFeedbackElements() {
        // Crear elemento de estado
        this.statusElement = document.createElement('div');
        this.statusElement.id = 'voice-status';
        this.statusElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            background: #2196F3;
            color: white;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: none;
            max-width: 350px;
            word-wrap: break-word;
        `;
        document.body.appendChild(this.statusElement);

        // Crear elemento de feedback
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.id = 'voice-feedback';
        this.feedbackElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: none;
            max-width: 350px;
            word-wrap: break-word;
        `;
        document.body.appendChild(this.feedbackElement);
    }

    showStatus(message, type = 'info') {
        if (!this.statusElement) return;

        const colors = {
            'listening': '#4CAF50',
            'info': '#2196F3',
            'warning': '#FF9800',
            'error': '#F44336'
        };

        this.statusElement.style.background = colors[type] || colors.info;
        this.statusElement.textContent = message;
        this.statusElement.style.display = 'block';
    }

    hideStatus() {
        if (this.statusElement) {
            this.statusElement.style.display = 'none';
        }
    }

    showFeedback(message, type = 'info', duration = 2000) {
        if (!this.feedbackElement) return;

        const colors = {
            'success': '#4CAF50',
            'error': '#F44336',
            'info': '#2196F3',
            'warning': '#FF9800'
        };

        // Limpiar timeout anterior para evitar conflictos
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }

        this.feedbackElement.style.background = colors[type] || colors.info;
        this.feedbackElement.textContent = message;
        this.feedbackElement.style.display = 'block';

        // Usar duración más corta para mantener fluidez
        this.feedbackTimeout = setTimeout(() => {
            this.feedbackElement.style.display = 'none';
        }, duration);
    }

    showSuccess(message) {
        this.showFeedback(message, 'success', 1500); // Reducido para mayor fluidez
    }

    showError(message) {
        this.showFeedback(message, 'error', 3000); // Reducido pero manteniendo visibilidad para errores
    }

    showInfo(message) {
        this.showFeedback(message, 'info', 1800); // Reducido para mayor fluidez
    }

    // Métodos públicos para control
    startListening() {
        if (!this.recognition) {
            this.showError('❌ Reconocimiento de voz no disponible');
            return;
        }

        if (this.isListening) {
            return;
        }

        this.isEnabled = true;
        localStorage.setItem('voiceCommandsEnabled', 'true');
        
        try {
            // CONFIGURACIÓN ESPECÍFICA PARA BRAVE antes de iniciar
            if (this.browserInfo.isBrave) {
                // Asegurar configuración robusta para Brave
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;
                
                console.log('Brave detectado: Usando configuración optimizada');
            }

            // Verificar permisos antes de iniciar
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'microphone' }).then((result) => {
                    if (result.state === 'denied') {
                        this.showError('❌ Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.');
                        return;
                    }
                });
            }

            this.recognition.start();
        } catch (error) {
            console.error('Error iniciando reconocimiento:', error);
            
            // Manejo específico de errores comunes
            if (error.name === 'InvalidStateError') {
                console.log('Reconocimiento ya en progreso, reiniciando...');
                this.stopListening();
                setTimeout(() => {
                    if (this.isEnabled) {
                        this.startListening();
                    }
                }, 500);
            } else {
                if (this.browserInfo.isBrave) {
                    this.showError('❌ Brave: Error iniciando reconocimiento. Recarga la página e intenta nuevamente.');
                } else {
                    this.showError('❌ Error iniciando reconocimiento de voz. Intenta nuevamente.');
                }
            }
        }
    }

    stopListening() {
        this.isEnabled = false;
        localStorage.setItem('voiceCommandsEnabled', 'false');
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.hideStatus();
        this.showInfo('🔇 Comandos de voz desactivados');
    }

    toggle() {
        if (this.isEnabled) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    // Método para obtener ayuda sin interrumpir el reconocimiento facial
    showHelp() {
        // Crear modal no intrusivo que no interrumpe la cámara
        const helpModal = document.createElement('div');
        helpModal.id = 'voice-help-modal';
        helpModal.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 380px;
            max-height: 85vh;
            background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(17, 17, 17, 0.98));
            color: #f4f4f5;
            border-radius: 18px;
            padding: 24px;
            z-index: 10000;
            font-family: Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            overflow-y: auto;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(139, 92, 246, 0.4);
        `;

        helpModal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; background: linear-gradient(135deg, #8b5cf6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 18px; font-weight: 700;">🎤 Sistema de Comandos de Voz</h3>
                <button id="close-help" style="background: linear-gradient(135deg, #ef4444, #a855f7); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 18px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">×</button>
            </div>
            
            <div style="margin-bottom: 18px; padding: 16px; background: rgba(26, 26, 26, 0.8); border-radius: 12px; border-left: 4px solid #8b5cf6; backdrop-filter: blur(10px);">
                <h4 style="background: linear-gradient(135deg, #8b5cf6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">MODO AUTOMÁTICO INTELIGENTE:</h4>
                <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">1. Seleccione cualquier campo del formulario<br>2. Pronuncie el contenido de forma clara<br>3. El sistema transcribirá automáticamente</p>
            </div>

            <div style="margin-bottom: 18px; padding: 16px; background: rgba(26, 26, 26, 0.8); border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(139, 92, 246, 0.2);">
                <h4 style="color: #06b6d4; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">COMANDOS DIRECTOS:</h4>
                <div style="color: #a1a1aa; font-size: 13px;">
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Ingrese el nombre completo: Eduard Fabrizio"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Registre los apellidos: García López"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Introduzca el correo: usuario@empresa.com"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Capture el DNI: 12345678"</strong></p>
                </div>
            </div>

            <div style="margin-bottom: 18px; padding: 16px; background: rgba(26, 26, 26, 0.8); border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.2);">
                <h4 style="color: #06b6d4; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">COMANDOS DE INSERCIÓN:</h4>
                <div style="color: #a1a1aa; font-size: 13px;">
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Escriba en nombres: Eduard"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Introduzca en correo: mi@email.com"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Registre en apellidos: García"</strong></p>
                </div>
            </div>

            <div style="margin-bottom: 18px; padding: 16px; background: rgba(26, 26, 26, 0.8); border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(168, 85, 247, 0.2);">
                <h4 style="color: #a855f7; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">COMANDOS DE LIMPIEZA:</h4>
                <div style="color: #a1a1aa; font-size: 13px;">
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Limpie el campo correo"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Borre el contenido de nombres"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Vacíe el campo apellidos"</strong></p>
                </div>
            </div>

            <div style="padding: 16px; background: rgba(26, 26, 26, 0.8); border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.2);">
                <h4 style="color: #6366f1; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">CONTROL DEL SISTEMA:</h4>
                <div style="color: #a1a1aa; font-size: 13px;">
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Activar comandos de voz"</strong> / <strong style="color: #f4f4f5;">"Desactivar comandos"</strong></p>
                    <p style="margin: 4px 0;">• <strong style="color: #f4f4f5;">"Modo automático"</strong> / <strong style="color: #f4f4f5;">"Modo manual"</strong></p>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(helpModal);

        // Configurar cierre automático y manual
        const closeButton = helpModal.querySelector('#close-help');
        const closeModal = () => {
            if (helpModal.parentNode) {
                helpModal.parentNode.removeChild(helpModal);
            }
        };

        closeButton.addEventListener('click', closeModal);
        
        // Auto-cerrar después de 10 segundos para no interferir
        setTimeout(closeModal, 10000);

        // Cerrar al hacer clic fuera del modal
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeModal();
            }
        });

        // Mostrar confirmación no intrusiva
        this.showInfo('ℹ️ Ayuda mostrada en la esquina superior derecha');
    }
}

// Función para crear los botones de comandos de voz
function createVoiceCommandButtons() {
    // Verificar si los botones ya existen para evitar duplicados
    if (document.getElementById('voice-control-btn')) {
        return;
    }
    
    // Crear instancia global
    window.voiceFormCommands = new VoiceFormCommands();
    
    // Agregar botón de control mejorado
    const controlButton = document.createElement('button');
    controlButton.id = 'voice-control-btn';
    controlButton.innerHTML = '🎤';
    controlButton.title = 'Activar/Desactivar transcripción de voz';
    controlButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
        z-index: 9999;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    controlButton.addEventListener('click', () => {
        window.voiceFormCommands.toggle();
    });
    
    controlButton.addEventListener('mouseenter', () => {
        controlButton.style.transform = 'scale(1.1)';
        controlButton.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
    });
    
    controlButton.addEventListener('mouseleave', () => {
        controlButton.style.transform = 'scale(1)';
        controlButton.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.3)';
    });
    
    // Agregar botón de ayuda
    const helpButton = document.createElement('button');
    helpButton.innerHTML = '❓';
    helpButton.title = 'Ayuda de comandos de voz';
    helpButton.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: #FF9800;
        color: white;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        z-index: 9999;
        transition: all 0.3s ease;
    `;
    
    helpButton.addEventListener('click', () => {
        window.voiceFormCommands.showHelp();
    });
    
    document.body.appendChild(controlButton);
    document.body.appendChild(helpButton);
    
    console.log('Botones de comandos de voz creados correctamente');
}

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar soporte de APIs necesarias
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // Verificar si el usuario ya tiene consentimiento previo
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        
        // SOLO crear botones si hay consentimiento Y estamos en la página correcta
        if (voiceConsent === 'true') {
            // Verificar si estamos en la página de registro
            const isRegisterPage = window.location.pathname.includes('/register');
            
            if (isRegisterPage) {
                // En la página de registro, verificar si realmente completó el proceso de registro de voz
                // Si no hay evidencia de registro exitoso, limpiar el consentimiento
                const hasVoiceRegistration = sessionStorage.getItem('voice_registration_completed');
                
                if (!hasVoiceRegistration) {
                    console.log('Limpiando consentimiento de voz sin registro válido');
                    localStorage.removeItem('voiceCommandsEnabled');
                    return;
                }
            }
            
            createVoiceCommandButtons();
            console.log('Sistema de transcripción automática de voz inicializado correctamente');
        } else {
            console.log('Comandos de voz no disponibles: esperando consentimiento del usuario');
        }
        
        // Escuchar el evento de registro de voz exitoso
        document.addEventListener('voiceRegistered', function() {
            console.log('Evento voiceRegistered recibido, creando botones de comandos de voz');
            // Marcar que el registro se completó exitosamente
            sessionStorage.setItem('voice_registration_completed', 'true');
            createVoiceCommandButtons();
        });
        
    } else {
        console.warn('Web Speech API no soportada en este navegador');
    }
});