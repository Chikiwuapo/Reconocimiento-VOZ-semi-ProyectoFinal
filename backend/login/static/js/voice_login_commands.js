// voice_login_commands.js - Sistema de comandos de voz específicos para login
class VoiceLoginCommands {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isEnabled = false;
        this.faceReady = false;
        this.commands = new Map();
        this.feedbackElement = null;
        this.statusElement = null;
        this.emailField = null;
        this.loginButton = null;
        this.lastCommand = null;
        this.commandTimeout = null;
        
        this.initializeElements();
        this.initializeCommands();
        this.setupSpeechRecognition();
        this.createFeedbackElements();
        this.bindEvents();
        // Verificar consentimiento antes de iniciar reconocimiento automáticamente
        this.checkVoiceConsent();
    }

    initializeElements() {
        // Elementos específicos del login
        this.emailField = document.getElementById('email');
        this.loginButton = document.getElementById('btnLogin');
        
        if (!this.emailField || !this.loginButton) {
            console.error('VoiceLoginCommands: Elementos del formulario no encontrados');
            return;
        }
    }

    bindEvents() {
        // Escuchar cambios en el estado facial
        document.addEventListener('faceStatusChanged', (event) => {
            this.faceReady = event.detail.ready;
            this.updateSystemState();
        });

        // Monitorear cambios en el botón de login (habilitado por facemesh.js)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                    this.faceReady = !this.loginButton.disabled;
                    this.updateSystemState();
                }
            });
        });

        if (this.loginButton) {
            observer.observe(this.loginButton, { attributes: true });
        }

        // Eventos del campo email
        if (this.emailField) {
            this.emailField.addEventListener('focus', () => {
                if (this.isEnabled) {
                    this.showStatus('🎤 Diga su email...', 'listening');
                }
            });

            this.emailField.addEventListener('input', () => {
                this.updateSystemState();
            });
        }
    }

    initializeCommands() {
        // Comando para activar campo email
        this.commands.set(/^(email|correo)$/i, () => {
            this.focusEmailField();
            this.showSuccess('✅ Campo email activado');
        });

        // Comando para dictar email completo
        this.commands.set(/^(?:email|correo)\s+(.+)/i, (match) => {
            const emailContent = this.processEmailInput(match[1].trim());
            this.fillEmailField(emailContent);
        });

        // Comandos optimizados para "Escribe en Email" y "Coloca en Correo"
        this.commands.set(/^(?:escribe|escribir)\s+en\s+(?:email|correo)\s+(.+)/i, (match) => {
            const emailContent = this.processEmailInput(match[1].trim());
            this.fillEmailField(emailContent);
        });

        this.commands.set(/^(?:coloca|colocar)\s+en\s+(?:email|correo)\s+(.+)/i, (match) => {
            const emailContent = this.processEmailInput(match[1].trim());
            this.fillEmailField(emailContent);
        });

        // Comando para iniciar sesión con validación
        this.commands.set(/^(inicia\s+sesi[oó]n|iniciar\s+sesi[oó]n|login|entrar|acceder)$/i, () => {
            this.attemptLogin();
        });

        // Comandos de navegación
        this.commands.set(/^(crear\s+cuenta|registro|registrarse|nueva\s+cuenta)$/i, () => {
            this.showSuccess('✅ Redirigiendo a registro...');
            setTimeout(() => {
                window.location.href = '/register/';
            }, 1000);
        });

        // Comando para limpiar email
        this.commands.set(/^(limpiar|borrar|vaciar|eliminar)\s*(?:email|correo)?$/i, () => {
            this.clearEmailField();
        });

        // Comando de ayuda
        this.commands.set(/^(ayuda|help|comandos)$/i, () => {
            this.showHelp();
        });

        // Comando para repetir último comando
        this.commands.set(/^(repetir|otra\s+vez|de\s+nuevo)$/i, () => {
            if (this.lastCommand) {
                this.processCommand(this.lastCommand);
            } else {
                this.showError('❌ No hay comando anterior para repetir');
            }
        });
    }

    setupSpeechRecognition() {
        // Verificar soporte del navegador - OPTIMIZADO
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('VoiceLoginCommands: Reconocimiento de voz no soportado');
            this.showError('❌ Reconocimiento de voz no soportado en este navegador');
            return;
        }

        // Inicializar reconocimiento con configuración optimizada
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configuración optimizada para mejor rendimiento
        this.recognition.continuous = true;
        this.recognition.interimResults = false; // Desactivar resultados intermedios para mejor rendimiento
        this.recognition.lang = 'es-ES';
        this.recognition.maxAlternatives = 1; // Reducir alternativas para mejor rendimiento
        
        // Eventos optimizados
        this.recognition.onstart = () => {
            console.log('VoiceLoginCommands: Reconocimiento iniciado');
            this.isListening = true;
            this.showStatus('🎤 Escuchando comandos de voz...', 'listening');
        };
        
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                console.log('VoiceLoginCommands: Transcripción final:', transcript);
                if (transcript) {
                    this.processCommand(transcript.toLowerCase());
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('VoiceLoginCommands: Error de reconocimiento:', event.error);
            
            // Manejo optimizado de errores
            switch (event.error) {
                case 'no-speech':
                    this.showStatus('🔇 No se detectó voz. Intenta hablar más claro.', 'warning');
                    break;
                case 'audio-capture':
                    this.showError('❌ Error de micrófono. Verifica los permisos.');
                    break;
                case 'not-allowed':
                    this.showError('❌ Permisos de micrófono denegados.');
                    break;
                case 'network':
                    this.showStatus('🌐 Error de red. Reintentando...', 'warning');
                    setTimeout(() => this.startListening(), 1000);
                    break;
                default:
                    this.showError(`❌ Error: ${event.error}`);
            }
            
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            console.log('VoiceLoginCommands: Reconocimiento terminado');
            this.isListening = false;
            
            // Reinicio automático optimizado con menor delay
            if (this.isEnabled) {
                setTimeout(() => {
                    if (this.isEnabled) {
                        this.startListening();
                    }
                }, 100); // Reducido de 50ms a 100ms para mejor estabilidad
            }
        };
    }

    checkVoiceConsent() {
        // Verificar si el usuario ha dado consentimiento para comandos de voz
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        
        if (voiceConsent === 'true') {
            // Si hay consentimiento, iniciar reconocimiento automáticamente
            this.startListening();
            this.showStatus('🎤 Comandos de voz activados', 'ready');
        } else {
            // Si no hay consentimiento, mostrar mensaje informativo
            this.showStatus('ℹ️ Registra tu voz en la página de registro para usar comandos de voz', 'waiting');
        }
    }

    startListening() {
        // Verificar consentimiento antes de iniciar
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        if (voiceConsent !== 'true') {
            console.log('VoiceLoginCommands: Consentimiento de voz no otorgado');
            return;
        }
        
        if (!this.recognition || this.isListening) return;
        
        try {
            this.isEnabled = true;
            this.recognition.start();
        } catch (error) {
            console.error('VoiceLoginCommands: Error al iniciar:', error);
            setTimeout(() => this.startListening(), 2000);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.isEnabled = false;
            this.recognition.stop();
        }
    }

    processCommand(transcript) {
        console.log('VoiceLoginCommands: Procesando comando:', transcript);
        this.lastCommand = transcript;
        
        // Limpiar timeout anterior
        if (this.commandTimeout) {
            clearTimeout(this.commandTimeout);
        }
        
        // Procesamiento optimizado de comandos de email
        const emailMatch = transcript.match(/(?:email|correo)\s+(.+)/i);
        if (emailMatch) {
            const emailValue = this.processEmailTranscription(emailMatch[1].trim());
            if (emailValue && this.emailField) {
                this.emailField.value = emailValue;
                this.emailField.dispatchEvent(new Event('input', { bubbles: true }));
                this.showSuccess(`✅ ${emailValue}`);
                return;
            }
        }
        
        // Comando de login optimizado
        if (/(?:login|iniciar sesión|entrar|inicia sesión)/i.test(transcript)) {
            this.executeLogin();
            return;
        }
        
        // Comando de limpiar optimizado
        if (/(?:limpiar|borrar|vaciar)/i.test(transcript)) {
            if (this.emailField) {
                this.emailField.value = '';
                this.emailField.dispatchEvent(new Event('input', { bubbles: true }));
                this.showSuccess('✅ Campo limpiado');
            }
            return;
        }
        
        // Comando de ayuda optimizado
        if (/(?:ayuda|help|comandos)/i.test(transcript)) {
            this.showHelp();
            return;
        }
        
        // Si no se reconoce el comando, mostrar ayuda concisa
        this.showError('❌ Comando no reconocido. Diga "email [dirección]" o "login"');
        
        // Timeout para limpiar el estado
        this.commandTimeout = setTimeout(() => {
            if (this.isEnabled) {
                this.showStatus('🎤 Escuchando comandos...', 'listening');
            }
        }, 3000);
    }
    
    processEmailTranscription(text) {
        // Función optimizada para procesar emails hablados - MEJORADA PARA RENDIMIENTO
        let processedEmail = text.toLowerCase().trim();
        
        // 1. Limpieza rápida inicial - Una sola pasada
        processedEmail = processedEmail
            .replace(/^(email|correo|escribe|escribir|coloca|colocar|en|el|la|mi|es|dice|digo|ingresa|ingrese|poner|pon)\s*/gi, '')
            .replace(/\s+/g, '') // Eliminar espacios múltiples
            .replace(/punto/g, '.')
            .replace(/arroba/g, '@');
        
        // 2. Correcciones críticas optimizadas - Solo las más comunes
        const quickCorrections = {
            // Solo dominios más frecuentes
            'gmai': 'gmail', 'gmeil': 'gmail', 'gmaill': 'gmail', 'gmall': 'gmail', 'jmail': 'gmail',
            'hotmeil': 'hotmail', 'otmail': 'hotmail',
            'outluk': 'outlook', 'outlok': 'outlook',
            'sennati': 'senati', 'cenati': 'senati', 'snati': 'senati',
            // Números más comunes
            'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
            'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9'
        };
        
        // Aplicar correcciones en una sola pasada
        for (const [wrong, correct] of Object.entries(quickCorrections)) {
            if (processedEmail.includes(wrong)) {
                processedEmail = processedEmail.replace(new RegExp(wrong, 'g'), correct);
            }
        }
        
        // 3. Correcciones específicas críticas - Solo las esenciales
        if (processedEmail.includes('carrillo')) processedEmail = processedEmail.replace(/carrillo/g, 'tarrillo');
        if (processedEmail.includes('carillo')) processedEmail = processedEmail.replace(/carillo/g, 'tarrillo');
        
        // 4. Reparaciones de dominio rápidas
        if (processedEmail.includes('@senati') && !processedEmail.includes('.pe')) {
            processedEmail = processedEmail.replace(/@senati$/, '@senati.pe');
        }
        if (processedEmail.includes('@gmail') && !processedEmail.includes('.com')) {
            processedEmail = processedEmail.replace(/@gmail$/, '@gmail.com');
        }
        if (processedEmail.includes('@hotmail') && !processedEmail.includes('.com')) {
            processedEmail = processedEmail.replace(/@hotmail$/, '@hotmail.com');
        }
        
        // Correcciones específicas para dominios con letras extra
        processedEmail = processedEmail
            .replace(/@gmaill\.com$/i, '@gmail.com')
            .replace(/@gmall\.com$/i, '@gmail.com')
            .replace(/@gmaill\.co$/i, '@gmail.com')
            .replace(/@gmall\.co$/i, '@gmail.com');
        
        // 5. Validación final rápida
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(processedEmail) ? processedEmail : text;
    }

    focusEmailField() {
        if (this.emailField) {
            this.emailField.focus();
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
        const emailField = document.getElementById('email');
        if (emailField && cleanedEmail) {
            emailField.value = cleanedEmail;
            emailField.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Feedback visual de éxito
            this.showStatus(`Email ingresado: ${cleanedEmail}`, 'success');
        } else {
            this.showStatus('Error: Email no válido', 'error');
        }
    }
    
    cleanEmailInput(email) {
        // Función optimizada para limpiar emails - MEJORADA PARA RENDIMIENTO
        if (!email) return '';
        
        let cleaned = email.toLowerCase().trim();
        
        // Limpieza rápida en una sola pasada
        cleaned = cleaned
            .replace(/\b(email|correo|escribe|escribir|coloca|colocar|ingresa|ingrese|poner|pon|dice|digo|es|mi|el|la|en|campo|casilla)\b/gi, '')
            .replace(/[^a-z0-9@._-]/g, '') // Solo caracteres válidos
            .replace(/\.{2,}/g, '.') // Múltiples puntos
            .replace(/@{2,}/g, '@') // Múltiples @
            .replace(/-{2,}/g, '-') // Múltiples guiones
            .replace(/^[.@-]+|[.@-]+$/g, ''); // Limpiar inicio/final
        
        return cleaned;
    }
    
    validateAndFormatEmail(email) {
        // Función optimizada para validación - MEJORADA PARA RENDIMIENTO
        if (!email) return '';
        
        let formatted = email.toLowerCase().trim();
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        
        // Validación rápida inicial
        if (emailRegex.test(formatted)) {
            return formatted;
        }
        
        // Solo reparaciones críticas si falla la validación inicial
        if (!formatted.includes('@')) {
            // Buscar patrón usuario.dominio.extension y convertir último punto a @
            const lastDotIndex = formatted.lastIndexOf('.');
            const secondLastDotIndex = formatted.lastIndexOf('.', lastDotIndex - 1);
            if (secondLastDotIndex > 0) {
                formatted = formatted.substring(0, secondLastDotIndex) + '@' + formatted.substring(secondLastDotIndex + 1);
            }
        }
        
        // Si tiene múltiples @, mantener solo el primero
        const atIndex = formatted.indexOf('@');
        if (atIndex > 0 && formatted.indexOf('@', atIndex + 1) > 0) {
            const beforeAt = formatted.substring(0, atIndex);
            const afterAt = formatted.substring(atIndex + 1).replace(/@/g, '');
            formatted = beforeAt + '@' + afterAt;
        }
        
        return emailRegex.test(formatted) ? formatted : '';
    }

    isValidEmail(email) {
        // Validación básica de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearEmailField() {
        if (this.emailField) {
            this.emailField.value = '';
            this.emailField.focus();
            this.showSuccess('✅ Email limpiado');
            this.updateSystemState();
        }
    }

    processEmailInput(text) {
        // Procesar entrada de voz para email con optimizaciones mejoradas
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
            .replace(/yahoo/g, 'yahoo')
            .replace(/tarrillo/g, 'tarrillo')
            .replace(/novecientos noventa y nueve/g, '999')
            .replace(/novecientos/g, '900')
            .replace(/noventa/g, '90')
            .replace(/nueve/g, '9');
    }

    attemptLogin() {
        const hasEmail = this.emailField && this.emailField.value.trim();
        
        if (!this.faceReady) {
            this.showError('❌ Primero debe completarse el reconocimiento facial');
            return;
        }
        
        if (!hasEmail) {
            this.showError('❌ Ingrese su email primero');
            this.focusEmailField();
            return;
        }
        
        if (this.loginButton && !this.loginButton.disabled) {
            this.showSuccess('✅ Iniciando sesión...');
            this.loginButton.click();
        } else {
            this.showError('❌ Login no disponible. Verifique los datos.');
        }
    }

    updateSystemState() {
        const hasEmail = this.emailField && this.emailField.value.trim();
        
        if (this.faceReady && hasEmail) {
            this.showStatus('✅ Listo para login. Diga "inicia sesión"', 'ready');
        } else if (this.faceReady && !hasEmail) {
            this.showStatus('📧 Diga "email" seguido de su correo', 'info');
        } else if (!this.faceReady) {
            this.showStatus('👤 Posicione su rostro para reconocimiento facial', 'info');
        }
    }

    showHelp() {
        const helpMessage = `
Comandos disponibles:
• "Email [su_email]" - Dictar email
• "Inicia sesión" - Hacer login
• "Limpiar" - Borrar email
• "Crear cuenta" - Ir a registro
        `.trim();
        
        this.showStatus(helpMessage, 'info');
    }

    createFeedbackElements() {
        // Crear elemento de estado si no existe
        if (!document.getElementById('voiceLoginStatus')) {
            this.statusElement = document.createElement('div');
            this.statusElement.id = 'voiceLoginStatus';
            this.statusElement.className = 'voice-login-status';
            this.statusElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                z-index: 1000;
                max-width: 320px;
                display: none;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border-left: 4px solid #3b82f6;
            `;
            document.body.appendChild(this.statusElement);
        } else {
            this.statusElement = document.getElementById('voiceLoginStatus');
        }
    }

    showStatus(message, type = 'info') {
        if (!this.statusElement) return;
        
        this.statusElement.innerHTML = message.replace(/\n/g, '<br>');
        this.statusElement.className = `voice-login-status ${type}`;
        this.statusElement.style.display = 'block';
        
        // Colores según el tipo
        switch (type) {
            case 'listening':
                this.statusElement.style.background = 'rgba(59, 130, 246, 0.95)';
                this.statusElement.style.borderLeftColor = '#3b82f6';
                break;
            case 'ready':
                this.statusElement.style.background = 'rgba(34, 197, 94, 0.95)';
                this.statusElement.style.borderLeftColor = '#22c55e';
                break;
            case 'error':
                this.statusElement.style.background = 'rgba(239, 68, 68, 0.95)';
                this.statusElement.style.borderLeftColor = '#ef4444';
                break;
            case 'info':
                this.statusElement.style.background = 'rgba(99, 102, 241, 0.95)';
                this.statusElement.style.borderLeftColor = '#6366f1';
                break;
            default:
                this.statusElement.style.background = 'rgba(0, 0, 0, 0.9)';
                this.statusElement.style.borderLeftColor = '#6b7280';
        }
        
        // Auto-ocultar según el tipo
        if (type !== 'listening') {
            setTimeout(() => {
                if (this.statusElement && this.statusElement.style.display === 'block') {
                    this.statusElement.style.display = 'none';
                }
            }, type === 'info' ? 5000 : 3000);
        }
    }

    showSuccess(message) {
        this.showStatus(message, 'ready');
    }

    showError(message) {
        this.showStatus(message, 'error');
    }

    // Método para destruir la instancia
    destroy() {
        this.stopListening();
        if (this.statusElement) {
            this.statusElement.remove();
        }
        if (this.commandTimeout) {
            clearTimeout(this.commandTimeout);
        }
    }
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página de login
    if (document.getElementById('email') && document.getElementById('btnLogin')) {
        // Esperar un poco para que facemesh.js se inicialice
        setTimeout(() => {
            window.voiceLoginCommands = new VoiceLoginCommands();
        }, 1000);
    }
});

// Exportar para uso global
window.VoiceLoginCommands = VoiceLoginCommands;