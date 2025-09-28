// voice_register.js - Funcionalidad de registro de voz
class VoiceRegistration {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.recordingTimer = null;
        this.countdownTimer = null;
        this.isRecording = false;
        this.RECORD_SECONDS = 6;
        this.pendingToken = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializePendingToken();
    }

    // Método para inicializar el pending token desde el HTML
    initializePendingToken() {
        // Buscar el pending token en un elemento de datos o variable global
        const tokenElement = document.querySelector('[data-pending-token]');
        if (tokenElement) {
            this.pendingToken = tokenElement.getAttribute('data-pending-token');
        }
    }

    // Método para configurar el pending token externamente
    setPendingToken(token) {
        this.pendingToken = token;
        window.PENDING_TOKEN = token; // Mantener compatibilidad con código existente
    }

    initializeElements() {
        // Elementos del modal principal
        this.voiceModal = document.getElementById('voiceModal');
        this.voiceRecordingModal = document.getElementById('voiceRecordingModal');
        this.btnVoiceRegister = document.getElementById('btnVoiceRegister');
        this.acceptBtn = document.getElementById('voice-accept');
        this.cancelBtn = document.getElementById('voice-cancel');
        this.closeBtn = document.querySelector('.voice-modal-close');
        this.stopBtn = document.getElementById('voice-stop');
        
        // Elementos de UI de grabación
        this.countdownElement = document.getElementById('countdown');
        this.progressFill = document.getElementById('progressFill');
        this.recordingText = document.getElementById('recordingText');
        
        // Overlay para cerrar modal
        this.modalOverlays = document.querySelectorAll('.voice-modal-overlay');
    }

    bindEvents() {
        // Abrir modal al hacer click en botón de registro de voz
        if (this.btnVoiceRegister) {
            this.btnVoiceRegister.addEventListener('click', () => this.openModal());
        }

        // Botones del modal
        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', () => this.startRecording());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopRecording());
        }

        // Cerrar modal al hacer click en overlay
        this.modalOverlays.forEach(overlay => {
            overlay.addEventListener('click', () => this.closeModal());
        });

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal() {
        if (this.voiceModal) {
            this.voiceModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        if (this.voiceModal) {
            this.voiceModal.style.display = 'none';
        }
        if (this.voiceRecordingModal) {
            this.voiceRecordingModal.style.display = 'none';
        }
        document.body.style.overflow = '';
        
        // Limpiar recursos si está grabando
        if (this.isRecording) {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            // Cerrar modal de confirmación
            this.voiceModal.style.display = 'none';
            
            // Solicitar permiso de micrófono
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });

            // Configurar MediaRecorder
            const options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.audioChunks = [];

            // Eventos del MediaRecorder
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingComplete();
            };

            // Mostrar modal de grabación
            this.showRecordingModal();
            
            // Iniciar grabación
            this.mediaRecorder.start();
            this.isRecording = true;

            // Configurar timer automático
            this.recordingTimer = setTimeout(() => {
                this.stopRecording();
            }, this.RECORD_SECONDS * 1000);

            // Iniciar countdown
            this.startCountdown();

        } catch (error) {
            console.error('Error al acceder al micrófono:', error);
            this.showError('No se pudo acceder al micrófono. Verifica los permisos.');
            this.closeModal();
        }
    }

    showRecordingModal() {
        if (this.voiceRecordingModal) {
            this.voiceRecordingModal.style.display = 'flex';
            this.resetRecordingUI();
        }
    }

    resetRecordingUI() {
        if (this.countdownElement) {
            this.countdownElement.textContent = this.RECORD_SECONDS;
        }
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }
        if (this.recordingText) {
            this.recordingText.innerHTML = `Grabando… Mantén la voz clara. Quedan <span id="countdown">${this.RECORD_SECONDS}</span>s.`;
        }
    }

    startCountdown() {
        let timeLeft = this.RECORD_SECONDS;
        
        // Agregar clase de grabación activa al modal
        if (this.voiceRecordingModal) {
            this.voiceRecordingModal.classList.add('recording-active');
        }
        
        // Agregar animación pulsante al botón de registro de voz
        const voiceBtn = document.getElementById('btnVoiceRegister');
        if (voiceBtn) {
            voiceBtn.classList.add('recording');
        }
        
        this.countdownTimer = setInterval(() => {
            timeLeft--;
            
            if (this.countdownElement) {
                this.countdownElement.textContent = timeLeft;
            }
            
            // Actualizar barra de progreso con animación suave
            const progress = ((this.RECORD_SECONDS - timeLeft) / this.RECORD_SECONDS) * 100;
            if (this.progressFill) {
                this.progressFill.style.width = `${progress}%`;
                
                // Cambiar color de la barra según el progreso
                if (progress > 80) {
                    this.progressFill.style.background = '#ef4444'; // Rojo al final
                } else if (progress > 50) {
                    this.progressFill.style.background = '#f59e0b'; // Amarillo en la mitad
                } else {
                    this.progressFill.style.background = 'var(--accent)'; // Color normal
                }
            }
            
            // Efecto de parpadeo en los últimos 3 segundos
            if (timeLeft <= 3 && timeLeft > 0) {
                if (this.recordingText) {
                    this.recordingText.style.animation = 'blink 0.5s infinite';
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.countdownTimer);
            }
        }, 1000);
    }

    stopRecording() {
        if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }

        // Remover clases de animación
        if (this.voiceRecordingModal) {
            this.voiceRecordingModal.classList.remove('recording-active');
        }
        
        const voiceBtn = document.getElementById('btnVoiceRegister');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
        }
        
        // Remover animación de parpadeo
        if (this.recordingText) {
            this.recordingText.style.animation = '';
        }

        // Limpiar timers
        if (this.recordingTimer) {
            clearTimeout(this.recordingTimer);
            this.recordingTimer = null;
        }
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }

        // Detener stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    async handleRecordingComplete() {
        try {
            // Mostrar estado de guardando
            this.showSavingState();

            // Crear blob de audio
            const audioBlob = new Blob(this.audioChunks, { 
                type: this.mediaRecorder.mimeType || 'audio/webm' 
            });

            // Validar tamaño del archivo
            if (audioBlob.size === 0) {
                throw new Error('No se grabó audio');
            }

            if (audioBlob.size > 10 * 1024 * 1024) { // 10MB
                throw new Error('El archivo de audio es demasiado grande');
            }

            // Preparar FormData
            const formData = new FormData();
            const fileName = `voice_sample_${Date.now()}.webm`;
            formData.append('audio', audioBlob, fileName);
            
            // Agregar pending token si existe
            if (this.pendingToken) {
                formData.append('pending_token', this.pendingToken);
            } else if (window.PENDING_TOKEN) {
                formData.append('pending_token', window.PENDING_TOKEN);
            }

            // Enviar al servidor
            const response = await fetch('/voz/api/register_audio/', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': this.getCookie('csrftoken'),
                }
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Voz registrada correctamente');
                // Marcar que el registro se completó exitosamente
                sessionStorage.setItem('voice_registration_completed', 'true');
                // Actualizar UI para permitir comandos de voz
                this.enableVoiceCommands();
                // Disparar evento para habilitar comandos de voz
                document.dispatchEvent(new CustomEvent('voiceRegistered'));
            } else {
                throw new Error(data.error || 'Error al guardar la voz');
            }

        } catch (error) {
            console.error('Error al procesar grabación:', error);
            this.showError('Error: no se pudo guardar la voz. Intenta de nuevo.');
        } finally {
            // Cerrar modal después de un delay
            setTimeout(() => {
                this.closeModal();
            }, 2000);
        }
    }

    showSavingState() {
        if (this.recordingText) {
            this.recordingText.innerHTML = 'Guardando...';
        }
        if (this.stopBtn) {
            this.stopBtn.disabled = true;
            this.stopBtn.textContent = 'Guardando...';
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
        if (this.recordingText) {
            this.recordingText.innerHTML = `✅ ${message}`;
        }
    }

    showError(message) {
        this.showToast(message, 'error');
        if (this.recordingText) {
            this.recordingText.innerHTML = `❌ ${message}`;
        }
    }

    showToast(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Estilos del toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Color según tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        toast.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 4 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    enableVoiceCommands() {
        // Marcar que los comandos de voz están disponibles
        localStorage.setItem('voiceCommandsEnabled', 'true');
        
        // Actualizar UI del botón de registro de voz
        if (this.btnVoiceRegister) {
            this.btnVoiceRegister.innerHTML = `
                <i class="fas fa-microphone"></i>
                <span>Voz registrada</span>
            `;
            this.btnVoiceRegister.style.opacity = '0.7';
            this.btnVoiceRegister.style.pointerEvents = 'none';
        }
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

// Función para obtener CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el navegador soporta las APIs necesarias
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('MediaDevices API no soportada en este navegador');
        return;
    }

    if (!window.MediaRecorder) {
        console.warn('MediaRecorder API no soportada en este navegador');
        return;
    }

    // Inicializar la funcionalidad de registro de voz
    window.voiceRegistration = new VoiceRegistration();
});