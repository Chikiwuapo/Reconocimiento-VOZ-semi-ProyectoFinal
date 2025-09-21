// Face mesh front-end helper
// - Dibuja malla y puntos en color blanco adaptados al rostro
// - Calcula una posición simple relativa: {x, y, scale} basada en el rectángulo
// - Entrega un frame base64 y la posición cuando corresponde

(function(){
  const WHITE = '#ffffff';

  function ready(fn){
    if(document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function getCanvasBase64(video, canvas){
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function computePositionFromBox(box, vw, vh){
    const cx = (box.xMin + box.xMax)/2 / vw; // 0..1
    const cy = (box.yMin + box.yMax)/2 / vh; // 0..1
    const scale = Math.min(1, (box.xMax - box.xMin)/vw * 1.5); // relativo
    return { x: cx, y: cy, scale };
  }

  function drawMesh(canvas, landmarks){
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Usar las utilidades oficiales de MediaPipe para dibujar malla completa (tessellation) en blanco
    if(window.drawConnectors && window.FACEMESH_TESSELATION){
      drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {color: WHITE, lineWidth: 0.7});
      // Puntos visibles ligeramente
      if(window.drawLandmarks){
        drawLandmarks(ctx, landmarks, {color: WHITE, radius: 0.7});
      }
      return;
    }

    // Fallback manual si las utilidades no cargan
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = WHITE;
    ctx.fillStyle = WHITE;
    for(const lm of landmarks){
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 1.0, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function setup({mode, selectors, endpoints = {}, onCapture}){
    const video = document.querySelector(selectors.video);
    const canvas = document.querySelector(selectors.canvas);
    const statusEl = document.querySelector(selectors.status);
    const button = document.querySelector(selectors.button);
    const emailEl = selectors.email ? document.querySelector(selectors.email) : null;

    // UI helpers (frontend-only): toast + button loading + console-friendly
    const toast = document.querySelector('#toast');
    function showToast(msg, type='info'){
      if(!toast) { console.log(`[${type}]`, msg); return; }
      toast.textContent = msg;
      toast.classList.remove('hidden','error','success','info');
      toast.classList.add(type);
      // Auto-hide after 4s for info/success
      if(type !== 'error'){
        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(()=> toast.classList.add('hidden'), 4000);
      }
    }
    function setLoading(el, isLoading, labelWhenLoading){
      if(!el) return;
      if(isLoading){
        el.dataset.prevText = el.textContent;
        el.classList.add('loading');
        if(labelWhenLoading) el.textContent = labelWhenLoading;
        el.disabled = true;
      } else {
        el.classList.remove('loading');
        if(el.dataset.prevText){ el.textContent = el.dataset.prevText; delete el.dataset.prevText; }
        el.disabled = false;
      }
    }
    function friendlyError(backendMsg){
      if(!backendMsg) return 'No se pudo completar la autenticación. Intenta nuevamente.';
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

    async function initCamera(){
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    function updateStatus(txt){ if(statusEl) statusEl.textContent = txt; }

    function enableButton(ok){ if(button) button.disabled = !ok; }

    const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`});
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    faceMesh.onResults((results) => {
      overlay.clearRect(0,0,canvas.width,canvas.height);
      if(results.multiFaceLandmarks && results.multiFaceLandmarks.length){
        const lms = results.multiFaceLandmarks[0];
        // Dibujar malla/puntos blancos
        drawMesh(canvas, lms);
        // Calcular caja y posición
        let xMin=1e9,yMin=1e9,xMax=-1e9,yMax=-1e9;
        for(const p of lms){
          xMin = Math.min(xMin, p.x*canvas.width);
          yMin = Math.min(yMin, p.y*canvas.height);
          xMax = Math.max(xMax, p.x*canvas.width);
          yMax = Math.max(yMax, p.y*canvas.height);
        }
        lastBox = { xMin, yMin, xMax, yMax };
        const pos = computePositionFromBox(lastBox, canvas.width, canvas.height);
        // estado de distancia simple
        if(pos.scale < 0.25) { updateStatus('Muy lejos'); faceReady = false; }
        else { updateStatus('Rostro listo'); faceReady = true; }
      } else {
        updateStatus('Buscando rostro...');
        faceReady = false;
        lastBox = null;
      }
      enableButton(faceReady);
    });

    const camera = new Camera(video, {onFrame: async () => { await faceMesh.send({image: video}); }, width: 640, height: 400});

    initCamera().then(()=>camera.start());

    // Persistencia (frontend-only): email y formulario de registro
    if(emailEl){
      // Cargar email guardado
      try{ const saved = sessionStorage.getItem('login_email'); if(saved) emailEl.value = saved; }catch{}
      emailEl.addEventListener('input', ()=>{ try{ sessionStorage.setItem('login_email', emailEl.value || ''); }catch{} });
    }
    // Persistir campos de registro si existen
    try{
      const regFields = ['nombres','apellidos','email','dni'];
      regFields.forEach(name => {
        const el = document.querySelector(`[name="${name}"]`);
        if(!el) return;
        const saved = sessionStorage.getItem('reg_'+name);
        if(saved && !el.value) el.value = saved;
        el.addEventListener('input', ()=>{ sessionStorage.setItem('reg_'+name, el.value || ''); });
      });
    }catch{}

    if(button){
      button.addEventListener('click', async () => {
        if(!faceReady) return;

        if(mode === 'register'){
          // Capturar 5 muestras (embeddings + posiciones) para robustez
          setLoading(button, true, 'Capturando...');
          const frames = [];
          const positions = [];
          updateStatus('Capturando muestras... mantén la posición');
          for(let i=0;i<5;i++){
            const b64 = getCanvasBase64(video, document.createElement('canvas'));
            const pos = lastBox ? computePositionFromBox(lastBox, canvas.width, canvas.height) : null;
            frames.push(b64);
            positions.push(pos);
            await new Promise(r => setTimeout(r, 220));
          }
          if(onCapture) onCapture({ imageB64: frames[0], position: positions[0], samples: {frames, positions} });
          updateStatus('Listo');
          setLoading(button, false);
          // Guardar flag de intento de registro (para persistencia post-error)
          try{ sessionStorage.setItem('reg_last_attempt', String(Date.now())); }catch{}
        } else if(mode === 'login'){
          if(!emailEl || !emailEl.value){ showToast('Ingresa tu email', 'error'); return; }
          setLoading(button, true, 'Verificando...');
          const b64 = getCanvasBase64(video, document.createElement('canvas'));
          const pos = lastBox ? computePositionFromBox(lastBox, canvas.width, canvas.height) : null;
          const payload = { facial_frame: b64, position_data: pos, email: emailEl.value };
          try{
            const resp = await fetch(endpoints.login, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            const data = await resp.json().catch(()=>({ok:false,error:'Respuesta no válida del servidor'}));
            if(data.ok && data.redirect){ showToast('Autenticado. Redirigiendo...', 'success'); window.location.href = data.redirect; }
            else { console.warn('Login error:', data); showToast(friendlyError(data.error), 'error'); }
          }catch(err){
            console.error('Login request failed', err);
            showToast('No se pudo contactar al servidor. Intenta de nuevo.', 'error');
          }finally{
            setLoading(button, false);
          }
        }
      });
    }
  }

  window.FaceApp = { init: setup };
})();
