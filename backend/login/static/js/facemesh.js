// Face mesh front-end helper
// - Dibuja malla y puntos en color blanco adaptados al rostro
// - Calcula una posición simple relativa: {x, y, scale} basada en el rectángulo
// - Entrega un frame base64 y la posición cuando corresponde

(function () {
    const WHITE = '#ffffff';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    function getCanvasBase64(video, canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.92);
    }

    function computePositionFromBox(box, vw, vh) {
        const cx = (box.xMin + box.xMax) / 2 / vw; // 0..1
        const cy = (box.yMin + box.yMax) / 2 / vh; // 0..1
        const scale = Math.min(1, (box.xMax - box.xMin) / vw * 1.5); // relativo
        return { x: cx, y: cy, scale };
    }

    function drawMesh(canvas, landmarks) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Usar las utilidades oficiales de MediaPipe para dibujar malla completa (tessellation) en blanco
        if (window.drawConnectors && window.FACEMESH_TESSELATION) {
            // Configuración mejorada para una máscara más natural y menos "chupada"
            drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { 
                color: WHITE, 
                lineWidth: 0.5  // Reducido de 0.7 para líneas más sutiles
            });
            
            // Puntos visibles con tamaño ajustado para mejor proporción
            if (window.drawLandmarks) {
                drawLandmarks(ctx, landmarks, { 
                    color: WHITE, 
                    radius: 0.5  // Reducido de 0.7 para puntos menos prominentes
                });
            }
            return;
        }

        // Fallback manual mejorado si las utilidades no cargan
        ctx.lineWidth = 0.8;  // Reducido de 1.0 para líneas más naturales
        ctx.strokeStyle = WHITE;
        ctx.fillStyle = WHITE;
        
        // Dibujar puntos con tamaño más natural
        for (const lm of landmarks) {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 0.8, 0, Math.PI * 2);  // Reducido de 1.0
            ctx.fill();
        }
    }

    function setup({ mode, selectors, endpoints = {}, onCapture }) {
        const video = document.querySelector(selectors.video);
        const canvas = document.querySelector(selectors.canvas);
        const statusEl = document.querySelector(selectors.status);
        const button = document.querySelector(selectors.button);
        const emailEl = selectors.email ? document.querySelector(selectors.email) : null;

        // UI helpers (frontend-only): toast + button loading + console-friendly
        const toast = document.querySelector('#toast');
        function showToast(msg, type = 'info') {
            if (!toast) { console.log(`[${type}]`, msg); return; }
            toast.textContent = msg;
            toast.classList.remove('hidden', 'error', 'success', 'info');
            toast.classList.add(type);
            // Auto-hide after 4s for info/success
            if (type !== 'error') {
                clearTimeout(window.__toastTimer);
                window.__toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000);
            }
        }
        function setLoading(el, isLoading, labelWhenLoading) {
            if (!el) return;
            if (isLoading) {
                el.dataset.prevText = el.textContent;
                el.classList.add('loading');
                if (labelWhenLoading) el.textContent = labelWhenLoading;
                el.disabled = true;
            } else {
                el.classList.remove('loading');
                if (el.dataset.prevText) { el.textContent = el.dataset.prevText; delete el.dataset.prevText; }
                el.disabled = false;
            }
        }
        function friendlyError(backendMsg) {
            if (!backendMsg) return 'No se pudo completar la autenticación. Intenta nuevamente.';
            const map = {
                'Usuario no encontrado': 'Usuario no registrado. Verifica el correo o regístrate.',
                'Rostro no detectado': 'No pudimos ver bien tu rostro. Asegúrate de estar centrado y con buena iluminación.',
                'Posición incorrecta. Colóquese exactamente como durante su registro': 'Posición incorrecta. Colócate exactamente como durante tu registro.',
                'Acceso denegado. Credenciales no coinciden': 'Las credenciales no coinciden con el usuario indicado.'
            };
            return map[backendMsg] || backendMsg;
        }

        const overlay = canvas.getContext('2d');

        let faceReady = false;
        let lastBox = null;
        
        // Función para emitir eventos de cambio de estado facial
        function updateFaceReadyState(newState) {
            if (faceReady !== newState) {
                faceReady = newState;
                // Emitir evento personalizado para que los sistemas de voz puedan reaccionar
                const event = new CustomEvent('faceStatusChanged', {
                    detail: { ready: faceReady }
                });
                document.dispatchEvent(event);
            }
        }

        async function initCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            video.srcObject = stream;
            await video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        function updateStatus(txt) { if (statusEl) statusEl.textContent = txt; }

        function enableButton(ok) { if (button) button.disabled = !ok; }

        const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6,
        });

        faceMesh.onResults((results) => {
            overlay.clearRect(0, 0, canvas.width, canvas.height);
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length) {
                const lms = results.multiFaceLandmarks[0];
                // Dibujar malla/puntos blancos
                drawMesh(canvas, lms);
                // Calcular caja y posición
                let xMin = 1e9, yMin = 1e9, xMax = -1e9, yMax = -1e9;
                for (const p of lms) {
                    xMin = Math.min(xMin, p.x * canvas.width);
                    yMin = Math.min(yMin, p.y * canvas.height);
                    xMax = Math.max(xMax, p.x * canvas.width);
                    yMax = Math.max(yMax, p.y * canvas.height);
                }
                lastBox = { xMin, yMin, xMax, yMax };
                const pos = computePositionFromBox(lastBox, canvas.width, canvas.height);
                // estado de distancia simple
                if (pos.scale < 0.25) { updateStatus('Muy lejos'); updateFaceReadyState(false); }
                else { updateStatus('Rostro listo'); updateFaceReadyState(true); }
            } else {
                updateStatus('Buscando rostro...');
                updateFaceReadyState(false);
                lastBox = null;
            }
            enableButton(faceReady);
        });

        const camera = new Camera(video, { onFrame: async () => { await faceMesh.send({ image: video }); }, width: 640, height: 400 });

        initCamera().then(() => camera.start());

        // Persistencia (frontend-only): email y formulario de registro
        if (emailEl) {
            // Verificar si se debe limpiar el email antes de restaurarlo
            const urlParams = new URLSearchParams(window.location.search);
            const clearEmail = urlParams.get('clear_email');
            const shouldClearEmail = localStorage.getItem('clear_email_on_load');
            
            if (clearEmail === 'true' || shouldClearEmail === 'true') {
                // Limpiar el sessionStorage y no restaurar el email
                try { 
                    sessionStorage.removeItem('login_email'); 
                    localStorage.removeItem('clear_email_on_load');
                } catch { }
            } else {
                // Cargar email guardado solo si no se debe limpiar
                try { const saved = sessionStorage.getItem('login_email'); if (saved) emailEl.value = saved; } catch { }
            }
            
            // Siempre agregar el listener para guardar cambios futuros
            emailEl.addEventListener('input', () => { try { sessionStorage.setItem('login_email', emailEl.value || ''); } catch { } });
        }
        // Limpiar campos de registro completamente - NO persistir datos
        try {
            const regFields = ['nombres', 'apellidos', 'email', 'dni'];
            const isRegisterPage = window.location.pathname.includes('/register');
            
            if (isRegisterPage) {
                regFields.forEach(name => {
                    const el = document.querySelector(`[name="${name}"]`);
                    if (!el) return;
                    
                    // Siempre limpiar sessionStorage y campo al cargar
                    sessionStorage.removeItem('reg_' + name);
                    el.value = '';
                    
                    // NO agregar listener para guardar - los campos no deben persistir
                });
            }
            
        } catch { }

        if (button) {
            button.addEventListener('click', async () => {
                if (!faceReady) return;

                if (mode === 'register') {
                    // Capturar 5 muestras (embeddings + posiciones) para robustez
                    setLoading(button, true, 'Capturando...');
                    const frames = [];
                    const positions = [];
                    updateStatus('Capturando muestras... mantén la posición');
                    for (let i = 0; i < 5; i++) {
                        const b64 = getCanvasBase64(video, document.createElement('canvas'));
                        const pos = lastBox ? computePositionFromBox(lastBox, canvas.width, canvas.height) : null;
                        frames.push(b64);
                        positions.push(pos);
                        await new Promise(r => setTimeout(r, 220));
                    }
                    if (onCapture) onCapture({ imageB64: frames[0], position: positions[0], samples: { frames, positions } });
                    updateStatus('Listo');
                    setLoading(button, false);
                    // NO guardar flag de intento de registro - no persistir datos
                } else if (mode === 'login') {
                    if (!emailEl || !emailEl.value) { showToast('Ingresa tu email', 'error'); return; }
                    setLoading(button, true, 'Verificando...');
                    const b64 = getCanvasBase64(video, document.createElement('canvas'));
                    const pos = lastBox ? computePositionFromBox(lastBox, canvas.width, canvas.height) : null;
                    const payload = { facial_frame: b64, position_data: pos, email: emailEl.value };
                    try {
                        const resp = await fetch(endpoints.login, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                        const data = await resp.json().catch(() => ({ ok: false, error: 'Respuesta no válida del servidor' }));
                        if (data.ok && data.redirect) { showToast('Autenticado. Redirigiendo...', 'success'); window.location.href = data.redirect; }
                        else { console.warn('Login error:', data); showToast(friendlyError(data.error), 'error'); }
                    } catch (err) {
                        console.error('Login request failed', err);
                        showToast('No se pudo contactar al servidor. Intenta de nuevo.', 'error');
                    } finally {
                        setLoading(button, false);
                    }
                }
            });
        }
    }

    window.FaceApp = { init: setup };
})();

