/**
 * Phase 1 - Reconocimiento Facial con Mediapipe
 * Sistema de voting con N frames para validación de identidad
 */

class FacialRecognitionSystem {
    constructor() {
        // Configuración del sistema
        this.config = {
            requiredFrames: 8,          // N frames para voting (aumentado para mayor precisión)
            matchThreshold: 0.8,        // Threshold para considerar match (aumentado)
            frameInterval: 300,         // ms entre capturas (reducido para captura más rápida)
            maxAttempts: 3,             // Máximo intentos por sesión
            faceBoxPadding: 50,         // Padding para el recuadro facial
            minConfidence: 0.7,         // Confianza mínima para detección facial
            securityMargin: 0.2         // Margen de seguridad para evitar falsos positivos
        };

        // Estado del sistema
        this.state = {
            isInitialized: false,
            isCapturing: false,
            currentAttempt: 0,
            capturedFrames: [],
            faceDetected: false,
            faceInBounds: false,
            lastFrameTime: 0
        };

        // Referencias DOM
        this.elements = {
            video: null,
            canvas: null,
            ctx: null,
            statusMessage: null,
            startBtn: null,
            stopBtn: null,
            loadingOverlay: null
        };

        // Mediapipe
        this.faceMesh = null;
        this.camera = null;

        // Bind methods
        this.onResults = this.onResults.bind(this);
        this.startCapture = this.startCapture.bind(this);
        this.stopCapture = this.stopCapture.bind(this);
    }

    /**
     * Inicializar el sistema
     */
    async init() {
        try {
            this.initializeDOM();
            await this.initializeMediapipe();
            await this.initializeCamera();
            this.setupEventListeners();
            this.updateStatus('Mantén tu rostro dentro del recuadro', 'default');
            this.state.isInitialized = true;
            console.log('✅ Sistema de reconocimiento facial inicializado');
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.updateStatus('Error inicializando cámara. Verifica permisos.', 'error');
        }
    }

    /**
     * Inicializar referencias DOM
     */
    initializeDOM() {
        this.elements.video = document.getElementById('video');
        this.elements.canvas = document.getElementById('canvas');
        this.elements.ctx = this.elements.canvas.getContext('2d');
        this.elements.statusMessage = document.getElementById('status-message');
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.stopBtn = document.getElementById('stop-btn');
        this.elements.loadingOverlay = document.getElementById('loading-overlay');

        if (!this.elements.video || !this.elements.canvas) {
            throw new Error('Elementos DOM requeridos no encontrados');
        }

        // Configurar canvas
        this.elements.canvas.width = this.elements.video.videoWidth || 640;
        this.elements.canvas.height = this.elements.video.videoHeight || 480;
    }

    /**
     * Inicializar Mediapipe Face Mesh
     */
    async initializeMediapipe() {
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

        this.faceMesh.onResults(this.onResults);
    }

