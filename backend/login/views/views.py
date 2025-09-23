from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.conf import settings
import logging

from ..models.models import Usuario
from django.db import connection

import base64
import json
import io
from typing import Optional

try:
    import numpy as np
    import cv2
except Exception:  # pragma: no cover
    np = None
    cv2 = None

try:
    import face_recognition
except Exception:
    face_recognition = None


def index(request):
    return redirect('login')


def login_view(request):
    return render(request, 'login/login.html')


def register_view(request):
    if request.method == 'POST':
        log = logging.getLogger('facial')
        nombres = request.POST.get('nombres')
        apellidos = request.POST.get('apellidos')
        email = request.POST.get('email')
        dni = request.POST.get('dni')
        facial_b64 = request.POST.get('facial_frame')
        position_json = request.POST.get('position_data')
        multi_samples = request.POST.get('samples')  # JSON con {frames:[], positions:[]}

        log.debug(f'register_view: email={email}, dni={dni}, has_single={(facial_b64 is not None)}, has_samples={(multi_samples is not None)}')

        if not all([nombres, apellidos, email, dni]):
            messages.error(request, 'Todos los campos son obligatorios.')
            return render(request, 'login/register.html')

        try:
            # Buscar usuario ya creado en el paso 1 o crear si no existe
            try:
                user = Usuario.objects.get(email=email)
                created = False
                # Actualiza datos básicos para mantener consistencia
                user.nombres = nombres
                user.apellidos = apellidos
                user.dni = dni
                user.save(update_fields=['nombres', 'apellidos', 'dni'])
                log.debug('register_view: usuario existente actualizado')
            except Usuario.DoesNotExist:
                user = Usuario.objects.create_user(
                    email=email,
                    dni=dni,
                    nombres=nombres,
                    apellidos=apellidos,
                )
                created = True
                log.debug('register_view: usuario creado (no existía)')

            embeddings_list = []
            positions_list = []

            # Preferimos múltiples muestras si existen
            if multi_samples:
                try:
                    samples = json.loads(multi_samples)
                    frames = samples.get('frames', [])
                    pos_list = samples.get('positions', [])
                    log.debug(f'register_view: muestras recibidas frames={len(frames)} positions={len(pos_list)}')
                    for idx, fb64 in enumerate(frames):
                        emb = _compute_embedding_from_b64(fb64)
                        if emb is not None:
                            embeddings_list.append(emb.tolist())
                            if idx < len(pos_list):
                                positions_list.append(pos_list[idx])
                        else:
                            log.debug(f'register_view: emb None en muestra {idx}')
                except Exception:
                    pass

            # Compatibilidad: si no hay muestras, usa una
            if not embeddings_list and facial_b64 and position_json:
                emb = _compute_embedding_from_b64(facial_b64)
                if emb is not None:
                    embeddings_list.append(emb.tolist())
                    positions_list.append(json.loads(position_json))
                else:
                    log.debug('register_view: emb None en modo compatibilidad (una muestra)')

            if not embeddings_list:
                log.debug('register_view: embeddings_list vacío tras procesamiento; abortando registro (usuario se mantiene)')
                messages.error(request, 'No se pudo extraer información facial válida. Intenta nuevamente con buena iluminación.')
                # No eliminar al usuario existente: mantener datos básicos
                return render(request, 'login/register.html')

            # Guarda compatibilidad binaria principal (primer embedding) y posición principal
            import numpy as _np
            first = _np.array(embeddings_list[0], dtype=_np.float32)
            user.facial_data = first.tobytes()
            user.position_data = positions_list[0] if positions_list else None

            # Guarda la colección completa
            user.facial_embeddings = embeddings_list
            user.positions = positions_list
            user.failed_attempts = 0
            user.save()
            log.debug(f'register_view: guardado OK. embeddings={len(embeddings_list)} positions={len(positions_list)}')
            messages.success(request, 'Registro exitoso. Ahora puedes iniciar sesión facial.')
            return redirect('login')
        except Exception as e:
            log.exception(f'register_view: excepción {e}')
            messages.error(request, f'Error al registrar: {e}')

    return render(request, 'login/register.html')


