from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.conf import settings
import json
import logging
import os

from .models import PalabraCapturada, HistorialReconocimientoPalabra, PracticaPalabra, TipoPalabra, TipoMano

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def guardar_gesto(request):
    """API para guardar un nuevo gesto de palabra entrenado"""
    try:
        # Validar que el request tenga contenido
        if not request.body:
            return JsonResponse({'success': False, 'error': 'No se enviaron datos en la petición'}, status=400)
        
        # Intentar parsear el JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return JsonResponse({'success': False, 'error': f'JSON malformado: {str(e)}'}, status=400)
        
        # Validar que data sea un diccionario
        if not isinstance(data, dict):
            return JsonResponse({'success': False, 'error': 'Los datos deben ser un objeto JSON válido'}, status=400)
        
        palabra_vinculada = data.get('palabra_vinculada')
        landmarks_data = data.get('landmarks_data')
        precision = float(data.get('precision', 0.0) or 0.0)
        # Normalizar tipo de mano
        tipo_mano = (data.get('tipo_mano') or 'right').lower()
        if tipo_mano not in ('left', 'right', 'both'):
            tipo_mano = 'right'
        numero_muestras = int(data.get('numero_muestras', 0) or 0)
        landmarks_izquierda = data.get('landmarks_izquierda') or []
        landmarks_derecha = data.get('landmarks_derecha') or []

        # Validaciones explícitas con respuesta clara
        if not palabra_vinculada or not landmarks_data:
            return JsonResponse({'success': False,'error': 'Faltan datos requeridos: debe especificar palabra y landmarks'}, status=400)
        
        # Validar que la palabra no esté vacía y tenga un formato básico
        palabra_vinculada = palabra_vinculada.strip().upper()
        if len(palabra_vinculada) < 1 or len(palabra_vinculada) > 50:
            return JsonResponse({'success': False,'error': 'La palabra debe tener entre 1 y 50 caracteres'}, status=400)

        nombre_display = f"Palabra {palabra_vinculada}"

        filter_params = {
            'palabra_vinculada': palabra_vinculada,
            'tipo_mano': tipo_mano
        }

        # Ajustar numero_muestras a la longitud efectiva del arreglo principal si aplica
        try:
            effective_samples = len(landmarks_data) if isinstance(landmarks_data, list) else 0
        except Exception:
            effective_samples = 0
        if not numero_muestras:
            numero_muestras = effective_samples

        palabra, created = PalabraCapturada.objects.update_or_create(
            **filter_params,
            defaults={
                'nombre_display': nombre_display,
                'landmarks_data': json.dumps(landmarks_data, ensure_ascii=False),
                'precision_entrenamiento': precision,
                'numero_muestras': numero_muestras,
                'landmarks_mano_izquierda': json.dumps(landmarks_izquierda, ensure_ascii=False) if landmarks_izquierda else None,
                'landmarks_mano_derecha': json.dumps(landmarks_derecha, ensure_ascii=False) if landmarks_derecha else None,
                'activo': True
            }
        )

        return JsonResponse({
            'success': True,
            'message': f'Palabra "{nombre_display}" {"creada" if created else "actualizada"} exitosamente',
            'palabra_id': palabra.id,
            'created': created
        })
    
    except Exception as e:
        logger.exception("Error inesperado en guardar_gesto")
        # Incluir detalles sólo en modo DEBUG para facilitar diagnóstico
        if getattr(settings, 'DEBUG', False):
            return JsonResponse({'success': False, 'error': 'Error interno del servidor', 'detail': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Error interno del servidor'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def reconocer_gesto(request):
    """API para reconocer un gesto de palabra capturado"""
    try:
        # Validar que el request tenga contenido
        if not request.body:
            return JsonResponse({'success': False, 'error': 'No se enviaron datos en la petición'}, status=400)
        
        # Intentar parsear el JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return JsonResponse({'success': False, 'error': f'JSON malformado: {str(e)}'}, status=400)
        
        # Validar que data sea un diccionario
        if not isinstance(data, dict):
            return JsonResponse({'success': False, 'error': 'Los datos deben ser un objeto JSON válido'}, status=400)
        
        # Aceptar alias 'landmarks' del HTML antiguo
        landmarks_payload = data.get('landmarks_data') or data.get('landmarks')

        if not landmarks_payload:
            return JsonResponse({'success': False, 'error': 'No se proporcionaron datos de landmarks'}, status=400)

        # Normalizar: si llega un frame plano de puntos, úsalo; si llegan frames con leftHand/rightHand, aplanar right si existe o left
        if isinstance(landmarks_payload, dict):
            landmarks_input = [landmarks_payload]
        else:
            landmarks_input = landmarks_payload

        if len(landmarks_input) > 0 and isinstance(landmarks_input[0], dict) and 'x' in landmarks_input[0]:
            points = landmarks_input
        else:
            # Se asume lista de frames con leftHand/rightHand
            points = []
            for fr in landmarks_input:
                hand = fr.get('rightHand') or fr.get('leftHand') or []
                points.extend(hand)

        palabras_entrenadas = PalabraCapturada.objects.filter(activo=True)
        if not palabras_entrenadas.exists():
            return JsonResponse({'success': False,'error': 'No hay palabras entrenadas disponibles'}, status=400)

        mejor_coincidencia = None
        mejor_confianza = 0.0
        for palabra in palabras_entrenadas:
            confianza = calcular_similitud_landmarks(points, palabra.get_landmarks_as_dict())
            if confianza > mejor_confianza:
                mejor_confianza = confianza
                mejor_coincidencia = palabra

        if mejor_coincidencia and mejor_confianza > 0.7:
            HistorialReconocimientoPalabra.objects.create(
                palabra_reconocida=mejor_coincidencia,
                confianza=mejor_confianza,
                landmarks_reconocidos=json.dumps(points)
            )
            return JsonResponse({
                'success': True,
                'palabra_reconocida': {
                    'id': mejor_coincidencia.id,
                    'palabra_vinculada': mejor_coincidencia.palabra_vinculada,
                    'valor_display': mejor_coincidencia.valor_display,
                    'nombre': mejor_coincidencia.nombre_display,
                    'confianza': mejor_confianza
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'No se pudo reconocer la palabra con suficiente confianza',
                'confianza_maxima': mejor_confianza
            })
    
    except Exception as e:
        logger.error(f"Error inesperado en reconocer_gesto: {str(e)}")
        return JsonResponse({'success': False, 'error': 'Error interno del servidor'}, status=500)

@require_http_methods(["GET"])
def palabras_capturadas(request):
    """API para obtener todas las palabras capturadas"""
    palabras = PalabraCapturada.objects.filter(activo=True).order_by('palabra_vinculada')
    palabras_data = []
    for palabra in palabras:
        palabras_data.append({
            'id': palabra.id,
            'palabra_vinculada': palabra.palabra_vinculada,
            'tipo_mano': palabra.tipo_mano,
            'nombre_display': palabra.nombre_display,
            'landmarks': json.loads(palabra.landmarks_data) if palabra.landmarks_data else [],
            'landmarks_izquierda': json.loads(palabra.landmarks_mano_izquierda) if palabra.landmarks_mano_izquierda else None,
            'landmarks_derecha': json.loads(palabra.landmarks_mano_derecha) if palabra.landmarks_mano_derecha else None,
            'numero_muestras': palabra.numero_muestras,
            'fecha_creacion': palabra.fecha_creacion.isoformat(),
            'precision': palabra.precision_entrenamiento
        })
    return JsonResponse({'success': True,'palabras': palabras_data,'total': len(palabras_data)})

@csrf_exempt
@require_http_methods(["POST"])
def eliminar_gesto(request, palabra_id):
    """API para eliminar una palabra entrenada"""
    palabra = get_object_or_404(PalabraCapturada, id=palabra_id)
    nombre_palabra = palabra.nombre_display
    palabra.delete()
    return JsonResponse({'success': True,'message': f'Palabra "{nombre_palabra}" eliminada exitosamente'})

@require_http_methods(["GET"])
def estadisticas_practica(request):
    """API para obtener estadísticas de práctica de palabras"""
    practicas = PracticaPalabra.objects.all()
    total_practicas = practicas.count()
    practicas_correctas = practicas.filter(fue_correcta=True).count()
    
    if total_practicas > 0:
        precision_general = (practicas_correctas / total_practicas) * 100
    else:
        precision_general = 0
    
    # Estadísticas por palabra
    estadisticas_por_palabra = {}
    for palabra in TipoPalabra.choices:
        palabra_code = palabra[0]
        palabra_practicas = practicas.filter(palabra_objetivo=palabra_code)
        palabra_correctas = palabra_practicas.filter(fue_correcta=True).count()
        palabra_total = palabra_practicas.count()
        
        if palabra_total > 0:
            palabra_precision = (palabra_correctas / palabra_total) * 100
        else:
            palabra_precision = 0
            
        estadisticas_por_palabra[palabra_code] = {
            'total': palabra_total,
            'correctas': palabra_correctas,
            'precision': palabra_precision
        }
    
    return JsonResponse({
        'success': True,
        'estadisticas': {
            'total_practicas': total_practicas,
            'practicas_correctas': practicas_correctas,
            'precision_general': precision_general,
            'por_palabra': estadisticas_por_palabra
        }
    })

@csrf_exempt
@require_http_methods(["POST"])
def reconocer_dos_manos(request):
    """
    API para reconocer simultáneamente ambas manos para palabras
    """
    try:
        if not request.body:
            return JsonResponse({'success': False, 'error': 'No se enviaron datos en la petición'}, status=400)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return JsonResponse({'success': False, 'error': f'JSON malformado: {str(e)}'}, status=400)

        if not isinstance(data, dict):
            return JsonResponse({'success': False, 'error': 'Los datos deben ser un objeto JSON válido'}, status=400)

        # Aceptar alias
        landmarks_payload = data.get('landmarks_data') or data.get('landmarks')
        if not landmarks_payload:
            return JsonResponse({'success': False, 'error': 'No se proporcionaron datos de landmarks'}, status=400)

        # Normalización de entrada a dos conjuntos: izquierda y derecha
        left_points, right_points = [], []

        def to_points(seq):
            if isinstance(seq, list) and len(seq) > 0 and isinstance(seq[0], dict) and ('leftHand' in seq[0] or 'rightHand' in seq[0]):
                for fr in seq:
                    if not isinstance(fr, dict):
                        continue
                    l = fr.get('leftHand') or []
                    r = fr.get('rightHand') or []
                    if isinstance(l, list):
                        for p in l:
                            if isinstance(p, dict) and 'x' in p and 'y' in p:
                                left_points.append({'x': float(p['x']), 'y': float(p['y'])})
                    if isinstance(r, list):
                        for p in r:
                            if isinstance(p, dict) and 'x' in p and 'y' in p:
                                right_points.append({'x': float(p['x']), 'y': float(p['y'])})
            else:
                # Caso secuencia plana: asumimos derecha por defecto
                points = []
                if isinstance(seq, dict) and 'x' in seq and 'y' in seq:
                    points = [{'x': float(seq['x']), 'y': float(seq['y'])}]
                elif isinstance(seq, list):
                    for p in seq:
                        if isinstance(p, dict) and 'x' in p and 'y' in p:
                            points.append({'x': float(p['x']), 'y': float(p['y'])})
                right_points.extend(points)

        to_points(landmarks_payload)

        # Consultar palabras entrenadas por mano
        palabras_izq = PalabraCapturada.objects.filter(activo=True, tipo_mano='left')
        palabras_der = PalabraCapturada.objects.filter(activo=True, tipo_mano='right')

        if not palabras_izq.exists() and not palabras_der.exists():
            return JsonResponse({'success': False, 'error': 'No hay palabras entrenadas para manos izquierda/derecha'}, status=400)

        # Buscar mejor coincidencia por mano
        umbral = 0.7
        mejor_izq, conf_izq = None, 0.0
        if left_points and palabras_izq.exists():
            for palabra in palabras_izq:
                c = calcular_similitud_landmarks(left_points, palabra.get_landmarks_as_dict())
                if c > conf_izq:
                    conf_izq, mejor_izq = c, palabra

        mejor_der, conf_der = None, 0.0
        if right_points and palabras_der.exists():
            for palabra in palabras_der:
                c = calcular_similitud_landmarks(right_points, palabra.get_landmarks_as_dict())
                if c > conf_der:
                    conf_der, mejor_der = c, palabra

        # Construir respuesta de palabras detectadas
        palabra_izq = mejor_izq.palabra_vinculada if mejor_izq and conf_izq > umbral else None
        palabra_der = mejor_der.palabra_vinculada if mejor_der and conf_der > umbral else None

        if palabra_izq is None and palabra_der is None:
            return JsonResponse({
                'success': False, 
                'error': 'No se detectaron palabras con suficiente confianza', 
                'confianzas': {'izquierda': conf_izq, 'derecha': conf_der}
            }, status=200)

        # Registrar en historial por mano si corresponde
        if mejor_izq and palabra_izq is not None:
            HistorialReconocimientoPalabra.objects.create(
                palabra_reconocida=mejor_izq,
                confianza=conf_izq,
                landmarks_reconocidos=json.dumps(left_points)
            )
        if mejor_der and palabra_der is not None:
            HistorialReconocimientoPalabra.objects.create(
                palabra_reconocida=mejor_der,
                confianza=conf_der,
                landmarks_reconocidos=json.dumps(right_points)
            )

        respuesta = {
            'success': True,
            'manos_detectadas': {
                'izquierda': {
                    'palabra': palabra_izq,
                    'confianza': conf_izq,
                    'palabra_id': mejor_izq.id if mejor_izq else None,
                    'nombre': mejor_izq.nombre_display if mejor_izq else None,
                },
                'derecha': {
                    'palabra': palabra_der,
                    'confianza': conf_der,
                    'palabra_id': mejor_der.id if mejor_der else None,
                    'nombre': mejor_der.nombre_display if mejor_der else None,
                },
            }
        }

        return JsonResponse(respuesta)

    except Exception as e:
        logger.error(f"Error inesperado en reconocer_dos_manos: {str(e)}")
        return JsonResponse({'success': False, 'error': 'Error interno del servidor'}, status=500)

def calcular_similitud_landmarks(landmarks1, landmarks2):
    """
    Función auxiliar para calcular similitud entre landmarks
    Implementación simplificada - en producción usarías algoritmos más sofisticados
    """
    try:
        if not landmarks1 or not landmarks2:
            return 0.0

        # Asegurar estructuras de datos desde JSON si llegan como string
        if isinstance(landmarks1, str):
            landmarks1 = json.loads(landmarks1)
        if isinstance(landmarks2, str):
            landmarks2 = json.loads(landmarks2)

        def to_flat_points(seq):
            """Normaliza una secuencia de landmarks a una lista plana de puntos {x,y}."""
            if not seq:
                return []
            # Si es dict de un solo punto
            if isinstance(seq, dict) and 'x' in seq and 'y' in seq:
                return [ {'x': float(seq['x']), 'y': float(seq['y'])} ]
            # Si es lista
            if isinstance(seq, list):
                # Caso lista de puntos planos
                if len(seq) > 0 and isinstance(seq[0], dict) and 'x' in seq[0] and 'y' in seq[0]:
                    return [ {'x': float(p['x']), 'y': float(p['y'])} for p in seq if isinstance(p, dict) and 'x' in p and 'y' in p ]
                # Caso lista de frames con leftHand/rightHand
                flat = []
                for fr in seq:
                    if isinstance(fr, dict):
                        hand = fr.get('rightHand') or fr.get('leftHand') or []
                        if isinstance(hand, list):
                            for p in hand:
                                if isinstance(p, dict) and 'x' in p and 'y' in p:
                                    flat.append({'x': float(p['x']), 'y': float(p['y'])})
                return flat
            # Estructura no reconocida
            return []

        pts1 = to_flat_points(landmarks1)
        pts2 = to_flat_points(landmarks2)

        if not pts1 or not pts2:
            return 0.0

        # Igualar longitudes usando la mínima para evitar 0 inmediato por diferente tamaño
        n = min(len(pts1), len(pts2))
        if n == 0:
            return 0.0
        pts1 = pts1[:n]
        pts2 = pts2[:n]

        # Implementación básica de similitud: 1 - distancia promedio euclidiana
        total_distance = 0.0
        for i in range(n):
            dx = (pts1[i]['x'] - pts2[i]['x'])
            dy = (pts1[i]['y'] - pts2[i]['y'])
            distance = (dx ** 2 + dy ** 2) ** 0.5
            total_distance += distance

        avg_distance = total_distance / n
        similitud = max(0.0, 1.0 - avg_distance)
        return similitud
        
    except Exception as e:
        logger.error(f"Error al calcular similitud: {str(e)}")
        return 0.0

@require_http_methods(["GET"])
def gestos_entrenados(request):
    """API para obtener todos los gestos entrenados de palabras"""
    gestos = PalabraCapturada.objects.filter(activo=True).order_by('palabra_vinculada')
    gestos_data = []
    for gesto in gestos:
        gestos_data.append({
            'id': gesto.id,
            'palabra_vinculada': gesto.palabra_vinculada,
            'tipo_mano': gesto.tipo_mano,
            'nombre_display': gesto.nombre_display,
            'landmarks': json.loads(gesto.landmarks_data) if gesto.landmarks_data else [],
            'landmarks_izquierda': json.loads(gesto.landmarks_mano_izquierda) if gesto.landmarks_mano_izquierda else None,
            'landmarks_derecha': json.loads(gesto.landmarks_mano_derecha) if gesto.landmarks_mano_derecha else None,
            'numero_muestras': gesto.numero_muestras,
            'fecha_creacion': gesto.fecha_creacion.isoformat(),
            'precision': gesto.precision_entrenamiento
        })
    return JsonResponse({'success': True,'gestos': gestos_data,'total': len(gestos_data)})
