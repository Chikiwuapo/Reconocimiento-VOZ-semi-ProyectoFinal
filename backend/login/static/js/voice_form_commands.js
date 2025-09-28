// voice_form_commands.js - Sistema de comandos de voz para llenar formularios
class VoiceFormCommands {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isActive = false;
        this.commands = this.initializeCommands();
        this.feedbackElement = null;
        
        this.initializeRecognition();
        this.createFeedbackUI();
        this.bindEvents();
    }

    initializeCommands() {
        return {
            // Comandos para campos del formulario
            'nombres': {
                patterns: [
                    /^(?:escribe en nombres?|nombre es|mi nombre es|nombres?)\s+(.+)$/i,
                    /^(?:en el campo nombres?|campo nombres?)\s+(.+)$/i
                ],
                field: 'nombres',
                description: 'Escribe en nombres [nombre]'
            },
            'apellidos': {
                patterns: [
                    /^(?:escribe en apellidos?|apellido es|mis apellidos son|apellidos?)\s+(.+)$/i,
                    /^(?:en el campo apellidos?|campo apellidos?)\s+(.+)$/i
                ],
                field: 'apellidos',
                description: 'Escribe en apellidos [apellido]'
            },
            'email': {
                patterns: [
                    /^(?:escribe en email|email es|mi email es|correo es)\s+(.+)$/i,
                    /^(?:en el campo email|campo email|correo electrónico)\s+(.+)$/i
                ],
                field: 'email',
                description: 'Escribe en email [correo]'
            },
            'dni': {
                patterns: [
                    /^(?:escribe en dni|dni es|mi dni es|documento es)\s+(.+)$/i,
                    /^(?:en el campo dni|campo dni|número de documento)\s+(.+)$/i
                ],
                field: 'dni',
                description: 'Escribe en DNI [número]'
            },
            // Comandos de control
            'control': {
                patterns: [
                    /^(?:activar comandos de voz|iniciar comandos|escuchar comandos)$/i,
                    /^(?:desactivar comandos de voz|parar comandos|dejar de escuchar)$/i,
                    /^(?:limpiar formulario|borrar todo|vaciar campos)$/i,
                    /^(?:ayuda|qué puedo decir|comandos disponibles)$/i
                ]
            }
        };
    }

    initializeRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech Recognition API no soportada en este navegador');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'es-ES';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateFeedback('🎤 Escuchando comandos de voz...', 'listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.isActive) {
                // Reiniciar automáticamente si está activo
                setTimeout(() => this.startListening(), 100);
            } else {
                this.updateFeedback('🔇 Comandos de voz desactivados', 'inactive');
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
            if (event.error === 'not-allowed') {
                this.updateFeedback('❌ Permisos de micrófono denegados', 'error');
            } else {
                this.updateFeedback('⚠️ Error en reconocimiento de voz', 'error');
            }
        };

        this.recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.trim();
                this.processCommand(transcript);
            }
        };
    }

    createFeedbackUI() {
        // Crear elemento de feedback si no existe
        this.feedbackElement = document.getElementById('voice-feedback');
        if (!this.feedbackElement) {
            this.feedbackElement = document.createElement('div');
            this.feedbackElement.id = 'voice-feedback';
            this.feedbackElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                max-width: 300px;
                display: none;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(this.feedbackElement);
        }
    }

    updateFeedback(message, type = 'info') {
        if (!this.feedbackElement) return;
        
        const colors = {
            listening: '#2E86AB',
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            inactive: '#7F8C8D',
            info: '#3498DB'
        };

        this.feedbackElement.textContent = message;
        this.feedbackElement.style.backgroundColor = colors[type] || colors.info;
        this.feedbackElement.style.display = 'block';

        // Auto-ocultar después de 3 segundos para mensajes que no sean de estado
        if (!['listening', 'inactive'].includes(type)) {
            setTimeout(() => {
                if (this.feedbackElement) {
                    this.feedbackElement.style.display = 'none';
                }
            }, 3000);
        }
    }

    bindEvents() {
        // Crear botón de activación/desactivación
        this.createToggleButton();
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + V para activar/desactivar
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggle();
            }
            
            // Escape para desactivar
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
            }
        });
    }

    createToggleButton() {
        const existingButton = document.getElementById('voice-commands-toggle');
        if (existingButton) return;

        const button = document.createElement('button');
        button.id = 'voice-commands-toggle';
        button.innerHTML = '🎤 Comandos de Voz';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2E86AB;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', () => this.toggle());
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });

        document.body.appendChild(button);
        this.toggleButton = button;
    }

    processCommand(transcript) {
        console.log('Comando recibido:', transcript);
        this.updateFeedback(`Procesando: "${transcript}"`, 'info');

        // Buscar coincidencias en los comandos
        for (const [category, commandData] of Object.entries(this.commands)) {
            if (category === 'control') {
                if (this.processControlCommand(transcript)) return;
                continue;
            }

            for (const pattern of commandData.patterns) {
                const match = transcript.match(pattern);
                if (match) {
                    const value = match[1].trim();
                    this.fillField(commandData.field, value);
                    return;
                }
            }
        }

        // Si no se encontró comando válido
        this.updateFeedback('❓ Comando no reconocido. Di "ayuda" para ver comandos disponibles.', 'warning');
    }

    processControlCommand(transcript) {
        if (/^(?:activar comandos de voz|iniciar comandos|escuchar comandos)$/i.test(transcript)) {
            this.activate();
            return true;
        }
        
        if (/^(?:desactivar comandos de voz|parar comandos|dejar de escuchar)$/i.test(transcript)) {
            this.deactivate();
            return true;
        }
        
        if (/^(?:limpiar formulario|borrar todo|vaciar campos)$/i.test(transcript)) {
            this.clearForm();
            return true;
        }
        
        if (/^(?:ayuda|qué puedo decir|comandos disponibles)$/i.test(transcript)) {
            this.showHelp();
            return true;
        }
        
        return false;
    }

    fillField(fieldName, value) {
        const field = document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            // Añadir clase de resaltado durante el autocompletado
            field.classList.add('voice-active');
            field.focus();
            
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
                    field.blur(); // Trigger change events
                    
                    // Remover clase de resaltado después de completar
                    setTimeout(() => {
                        field.classList.remove('voice-active');
                    }, 1500);
                }
            }, 50);
            
            this.updateFeedback(`✅ Campo "${fieldName}" completado: ${value}`, 'success');
        } else {
            this.updateFeedback(`❌ Campo "${fieldName}" no encontrado`, 'error');
        }
    }

    clearForm() {
        const fields = ['nombres', 'apellidos', 'email', 'dni'];
        fields.forEach(fieldName => {
            const field = document.querySelector(`input[name="${fieldName}"]`);
            if (field) {
                field.value = '';
                const event = new Event('input', { bubbles: true });
                field.dispatchEvent(event);
            }
        });
        this.updateFeedback('🗑️ Formulario limpiado', 'success');
    }

    showHelp() {
        const helpText = `
Comandos disponibles:
• "Escribe en nombres [tu nombre]"
• "Escribe en apellidos [tus apellidos]"
• "Escribe en email [tu correo]"
• "Escribe en DNI [tu documento]"
• "Limpiar formulario"
• "Desactivar comandos de voz"

Atajo: Ctrl+Shift+V para activar/desactivar
        `.trim();
        
        alert(helpText);
    }

    activate() {
        if (!this.recognition) {
            this.updateFeedback('❌ Reconocimiento de voz no disponible', 'error');
            return;
        }
        
        this.isActive = true;
        this.startListening();
        
        if (this.toggleButton) {
            this.toggleButton.style.background = '#E74C3C';
            this.toggleButton.innerHTML = '🔴 Desactivar Voz';
        }
    }

    deactivate() {
        this.isActive = false;
        this.stopListening();
        
        if (this.toggleButton) {
            this.toggleButton.style.background = '#2E86AB';
            this.toggleButton.innerHTML = '🎤 Comandos de Voz';
        }
        
        this.updateFeedback('🔇 Comandos de voz desactivados', 'inactive');
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error al iniciar reconocimiento:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de registro
    if (document.querySelector('input[name="nombres"]')) {
        // Verificar si el usuario ha completado el proceso de consentimiento de voz
        const voiceConsent = localStorage.getItem('voiceCommandsEnabled');
        
        // Solo inicializar si hay consentimiento Y registro completado
        if (voiceConsent === 'true') {
            // Verificar si realmente completó el proceso de registro de voz
            const hasVoiceRegistration = sessionStorage.getItem('voice_registration_completed');
            
            if (hasVoiceRegistration) {
                window.voiceFormCommands = new VoiceFormCommands();
                console.log('Sistema de comandos de voz inicializado');
            } else {
                console.log('Comandos de voz no disponibles: registro de voz no completado');
                // Limpiar consentimiento inválido
                localStorage.removeItem('voiceCommandsEnabled');
            }
        } else {
            console.log('Comandos de voz no disponibles: consentimiento no otorgado');
        }
        
        // Escuchar el evento de registro de voz exitoso
        document.addEventListener('voiceRegistered', function() {
            console.log('Evento voiceRegistered recibido en voice_form_commands');
            // Marcar que el registro se completó exitosamente
            sessionStorage.setItem('voice_registration_completed', 'true');
            // Inicializar comandos de voz si no están ya inicializados
            if (!window.voiceFormCommands) {
                window.voiceFormCommands = new VoiceFormCommands();
                console.log('Sistema de comandos de voz inicializado después del registro');
            }
        });
    }
});