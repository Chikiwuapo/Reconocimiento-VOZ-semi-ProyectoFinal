/**
 * VoiceLogin - Sistema de reconocimiento de voz para login.html
 * Basado en voice_register.js pero adaptado para comandos de login
 */

class VoiceLogin {
    constructor() {
        this.isListening = false;
        this.faceReady = false;
        this.emailFilled = false;
        this.recognition = null;
        this.feedbackElement = null;
        
        // Elementos del DOM
        this.emailInput = document.querySelector('#email');
        this.loginButton = document.querySelector('#btnLogin');
        
        this.init();
    }
    
    init() {
        this.createFeedbackElement();
        this.setupSpeechRecognition();
        this.bindEvents();
        this.updateLoginButtonState();
    }
    
    createFeedbackElement() {
        // Crear elemento de feedback visual
        this.feedbackElement = document.createElement('div');
        this.feedbackElement.id = 'voice-feedback';
        this.feedbackElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 1000;
            display: none;
            max-width: 300px;
        `;
        document.body.appendChild(this.feedbackElement);
    }
    
    setupSpeechRecognition() {
        // Detección mejorada de compatibilidad del navegador
        const browserInfo = this.detectBrowser();
        console.log('VoiceLogin: Navegador detectado:', browserInfo);

        if (!this.isSpeechRecognitionSupported()) {
            console.warn('Reconocimiento de voz no soportado en este navegador');
            this.showFeedback('❌ Reconocimiento de voz no disponible en este navegador', 'error');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.configureSpeechRecognition();
        this.setupSpeechEvents();
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
            edge: /Edg/.test(userAgent),
            firefox: /Firefox/.test(userAgent),
            safari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
            brave: navigator.brave && navigator.brave.isBrave
        };
        
        for (const [name, condition] of Object.entries(browsers)) {
            if (condition) return { name, userAgent };
        }
        
        return { name: 'unknown', userAgent };
    }

    isSpeechRecognitionSupported() {
        // Verificación más robusta de soporte
        if ('webkitSpeechRecognition' in window) {
            return true;
        }
        if ('SpeechRecognition' in window) {
            return true;
        }
        
        // Verificación adicional para navegadores que pueden tener soporte parcial
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                return true;
            }
        } catch (e) {
            console.warn('Error verificando soporte de Speech Recognition:', e);
        }
        
        return false;
    }

    configureSpeechRecognition() {
        // Configuración optimizada para baja latencia y mejor precisión
        this.recognition.continuous = true;
        this.recognition.interimResults = false; // Desactivar resultados intermedios para mayor velocidad
        this.recognition.lang = 'es-ES';
        this.recognition.maxAlternatives = 3; // Más alternativas para mejor precisión
        
        // Configuraciones adicionales para mejor compatibilidad
        try {
            this.recognition.serviceURI = null; // Usar servicio por defecto
        } catch (e) {
            // Ignorar si no es compatible
        }
    }

    setupSpeechEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showFeedback('🎤 Escuchando...', 'listening');
        };
        
        this.recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.toLowerCase().trim();
                console.log('VoiceLogin: Comando detectado:', transcript);
                
                // Procesamiento inmediato sin demoras
                this.processCommand(transcript);
            }
        };
        
        this.recognition.onerror = (event) => {
            this.handleSpeechError(event);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.shouldKeepListening()) {
                // Reinicio optimizado más rápido (50ms en lugar de 100ms)
                setTimeout(() => this.startListening(), 50);
            }
        };
    }

    handleSpeechError(event) {
        console.error('Error de reconocimiento de voz:', event.error);
        
        // Manejo mejorado y específico de errores
        switch (event.error) {
            case 'no-speech':
                // Reintentar silenciosamente sin mostrar error
                setTimeout(() => {
                    if (this.shouldKeepListening()) {
                        this.startListening();
                    }
                }, 500);
                break;
            case 'audio-capture':
                this.showFeedback('❌ Error de micrófono. Verifique permisos.', 'error');
                break;
            case 'not-allowed':
                this.showFeedback('❌ Permisos de micrófono denegados. Permite el acceso en la configuración del navegador.', 'error');
                break;
            case 'network':
                console.log('Error de red detectado, reintentando...');
                this.showFeedback('⚠️ Problema de conexión, reintentando...', 'warning');
                setTimeout(() => {
                    if (this.shouldKeepListening()) {
                        this.startListening();
                    }
                }, 2000);
                break;
            case 'service-not-allowed':
                this.showFeedback('❌ Servicio de reconocimiento no disponible', 'error');
                break;
            case 'bad-grammar':
                console.warn('Problema de gramática, continuando...');
                setTimeout(() => {
                    if (this.shouldKeepListening()) {
                        this.startListening();
                    }
                }, 1000);
                break;
            default:
                console.warn('Error desconocido:', event.error);
                // Reintentar automáticamente para otros errores
                setTimeout(() => {
                    if (this.shouldKeepListening()) {
                        this.startListening();
                    }
                }, 1000);
        }
        this.isListening = false;
    }
    
    bindEvents() {
        // Escuchar eventos de cambio de estado facial
        document.addEventListener('faceStatusChanged', (event) => {
            this.faceReady = event.detail.ready;
            this.updateLoginButtonState();
            this.updateVisualFeedback();
        });
        
        // Monitorear cambios en el campo de email
        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => {
                this.emailFilled = this.emailInput.value.trim().length > 0;
                this.updateLoginButtonState();
            });
        }
        
        // Verificar consentimiento antes de iniciar reconocimiento automáticamente
        this.checkVoiceConsent();
    }
    
    processCommand(transcript) {
        console.log('VoiceLogin: Procesando comando:', transcript);
        
        // Procesamiento optimizado de comandos de email
        const emailMatch = transcript.match(/(?:email|correo)\s+(.+)/i);
        if (emailMatch) {
            const emailValue = this.processEmailTranscription(emailMatch[1].trim());
            if (emailValue && this.emailInput) {
                this.emailInput.value = emailValue;
                this.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                this.showFeedback(`✅ ${emailValue}`, 'success');
                this.emailFilled = true;
                this.updateLoginButtonState();
                return;
            }
        }
        
        // Comando de login optimizado - Corregido para activar automáticamente
        if (/(?:login|iniciar sesión|entrar|inicia sesión)/i.test(transcript)) {
            this.attemptLogin();
            return;
        }
        
        // Comando de limpiar optimizado
        if (/(?:limpiar|borrar|vaciar)/i.test(transcript)) {
            if (this.emailInput) {
                this.emailInput.value = '';
                this.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                this.showFeedback('✅ Campo limpiado', 'success');
                this.emailFilled = false;
                this.updateLoginButtonState();
            }
            return;
        }
        
        // Si no se reconoce el comando, mostrar ayuda concisa
        this.showFeedback('❌ Comando no reconocido. Diga "email [dirección]" o "login"', 'error');
    }
    
    processEmailTranscription(text) {
        // Función avanzada para procesar y corregir emails hablados
        let processedEmail = text.toLowerCase().trim();
        
        // 1. Eliminar palabras de comando y ruido
        processedEmail = processedEmail
            .replace(/^(email|correo|escribe|escribir|coloca|colocar|en|el|la|mi|es|dice|digo|ingresa|ingrese|poner|pon)\s*/gi, '')
            .replace(/\s*(email|correo|escribe|escribir|coloca|colocar|en|el|la|mi|es|dice|digo|ingresa|ingrese|poner|pon)\s*/gi, ' ')
            .trim();
        
        // 2. Eliminar espacios múltiples y normalizar
        processedEmail = processedEmail.replace(/\s+/g, '');
        
        // 3. Correcciones automáticas de pronunciación común
        const corrections = {
            // Correcciones de dominios comunes
            'gmail': 'gmail',
            'gmai': 'gmail',
            'gmeil': 'gmail',
            'gmaill': 'gmail',
            'gmall': 'gmail',
            'jmail': 'gmail',
            'gemail': 'gmail',
            'hotmail': 'hotmail',
            'hotmeil': 'hotmail',
            'otmail': 'hotmail',
            'outlook': 'outlook',
            'outluk': 'outlook',
            'outlok': 'outlook',
            'yahoo': 'yahoo',
            'yaju': 'yahoo',
            'yaho': 'yahoo',
            'senati': 'senati',
            'sennati': 'senati',
            'cenati': 'senati',
            'senatti': 'senati',
            'snati': 'senati',
            'sati': 'senati',
            'salti': 'senati',
            'saltti': 'senati',
            'salty': 'senati',
            'saltie': 'senati',
            
            // Correcciones de caracteres especiales hablados
            'punto': '.',
            'arroba': '@',
            'guión': '-',
            'guion': '-',
            'barra': '/',
            'más': '+',
            'underscore': '_',
            'bajo': '_',
            'rayabaja': '_',
            
            // Correcciones de números hablados
            'cero': '0',
            'uno': '1',
            'dos': '2',
            'tres': '3',
            'cuatro': '4',
            'cinco': '5',
            'seis': '6',
            'siete': '7',
            'ocho': '8',
            'nueve': '9',
            
            // Correcciones de extensiones comunes
            'pe': 'pe',
            'com': 'com',
            'org': 'org',
            'net': 'net',
            'edu': 'edu',
            'gov': 'gov'
        };
        
        // Aplicar correcciones
        for (const [wrong, correct] of Object.entries(corrections)) {
            const regex = new RegExp(wrong, 'gi');
            processedEmail = processedEmail.replace(regex, correct);
        }
        
        // 4. Correcciones específicas para casos como "Tarrillo" -> "tarrillo"
        // Detectar y corregir errores comunes de transcripción
        processedEmail = processedEmail
            .replace(/([a-z])([A-Z])/g, '$1$2') // Mantener capitalización interna
            .toLowerCase() // Convertir todo a minúsculas
            .replace(/([a-z])(\d)/g, '$1$2') // Mantener números pegados a letras
            .replace(/(\d)([a-z])/g, '$1$2'); // Mantener letras pegadas a números
        
        // 5. Correcciones específicas de patrones de error comunes
        const patternCorrections = [
            // Corregir "carrillo" -> "tarrillo" (error de transcripción común)
            [/^carrillo/i, 'tarrillo'],
            [/^carillo/i, 'tarrillo'],
            [/^tarillo/i, 'tarrillo'],
            
            // Corregir números mal transcritos
            [/999(\d)/g, '9999$1'], // "999" -> "9999" cuando hay más dígitos
            [/(\d)99(\d)/g, '$19999$2'], // Insertar 9s faltantes
            
            // Corregir dominios mal transcritos - SENATI
            [/@sennati\.p$/i, '@senati.pe'],
            [/@senatti\.pe$/i, '@senati.pe'],
            [/@cenati\.pe$/i, '@senati.pe'],
            [/@senati\.p$/i, '@senati.pe'],
            [/@snati\.pe$/i, '@senati.pe'],
            [/@snati\.p$/i, '@senati.pe'],
            [/@sati\.pe$/i, '@senati.pe'],
            [/@sati\.p$/i, '@senati.pe'],
            [/@salti\.pe$/i, '@senati.pe'],
            [/@saltti\.pe$/i, '@senati.pe'],
            [/@salty\.pe$/i, '@senati.pe'],
            [/@saltie\.pe$/i, '@senati.pe'],
            [/@salti\.p$/i, '@senati.pe'],
            
            // Corregir otros dominios mal transcritos
            [/@gmaill\.com$/i, '@gmail.com'],
            [/@gmall\.com$/i, '@gmail.com'],
            [/@gmaill\.co$/i, '@gmail.com'],
            [/@gmall\.co$/i, '@gmail.com'],
            [/@gmail\.co$/i, '@gmail.com'],
            [/@hotmail\.co$/i, '@hotmail.com'],
            [/@outlook\.co$/i, '@outlook.com']
        ];
        
        for (const [pattern, replacement] of patternCorrections) {
            processedEmail = processedEmail.replace(pattern, replacement);
        }
        
        // 6. Validación y limpieza final
        // Asegurar que tenga @ y .
        if (!processedEmail.includes('@') && processedEmail.includes('arroba')) {
            processedEmail = processedEmail.replace('arroba', '@');
        }
        
        if (!processedEmail.includes('.') && processedEmail.includes('punto')) {
            processedEmail = processedEmail.replace('punto', '.');
        }
        
        // 7. Validación de formato final
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Si no es válido, intentar reparaciones automáticas
        if (!emailRegex.test(processedEmail)) {
            // Intentar agregar .pe si falta extensión
            if (processedEmail.includes('@senati') && !processedEmail.includes('.')) {
                processedEmail += '.pe';
            }
            // Intentar agregar .com si falta extensión para gmail/hotmail/outlook
            else if ((processedEmail.includes('@gmail') || processedEmail.includes('@hotmail') || processedEmail.includes('@outlook')) && !processedEmail.includes('.')) {
                processedEmail += '.com';
            }
        }
        
        // Retornar el email procesado si es válido, o el texto original si no se pudo corregir
        return emailRegex.test(processedEmail) ? processedEmail : text;
    }
    
    activateEmailField() {
        if (this.emailInput) {
            this.emailInput.focus();
            this.emailInput.select();
        }
    }
    
    fillEmailField(emailContent) {
        // Sistema avanzado de limpieza y validación de email
        if (!emailContent) return;
        
        // 1. Procesar el contenido del email con correcciones automáticas
        let cleanedEmail = this.processEmailTranscription(emailContent);
        
        // 2. Limpieza adicional de palabras incoherentes y ruido
        cleanedEmail = this.cleanEmailInput(cleanedEmail);
        
        // 3. Validación final y formateo
        cleanedEmail = this.validateAndFormatEmail(cleanedEmail);
        
        // 4. Actualizar el campo de email solo si es válido
        if (this.emailInput && cleanedEmail) {
            this.emailInput.value = cleanedEmail;
            this.emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.emailFilled = true;
            this.updateLoginButtonState();
            
            // Feedback visual de éxito
            this.showFeedback(`✅ Email insertado: ${cleanedEmail}`, 'success');
        } else {
            this.showFeedback('❌ Error: Email no válido', 'error');
        }
    }
    
    cleanEmailInput(email) {
        // Función para limpiar palabras adicionales e incoherencias
        let cleaned = email.toLowerCase().trim();
        
        // Eliminar palabras de comando residuales
        const commandWords = [
            'email', 'correo', 'escribe', 'escribir', 'coloca', 'colocar',
            'ingresa', 'ingrese', 'poner', 'pon', 'dice', 'digo', 'es',
            'mi', 'el', 'la', 'en', 'para', 'por', 'con', 'sin', 'sobre',
            'campo', 'casilla', 'formulario', 'login', 'sesión', 'cuenta'
        ];
        
        // Crear patrón para eliminar palabras de comando
        const commandPattern = new RegExp(`\\b(${commandWords.join('|')})\\b`, 'gi');
        cleaned = cleaned.replace(commandPattern, '').trim();
        
        // Eliminar caracteres no válidos para emails (excepto los permitidos)
        cleaned = cleaned.replace(/[^a-z0-9@._-]/g, '');
        
        // Eliminar múltiples puntos consecutivos
        cleaned = cleaned.replace(/\.{2,}/g, '.');
        
        // Eliminar múltiples @ consecutivos
        cleaned = cleaned.replace(/@{2,}/g, '@');
        
        // Eliminar múltiples guiones consecutivos
        cleaned = cleaned.replace(/-{2,}/g, '-');
        
        // Eliminar puntos al inicio o final
        cleaned = cleaned.replace(/^\.+|\.+$/g, '');
        
        // Eliminar @ al inicio o final
        cleaned = cleaned.replace(/^@+|@+$/g, '');
        
        return cleaned;
    }
    
    validateAndFormatEmail(email) {
        // Función para validación final y formateo correcto
        if (!email) return '';
        
        let formatted = email.toLowerCase().trim();
        
        // Verificar estructura básica de email
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        
        if (!emailRegex.test(formatted)) {
            // Intentar reparaciones automáticas finales
            
            // Si no tiene @, buscar patrones comunes
            if (!formatted.includes('@')) {
                // Buscar patrones como "usuario.dominio.extension"
                const parts = formatted.split('.');
                if (parts.length >= 3) {
                    // Asumir que el último punto debería ser @
                    const lastDotIndex = formatted.lastIndexOf('.', formatted.lastIndexOf('.') - 1);
                    if (lastDotIndex > 0) {
                        formatted = formatted.substring(0, lastDotIndex) + '@' + formatted.substring(lastDotIndex + 1);
                    }
                }
            }
            
            // Si tiene múltiples @, mantener solo el primero
            const atIndex = formatted.indexOf('@');
            if (atIndex > 0) {
                const beforeAt = formatted.substring(0, atIndex);
                const afterAt = formatted.substring(atIndex + 1).replace(/@/g, '');
                formatted = beforeAt + '@' + afterAt;
            }
            
            // Verificar nuevamente después de las reparaciones
            if (!emailRegex.test(formatted)) {
                return ''; // Retornar vacío si no se puede reparar
            }
        }
        
        return formatted;
    }

    isValidEmail(email) {
        // Validación básica de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    processEmailInput(text) {
        // Procesar entrada de voz para email con optimizaciones
        return text
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/punto/g, '.')
            .replace(/arroba/g, '@')
            .replace(/guión/g, '-')
            .replace(/guion/g, '-')
            .replace(/underscore/g, '_')
            .replace(/más/g, '+')
            .replace(/gmail/g, 'gmail')
            .replace(/hotmail/g, 'hotmail')
            .replace(/outlook/g, 'outlook')
            .replace(/yahoo/g, 'yahoo');
    }
    
    attemptLogin() {
        if (this.canLogin()) {
            this.showFeedback('🔐 Iniciando sesión...', 'success');
            if (this.loginButton) {
                this.loginButton.click();
            }
        } else {
            let message = '❌ No se puede iniciar sesión: ';
            if (!this.faceReady) message += 'rostro no detectado';
            else if (!this.emailFilled) message += 'email requerido';
            
            this.showFeedback(message, 'error');
        }
    }
    
    canLogin() {
        return this.faceReady && this.emailFilled;
    }
    
    updateLoginButtonState() {
        if (this.loginButton) {
            const canLogin = this.canLogin();
            this.loginButton.disabled = !canLogin;
            
            // Agregar clases CSS para feedback visual
            if (canLogin) {
                this.loginButton.classList.add('voice-ready');
                this.loginButton.classList.remove('voice-waiting');
            } else {
                this.loginButton.classList.add('voice-waiting');
                this.loginButton.classList.remove('voice-ready');
            }
        }
    }
    
    updateVisualFeedback() {
        // Actualizar indicadores visuales basados en el estado
        const statusText = this.faceReady ? 
            '👤 Rostro detectado' : 
            '👤 Detectando rostro...';
        
        // Solo mostrar si no hay otro feedback activo
        if (!this.feedbackElement.style.display || this.feedbackElement.style.display === 'none') {
            this.showFeedback(statusText, this.faceReady ? 'success' : 'waiting', 2000);
        }
    }
    
    showFeedback(message, type = 'info', duration = 3000) {
        if (!this.feedbackElement) return;
        
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `voice-feedback-${type}`;
        this.feedbackElement.style.display = 'block';
        
        // Colores según el tipo
        const colors = {
            listening: 'rgba(0, 123, 255, 0.9)',
            success: 'rgba(40, 167, 69, 0.9)',
            error: 'rgba(220, 53, 69, 0.9)',
            waiting: 'rgba(255, 193, 7, 0.9)',
            interim: 'rgba(108, 117, 125, 0.9)',
            info: 'rgba(0, 0, 0, 0.8)'
        };
        
        this.feedbackElement.style.background = colors[type] || colors.info;
        
        if (duration > 0) {
            setTimeout(() => {
                if (this.feedbackElement) {
                    this.feedbackElement.style.display = 'none';
                }
            }, duration);
        }
    }

    checkVoiceConsent() {
        // Verificar si el usuario ha dado consentimiento para comandos de voz
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        
        if (voiceConsent === 'true') {
            // Si hay consentimiento, iniciar reconocimiento automáticamente
            setTimeout(() => this.startListening(), 1000);
            this.showFeedback('🎤 Comandos de voz activados', 'success');
        } else {
            // Si no hay consentimiento, mostrar mensaje informativo
            this.showFeedback('ℹ️ Registra tu voz en la página de registro para usar comandos de voz', 'info');
        }
    }

    shouldKeepListening() {
        // Mantener escuchando mientras la página esté activa y haya consentimiento
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        return !document.hidden && voiceConsent === 'true';
    }
    
    startListening() {
        // Verificar consentimiento antes de iniciar
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        if (voiceConsent !== 'true') {
            console.log('VoiceLogin: Consentimiento de voz no otorgado');
            return;
        }
        
        if (!this.recognition) {
            this.showFeedback('❌ Reconocimiento de voz no disponible', 'error');
            return;
        }

        if (this.isListening) {
            return;
        }
        
        try {
            // Verificar permisos antes de iniciar
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'microphone' }).then((result) => {
                    if (result.state === 'denied') {
                        this.showFeedback('❌ Permiso de micrófono denegado. Permite el acceso en la configuración del navegador.', 'error');
                        return;
                    }
                });
            }

            this.recognition.start();
        } catch (error) {
            console.error('Error al iniciar reconocimiento:', error);
            
            // Manejo específico de errores comunes
            if (error.name === 'InvalidStateError') {
                console.log('Reconocimiento ya en progreso, reiniciando...');
                this.stopListening();
                setTimeout(() => {
                    if (this.shouldKeepListening()) {
                        this.startListening();
                    }
                }, 500);
            } else {
                this.showFeedback('❌ Error iniciando reconocimiento de voz. Intenta nuevamente.', 'error');
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    destroy() {
        this.stopListening();
        if (this.feedbackElement) {
            this.feedbackElement.remove();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario ha dado consentimiento para comandos de voz
    const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
    
    if (voiceConsent === 'true') {
        window.voiceLogin = new VoiceLogin();
    } else {
        console.log('VoiceLogin: Comandos de voz no disponibles - consentimiento no otorgado');
    }
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (window.voiceLogin) {
        window.voiceLogin.destroy();
    }
});