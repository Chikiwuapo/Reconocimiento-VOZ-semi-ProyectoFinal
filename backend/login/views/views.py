from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
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

# face_recognition eliminado - ya no se usa


def index(request):
    """Redirige al frontend principal"""
    return redirect('http://localhost:5173/')


def bienvenido_view(request):
    """Redirige al frontend principal"""
    return redirect('http://localhost:5173/')


def login_view(request):
    """Redirige al frontend para login"""
    return redirect('http://localhost:5173/auth')





def register_view(request):
    """Redirige al frontend para registro"""
    return redirect('http://localhost:5173/auth')


@require_POST
@csrf_exempt
def api_encode(request):
    """Endpoint para codificar imagen facial (ahora usa solo fallback básico)"""
    try:
        data = json.loads(request.body)
        image_data = data.get('image')
        if not image_data:
            return JsonResponse({'error': 'No image data provided'}, status=400)
        
        embedding = _compute_embedding_from_b64(image_data)
        if embedding is None:
            return JsonResponse({'error': 'No face detected or processing failed'}, status=400)
        
        return JsonResponse({'embedding': embedding.tolist()})
    except Exception as e:
        logging.getLogger('facial').exception(f'api_encode error: {e}')
        return JsonResponse({'error': 'Internal server error'}, status=500)


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
            
            # Determinar redirección basada en el dominio del email
            redirect_url = get_redirect_url_by_domain(user.email)
            response_data = {'ok': True, 'redirect': redirect_url}
            
            # Agregar información adicional para administradores
            if is_admin_user(user.email):
                response_data['is_admin'] = True
                response_data['username'] = user.nombres
            
            return JsonResponse(response_data)
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

        # Validación previa de DNI único
        existing_dni_user = Usuario.objects.filter(dni=dni).first()
        if existing_dni_user and existing_dni_user.email != email:
            return JsonResponse({
                'ok': False, 
                'error': f'El DNI {dni} ya está registrado con otro email. Por favor, verifica el número o usa otro DNI.'
            }, status=400)

        # Validación previa de email único
        existing_email_user = Usuario.objects.filter(email=email).first()
        if existing_email_user and existing_email_user.dni != dni:
            return JsonResponse({
                'ok': False, 
                'error': f'El email {email} ya está registrado con otro DNI. Por favor, usa otro email.'
            }, status=400)

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
            error_message = str(ie)
            if 'login_usuario.dni' in error_message or 'dni' in error_message.lower():
                return JsonResponse({
                    'ok': False, 
                    'error': f'El DNI {dni} ya está registrado. Por favor, verifica el número o usa otro DNI.'
                }, status=400)
            elif 'login_usuario.email' in error_message or 'email' in error_message.lower():
                return JsonResponse({
                    'ok': False, 
                    'error': f'El email {email} ya está registrado. Por favor, usa otro email.'
                }, status=400)
            else:
                return JsonResponse({
                    'ok': False, 
                    'error': 'Ya existe un usuario con estos datos. Verifica DNI y email.'
                }, status=400)

        return JsonResponse({'ok': True, 'created': created})
    except Exception as e:
        logging.getLogger('facial').exception(f'api_register_basic: excepción {e}')
        return JsonResponse({'ok': False, 'error': 'Error interno'}, status=500)


@login_required
def mantenimiento_view(request):
    """Redirige al frontend para mantenimiento"""
    return redirect('http://localhost:5173/blackboard')