// Función para limpiar campos del formulario de registro al cargar la página
function clearRegistrationFieldsOnLoad() {
    // Solo ejecutar en la página de registro
    if (!window.location.pathname.includes('/register')) {
        console.log('No es página de registro - saltando limpieza');
        return;
    }
    
    try {
        console.log('🧹 Iniciando limpieza completa de datos de registro...');
        
        // 1. Limpiar campos del formulario
        const regFields = ['nombres', 'apellidos', 'email', 'dni'];
        regFields.forEach(name => {
            // Limpiar sessionStorage
            sessionStorage.removeItem('reg_' + name);
            
            // Limpiar localStorage también por si acaso
            localStorage.removeItem('reg_' + name);
            
            // Limpiar campo visual si existe
            const el = document.querySelector(`[name="${name}"]`);
            if (el) {
                el.value = '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        
        // 2. Limpiar datos relacionados con el registro
        const keysToRemove = [
            'reg_last_attempt',
            'reg_form_data',
            'reg_validation_errors',
            'reg_step',
            'reg_progress',
            'face_samples',
            'voice_samples',
            'registration_session',
            'temp_user_data'
        ];
        
        keysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        });
        
        // 3. Limpiar cualquier dato que empiece con 'reg_' o 'registration_'
        // SessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('reg_') || key.startsWith('registration_')) {
                sessionStorage.removeItem(key);
            }
        });
        
        // LocalStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('reg_') || key.startsWith('registration_')) {
                localStorage.removeItem(key);
            }
        });
        
        // 4. Resetear cualquier estado visual del formulario
        const form = document.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // 5. Limpiar mensajes de error o éxito
        const errorMessages = document.querySelectorAll('.error-message, .success-message, .alert');
        errorMessages.forEach(msg => {
            msg.remove();
        });
        
        console.log('✅ Limpieza completa de datos de registro completada');
        console.log('📝 Campos limpiados:', regFields);
        console.log('🗑️ Datos adicionales eliminados:', keysToRemove);
        
    } catch (error) {
        console.error('❌ Error al limpiar campos de registro:', error);
    }
}

