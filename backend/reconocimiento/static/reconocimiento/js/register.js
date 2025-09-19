/**
 * register.js - Sistema de registro facial con captura de múltiples ángulos
 * Maneja formulario de datos personales y captura de embeddings faciales
 */

class FacialRegistrationSystem {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.faceMesh = null;
        this.isCapturing = false;
        this.isProcessingVideo = false;
        this.capturedImages = [];
        this.requiredImages = 8;
        this.userData = {};
        this.storageKey = 'facial_registration_data';
        
        // Estado de la aplicación
        this.currentStep = 'form'; // 'form', 'camera', 'processing'
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.checkIfComingFromLogin();
        this.loadSavedData();
        this.checkNavigationState();
    }

    checkIfComingFromLogin() {
        // Si viene desde login, limpiar datos previos para empezar fresh
        const referrer = document.referrer;
        const urlParams = new URLSearchParams(window.location.search);
        const fromLogin = urlParams.get('from') === 'login' || referrer.includes('/login/');
        
        if (fromLogin) {
            console.log('🔄 Navegación desde login detectada, limpiando datos previos');
            this.clearSavedData();
            this.resetToFormStep();
        }
    }

    resetToFormStep() {
        // Asegurar que siempre inicie en el formulario
        this.currentStep = 'form';
        this.capturedImages = [];
        this.userData = {};
        
        // Mostrar formulario y ocultar cámara
        if (this.registrationForm) this.registrationForm.style.display = 'block';
        if (this.cameraSection) this.cameraSection.style.display = 'none';
        if (this.formInstructions) this.formInstructions.style.display = 'block';
        if (this.cameraInstructions) this.cameraInstructions.style.display = 'none';
        
        // Mostrar botón correcto
        if (this.proceedToCameraBtn) this.proceedToCameraBtn.style.display = 'inline-block';
        if (this.startCaptureBtn) this.startCaptureBtn.style.display = 'none';
        if (this.stopCaptureBtn) this.stopCaptureBtn.style.display = 'none';
        if (this.editInfoBtn) this.editInfoBtn.style.display = 'none';
        if (this.registerUserBtn) this.registerUserBtn.style.display = 'none';
    }

    // Funciones de persistencia temporal (localStorage para el proceso de registro)
    // NOTA: localStorage se usa solo para persistir datos DURANTE el proceso de registro
    // Los datos finales se guardan en MySQL cuando se completa el registro
    saveFormData() {
        const formData = {
            username: document.getElementById('username')?.value || '',
            email: document.getElementById('email')?.value || '',
            dni: document.getElementById('dni')?.value || '',
            step: this.currentStep,
            capturedImages: this.capturedImages || [],
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(formData));
            console.log('✅ Datos del formulario guardados temporalmente durante el registro');
        } catch (error) {
            console.error('❌ Error guardando datos temporales:', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Verificar que los datos no sean muy antiguos (24 horas)
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
                if (Date.now() - data.timestamp < maxAge) {
                    // Restaurar datos del formulario
                    if (data.username) document.getElementById('username').value = data.username;
                    if (data.email) document.getElementById('email').value = data.email;
                    if (data.dni) document.getElementById('dni').value = data.dni;
                    
                    // Restaurar imágenes capturadas
                    if (data.capturedImages && Array.isArray(data.capturedImages)) {
                        this.capturedImages = data.capturedImages;
                        console.log(`✅ ${this.capturedImages.length} imágenes restauradas`);
                    }
                    
                    this.currentStep = data.step || 'form';
                    console.log('✅ Datos del formulario restaurados desde localStorage');
                    return data;
                } else {
                    // Datos muy antiguos, limpiar
                    this.clearSavedData();
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos desde localStorage:', error);
            this.clearSavedData();
        }
        return null;
    }

    loadFormData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Verificar que los datos no sean muy antiguos (24 horas)
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas en ms
                if (Date.now() - data.timestamp < maxAge) {
                    // Restaurar datos del formulario
                    if (data.username) document.getElementById('username').value = data.username;
                    if (data.email) document.getElementById('email').value = data.email;
                    if (data.dni) document.getElementById('dni').value = data.dni;
                    
                    console.log('✅ Datos del formulario restaurados para edición');
                    return data;
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos temporales del formulario:', error);
        }
        return null;
    }

    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🗑️ Datos temporales del registro limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos temporales:', error);
        }
    }

    clearFormAndData() {
        // Limpiar localStorage
        this.clearSavedData();
        
        // Limpiar formulario
        const form = document.getElementById('user-form');
        if (form) {
            form.reset();
        }
        
        // Limpiar campos específicos
        const fields = ['username', 'email', 'dni'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
                field.classList.remove('valid', 'invalid');
            }
        });
        
        // Resetear estado interno
        this.userData = {};
        this.capturedImages = [];
        this.currentStep = 'form';
        
        // Asegurar que esté en el paso correcto
        this.resetToFormStep();
        
        this.showStatus('✅ Formulario y datos temporales limpiados correctamente', 'success');
        
        console.log('🗑️ Formulario y datos limpiados completamente');
    }

    checkNavigationState() {
        const savedData = this.loadSavedData();
        
        // Solo navegar automáticamente si estaba en el paso de cámara Y tiene imágenes capturadas
        if (savedData && savedData.step === 'camera' && savedData.capturedImages && savedData.capturedImages.length > 0) {
            console.log('📋 Sesión de captura en progreso detectada, restaurando estado de cámara');
            this.proceedToCamera();
        } else if (savedData && this.isFormComplete()) {
            // Si tiene datos completos pero no estaba capturando, solo llenar el formulario
            console.log('📋 Datos del formulario detectados, formulario prellenado');
            // El formulario ya se llenó en loadSavedData(), no hacer nada más
        }
    }

    isFormComplete() {
        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const dni = document.getElementById('dni')?.value?.trim();
        
        return username && email && dni && 
               username.length >= 3 && 
               this.isValidEmail(email) && 
               this.isValidDNI(dni);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidDNI(dni) {
        const dniRegex = /^\d{8,12}$/;
        return dniRegex.test(dni);
    }

    setupElements() {
        // Elementos del DOM
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas?.getContext('2d');
        
        // Elementos de control
        this.proceedToCameraBtn = document.getElementById('proceed-to-camera');
        this.startCaptureBtn = document.getElementById('start-capture');
        this.stopCaptureBtn = document.getElementById('stop-capture');
        this.editInfoBtn = document.getElementById('edit-info');
        this.registerUserBtn = document.getElementById('register-user');
        
        // Elementos de estado
        this.statusMessage = document.getElementById('status-message');
        this.capturedCount = document.getElementById('captured-count');
        this.progressFill = document.getElementById('progress-fill');
        
        // Secciones
        this.registrationForm = document.getElementById('registration-form');
        this.cameraSection = document.getElementById('camera-section');
        this.formInstructions = document.getElementById('form-instructions');
        this.cameraInstructions = document.getElementById('camera-instructions');
        
        // Overlay y modal
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.successModal = document.getElementById('success-modal');
    }

    setupEventListeners() {
        // Botón para proceder a la cámara
        this.proceedToCameraBtn?.addEventListener('click', () => {
            this.validateFormAndProceed();
        });

        // Botón para limpiar formulario
        document.getElementById('clear-form')?.addEventListener('click', () => {
            this.clearFormAndData();
        });

        // Botones de captura
        this.startCaptureBtn?.addEventListener('click', () => {
            this.startCapture();
        });

        this.stopCaptureBtn?.addEventListener('click', () => {
            this.stopCapture();
        });

        // Botón para editar información
        this.editInfoBtn?.addEventListener('click', () => {
            this.editInformation();
        });

        // Botón de registro final
        this.registerUserBtn?.addEventListener('click', () => {
            this.registerUser();
        });

        // Modal de éxito - Agregar event listener cuando se muestre el modal
        this.setupSuccessModalListeners();

        // Validación en tiempo real y persistencia automática
        const formInputs = document.querySelectorAll('#user-form input');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateFormField(input);
                // Guardar datos automáticamente cuando el usuario escriba
                this.saveFormData();
            });
        });
    }

    validateFormField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        
        // Remover clases de validación previas
        input.classList.remove('valid', 'invalid');
        
        let isValid = false;
        
        switch (fieldName) {
            case 'username':
                isValid = value.length >= 3 && value.length <= 150 && /^[a-zA-Z0-9_]+$/.test(value);
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'dni':
                isValid = value.length >= 5 && value.length <= 20 && /^[a-zA-Z0-9]+$/.test(value);
                break;
        }
        
        input.classList.add(isValid ? 'valid' : 'invalid');
        return isValid;
    }

    validateFormAndProceed() {
        const form = document.getElementById('user-form');
        const formData = new FormData(form);
        
        // Validar todos los campos
        const username = formData.get('username')?.trim();
        const email = formData.get('email')?.trim();
        const dni = formData.get('dni')?.trim();
        
        if (!username || !email || !dni) {
            this.showStatus('Por favor completa todos los campos', 'error');
            return;
        }
        
        // Validaciones específicas
        if (username.length < 3) {
            this.showStatus('El nombre de usuario debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showStatus('Por favor ingresa un email válido', 'error');
            return;
        }
        
        if (dni.length < 5) {
            this.showStatus('El DNI debe tener al menos 5 caracteres', 'error');
            return;
        }
        
        // Guardar datos del usuario
        this.userData = { username, email, dni };
        
        // Actualizar estado y guardar
        this.currentStep = 'camera';
        this.saveFormData();
        
        // Proceder a la cámara
        this.proceedToCamera();
    }

    async proceedToCamera() {
        try {
            this.showStatus('Iniciando cámara...', 'info');
            
            // Ocultar formulario y mostrar cámara
            this.registrationForm.style.display = 'none';
            this.cameraSection.style.display = 'block';
            this.formInstructions.style.display = 'none';
            this.cameraInstructions.style.display = 'block';
            
            // Mostrar controles de cámara
            this.startCaptureBtn.style.display = 'inline-block';
            this.editInfoBtn.style.display = 'inline-block';
            this.proceedToCameraBtn.style.display = 'none';
            
            // Inicializar MediaPipe primero
            this.initializeMediaPipe();
            
            // Inicializar cámara
            await this.initializeCamera();
            
            // Esperar un momento antes de iniciar el procesamiento para asegurar que MediaPipe esté listo
            setTimeout(() => {
                if (this.faceMesh && this.video) {
                    this.startVideoProcessing();
                }
            }, 500);
            
            this.currentStep = 'camera';
            
            // Restaurar estado de imágenes si las hay
            if (this.capturedImages && this.capturedImages.length > 0) {
                this.updateProgress();
                if (this.capturedImages.length >= this.requiredImages) {
                    this.registerUserBtn.style.display = 'inline-block';
                    this.registerUserBtn.disabled = false;
                    this.showStatus(`¡Captura completa! ${this.capturedImages.length} imágenes restauradas. Puedes completar el registro.`, 'success');
                } else {
                    this.showStatus(`${this.capturedImages.length} imágenes restauradas. Continúa capturando para completar el registro.`, 'info');
                }
            } else {
                this.showStatus('Cámara lista. Haz clic en "Iniciar Captura" cuando estés listo', 'success');
            }
            
        } catch (error) {
            console.error('Error al inicializar cámara:', error);
            this.showStatus('Error al acceder a la cámara. Verifica los permisos.', 'error');
        }
    }

    editInformation() {
        // Detener la cámara si está activa
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Detener el procesamiento de video primero
        this.isProcessingVideo = false;

        // Limpiar MediaPipe de manera segura
        if (this.faceMesh) {
            try {
                this.faceMesh.close();
                console.log('MediaPipe cerrado correctamente');
            } catch (error) {
                console.warn('Error al cerrar MediaPipe:', error);
            }
            this.faceMesh = null;
        }

        // Ocultar la sección de cámara y mostrar el formulario
        this.cameraSection.style.display = 'none';
        this.registrationForm.style.display = 'block';
        this.cameraInstructions.style.display = 'none';
        this.formInstructions.style.display = 'block';

        // Ocultar controles de cámara y mostrar botón de continuar
        this.startCaptureBtn.style.display = 'none';
        this.stopCaptureBtn.style.display = 'none';
        this.editInfoBtn.style.display = 'none';
        this.registerUserBtn.style.display = 'none';
        this.proceedToCameraBtn.style.display = 'inline-block';

        // Cambiar el estado
        this.currentStep = 'form';

        // Restaurar los datos del formulario (ya están guardados en localStorage)
        this.loadFormData();

        // Guardar el estado actual
        this.saveFormData();

        this.showStatus('Puedes editar tu información. Los datos capturados se mantendrán.', 'info');
    }

    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    
                    // Iniciar procesamiento continuo de video para mostrar puntos y líneas
                    this.startVideoProcessing();
                    
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('No se pudo acceder a la cámara: ' + error.message);
        }
    }

    initializeMediaPipe() {
        // Evitar múltiples inicializaciones
        if (this.faceMesh) {
            console.log('MediaPipe ya está inicializado');
            return;
        }

        try {
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => {
                this.onFaceMeshResults(results);
            });
            
            console.log('MediaPipe inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar MediaPipe:', error);
            this.faceMesh = null;
        }
    }

    onFaceMeshResults(results) {
        if (!this.ctx) return;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar video
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Dibujar conexiones
            this.drawConnections(landmarks);
            
            // Dibujar landmarks
            this.drawLandmarks(landmarks);
            
            // Dibujar recuadro guía
            this.drawGuideBox(landmarks);
            
            // Verificar si el rostro está bien posicionado
            const isWellPositioned = this.checkFacePosition(landmarks);
            
            if (this.isCapturing && isWellPositioned) {
                this.captureFrame();
            }
        } else {
            // Dibujar recuadro guía sin rostro
            this.drawGuideBox(null);
        }
    }

    /**
     * Dibujar conexiones faciales - Malla completa de MediaPipe
     */
    drawConnections(landmarks) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Configuración para las líneas de conexión
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // Líneas sutiles y translúcidas
        ctx.lineWidth = 0.5; // Líneas muy finas
        ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 1;

        // CONEXIONES COMPLETAS DE MEDIAPIPE FACE MESH
        // Estas son las conexiones estándar de MediaPipe Face Mesh
        const FACE_CONNECTIONS = [
            // Contorno facial principal
            [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],

            // Ojo izquierdo (desde la perspectiva del observador)
            [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133], [133, 173], [173, 157], [157, 158], [158, 159], [159, 160], [160, 161], [161, 246], [246, 33],

            // Ojo derecho (desde la perspectiva del observador)
            [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263], [263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381], [381, 382], [382, 362],

            // Nariz
            [1, 2], [2, 5], [5, 4], [4, 6], [6, 168], [168, 8], [8, 9], [9, 10], [19, 94], [94, 125], [125, 141], [141, 235], [235, 31], [31, 228], [228, 229], [229, 230], [230, 231], [231, 232], [232, 233], [233, 244], [244, 245], [245, 122], [122, 6],

            // Boca exterior
            [61, 84], [84, 17], [17, 314], [314, 405], [405, 320], [320, 307], [307, 375], [375, 321], [321, 308], [308, 324], [324, 318], [318, 402], [402, 317], [317, 14], [14, 87], [87, 178], [178, 88], [88, 95], [95, 78], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308], [308, 324], [324, 318], [318, 402], [402, 317], [317, 14], [14, 87], [87, 178], [178, 88], [88, 95], [95, 78], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 61],

            // Cejas
            [46, 53], [53, 52], [52, 51], [51, 48], [48, 115], [115, 131], [131, 134], [134, 102], [102, 48], [276, 283], [283, 282], [282, 295], [295, 285], [285, 336], [336, 296], [296, 334], [334, 293], [293, 300], [300, 276],

            // Líneas adicionales para mayor densidad
            [127, 234], [234, 93], [93, 132], [132, 58], [58, 172], [172, 136], [136, 150], [150, 149], [149, 176], [176, 148], [148, 152], [152, 377], [377, 400], [400, 378], [378, 379], [379, 365], [365, 397], [397, 288], [288, 361], [361, 323], [323, 454], [454, 356], [356, 389], [389, 251], [251, 284], [284, 332], [332, 297], [297, 338], [338, 10], [10, 109], [109, 67], [67, 103], [103, 54], [54, 21], [21, 162], [162, 127]
        ];

        // Dibujar todas las conexiones
        FACE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const startPoint = landmarks[startIdx];
            const endPoint = landmarks[endIdx];
            
            if (startPoint && endPoint) {
                const startX = startPoint.x * canvas.width;
                const startY = startPoint.y * canvas.height;
                const endX = endPoint.x * canvas.width;
                const endY = endPoint.y * canvas.height;
                
                // Verificar que ambos puntos estén dentro del canvas
                if (startX >= 0 && startX <= canvas.width && startY >= 0 && startY <= canvas.height &&
                    endX >= 0 && endX <= canvas.width && endY >= 0 && endY <= canvas.height) {
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        });

        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    /**
     * Dibujar landmarks faciales - TODOS los 468 puntos de MediaPipe
     */
    drawLandmarks(landmarks) {
        const ctx = this.ctx;
        const canvas = this.canvas;

        // Configuración para todos los landmarks - puntos pequeños y sutiles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Opacidad baja como solicitado
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 1;

        // DIBUJAR TODOS LOS 468 LANDMARKS DE MEDIAPIPE
        // Esto asegura que aparezcan en ambos lados de la cara
        landmarks.forEach((landmark, index) => {
            if (landmark) {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                
                // Verificar que las coordenadas estén dentro del canvas
                if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, 2 * Math.PI); // Puntos pequeños (1px radius)
                    ctx.fill();
                }
            }
        });

        // Puntos de referencia principales más destacados (opcional)
        const MAIN_REFERENCE_POINTS = [
            // Esquinas de los ojos
            33, 133, 362, 263,
            // Punta de la nariz
            1, 2,
            // Comisuras de la boca
            61, 291,
            // Centro de la boca
            13, 14,
            // Puntos del contorno facial principales
            10, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454,
            // Centro de la frente y barbilla
            9, 175, 199
        ];

        // Configuración para puntos principales ligeramente más destacados
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Ligeramente más visible
        ctx.shadowBlur = 2;

        MAIN_REFERENCE_POINTS.forEach(index => {
            const landmark = landmarks[index];
            if (landmark) {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;
                
                // Verificar que las coordenadas estén dentro del canvas
                if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI); // Puntos principales ligeramente más grandes (2px)
                    ctx.fill();
                }
            }
        });

        // Resetear sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    drawGuideBox(landmarks) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const boxSize = Math.min(this.canvas.width, this.canvas.height) * 0.6;
        
        const left = centerX - boxSize / 2;
        const top = centerY - boxSize / 2;
        const right = centerX + boxSize / 2;
        const bottom = centerY + boxSize / 2;
        
        // Determinar color basado en posición del rostro
        const isWellPositioned = landmarks ? this.checkFacePosition(landmarks) : false;
        const color = isWellPositioned ? '#00FF00' : '#FFFFFF';
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        
        // Dibujar esquinas del recuadro
        const cornerLength = 30;
        
        // Esquina superior izquierda
        this.ctx.beginPath();
        this.ctx.moveTo(left, top + cornerLength);
        this.ctx.lineTo(left, top);
        this.ctx.lineTo(left + cornerLength, top);
        this.ctx.stroke();
        
        // Esquina superior derecha
        this.ctx.beginPath();
        this.ctx.moveTo(right - cornerLength, top);
        this.ctx.lineTo(right, top);
        this.ctx.lineTo(right, top + cornerLength);
        this.ctx.stroke();
        
        // Esquina inferior izquierda
        this.ctx.beginPath();
        this.ctx.moveTo(left, bottom - cornerLength);
        this.ctx.lineTo(left, bottom);
        this.ctx.lineTo(left + cornerLength, bottom);
        this.ctx.stroke();
        
        // Esquina inferior derecha
        this.ctx.beginPath();
        this.ctx.moveTo(right - cornerLength, bottom);
        this.ctx.lineTo(right, bottom);
        this.ctx.lineTo(right, bottom - cornerLength);
        this.ctx.stroke();
    }

    checkFacePosition(landmarks) {
        if (!landmarks || landmarks.length === 0) return false;
        
        // Obtener puntos clave del rostro
        const nose = landmarks[1]; // Punta de la nariz
        const leftEye = landmarks[33]; // Ojo izquierdo
        const rightEye = landmarks[263]; // Ojo derecho
        const mouth = landmarks[13]; // Boca
        
        if (!nose || !leftEye || !rightEye || !mouth) return false;
        
        // Convertir a coordenadas de canvas
        const noseX = nose.x * this.canvas.width;
        const noseY = nose.y * this.canvas.height;
        
        // Definir área central (60% del canvas)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const boxSize = Math.min(this.canvas.width, this.canvas.height) * 0.6;
        
        const left = centerX - boxSize / 2;
        const top = centerY - boxSize / 2;
        const right = centerX + boxSize / 2;
        const bottom = centerY + boxSize / 2;
        
        // Verificar si la nariz está dentro del recuadro
        return noseX >= left && noseX <= right && noseY >= top && noseY <= bottom;
    }

    startCapture() {
        if (this.capturedImages.length >= this.requiredImages) {
            this.showStatus('Ya se han capturado todas las imágenes necesarias', 'warning');
            return;
        }
        
        this.isCapturing = true;
        this.startCaptureBtn.disabled = true;
        this.stopCaptureBtn.disabled = false;
        this.stopCaptureBtn.style.display = 'inline-block';
        
        this.showStatus('Capturando... Mantén tu rostro dentro del recuadro verde', 'info');
        
        // El procesamiento de video ya está corriendo automáticamente
        // Solo necesitamos cambiar el estado de captura
    }

    stopCapture() {
        this.isCapturing = false;
        this.startCaptureBtn.disabled = false;
        this.stopCaptureBtn.disabled = true;
        
        if (this.capturedImages.length >= this.requiredImages) {
            this.showStatus(`¡Captura completa! ${this.capturedImages.length} imágenes capturadas`, 'success');
            this.registerUserBtn.disabled = false;
            this.registerUserBtn.style.display = 'inline-block';
        } else {
            this.showStatus(`Captura detenida. ${this.capturedImages.length}/${this.requiredImages} imágenes capturadas`, 'warning');
        }
    }

    startVideoProcessing() {
        this.isProcessingVideo = true;
        this.processVideo();
    }

    stopVideoProcessing() {
        this.isProcessingVideo = false;
    }

    async processVideo() {
        if (!this.isProcessingVideo) return;
        
        if (this.video && this.faceMesh) {
            await this.faceMesh.send({ image: this.video });
        }
        
        requestAnimationFrame(() => this.processVideo());
    }

    captureFrame() {
        if (this.capturedImages.length >= this.requiredImages) {
            this.stopCapture();
            return;
        }
        
        // Capturar frame del canvas
        const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
        this.capturedImages.push(imageData);
        
        // Guardar progreso automáticamente
        this.saveFormData();
        
        // Actualizar progreso
        this.updateProgress();
        
        // Pequeña pausa entre capturas
        setTimeout(() => {
            if (this.capturedImages.length >= this.requiredImages) {
                this.stopCapture();
            }
        }, 500);
    }

    updateProgress() {
        const progress = (this.capturedImages.length / this.requiredImages) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.capturedCount.textContent = this.capturedImages.length;
        
        this.showStatus(`Capturado ${this.capturedImages.length}/${this.requiredImages} imágenes`, 'info');
    }

    async registerUser() {
        if (this.capturedImages.length < this.requiredImages) {
            this.showStatus('Se necesitan al menos 8 imágenes para el registro', 'error');
            return;
        }
        
        this.showLoading('Procesando registro...', 'Generando embeddings faciales y guardando en base de datos');
        
        try {
            const registrationData = {
                ...this.userData,
                images: this.capturedImages
            };
            
            const response = await fetch('/api/reconocimiento/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(registrationData)
            });
            
            const result = await response.json();
            
            this.hideLoading();
            
            if (result.status === 'ok') {
                this.showSuccessModal(result);
            } else {
                this.showStatus(result.message || 'Error en el registro', 'error');
            }
            
        } catch (error) {
            this.hideLoading();
            console.error('Error en registro:', error);
            this.showStatus('Error de conexión. Intenta nuevamente.', 'error');
        }
    }

    setupSuccessModalListeners() {
        // Configurar event listener para el botón de continuar
        const continueBtn = document.getElementById('continue-to-maintenance');
        if (continueBtn) {
            continueBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navegando a mantenimiento...');
                window.location.href = '/reconocimiento/maintenance/';
            });
        }
    }

    showSuccessModal(result) {
        document.getElementById('success-username').textContent = result.username || this.userData.username;
        document.getElementById('success-email').textContent = result.email || this.userData.email;
        document.getElementById('success-dni').textContent = result.dni || this.userData.dni;
        document.getElementById('success-images').textContent = result.images_saved || this.capturedImages.length;

        // Limpiar datos guardados después del registro exitoso
        this.clearSavedData();
        
        // Asegurar que el event listener esté configurado
        this.setupSuccessModalListeners();
        
        this.successModal.style.display = 'flex';
        
        // Redirección automática después de 3 segundos
        console.log('✅ Registro completado. Datos guardados en base de datos MySQL.');
        console.log('🔄 Redirigiendo automáticamente a mantenimiento en 3 segundos...');
        
        setTimeout(() => {
            console.log('🚀 Navegando a mantenimiento...');
            window.location.href = '/reconocimiento/maintenance/';
        }, 3000);
    }

    showLoading(title, description) {
        document.getElementById('loading-title').textContent = title;
        document.getElementById('loading-description').textContent = description;
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showStatus(message, type = 'default') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FacialRegistrationSystem();
});