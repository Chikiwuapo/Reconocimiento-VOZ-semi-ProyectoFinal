"""
Vistas de Django para el Chatbot Educativo
"""

import json
import uuid
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils import timezone

from .models import ChatSession, ChatMessage, ChatAnalytics
from .services.chatbot_service import chatbot_service

# Configurar logging
logger = logging.getLogger(__name__)


def chat_interface(request):
    """Vista principal para la interfaz del chatbot"""
    
    # Obtener o crear sesión de chat
    session_id = request.session.get('chat_session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
        request.session['chat_session_id'] = session_id
    
    # Crear o obtener sesión de chat en la base de datos
    chat_session, created = ChatSession.objects.get_or_create(
        session_id=session_id,
        defaults={
            'user': request.user if request.user.is_authenticated else None,
            'is_active': True
        }
    )
    
    # Obtener historial de mensajes
    messages = chat_session.messages.all().order_by('timestamp')
    
    context = {
        'session_id': session_id,
        'messages': messages,
        'user': request.user if request.user.is_authenticated else None,
    }
    
    return render(request, 'chatbot/chat.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def chat_api(request):
    """API endpoint para procesar mensajes del chatbot"""
    
    try:
        # Parsear datos JSON
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id')
        
        if not user_message:
            return JsonResponse({
                'error': 'Mensaje vacío'
            }, status=400)
        
        # Obtener o crear sesión
        if not session_id:
            session_id = str(uuid.uuid4())
        
        chat_session, created = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user': request.user if request.user.is_authenticated else None,
                'is_active': True
            }
        )
        
        # Guardar mensaje del usuario
        user_msg = ChatMessage.objects.create(
            session=chat_session,
            message_type='user',
            content=user_message,
            user_ip=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Procesar mensaje con el servicio del chatbot
        response_data = chatbot_service.process_message(user_message, session_id)
        
        # Guardar respuesta del bot
        bot_msg = ChatMessage.objects.create(
            session=chat_session,
            message_type='bot',
            content=response_data['response'],
            bot_confidence=response_data.get('confidence'),
            bot_category=response_data.get('category'),
            bot_redirect=response_data.get('redirect')
        )
        
        # Actualizar timestamp de la sesión
        chat_session.updated_at = timezone.now()
        chat_session.save()
        
        # Actualizar o crear analíticas
        analytics, created = ChatAnalytics.objects.get_or_create(
            session=chat_session
        )
        analytics.update_analytics()
        
        # Preparar respuesta
        response = {
            'response': response_data['response'],
            'confidence': response_data.get('confidence', 0.5),
            'category': response_data.get('category', 'General'),
            'redirect': response_data.get('redirect'),
            'session_id': session_id,
            'timestamp': bot_msg.timestamp.isoformat()
        }
        
        return JsonResponse(response)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Formato JSON inválido'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Error en chat_api: {str(e)}")
        return JsonResponse({
            'error': 'Error interno del servidor',
            'response': 'Lo siento, ocurrió un error procesando tu mensaje. Por favor, inténtalo de nuevo.',
            'confidence': 0.0,
            'category': 'Error'
        }, status=500)


@require_http_methods(["GET"])
def health_check(request):
    """Endpoint para verificar el estado del servicio"""
    
    try:
        # Verificar estado del servicio del chatbot
        health_data = chatbot_service.health_check()
        
        # Agregar información adicional
        health_data.update({
            'django_status': 'healthy',
            'database_status': 'healthy',  # Podrías agregar verificación de DB aquí
            'timestamp': timezone.now().isoformat()
        })
        
        status_code = 200 if health_data['status'] == 'healthy' else 503
        return JsonResponse(health_data, status=status_code)
        
    except Exception as e:
        logger.error(f"Error en health_check: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'django_status': 'error',
            'message': f'Health check failed: {str(e)}',
            'timestamp': timezone.now().isoformat()
        }, status=503)


@login_required
def chat_history(request):
    """Vista para mostrar el historial de chats del usuario"""
    
    user_sessions = ChatSession.objects.filter(
        user=request.user
    ).prefetch_related('messages').order_by('-updated_at')
    
    context = {
        'sessions': user_sessions
    }
    
    return render(request, 'chatbot/history.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def clear_session(request):
    """API para limpiar la sesión actual del chat"""
    
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        
        if session_id:
            try:
                chat_session = ChatSession.objects.get(session_id=session_id)
                chat_session.is_active = False
                chat_session.save()
                
                # Limpiar sesión de Django
                if 'chat_session_id' in request.session:
                    del request.session['chat_session_id']
                
                return JsonResponse({
                    'success': True,
                    'message': 'Sesión limpiada exitosamente'
                })
                
            except ChatSession.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Sesión no encontrada'
                }, status=404)
        
        return JsonResponse({
            'success': False,
            'message': 'ID de sesión requerido'
        }, status=400)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Formato JSON inválido'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Error en clear_session: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'Error interno del servidor'
        }, status=500)


@require_http_methods(["GET"])
def session_analytics(request, session_id):
    """API para obtener analíticas de una sesión específica"""
    
    try:
        chat_session = ChatSession.objects.get(session_id=session_id)
        
        # Verificar permisos (solo el propietario o staff)
        if chat_session.user and chat_session.user != request.user and not request.user.is_staff:
            return JsonResponse({
                'error': 'No tienes permisos para ver esta sesión'
            }, status=403)
        
        # Obtener o crear analíticas
        analytics, created = ChatAnalytics.objects.get_or_create(
            session=chat_session
        )
        
        if created or not analytics.total_messages:
            analytics.update_analytics()
        
        # Preparar datos de respuesta
        analytics_data = {
            'session_id': session_id,
            'total_messages': analytics.total_messages,
            'user_messages': analytics.user_messages,
            'bot_messages': analytics.bot_messages,
            'average_confidence': analytics.average_confidence,
            'session_duration': str(analytics.session_duration) if analytics.session_duration else None,
            'most_common_category': analytics.most_common_category,
            'created_at': chat_session.created_at.isoformat(),
            'updated_at': chat_session.updated_at.isoformat(),
            'is_active': chat_session.is_active
        }
        
        return JsonResponse(analytics_data)
        
    except ChatSession.DoesNotExist:
        return JsonResponse({
            'error': 'Sesión no encontrada'
        }, status=404)
        
    except Exception as e:
        logger.error(f"Error en session_analytics: {str(e)}")
        return JsonResponse({
            'error': 'Error interno del servidor'
        }, status=500)


def get_client_ip(request):
    """Obtiene la dirección IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class ChatbotView(View):
    """Vista basada en clase para el chatbot (alternativa)"""
    
    def get(self, request):
        """Mostrar interfaz del chatbot"""
        return chat_interface(request)
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        """Procesar mensaje del chatbot"""
        return chat_api(request)