@require_POST
@csrf_exempt
def api_encode(request):
    """Devuelve embedding facial a partir de un frame base64."""
    log = logging.getLogger('facial')
    data = json.loads(request.body.decode('utf-8')) if request.body else request.POST
    log.debug(f'api_encode: payload_keys={list(data.keys())}')
    if 'facial_frame' in data:
        log.debug(f"api_encode: facial_frame length={len(data.get('facial_frame') or '')}")
    b64 = data.get('facial_frame')
    emb = _compute_embedding_from_b64(b64)
    if emb is None:
        return JsonResponse({'ok': False, 'error': 'No face detected'}, status=400)
    return JsonResponse({'ok': True, 'embedding': base64.b64encode(emb.tobytes()).decode('utf-8')})


@csrf_exempt
def api_login(request):
    """Autentica comparando embedding y validando posición aproximada.
    Devuelve JSON incluso en caso de error para evitar HTML 500 en el front.
    """
    log = logging.getLogger('facial')
    # Manejo explícito de método para evitar 500/HTML en GET
    if request.method != 'POST':
        return JsonResponse({'ok': False, 'error': 'Method not allowed', 'allowed': ['POST']}, status=405)
    try:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception as e:
            log.exception(f'api_login: JSON inválido: {e}')
            return JsonResponse({'ok': False, 'error': 'JSON inválido'}, status=400)

        log.debug(f"api_login: keys={list(data.keys())}, email={data.get('email')}")
        if data.get('facial_frame'):
            log.debug(f"api_login: facial_frame length={len(data.get('facial_frame'))}")
        if data.get('position_data'):
            log.debug(f"api_login: position_data keys={list((data.get('position_data') or {}).keys())}")

        b64 = data.get('facial_frame')
        position = data.get('position_data')
        email = data.get('email')
        if not all([b64, position, email]):
            return JsonResponse({'ok': False, 'error': 'Parámetros incompletos'}, status=400)

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return JsonResponse({'ok': False, 'error': 'Usuario no encontrado'}, status=404)

        live_emb = _compute_embedding_from_b64(b64)
        if live_emb is None:
            return JsonResponse({'ok': False, 'error': 'Rostro no detectado'}, status=400)

        # Comparación de embeddings con colección de muestras
        match = _compare_to_collection(user, live_emb)

        # Validación de posición: exige coincidencia con alguna posición registrada
        position_ok = _validate_position_collection(user, position)

        if match and position_ok:
            auth_login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            user.failed_attempts = 0
            user.save(update_fields=['failed_attempts'])
            return JsonResponse({'ok': True, 'redirect': '/mantenimiento/'})
        else:
            # Mensajes específicos
            msg = 'Acceso denegado. Credenciales no coinciden'
            if match and not position_ok:
                msg = 'Posición incorrecta. Colóquese exactamente como durante su registro'
            elif (not match) and position_ok:
                msg = 'Usuario no reconocido'

            # Tolerancia adaptativa (solo para falsos negativos):
            user.failed_attempts = min(user.failed_attempts + 1, 5)
            user.save(update_fields=['failed_attempts'])
            return JsonResponse({'ok': False, 'error': msg}, status=401)
    except Exception as e:
        log.exception(f'api_login: excepción inesperada {e}')
        return JsonResponse({'ok': False, 'error': 'Error interno'}, status=500)