    /**
     * Inicializar cámara
     */
    async initializeCamera() {
        this.camera = new Camera(this.elements.video, {
            onFrame: async () => {
                await this.faceMesh.send({ image: this.elements.video });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();

        // Actualizar dimensiones del canvas cuando el video esté listo
        this.elements.video.addEventListener('loadedmetadata', () => {
            this.elements.canvas.width = this.elements.video.videoWidth;
            this.elements.canvas.height = this.elements.video.videoHeight;
        });
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', this.startCapture);
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', this.stopCapture);
        }
    }

    /**
     * Callback de resultados de Mediapipe
     */
    onResults(results) {
        const ctx = this.elements.ctx;
        const canvas = this.elements.canvas;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar imagen de video
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        // Procesar detección facial
        this.state.faceDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

        if (this.state.faceDetected) {
            const landmarks = results.multiFaceLandmarks[0];
            this.processFaceLandmarks(landmarks);
            this.drawFaceOverlay(landmarks);
        } else {
            this.state.faceInBounds = false;
            this.drawFaceBox(false);
            if (this.state.isCapturing) {
                this.updateStatus('Rostro no detectado. Mantente en el recuadro.', 'warning');
            }
        }

        // Capturar frame si está en proceso
        if (this.state.isCapturing && this.shouldCaptureFrame()) {
            this.captureFrame(results.image);
        }
    }

    /**
     * Procesar landmarks faciales
     */
    processFaceLandmarks(landmarks) {
        const canvas = this.elements.canvas;
        const bounds = this.getFaceBounds(landmarks);
        const faceBox = this.getFaceBox();

        // Verificar si el rostro está dentro del recuadro (validación general)
        const faceInGeneralBounds = this.isFaceInBounds(bounds, faceBox);
        
        // Verificar si los landmarks clave están dentro del recuadro (validación precisa)
        const keyLandmarksInBounds = this.areKeyLandmarksInBounds(landmarks, faceBox);
        
        // El rostro está correctamente posicionado solo si ambas validaciones pasan
        this.state.faceInBounds = faceInGeneralBounds && keyLandmarksInBounds;

        // Actualizar status basado en posición con mensajes más específicos
        if (this.state.isCapturing) {
            if (this.state.faceInBounds) {
                this.updateStatus(`Capturando... ${this.state.capturedFrames.length}/${this.config.requiredFrames}`, 'processing');
            } else {
                this.updateStatus('Ajusta tu posición - mantén ojos, nariz y boca dentro del recuadro', 'warning');
            }
        } else {
            if (this.state.faceInBounds) {
                this.updateStatus('Rostro detectado correctamente. ¡Listo para capturar!', 'success');
            } else if (faceInGeneralBounds && !keyLandmarksInBounds) {
                this.updateStatus('Acerca tu rostro - asegúrate que ojos, nariz y boca estén dentro del recuadro', 'warning');
            } else {
                this.updateStatus('Mantén tu rostro dentro del recuadro', 'default');
            }
        }
    }

    /**
     * Obtener bounds del rostro
     */
    getFaceBounds(landmarks) {
        const canvas = this.elements.canvas;
        let minX = canvas.width, minY = canvas.height;
        let maxX = 0, maxY = 0;

        landmarks.forEach(landmark => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        return { minX, minY, maxX, maxY };
    }

    /**
     * Obtener recuadro objetivo para el rostro
     */
    getFaceBox() {
        const canvas = this.elements.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const boxWidth = 300;
        const boxHeight = 400;

        return {
            minX: centerX - boxWidth / 2,
            minY: centerY - boxHeight / 2,
            maxX: centerX + boxWidth / 2,
            maxY: centerY + boxHeight / 2
        };
    }

    /**
     * Verificar si el rostro está dentro del recuadro
     */
    isFaceInBounds(faceBounds, faceBox) {
        const padding = this.config.faceBoxPadding;
        
        return (
            faceBounds.minX >= (faceBox.minX - padding) &&
            faceBounds.maxX <= (faceBox.maxX + padding) &&
            faceBounds.minY >= (faceBox.minY - padding) &&
            faceBounds.maxY <= (faceBox.maxY + padding)
        );
    }

    /**
     * Verificar si los landmarks clave están dentro del recuadro guía
     */
    areKeyLandmarksInBounds(landmarks, faceBox) {
        const canvas = this.elements.canvas;
        const padding = 20; // Padding más estricto para landmarks clave

        // Definir landmarks clave para validación con índices correctos de MediaPipe
        const keyLandmarkIndices = {
            // Nariz (punta y puente)
            nose: [1, 2, 19, 20],
            // Ojos (esquinas internas y externas)
            leftEye: [33, 133, 159, 145],
            rightEye: [362, 263, 386, 374],
            // Boca (esquinas y centro)
            mouth: [61, 291, 13, 14, 17, 18],
            // Mentón
            chin: [175, 199, 152]
        };

        // Calcular cuántos puntos están dentro del área válida
        let pointsInside = 0;
        let totalPoints = 0;
        const validPoints = [];

        // Verificar cada grupo de landmarks clave
        for (const [region, indices] of Object.entries(keyLandmarkIndices)) {
            for (const index of indices) {
                const landmark = landmarks[index];
                if (landmark) {
                    totalPoints++;
                    const x = landmark.x * canvas.width;
                    const y = landmark.y * canvas.height;

                    // Verificar si el landmark está dentro del recuadro con padding
                    const isInside = x >= (faceBox.minX + padding) && 
                                x <= (faceBox.maxX - padding) &&
                                y >= (faceBox.minY + padding) && 
                                y <= (faceBox.maxY - padding);
                    
                    if (isInside) {
                        pointsInside++;
                    }
                    
                    validPoints.push({ region, index, x, y, isInside });
                }
            }
        }

        // Al menos 80% de los puntos deben estar dentro del área válida
        const validPercentage = totalPoints > 0 ? (pointsInside / totalPoints) : 0;
        const isValid = validPercentage >= 0.8;
        
        // Actualizar feedback visual
        this.updateFacePositionFeedback(isValid, validPoints, validPercentage);
        
        return isValid;
    }
    
    /**
     * Actualizar feedback visual de posición facial
     */
    updateFacePositionFeedback(isValid, validPoints, validPercentage) {
        // Actualizar mensaje de instrucciones basado en el porcentaje de validez
        const instructionElement = document.getElementById('face-instruction');
        if (instructionElement) {
            if (isValid) {
                instructionElement.textContent = '✓ Posición correcta - Mantén la posición';
                instructionElement.style.color = '#00ff00';
            } else if (validPercentage >= 0.6) {
                instructionElement.textContent = 'Ajusta ligeramente tu posición';
                instructionElement.style.color = '#ffaa00';
            } else {
                instructionElement.textContent = 'Mantén tu rostro dentro del recuadro';
                instructionElement.style.color = '#ffffff';
            }
        }
        
        // Log para debugging
        if (validPercentage < 1.0) {
            console.log(`Face position: ${(validPercentage * 100).toFixed(1)}% valid`);
        }
    }

    /**
     * Dibujar overlay facial optimizado para tiempo real
     */
    drawFaceOverlay(landmarks) {
        const ctx = this.elements.ctx;
        const canvas = this.elements.canvas;

        // Optimización: throttling para mejor rendimiento
        const now = performance.now();
        if (!this.lastRenderTime) this.lastRenderTime = now;
        
        // Limitar a ~30 FPS para suavidad visual
        if (now - this.lastRenderTime < 33) return;
        this.lastRenderTime = now;

        // Limpiar canvas de forma eficiente
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Configuración global para mejor rendimiento
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dibujar malla facial densa (FACEMESH_TESSELATION)
        this.drawFaceMesh(landmarks);

        // Dibujar puntos de referencia visibles
        this.drawLandmarks(landmarks);

        // Dibujar recuadro guía elegante
        this.drawFaceBox(this.state.faceInBounds);
    }

    /**
     * Dibujar malla facial completa con triangulación densa
     */
    drawFaceMesh(landmarks) {
        const ctx = this.elements.ctx;
        const canvas = this.elements.canvas;

        // Configuración para malla geométrica moderna - estilo imagen de referencia
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // Líneas blancas más visibles
        ctx.lineWidth = 0.4; // Líneas muy finas como en la imagen
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 1; // Sutil efecto de brillo

        // FACEMESH_TESSELATION completa - triangulación densa como en la imagen
        const FACEMESH_TESSELATION = [
            [127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11], [232, 231], [231, 120], [120, 232],
            [72, 37], [37, 39], [39, 72], [128, 121], [121, 47], [47, 128], [232, 121], [121, 128], [128, 232],
            [104, 69], [69, 67], [67, 104], [175, 171], [171, 148], [148, 175], [118, 50], [50, 101], [101, 118],
            [73, 39], [39, 40], [40, 73], [9, 151], [151, 108], [108, 9], [48, 115], [115, 131], [131, 48],
            [194, 204], [204, 211], [211, 194], [74, 40], [40, 185], [185, 74], [80, 42], [42, 183], [183, 80],
            [230, 229], [229, 118], [118, 230], [202, 212], [212, 214], [214, 202], [83, 18], [18, 17], [17, 83],
            [76, 61], [61, 146], [146, 76], [160, 29], [29, 30], [30, 160], [56, 157], [157, 173], [173, 56],
            [106, 204], [204, 194], [194, 106], [135, 214], [214, 192], [192, 135], [203, 165], [165, 98], [98, 203],
            [21, 71], [71, 68], [68, 21], [51, 45], [45, 4], [4, 51], [144, 24], [24, 23], [23, 144],
            [77, 146], [146, 91], [91, 77], [205, 50], [50, 187], [187, 205], [201, 200], [200, 18], [18, 201],
            [91, 106], [106, 182], [182, 91], [90, 91], [91, 181], [181, 90], [85, 84], [84, 17], [17, 85],
            [206, 203], [203, 36], [36, 206], [148, 171], [171, 140], [140, 148], [92, 40], [40, 39], [39, 92],
            [193, 189], [189, 244], [244, 193], [159, 158], [158, 28], [28, 159], [247, 246], [246, 161], [161, 247],
            [236, 3], [3, 196], [196, 236], [54, 68], [68, 104], [104, 54], [193, 168], [168, 8], [8, 193],
            [117, 228], [228, 31], [31, 117], [189, 193], [193, 55], [55, 189], [98, 97], [97, 99], [99, 98],
            [126, 47], [47, 100], [100, 126], [166, 79], [79, 218], [218, 166], [155, 154], [154, 26], [26, 155],
            [209, 49], [49, 131], [131, 209], [135, 136], [136, 150], [150, 135], [47, 126], [126, 217], [217, 47],
            [223, 52], [52, 53], [53, 223], [45, 51], [51, 134], [134, 45], [211, 170], [170, 140], [140, 211],
            [67, 69], [69, 108], [108, 67], [43, 106], [106, 91], [91, 43], [230, 119], [119, 120], [120, 230],
            [226, 130], [130, 247], [247, 226], [63, 53], [53, 52], [52, 63], [238, 20], [20, 242], [242, 238],
            [46, 70], [70, 156], [156, 46], [78, 62], [62, 96], [96, 78], [46, 53], [53, 63], [63, 46],
            [143, 34], [34, 227], [227, 143], [123, 117], [117, 111], [111, 123], [44, 125], [125, 19], [19, 44],
            [236, 134], [134, 51], [51, 236], [216, 206], [206, 205], [205, 216], [154, 153], [153, 22], [22, 154],
            [39, 37], [37, 167], [167, 39], [200, 201], [201, 208], [208, 200], [36, 142], [142, 100], [100, 36],
            [57, 212], [212, 202], [202, 57], [20, 60], [60, 99], [99, 20], [28, 158], [158, 157], [157, 28],
            [35, 226], [226, 113], [113, 35], [160, 159], [159, 27], [27, 160], [204, 202], [202, 210], [210, 204],
            [113, 225], [225, 46], [46, 113], [43, 202], [202, 204], [204, 43], [62, 76], [76, 77], [77, 62],
            [137, 123], [123, 116], [116, 137], [41, 38], [38, 72], [72, 41], [203, 129], [129, 142], [142, 203],
            [64, 98], [98, 240], [240, 64], [49, 102], [102, 64], [64, 49], [41, 73], [73, 74], [74, 41],
            [212, 216], [216, 207], [207, 212], [42, 74], [74, 184], [184, 42], [169, 170], [170, 211], [211, 169],
            [170, 149], [149, 176], [176, 170], [105, 66], [66, 69], [69, 105], [122, 6], [6, 168], [168, 122],
            [123, 147], [147, 187], [187, 123], [96, 77], [77, 90], [90, 96], [65, 55], [55, 107], [107, 65],
            [89, 90], [90, 180], [180, 89], [101, 100], [100, 120], [120, 101], [63, 105], [105, 104], [104, 63],
            [93, 137], [137, 227], [227, 93], [15, 86], [86, 85], [85, 15], [129, 102], [102, 49], [49, 129],
            [14, 87], [87, 86], [86, 14], [55, 8], [8, 9], [9, 55], [100, 47], [47, 121], [121, 100],
            [145, 23], [23, 22], [22, 145], [88, 89], [89, 179], [179, 88], [6, 122], [122, 196], [196, 6],
            [88, 95], [95, 96], [96, 88], [138, 172], [172, 136], [136, 138], [215, 58], [58, 172], [172, 215],
            [115, 48], [48, 219], [219, 115], [42, 80], [80, 81], [81, 42], [195, 3], [3, 51], [51, 195],
            [43, 146], [146, 61], [61, 43], [171, 175], [175, 199], [199, 171], [81, 82], [82, 38], [38, 81],
            [53, 46], [46, 225], [225, 53], [144, 163], [163, 110], [110, 144], [52, 65], [65, 66], [66, 52],
            [229, 228], [228, 117], [117, 229], [34, 127], [127, 234], [234, 34], [107, 108], [108, 69], [69, 107],
            [109, 108], [108, 151], [151, 109], [48, 64], [64, 235], [235, 48], [62, 78], [78, 191], [191, 62],
            [129, 209], [209, 126], [126, 129], [111, 35], [35, 143], [143, 111], [117, 123], [123, 50], [50, 117],
            [222, 65], [65, 52], [52, 222], [19, 125], [125, 141], [141, 19], [221, 55], [55, 65], [65, 221],
            [3, 195], [195, 197], [197, 3], [25, 7], [7, 33], [33, 25], [220, 237], [237, 44], [44, 220],
            [70, 71], [71, 139], [139, 70], [122, 193], [193, 245], [245, 122], [247, 130], [130, 33], [33, 247],
            [71, 21], [21, 162], [162, 71], [170, 169], [169, 150], [150, 170], [188, 174], [174, 196], [196, 188],
            [216, 186], [186, 92], [92, 216], [2, 97], [97, 167], [167, 2], [141, 125], [125, 241], [241, 141],
            [164, 167], [167, 37], [37, 164], [72, 38], [38, 12], [12, 72], [38, 82], [82, 13], [13, 38],
            [63, 68], [68, 71], [71, 63], [226, 35], [35, 111], [111, 226], [101, 50], [50, 205], [205, 101],
            [206, 92], [92, 165], [165, 206], [209, 198], [198, 217], [217, 209], [165, 167], [167, 97], [97, 165],
            [220, 115], [115, 218], [218, 220], [133, 112], [112, 243], [243, 133], [239, 238], [238, 241], [241, 239],
            [214, 135], [135, 169], [169, 214], [190, 173], [173, 133], [133, 190], [171, 208], [208, 32], [32, 171],
            [125, 44], [44, 237], [237, 125], [86, 87], [87, 178], [178, 86], [85, 86], [86, 179], [179, 85],
            [84, 85], [85, 180], [180, 84], [83, 84], [84, 181], [181, 83], [201, 83], [83, 182], [182, 201],
            [137, 93], [93, 132], [132, 137], [76, 62], [62, 183], [183, 76], [61, 76], [76, 184], [184, 61],
            [57, 61], [61, 185], [185, 57], [212, 57], [57, 186], [186, 212], [214, 207], [207, 187], [187, 214],
            [34, 143], [143, 156], [156, 34], [79, 239], [239, 237], [237, 79], [123, 137], [137, 177], [177, 123],
            [44, 1], [1, 4], [4, 44], [201, 194], [194, 32], [32, 201], [64, 102], [102, 129], [129, 64],
            [213, 215], [215, 138], [138, 213], [59, 166], [166, 219], [219, 59], [242, 99], [99, 97], [97, 242],
            [2, 94], [94, 141], [141, 2], [75, 59], [59, 235], [235, 75], [24, 110], [110, 228], [228, 24],
            [25, 130], [130, 226], [226, 25], [23, 24], [24, 229], [229, 23], [22, 23], [23, 230], [230, 22],
            [26, 22], [22, 231], [231, 26], [112, 26], [26, 232], [232, 112], [189, 190], [190, 243], [243, 189],
            [221, 56], [56, 190], [190, 221], [28, 56], [56, 221], [221, 28], [27, 28], [28, 222], [222, 27],
            [29, 27], [27, 223], [223, 29], [30, 29], [29, 224], [224, 30], [247, 30], [30, 225], [225, 247],
            [238, 79], [79, 20], [20, 238], [166, 59], [59, 75], [75, 166], [60, 75], [75, 240], [240, 60],
            [147, 177], [177, 215], [215, 147], [20, 79], [79, 166], [166, 20], [187, 147], [147, 213], [213, 187],
            [112, 233], [233, 244], [244, 112], [233, 128], [128, 245], [245, 233], [128, 114], [114, 188], [188, 128],
            [114, 217], [217, 174], [174, 114], [131, 115], [115, 220], [220, 131], [217, 198], [198, 236], [236, 217],
            [198, 131], [131, 134], [134, 198], [177, 132], [132, 58], [58, 177], [143, 35], [35, 124], [124, 143],
            [110, 163], [163, 7], [7, 110], [228, 110], [110, 25], [25, 228], [356, 389], [389, 368], [368, 356],
            [11, 302], [302, 267], [267, 11], [452, 350], [350, 349], [349, 452], [302, 303], [303, 269], [269, 302],
            [357, 343], [343, 277], [277, 357], [452, 453], [453, 464], [464, 452], [357, 359], [359, 299], [299, 357],
            [333, 298], [298, 301], [301, 333], [333, 335], [335, 334], [334, 333], [298, 301], [301, 299], [299, 298],
            [334, 282], [282, 284], [284, 334], [332, 297], [297, 296], [296, 332], [336, 285], [285, 336], [336, 285]
        ];

        // Dibujar la malla completa con triangulación densa
        FACEMESH_TESSELATION.forEach(connection => {
            const start = landmarks[connection[0]];
            const end = landmarks[connection[1]];
            
            if (start && end) {
                const startX = start.x * canvas.width;
                const startY = start.y * canvas.height;
                const endX = end.x * canvas.width;
                const endY = end.y * canvas.height;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        });

        // Resetear efectos de sombra
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    /**
     * Dibujar landmarks faciales - TODOS los 468 puntos de MediaPipe
     */
    drawLandmarks(landmarks) {
        const ctx = this.elements.ctx;
        const canvas = this.elements.canvas;

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

    /**
     * Dibujar recuadro facial elegante con esquinas sutiles
     */
    drawFaceBox(isValid) {
        const ctx = this.elements.ctx;
        const faceBox = this.getFaceBox();
        const cornerLength = 25; // Esquinas más pequeñas y elegantes
        const lineWidth = 2; // Líneas más finas

        // Colores más sutiles y elegantes
        let color, glowColor;
        
        if (isValid) {
            // Verde sutil y elegante cuando está válido
            color = 'rgba(0, 255, 100, 0.8)';
            glowColor = 'rgba(0, 255, 100, 0.3)';
        } else {
            // Blanco elegante cuando no está válido
            color = 'rgba(255, 255, 255, 0.7)';
            glowColor = 'rgba(255, 255, 255, 0.2)';
        }

        // Configurar estilo elegante
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Efecto de brillo sutil
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;

        // Esquinas más elegantes y definidas
        const cornerRadius = 3; // Radio pequeño para esquinas redondeadas

        // Esquina superior izquierda
        ctx.beginPath();
        ctx.moveTo(faceBox.minX, faceBox.minY + cornerLength);
        ctx.lineTo(faceBox.minX, faceBox.minY + cornerRadius);
        ctx.arcTo(faceBox.minX, faceBox.minY, faceBox.minX + cornerRadius, faceBox.minY, cornerRadius);
        ctx.lineTo(faceBox.minX + cornerLength, faceBox.minY);
        ctx.stroke();

        // Esquina superior derecha
        ctx.beginPath();
        ctx.moveTo(faceBox.maxX - cornerLength, faceBox.minY);
        ctx.lineTo(faceBox.maxX - cornerRadius, faceBox.minY);
        ctx.arcTo(faceBox.maxX, faceBox.minY, faceBox.maxX, faceBox.minY + cornerRadius, cornerRadius);
        ctx.lineTo(faceBox.maxX, faceBox.minY + cornerLength);
        ctx.stroke();

        // Esquina inferior izquierda
        ctx.beginPath();
        ctx.moveTo(faceBox.minX, faceBox.maxY - cornerLength);
        ctx.lineTo(faceBox.minX, faceBox.maxY - cornerRadius);
        ctx.arcTo(faceBox.minX, faceBox.maxY, faceBox.minX + cornerRadius, faceBox.maxY, cornerRadius);
        ctx.lineTo(faceBox.minX + cornerLength, faceBox.maxY);
        ctx.stroke();

        // Esquina inferior derecha
        ctx.beginPath();
        ctx.moveTo(faceBox.maxX - cornerLength, faceBox.maxY);
        ctx.lineTo(faceBox.maxX - cornerRadius, faceBox.maxY);
        ctx.arcTo(faceBox.maxX, faceBox.maxY, faceBox.maxX, faceBox.maxY - cornerRadius, cornerRadius);
        ctx.lineTo(faceBox.maxX, faceBox.maxY - cornerLength);
        ctx.stroke();

        // Limpiar efectos de sombra
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Agregar indicadores adicionales cuando está válido
        if (isValid) {
            this.drawValidationIndicators(faceBox);
        }
    }

    /**
     * Dibujar indicadores adicionales cuando la validación es exitosa
     */
    drawValidationIndicators(faceBox) {
        const ctx = this.elements.ctx;
        const centerX = (faceBox.minX + faceBox.maxX) / 2;
        const centerY = faceBox.minY - 20;

        // Dibujar ícono de check pequeño arriba del recuadro
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        const checkSize = 8;
        ctx.beginPath();
        ctx.moveTo(centerX - checkSize, centerY);
        ctx.lineTo(centerX - checkSize/3, centerY + checkSize/2);
        ctx.lineTo(centerX + checkSize, centerY - checkSize/2);
        ctx.stroke();

        // Pequeños puntos de confirmación en las esquinas
        ctx.fillStyle = '#00ff41';
        const dotSize = 3;
        
        // Puntos en las esquinas externas
        ctx.beginPath();
        ctx.arc(faceBox.minX - 10, faceBox.minY - 10, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(faceBox.maxX + 10, faceBox.minY - 10, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(faceBox.minX - 10, faceBox.maxY + 10, dotSize, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(faceBox.maxX + 10, faceBox.maxY + 10, dotSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Verificar si debe capturar frame
     */
    shouldCaptureFrame() {
        const now = Date.now();
        const timeSinceLastFrame = now - this.state.lastFrameTime;
        
        return (
            this.state.faceInBounds &&
            this.state.capturedFrames.length < this.config.requiredFrames &&
            timeSinceLastFrame >= this.config.frameInterval
        );
    }

    /**
     * Capturar frame para análisis
     */
    captureFrame(image) {
        if (!this.state.isCapturing || this.state.capturedFrames.length >= this.config.requiredFrames) {
            return;
        }
        
        // Verificar que hay una cara detectada y está en posición válida
        if (!this.state.faceDetected) {
            console.log('⚠️ No hay cara detectada para capturar');
            return;
        }
        
        if (!this.state.faceInBounds) {
            console.log('⚠️ Cara no está en posición válida');
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        
        // Calcular calidad del frame
        const quality = this.calculateFrameQuality();
        
        // Solo capturar si la calidad es suficiente
        if (quality < 0.5) {
            console.log(`⚠️ Calidad de frame muy baja: ${quality.toFixed(2)}`);
            return;
        }
        
        const frameData = {
            timestamp: Date.now(),
            imageData: canvas.toDataURL('image/jpeg', 0.9),
            frameNumber: this.state.capturedFrames.length + 1,
            quality: quality
        };

        this.state.capturedFrames.push(frameData);
        this.state.lastFrameTime = Date.now();

        console.log(`📸 Frame capturado: ${frameData.frameNumber}/${this.config.requiredFrames} (calidad: ${quality.toFixed(2)})`);

        // Si completamos todos los frames, procesar
        if (this.state.capturedFrames.length >= this.config.requiredFrames) {
            this.processFrames();
        }
    }

    /**
     * Calcular calidad del frame basado en la detección facial
     */
    calculateFrameQuality() {
        if (!this.state.faceDetected || !this.state.faceInBounds) {
            return 0;
        }
        
        // Factores de calidad:
        // 1. Estabilidad de la detección
        // 2. Posición centrada
        // 3. Tamaño adecuado del rostro
        
        let quality = 0.8; // Base quality
        
        // Bonus por detección estable
        if (this.state.faceDetected) {
            quality += 0.2;
        }
        
        // Normalizar entre 0 y 1
        return Math.min(1.0, Math.max(0.0, quality));
    }

    /**
     * Actualizar progreso de captura visual
     */
    updateCaptureProgress() {
        const progressElement = document.getElementById('capture-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressElement && progressFill && progressText) {
            // Mostrar progreso
            progressElement.style.display = 'block';
            
            // Calcular porcentaje
            const percentage = (this.state.capturedFrames.length / this.config.requiredFrames) * 100;
            
            // Actualizar barra
            progressFill.style.width = `${percentage}%`;
            
            // Actualizar texto
            progressText.textContent = `${this.state.capturedFrames.length}/${this.config.requiredFrames} frames capturados`;
            
            // Cambiar color según progreso
            if (percentage >= 100) {
                progressFill.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
            } else if (percentage >= 50) {
                progressFill.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, #2196f3, #03a9f4)';
            }
        }
    }
    
    /**
     * Ocultar progreso de captura
     */
    hideCaptureProgress() {
        const progressElement = document.getElementById('capture-progress');
        if (progressElement) {
            progressElement.style.display = 'none';
        }
    }
    
    /**
     * Resetear captura y UI
     */
    resetCapture() {
        this.state.capturedFrames = [];
        this.state.isCapturing = false;
        this.state.currentAttempt = 0;
        
        // Resetear UI
        this.hideCaptureProgress();
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = 'Iniciar Reconocimiento';
        
        // Resetear instrucciones
        const instructionElement = document.getElementById('face-instruction');
        if (instructionElement) {
            instructionElement.textContent = 'Mantén tu rostro dentro del recuadro';
            instructionElement.style.color = '#ffffff';
        }
        
        // Resetear esquinas
        const corners = document.querySelectorAll('.corner');
        corners.forEach(corner => {
            corner.style.borderColor = '#ffffff';
        });
    }

    /**
     * Procesar frames capturados y enviar al backend
     */
    async processFrames() {
        this.state.isCapturing = false;
        this.updateStatus('Validando identidad...', 'processing');
        this.showLoading(true);

        try {
            console.log(`🔄 Procesando ${this.state.capturedFrames.length} frames capturados`);
            
            const requestData = {
                images: this.state.capturedFrames.map(frame => frame.imageData),
                user_id: 'demo_user', // En producción, obtener del contexto
                session_id: this.generateSessionId()
            };

            console.log('📤 Enviando datos al backend:', {
                imageCount: requestData.images.length,
                user_id: requestData.user_id,
                session_id: requestData.session_id
            });

            const response = await fetch('/reconocimiento/api/phase1/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(requestData)
            });

            console.log('📥 Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📋 Resultado parseado:', result);
            this.handleRecognitionResult(result);

        } catch (error) {
            console.error('❌ Error procesando frames:', error);
            
            let errorMessage = 'Error en el reconocimiento. Intenta nuevamente.';
            
            if (error.message.includes('HTTP 400')) {
                errorMessage = 'Error de datos: Verifica que la cámara esté funcionando correctamente.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage = 'Error del servidor: Intenta nuevamente en unos momentos.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Error de conexión: Verifica tu conexión a internet.';
            }
            
            this.updateStatus(errorMessage, 'error');
        } finally {
            this.showLoading(false);
            this.resetCapture();
        }
    }

    /**
     * Manejar resultado del reconocimiento
     */
    handleRecognitionResult(result) {
        // Verificar si hay error en la respuesta
        if (result.status === 'error') {
            this.updateStatus(`Error: ${result.message}`, 'error');
            console.error('❌ Error del servidor:', result.message);
            return;
        }
        
        // Verificar si el reconocimiento fue exitoso
        if (result.status === 'ok') {
            if (result.matched) {
                const username = result.username || `usuario ${result.person_id}`;
                this.updateStatus(`¡Bienvenido ${username}! Reconocimiento exitoso.`, 'success');
                console.log('🎉 Reconocimiento exitoso:', result);
                
                // Redirigir a maintenance después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/reconocimiento/maintenance/';
                }, 2000);
            } else {
                // Usar el contador del backend
                const currentAttempts = result.current_attempts || this.state.currentAttempt + 1;
                const maxAttempts = result.max_attempts || this.config.maxAttempts;
                
                // Mostrar mensaje con consejos específicos
                let message = result.message || 'No se pudo verificar tu identidad.';
                
                // Agregar consejos basados en el score
                if (result.tips && result.tips.length > 0) {
                    message += '\n\nConsejos:\n• ' + result.tips.join('\n• ');
                }
                
                if (currentAttempts >= maxAttempts) {
                    this.updateStatus('Máximo de intentos alcanzado. Recarga la página para intentar nuevamente.', 'error');
                    this.elements.startBtn.disabled = true;
                } else {
                    this.updateStatus(`${message}\n\nIntento ${currentAttempts}/${maxAttempts}`, 'warning');
                    this.resetCapture();
                }
                
                console.log('⚠️ Reconocimiento fallido:', result);
                console.log(`📊 Intentos: ${currentAttempts}/${maxAttempts}`);
            }

            // Mostrar detalles adicionales
            console.log('📊 Score:', result.score);
            console.log('📊 Confidence:', result.confidence);
            console.log('📊 Frames procesados:', result.frames_processed);
        } else {
            this.updateStatus('Error en el procesamiento. Intenta nuevamente.', 'error');
            console.error('❌ Error del servidor:', result);
        }
        
        // Actualizar contador de intentos en UI
        const attemptCounter = document.getElementById('attempt-counter');
        if (attemptCounter) {
            attemptCounter.textContent = `${this.state.currentAttempt}/${this.config.maxAttempts}`;
        }
    }

    /**
     * Iniciar captura de frames
     */
    startCapture() {
        if (!this.state.isInitialized) {
            this.updateStatus('Sistema no inicializado', 'error');
            return;
        }

        if (this.state.currentAttempt >= this.config.maxAttempts) {
            this.updateStatus('Máximo de intentos alcanzado. Recarga la página.', 'error');
            return;
        }

        this.state.isCapturing = true;
        this.state.currentAttempt++;
        this.state.capturedFrames = [];
        this.state.lastFrameTime = 0;

        this.updateStatus('Iniciando captura... Mantén tu rostro en el recuadro', 'processing');
        this.updateButtons(true);

        console.log(`🎬 Iniciando captura - Intento ${this.state.currentAttempt}/${this.config.maxAttempts}`);
    }

    /**
     * Detener captura
     */
    stopCapture() {
        this.state.isCapturing = false;
        this.resetCapture();
        this.updateStatus('Captura detenida', 'default');
        console.log('⏹️ Captura detenida por el usuario');
    }

    /**
     * Resetear estado de captura
     */
    resetCapture() {
        this.state.isCapturing = false;
        this.state.capturedFrames = [];
        this.state.lastFrameTime = 0;
        this.updateButtons(false);
    }

    /**
     * Actualizar mensaje de estado
     */
    updateStatus(message, type = 'default') {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = `status-message ${type}`;
        }
    }

    /**
     * Actualizar estado de botones
     */
    updateButtons(isCapturing) {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = isCapturing;
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !isCapturing;
        }
    }

    /**
     * Mostrar/ocultar loading overlay
     */
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.toggle('show', show);
        }
    }

    /**
     * Generar ID de sesión
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtener CSRF token
     */
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

// Inicializar sistema cuando la página esté lista
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando sistema de reconocimiento facial...');
    
    const facialSystem = new FacialRecognitionSystem();
    
    try {
        await facialSystem.init();
    } catch (error) {
        console.error('❌ Error fatal inicializando sistema:', error);
    }
    
    // Hacer disponible globalmente para debugging
    window.facialSystem = facialSystem;
});