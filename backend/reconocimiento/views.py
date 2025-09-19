from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from django.contrib.auth import login
from .serializers import Phase1RequestSerializer, Phase1ResponseSerializer
from .models import Capture, Person
from .face_recognition_service import FaceRecognitionService
import random
import base64
import io
from PIL import Image
import json
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Helper para obtener la IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@csrf_exempt
@api_view(['POST'])
def register_view(request):
    """
    Endpoint para registro de nuevas personas con embeddings faciales
    Recibe: username, email, dni, images (≥8 imágenes desde distintos ángulos)
    """
    try:
        # Validar datos requeridos
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        dni = request.data.get('dni', '').strip()
        images = request.data.get('images', [])
        
        if not all([username, email, dni]):
            return Response({
                'status': 'error',
                'message': 'Username, email y DNI son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(images) < 8:
            return Response({
                'status': 'error',
                'message': 'Se requieren mínimo 8 imágenes para el registro'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que no exista el DNI
        if Person.objects.filter(dni=dni).exists():
            return Response({
                'status': 'error',
                'message': 'Ya existe una persona registrada con este DNI'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Procesar imágenes y extraer embeddings
        face_service = FaceRecognitionService()
        embeddings, processed_count = face_service.process_registration_images(images)
        
        if processed_count < 5:  # Mínimo 5 imágenes válidas
            return Response({
                'status': 'error',
                'message': f'Solo se procesaron {processed_count} imágenes válidas. Se requieren mínimo 5.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear persona en la base de datos
        try:
            # Verificar que no exista el username o email en User
            if User.objects.filter(username=username).exists():
                return Response({
                    'status': 'error',
                    'message': 'El nombre de usuario ya está en uso'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'El email ya está en uso'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear usuario de Django
            django_user = User.objects.create_user(
                username=username,
                email=email,
                password=dni  # Usar DNI como contraseña temporal
            )
            
            # Crear persona en la base de datos
            person = Person.objects.create(
                user=django_user,  # Asociar con el usuario de Django
                username=username,
                email=email,
                dni=dni,
                embeddings=embeddings,
                registration_ip=get_client_ip(request)
            )
            
            # Autenticar automáticamente al usuario
            login(request, django_user)
            
            logger.info(f"Usuario y persona registrados exitosamente: {person.id} - {username}")
            
            return Response({
                'status': 'ok',
                'person_id': person.id,
                'user_id': django_user.id,
                'username': username,
                'email': email,
                'dni': dni,
                'images_saved': processed_count,
                'message': f'Registro exitoso. Se procesaron {processed_count} imágenes.'
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError as e:
            logger.error(f"Error de integridad al registrar persona: {e}")
            return Response({
                'status': 'error',
                'message': 'El username o email ya están en uso'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except ValidationError as e:
            logger.error(f"Error de validación al registrar persona: {e}")
            return Response({
                'status': 'error',
                'message': 'Datos inválidos',
                'errors': e.message_dict if hasattr(e, 'message_dict') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error inesperado en registro: {e}")
        return Response({
            'status': 'error',
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def phase1_view(request):
    """
    Endpoint para el reconocimiento facial Fase 1 - Login robusto
    Recibe N frames (7-10) y aplica voting system contra base de datos
    """
    try:
        # Debug: Log de datos recibidos
        logger.info(f"Request method: {request.method}")
        logger.info(f"Content-Type: {request.content_type}")
        
        # Validar datos usando el serializer
        serializer = Phase1RequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"Datos inválidos: {serializer.errors}")
            return Response({
                'status': 'error',
                'message': f'Datos inválidos: {serializer.errors}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener datos validados
        images_data = serializer.validated_data['images']
        
        logger.info(f"Número de imágenes validadas: {len(images_data)}")
        
        if not images_data:
            logger.error("No se recibieron imágenes para procesar")
            return Response({
                'status': 'error',
                'message': 'No se recibieron imágenes para procesar'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(images_data) < 5:
            return Response({
                'status': 'error',
                'message': 'Se requieren mínimo 5 frames para el reconocimiento'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener todas las personas registradas con sus embeddings
        persons = Person.objects.filter(is_active=True)
        
        if not persons.exists():
            return Response({
                'status': 'error',
                'message': 'No hay personas registradas en el sistema'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Preparar datos para comparación
        stored_embeddings_list = []
        for person in persons:
            if person.embeddings and len(person.embeddings) > 0:
                stored_embeddings_list.append((person.id, person.embeddings))
                logger.info(f"👤 Usuario disponible para comparación: ID={person.id}, Username={person.username}, Embeddings={len(person.embeddings)}")
        
        if not stored_embeddings_list:
            return Response({
                'status': 'error',
                'message': 'No hay embeddings válidos en la base de datos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Realizar reconocimiento facial con voting
        face_service = FaceRecognitionService()
        recognition_result = face_service.compare_with_database(
            images_data, 
            stored_embeddings_list
        )
        
        logger.info(f"Resultado del reconocimiento: {recognition_result}")
        logger.info(f"Número de personas en BD: {len(stored_embeddings_list)}")
        logger.info(f"Umbral de similitud: {getattr(face_service, 'similarity_threshold', 'N/A')}")
        logger.info(f"Score obtenido: {recognition_result.get('score', 0)}")
        logger.info(f"¿Matched?: {recognition_result.get('matched', False)}")
        
        # Obtener información de la persona si hay match
        matched_person = None
        if recognition_result['matched'] and recognition_result['person_id']:
            try:
                matched_person = Person.objects.get(id=recognition_result['person_id'])
                
                # Verificar si la cuenta está bloqueada
                if matched_person.is_locked():
                    return Response({
                        'status': 'error',
                        'message': 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.'
                    }, status=status.HTTP_423_LOCKED)
                
                # Actualizar información de login exitoso
                matched_person.update_login_info(get_client_ip(request))
                
            except Person.DoesNotExist:
                recognition_result['matched'] = False
                recognition_result['person_id'] = None
        
        # Registrar el intento en la base de datos
        try:
            capture = Capture.objects.create(
                user=request.user if request.user.is_authenticated else None,
                person_id=recognition_result['person_id'] if recognition_result['matched'] else None,
                match_score=recognition_result['score'],
                matched=recognition_result['matched'],
                region_scores={'confidence': recognition_result.get('confidence', 0.0)},
                frames_count=recognition_result['frames_processed'],
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        except Exception as e:
            logger.error(f"Error guardando capture: {e}")
        
        # Manejar intentos por sesión
        session_key = f"recognition_attempts_{get_client_ip(request)}"
        current_attempts = request.session.get(session_key, 0)
        
        if not recognition_result['matched']:
            current_attempts += 1
            request.session[session_key] = current_attempts
            logger.info(f"Intento fallido #{current_attempts} desde IP {get_client_ip(request)}")
        else:
            # Reset attempts on successful recognition
            request.session[session_key] = 0
            # Autenticar al usuario de Django si hay match
            if matched_person and matched_person.user:
                # Autenticar usando el sistema de Django
                login(request, matched_person.user)
                logger.info(f"Usuario Django {matched_person.user.username} autenticado correctamente")
                logger.info(f"Usuario {matched_person.username} (ID: {matched_person.id}) autenticado en sesión")
            logger.info(f"Reconocimiento exitoso, reseteando intentos para IP {get_client_ip(request)}")
        
        # Preparar respuesta
        response_data = {
            'status': 'ok',
            'matched': recognition_result['matched'],
            'person_id': recognition_result['person_id'],
            'score': recognition_result['score'],
            'confidence': recognition_result.get('confidence', 0.0),
            'frames_processed': recognition_result['frames_processed'],
            'current_attempts': current_attempts,
            'max_attempts': 3
        }
        
        if recognition_result['matched'] and matched_person:
            response_data['message'] = f"¡Bienvenido {matched_person.username}! Reconocimiento exitoso."
            response_data['username'] = matched_person.username
        else:
            # Mensaje más específico basado en el score
            if recognition_result['score'] < 0.2:
                response_data['message'] = "No se encontró tu rostro en la base de datos. Debes registrarte primero para acceder al sistema."
                response_data['tips'] = [
                    "Contacta al administrador para registrarte en el sistema",
                    "Verifica que hayas completado el proceso de registro",
                    "Si ya estás registrado, verifica la iluminación y posición"
                ]
            elif recognition_result['score'] < 0.5:
                response_data['message'] = "No se pudo verificar tu identidad. Es posible que no estés registrado en el sistema."
                response_data['tips'] = [
                    "Verifica que estés registrado en la base de datos",
                    "Mejora la iluminación del ambiente",
                    "Mantén el rostro centrado en el recuadro"
                ]
            else:
                response_data['message'] = "No se pudo verificar tu identidad. Verifica la iluminación y posición del rostro."
                response_data['tips'] = [
                    "Asegúrate de tener buena iluminación",
                    "Mantén el rostro centrado en el recuadro",
                    "Evita usar gafas o accesorios que cubran el rostro"
                ]
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error inesperado en phase1_view: {e}")
        return Response({
            'status': 'error',
            'message': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def maintenance_view(request):
    """Vista de mantenimiento que muestra información del usuario autenticado"""
    # Usar la autenticación de Django
    if request.user.is_authenticated:
        # Buscar la persona asociada al usuario de Django
        try:
            person = Person.objects.get(user=request.user)
            context = {
                'user_id': person.id,
                'username': person.username,
                'is_authenticated': True
            }
        except Person.DoesNotExist:
            # Si no hay persona asociada, usar datos del usuario de Django
            context = {
                'user_id': request.user.id,
                'username': request.user.username,
                'is_authenticated': True
            }
    else:
        context = {
            'user_id': None,
            'username': 'Usuario no identificado',
            'is_authenticated': False
        }
    
    return render(request, 'reconocimiento/maintenance.html', context)


def logout_view(request):
    """Vista para cerrar sesión del usuario"""
    # Limpiar la sesión
    request.session.flush()
    
    # Redirigir al login
    from django.shortcuts import redirect
    return redirect('reconocimiento:login')