@require_POST
@csrf_exempt
def api_register_basic(request):
    """Crea o actualiza un usuario solo con datos básicos (sin rostro).
    Espera JSON o x-www-form-urlencoded con campos: nombres, apellidos, email, dni.
    """
    try:
        try:
            data = json.loads(request.body.decode('utf-8')) if request.body else request.POST
        except Exception:
            data = request.POST

        nombres = (data.get('nombres') or '').strip()
        apellidos = (data.get('apellidos') or '').strip()
        email = (data.get('email') or '').strip().lower()
        import re
        dni = re.sub(r"\D+", "", (data.get('dni') or '').strip())

        if not all([nombres, apellidos, email, dni]):
            return JsonResponse({'ok': False, 'error': 'Campos incompletos'}, status=400)

        # Validación simple de email
        if '@' not in email or '.' not in email.split('@')[-1]:
            return JsonResponse({'ok': False, 'error': 'Email inválido'}, status=400)

        # Crea o actualiza con el manager adecuado si existe
        from django.db import IntegrityError
        try:
            try:
                user = Usuario.objects.get(email=email)
                created = False
            except Usuario.DoesNotExist:
                # Intentar localizar por DNI (datos existentes previos)
                try:
                    user = Usuario.objects.get(dni=dni)
                    # Actualiza email normalizado si antes no coincidía
                    user.email = email
                    user.nombres = nombres
                    user.apellidos = apellidos
                    user.save(update_fields=['email', 'nombres', 'apellidos'])
                    created = False
                except Usuario.DoesNotExist:
                    created = True
                    if hasattr(Usuario.objects, 'create_user'):
                        user = Usuario.objects.create_user(
                            email=email,
                            dni=dni,
                            nombres=nombres,
                            apellidos=apellidos,
                        )
                    else:
                        user = Usuario.objects.create(
                            email=email,
                            dni=dni,
                            nombres=nombres,
                            apellidos=apellidos,
                        )
            if not created:
                # Asegura sincronización de datos básicos
                user.nombres = nombres
                user.apellidos = apellidos
                user.dni = dni
                user.save(update_fields=['nombres', 'apellidos', 'dni'])
        except IntegrityError as ie:
            return JsonResponse({'ok': False, 'error': 'Duplicado o restricción de integridad'}, status=400)

        return JsonResponse({'ok': True, 'created': created})
    except Exception as e:
        logging.getLogger('facial').exception(f'api_register_basic: excepción {e}')
        return JsonResponse({'ok': False, 'error': 'Error interno'}, status=500)


@login_required
def mantenimiento_view(request):
    # Pasamos el usuario autenticado como 'user' para el template
    return render(request, 'login/mantenimiento.html', {'user': request.user})


def logout_view(request):
    auth_logout(request)
    return redirect('login')


