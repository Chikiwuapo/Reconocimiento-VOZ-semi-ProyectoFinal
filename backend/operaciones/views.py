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

from .models import GestoMano, HistorialReconocimiento, OperacionMatematica, TipoGesto, TipoOperacion

logger = logging.getLogger(__name__)

def index(request):
    """Vista principal que sirve el archivo HTML"""
    # Leer el archivo ejemplo_frontend.html
    html_path = os.path.join(os.path.dirname(__file__), '..', 'ejemplo_frontend.html')
    try:
        with open(html_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        return HttpResponse(html_content, content_type='text/html')
    except FileNotFoundError:
        return HttpResponse("Archivo HTML no encontrado", status=404)

def vista_entrenamiento(request):
    """Redirige a la vista principal"""
    return index(request)

def frontend_view(request):
    """Vista específica para el frontend de reconocimiento de gestos"""
    return index(request)

@csrf_exempt
@require_http_methods(["POST"])
def guardar_gesto(request):
    """API para guardar un nuevo gesto entrenado"""
    try:
        data = json.loads(request.body)
        numero_vinculado = data.get('numero_vinculado')
        operacion_vinculada = data.get('operacion_vinculada')
        landmarks_data = data.get('landmarks_data')
        precision = data.get('precision', 0.0)
        tipo_mano = data.get('tipo_mano', 'derecha')  # Por defecto mano derecha
        numero_muestras = data.get('numero_muestras', 0)
        landmarks_izquierda = data.get('landmarks_izquierda')
        landmarks_derecha = data.get('landmarks_derecha')
        
        # Validar que se proporcione al menos uno de los dos campos
        if (numero_vinculado is None and operacion_vinculada is None) or not landmarks_data:
            return JsonResponse({
                'success': False,
                'error': 'Faltan datos requeridos: debe especificar número o operación'
            }, status=400)
        
        # Validar número si se proporciona
        if numero_vinculado is not None:
            if not (0 <= numero_vinculado <= 50):
                return JsonResponse({
                    'success': False,
                    'error': 'El número debe estar entre 0 y 50'
                }, status=400)
        
        # Validar operación si se proporciona
        if operacion_vinculada is not None:
            operaciones_validas = [choice[0] for choice in TipoOperacion.choices]
            if operacion_vinculada not in operaciones_validas:
                return JsonResponse({
                    'success': False,
                    'error': 'Operación no válida'
                }, status=400)
        
        # Generar nombre display
        if numero_vinculado is not None:
            nombre_display = f"Número {numero_vinculado}"
        else:
            nombre_display = f"Operación {dict(TipoOperacion.choices)[operacion_vinculada]}"
        
        # Crear o actualizar el gesto
        # Buscar si ya existe un gesto con los mismos parámetros
        filter_params = {'tipo_mano': tipo_mano}
        if numero_vinculado is not None:
            filter_params['numero_vinculado'] = numero_vinculado
        else:
            filter_params['operacion_vinculada'] = operacion_vinculada
        
        gesto, created = GestoMano.objects.update_or_create(
            **filter_params,
            defaults={
                'nombre_display': nombre_display,
                'landmarks_data': json.dumps(landmarks_data),
                'precision_entrenamiento': precision,
                'numero_muestras': numero_muestras,
                'landmarks_mano_izquierda': json.dumps(landmarks_izquierda) if landmarks_izquierda else None,
                'landmarks_mano_derecha': json.dumps(landmarks_derecha) if landmarks_derecha else None,
                'activo': True
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Gesto "{nombre_display}" {"creado" if created else "actualizado"} exitosamente',
            'gesto_id': gesto.id,
            'created': created
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        logger.error(f"Error al guardar gesto: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

def vista_interaccion(request):
    """Redirige a la vista principal"""
    return index(request)

@csrf_exempt
@require_http_methods(["POST"])
def reconocer_gesto(request):
    """API para reconocer un gesto capturado"""
    try:
        data = json.loads(request.body)
        landmarks_data = data.get('landmarks_data')
        
        if not landmarks_data:
            return JsonResponse({
                'success': False,
                'error': 'No se proporcionaron datos de landmarks'
            }, status=400)
        
        # Obtener todos los gestos entrenados
        gestos_entrenados = GestoMano.objects.filter(activo=True)
        
        if not gestos_entrenados.exists():
            return JsonResponse({
                'success': False,
                'error': 'No hay gestos entrenados disponibles'
            }, status=400)
        
        # Aquí implementarías la lógica de reconocimiento
        # Por simplicidad, usaremos una comparación básica
        mejor_coincidencia = None
        mejor_confianza = 0.0
        
        for gesto in gestos_entrenados:
            # Calcular similitud (implementación simplificada)
            confianza = calcular_similitud_landmarks(landmarks_data, gesto.get_landmarks_as_dict())
            
            if confianza > mejor_confianza:
                mejor_confianza = confianza
                mejor_coincidencia = gesto
        
        if mejor_coincidencia and mejor_confianza > 0.7:  # Umbral de confianza
            # Guardar en historial
            HistorialReconocimiento.objects.create(
                gesto_reconocido=mejor_coincidencia,
                confianza=mejor_confianza,
                landmarks_reconocidos=json.dumps(landmarks_data)
            )
            
            return JsonResponse({
                'success': True,
                'gesto_reconocido': {
                    'numero_vinculado': mejor_coincidencia.numero_vinculado,
                    'operacion_vinculada': mejor_coincidencia.operacion_vinculada,
                    'valor_display': mejor_coincidencia.valor_display,
                    'nombre': mejor_coincidencia.nombre_display,
                    'confianza': mejor_confianza
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'No se pudo reconocer el gesto con suficiente confianza',
                'confianza_maxima': mejor_confianza
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        logger.error(f"Error al reconocer gesto: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

def vista_guia(request):
    """Redirige a la vista principal"""
    return index(request)

@require_http_methods(["GET"])
def gestos_entrenados(request):
    """API para obtener todos los gestos entrenados"""
    try:
        gestos = GestoMano.objects.filter(activo=True).order_by('numero_vinculado', 'operacion_vinculada')
        gestos_data = []
        
        for gesto in gestos:
            gestos_data.append({
                'id': gesto.id,
                'numero_vinculado': gesto.numero_vinculado,
                'operacion_vinculada': gesto.operacion_vinculada,
                'tipo_mano': gesto.tipo_mano,
                'nombre_display': gesto.nombre_display,
                'landmarks': json.loads(gesto.landmarks_data) if gesto.landmarks_data else [],
                'landmarks_izquierda': json.loads(gesto.landmarks_mano_izquierda) if gesto.landmarks_mano_izquierda else None,
                'landmarks_derecha': json.loads(gesto.landmarks_mano_derecha) if gesto.landmarks_mano_derecha else None,
                'numero_muestras': gesto.numero_muestras,
                'fecha_creacion': gesto.fecha_creacion.isoformat(),
                'precision': gesto.precision_entrenamiento
            })
        
        return JsonResponse({
            'success': True,
            'gestos': gestos_data,
            'total': len(gestos_data)
        })
        
    except Exception as e:
        logger.error(f"Error al obtener gestos entrenados: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error al cargar gestos entrenados'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def eliminar_gesto(request, gesto_id):
    """API para eliminar un gesto entrenado"""
    try:
        gesto = get_object_or_404(GestoMano, id=gesto_id)
        nombre_gesto = gesto.nombre_display
        gesto.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Gesto "{nombre_gesto}" eliminado exitosamente'
        })
        
    except Exception as e:
        logger.error(f"Error al eliminar gesto: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error al eliminar el gesto'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def calcular_operacion(request):
    """API para calcular una operación matemática"""
    try:
        data = json.loads(request.body)
        operando1 = data.get('operando1')
        operador = data.get('operador')
        operando2 = data.get('operando2')
        gestos_ids = data.get('gestos_utilizados', [])
        
        if not all([operando1, operador, operando2]):
            return JsonResponse({
                'success': False,
                'error': 'Faltan operandos u operador'
            }, status=400)
        
        # Calcular resultado
        try:
            num1 = float(operando1)
            num2 = float(operando2)
            
            if operador == '+':
                resultado = num1 + num2
            elif operador == '-':
                resultado = num1 - num2
            elif operador == '*':
                resultado = num1 * num2
            elif operador == '/':
                if num2 == 0:
                    return JsonResponse({
                        'success': False,
                        'error': 'División por cero no permitida'
                    }, status=400)
                resultado = num1 / num2
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Operador no válido'
                }, status=400)
            
            # Formatear resultado
            if resultado == int(resultado):
                resultado_str = str(int(resultado))
            else:
                resultado_str = f"{resultado:.2f}"
            
            # Guardar operación en base de datos
            operacion = OperacionMatematica.objects.create(
                operando1=operando1,
                operador=operador,
                operando2=operando2,
                resultado=resultado_str
            )
            
            # Asociar gestos utilizados
            if gestos_ids:
                gestos = GestoMano.objects.filter(id__in=gestos_ids)
                operacion.gestos_utilizados.set(gestos)
            
            return JsonResponse({
                'success': True,
                'resultado': resultado_str,
                'expresion': f"{operando1} {operador} {operando2} = {resultado_str}",
                'operacion_id': operacion.id
            })
            
        except ValueError:
            return JsonResponse({
                'success': False,
                'error': 'Operandos no válidos'
            }, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        logger.error(f"Error al calcular operación: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

def calcular_similitud_landmarks(landmarks1, landmarks2):
    """
    Función auxiliar para calcular similitud entre landmarks
    Implementación simplificada - en producción usarías algoritmos más sofisticados
    """
    try:
        if not landmarks1 or not landmarks2:
            return 0.0
        
        # Convertir a listas si son necesarios
        if isinstance(landmarks1, str):
            landmarks1 = json.loads(landmarks1)
        if isinstance(landmarks2, str):
            landmarks2 = json.loads(landmarks2)
        
        # Implementación básica de similitud
        # En un caso real, usarías algoritmos como DTW, cosine similarity, etc.
        if len(landmarks1) != len(landmarks2):
            return 0.0
        
        total_distance = 0.0
        for i in range(len(landmarks1)):
            if 'x' in landmarks1[i] and 'y' in landmarks1[i] and 'x' in landmarks2[i] and 'y' in landmarks2[i]:
                dx = landmarks1[i]['x'] - landmarks2[i]['x']
                dy = landmarks1[i]['y'] - landmarks2[i]['y']
                distance = (dx ** 2 + dy ** 2) ** 0.5
                total_distance += distance
        
        # Normalizar y convertir a similitud (0-1)
        avg_distance = total_distance / len(landmarks1)
        similitud = max(0.0, 1.0 - avg_distance)
        
        return similitud
        
    except Exception as e:
        logger.error(f"Error al calcular similitud: {str(e)}")
        return 0.0