def logout_view(request):
    auth_logout(request)
    # Crear respuesta de redirección con parámetro para limpiar el campo de email
    response = redirect('login')
    # Agregar parámetro a la URL para indicar que se debe limpiar el campo
    response['Location'] = '/login/?clear_email=true'
    return response


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
            # Autenticar al usuario en la sesión
            auth_login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            
            # Determinar redirección basada en el dominio del email
            redirect_url = get_redirect_url_by_domain(user.email)
            response_data = {'ok': True, 'redirect': redirect_url}
            
            # Agregar información adicional para administradores
            if is_admin_user(user.email):
                response_data['is_admin'] = True
                response_data['username'] = user.nombres
            
            return JsonResponse(response_data)
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
        'has_face_recognition': False,  # face_recognition eliminado
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
        # face_recognition eliminado - no se detectan caras
        return JsonResponse({'ok': True, 'info': info})
    except Exception as e:
        log.exception(f'api_debug_decode: excepción {e}')
        return JsonResponse({'ok': False, 'info': info, 'error': str(e)}, status=500)


def _compute_embedding_from_b64(b64_str) -> Optional['np.ndarray']:
    """Computa embedding básico usando solo OpenCV (sin face_recognition)"""
    log = logging.getLogger('facial')
    if not b64_str:
        log.debug('compute_embedding: b64_str vacío')
        return None
    if np is None or cv2 is None:
        log.debug('compute_embedding: numpy o cv2 no disponible')
        return None
    try:
        header, encoded = b64_str.split(',') if ',' in b64_str else ('', b64_str)
        img_bytes = base64.b64decode(encoded)
        image = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(image, cv2.IMREAD_COLOR)
        if frame is None:
            log.debug('compute_embedding: cv2.imdecode devolvió None')
            return None
        
        # Usar solo el método de fallback básico
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
    """Compara embeddings usando solo similitud de coseno"""
    if stored_bytes is None or live_emb is None or np is None:
        return False
    try:
        stored = np.frombuffer(stored_bytes, dtype=np.float32)
        # Usar solo similitud de coseno
        num = float(np.dot(stored, live_emb))
        den = (np.linalg.norm(stored) * np.linalg.norm(live_emb) + 1e-6)
        sim = num / den
        return sim > 0.9
    except Exception:
        return False


def _compare_to_collection(user: Usuario, live_emb) -> bool:
    """Compara el embedding vivo contra la colección de embeddings del usuario usando solo similitud de coseno"""
    try:
        if live_emb is None:
            return False
        if np is None:
            # Sin numpy no podemos comparar colecciones; usar compatibilidad
            return _compare_embeddings(user.facial_data, live_emb)
        # Si no hay colección, caer al camino de compatibilidad
        if not user.facial_embeddings:
            return _compare_embeddings(user.facial_data, live_emb)

        # Umbral para similitud de coseno (más alto que distancia euclidiana)
        base_thr = 0.85
        thr = max(base_thr - (user.failed_attempts or 0) * 0.02, 0.75)

        live = np.array(live_emb, dtype=np.float32)
        for emb_list in user.facial_embeddings:
            stored = np.array(emb_list, dtype=np.float32)
            # Similitud de coseno
            num = float(np.dot(stored, live))
            den = (np.linalg.norm(stored) * np.linalg.norm(live) + 1e-6)
            sim = num / den
            if sim > thr:
                return True
        return False
    except Exception:
        return False


def estadistica_view(request):
    """Redirige al frontend para estadísticas"""
    return redirect('http://localhost:5173/estadistica')


def get_redirect_url_by_domain(email):
    """
    Determina la URL de redirección basada en el dominio del email.
    
    Args:
        email (str): Email del usuario
        
    Returns:
        str: URL de redirección ('/estadistica' para @senati.pe, '/blackboard' para otros)
    """
    if not email:
        return '/blackboard'
    
    email_lower = email.lower().strip()
    if email_lower.endswith('@senati.pe'):
        return '/estadistica'
    else:
        return '/blackboard'


def is_admin_user(email):
    """
    Verifica si un usuario es administrador basado en su dominio de email.
    
    Args:
        email (str): Email del usuario
        
    Returns:
        bool: True si es administrador (@senati.pe), False en caso contrario
    """
    if not email:
        return False
    
    email_lower = email.lower().strip()
    return email_lower.endswith('@senati.pe')


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