def db_check(request):
    """Verificación simple de conexión a base de datos."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
        return JsonResponse({"ok": True, "result": row[0] if row else None})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)


@require_POST
@csrf_exempt
def api_validate_user(request):
    """Valida credenciales tradicionales: email + DNI.
    Responde JSON con ok True si existe el usuario y coincide el DNI.
    """
    try:
        try:
            data = json.loads(request.body.decode('utf-8')) if request.body else request.POST
        except Exception:
            return JsonResponse({'ok': False, 'error': 'JSON inválido'}, status=400)

        email = (data.get('email') or '').strip().lower()
        import re
        dni = re.sub(r"\D+", "", (data.get('dni') or '').strip())
        if not email or not dni:
            return JsonResponse({'ok': False, 'error': 'Parámetros incompletos'}, status=400)

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return JsonResponse({'ok': False, 'error': 'Usuario no encontrado'}, status=404)
        except Exception as ex:
            # p.ej., MultipleObjectsReturned
            try:
                user = Usuario.objects.filter(email=email).first()
                if not user:
                    return JsonResponse({'ok': False, 'error': 'Usuario no encontrado'}, status=404)
            except Exception:
                return JsonResponse({'ok': False, 'error': 'Error al consultar usuario'}, status=500)

        stored_dni = re.sub(r"\D+", "", str(user.dni or '').strip())
        if stored_dni == dni:
            return JsonResponse({'ok': True})
        return JsonResponse({'ok': False, 'error': 'DNI no coincide'}, status=401)
    except Exception as e:
        logging.getLogger('facial').exception(f'api_validate_user: excepción {e}')
        return JsonResponse({'ok': False, 'error': 'Error interno'}, status=500)


@require_POST
@csrf_exempt
def api_debug_decode(request):
    """Endpoint temporal de diagnóstico: evalúa un frame base64 y reporta métricas.
    No altera lógica de negocio.
    """
    log = logging.getLogger('facial')
    data = json.loads(request.body.decode('utf-8')) if request.body else request.POST
    b64 = data.get('facial_frame')
    info = {
        'has_numpy': bool(np is not None),
        'has_cv2': bool(cv2 is not None),
        'has_face_recognition': bool(face_recognition is not None),
        'b64_length': len(b64) if b64 else 0,
    }
    try:
        if not b64:
            return JsonResponse({'ok': False, 'info': info, 'error': 'b64 vacío'}, status=400)
        header, encoded = b64.split(',') if ',' in b64 else ('', b64)
        img_bytes = base64.b64decode(encoded)
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        info['np_array_len'] = int(arr.size)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR) if cv2 is not None else None
        if frame is None:
            info['decoded'] = False
            return JsonResponse({'ok': False, 'info': info, 'error': 'imdecode None'}, status=400)
        h, w = frame.shape[:2]
        info['decoded'] = True
        info['shape'] = {'h': int(h), 'w': int(w)}
        info['mean_pixel'] = float(frame.mean())
        if face_recognition is not None:
            rgb = frame[:, :, ::-1]
            boxes = face_recognition.face_locations(rgb, model='hog')
            info['boxes'] = len(boxes)
            if boxes:
                encs = face_recognition.face_encodings(rgb, boxes)
                info['encs'] = len(encs)
        return JsonResponse({'ok': True, 'info': info})
    except Exception as e:
        log.exception(f'api_debug_decode: excepción {e}')
        return JsonResponse({'ok': False, 'info': info, 'error': str(e)}, status=500)


def _compute_embedding_from_b64(b64_str) -> Optional['np.ndarray']:
    log = logging.getLogger('facial')
    if not b64_str:
        log.debug('compute_embedding: b64_str vacío')
        return None
    if np is None:
        log.debug('compute_embedding: numpy no disponible')
        return None
    try:
        header, encoded = b64_str.split(',') if ',' in b64_str else ('', b64_str)
        img_bytes = base64.b64decode(encoded)
        image = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)
        if frame is None:
            log.debug('compute_embedding: cv2.imdecode devolvió None')
            return None
        if face_recognition is not None:
            rgb = frame[:, :, ::-1]
            boxes = face_recognition.face_locations(rgb, model='hog')
            log.debug(f'compute_embedding: boxes={len(boxes)}')
            if not boxes:
                return None
            encs = face_recognition.face_encodings(rgb, boxes)
            log.debug(f'compute_embedding: encs={len(encs)}')
            if not encs:
                return None
            return np.array(encs[0], dtype=np.float32)
        else:
            # Fallback: usar promedio de píxeles de la región central como "huella" rudimentaria
            h, w = frame.shape[:2]
            cx, cy = w // 2, h // 2
            crop = frame[max(cy-100,0):cy+100, max(cx-100,0):cx+100]
            if crop.size == 0:
                log.debug('compute_embedding: crop vacío en fallback')
                return None
            emb = cv2.resize(crop, (16, 16)).astype('float32').reshape(-1)
            emb = emb / (np.linalg.norm(emb) + 1e-6)
            return emb
    except Exception as e:
        logging.getLogger('facial').exception(f'compute_embedding: excepción {e}')
        return None


def _compare_embeddings(stored_bytes: bytes, live_emb) -> bool:
    if stored_bytes is None or live_emb is None or np is None:
        return False
    try:
        stored = np.frombuffer(stored_bytes, dtype=np.float32)
        if face_recognition is not None and stored.shape[0] in (128, 129):
            # distancia euclidiana típica < 0.6
            dist = np.linalg.norm(stored[:128] - live_emb[:128])
            return dist < 0.6
        else:
            # coseno para el fallback
            num = float(np.dot(stored, live_emb))
            den = (np.linalg.norm(stored) * np.linalg.norm(live_emb) + 1e-6)
            sim = num / den
            return sim > 0.9
    except Exception:
        return False


def _compare_to_collection(user: Usuario, live_emb) -> bool:
    """Compara el embedding vivo contra la colección de embeddings del usuario.
    Mantiene la lógica: si no hay colección, usa el método de compatibilidad _compare_embeddings.
    Usa umbral estricto base 0.45 con leve adaptación hasta 0.55 por intentos fallidos.
    """
    try:
        if live_emb is None:
            return False
        if np is None:
            # Sin numpy no podemos comparar colecciones; usar compatibilidad
            return _compare_embeddings(user.facial_data, live_emb)
        # Si no hay colección, caer al camino de compatibilidad
        if not user.facial_embeddings:
            return _compare_embeddings(user.facial_data, live_emb)

        base_thr = 0.45
        thr = min(base_thr + (user.failed_attempts or 0) * 0.03, 0.55)

        live = np.array(live_emb, dtype=np.float32)
        for emb_list in user.facial_embeddings:
            stored = np.array(emb_list, dtype=np.float32)
            # Euclidiana en primeras 128 dims (face_recognition)
            dist = float(np.linalg.norm(stored[:128] - live[:128]))
            if dist < thr:
                return True
        return False
    except Exception:
        return False


def _validate_position_collection(user: Usuario, live_pos) -> bool:
    """Valida la posición contra alguna de las posiciones registradas en el usuario.
    Si no hay colección, usa la posición de compatibilidad existente.
    Tolerancias estrictas y ligera adaptación por intentos fallidos.
    """
    try:
        if not live_pos:
            return False
        positions = user.positions or ([] if user.position_data is None else [user.position_data])
        if not positions:
            return False

        # Tolerancias base
        attempts = user.failed_attempts or 0
        tol_xy = max(0.05, 0.10 - attempts * 0.01)      # 0.10 -> 0.05
        tol_scale = max(0.08, 0.15 - attempts * 0.01)   # 0.15 -> 0.08

        for p in positions:
            # Formato {x,y,scale}
            if all(k in p for k in ('x', 'y', 'scale')) and all(k in live_pos for k in ('x', 'y', 'scale')):
                if (
                    abs(p['x'] - live_pos['x']) <= tol_xy and
                    abs(p['y'] - live_pos['y']) <= tol_xy and
                    abs(p['scale'] - live_pos['scale']) <= tol_scale
                ):
                    return True
            # Formato angular {roll,pitch,yaw,dist}
            if all(k in p for k in ('roll', 'pitch', 'yaw', 'dist')) and all(k in live_pos for k in ('roll', 'pitch', 'yaw', 'dist')):
                tol_ang = max(8, 15 - attempts * 1)
                tol_dist = max(0.12, 0.22 - attempts * 0.02)
                if (
                    abs(p['roll'] - live_pos['roll']) <= tol_ang and
                    abs(p['pitch'] - live_pos['pitch']) <= tol_ang and
                    abs(p['yaw'] - live_pos['yaw']) <= tol_ang and
                    abs(p['dist'] - live_pos['dist']) <= tol_dist
                ):
                    return True
        return False
    except Exception:
        return False

def _validate_position(stored_pos, live_pos) -> bool:
    try:
        # posición esperada: dict con {x,y,scale} o {roll,pitch,yaw,dist}
        keys = ('x', 'y', 'scale')
        if all(k in stored_pos for k in keys) and all(k in live_pos for k in keys):
            tol_xy = 0.12
            tol_scale = 0.20
            ok = (
                abs(stored_pos['x'] - live_pos['x']) <= tol_xy and
                abs(stored_pos['y'] - live_pos['y']) <= tol_xy and
                abs(stored_pos['scale'] - live_pos['scale']) <= tol_scale
            )
            return ok
        angles = ('roll', 'pitch', 'yaw', 'dist')
        if all(k in stored_pos for k in angles) and all(k in live_pos for k in angles):
            tol_ang = 15  # grados
            tol_dist = 0.25
            return (
                abs(stored_pos['roll'] - live_pos['roll']) <= tol_ang and
                abs(stored_pos['pitch'] - live_pos['pitch']) <= tol_ang and
                abs(stored_pos['yaw'] - live_pos['yaw']) <= tol_ang and
                abs(stored_pos['dist'] - live_pos['dist']) <= tol_dist
            )
        return False
    except Exception:
        return False