// Función para detectar si es una recarga real de página
function isRealPageReload() {
    try {
        // Método 1: Usar performance.navigation (más confiable para navegadores antiguos)
        if (performance.navigation && performance.navigation.type === 1) {
            console.log('Recarga detectada por performance.navigation');
            return true;
        }
        
        // Método 2: Usar performance.getEntriesByType (navegadores modernos)
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
            const navEntry = navigationEntries[0];
            if (navEntry.type === 'reload') {
                console.log('Recarga detectada por navigation entries');
                return true;
            }
        }
        
        // Método 3: Detectar usando el referrer y sessionStorage
        // Si no hay referrer y no existe el indicador de sesión, es una carga inicial o recarga
        const sessionKey = 'page_session_active';
        const isSessionActive = sessionStorage.getItem(sessionKey);
        
        if (!isSessionActive) {
            // Primera carga o recarga (sessionStorage se limpia en recarga)
            sessionStorage.setItem(sessionKey, 'true');
            console.log('Recarga detectada por sessionStorage');
            return true;
        }
        
        // Método 4: Verificar si el documento fue recargado usando document.referrer
        if (document.referrer === window.location.href) {
            console.log('Recarga detectada por referrer');
            return true;
        }
        
        console.log('No es recarga - cambio de pestaña o navegación normal');
        return false;
    } catch (error) {
        console.warn('Error detectando tipo de carga de página:', error);
        // En caso de error, asumir que es recarga para limpiar por seguridad
        return true;
    }
}

// Ejecutar limpieza automática cuando se carga la página de registro
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado - ejecutando limpieza de campos de registro');
    // Ejecutar la función de limpieza inmediatamente
    clearRegistrationFieldsOnLoad();
});

// También ejecutar en el evento load para asegurar que se ejecute
window.addEventListener('load', () => {
    console.log('🔄 Página completamente cargada - ejecutando limpieza adicional');
    clearRegistrationFieldsOnLoad();
});
