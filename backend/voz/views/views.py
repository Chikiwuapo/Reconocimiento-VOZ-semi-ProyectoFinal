from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from django.contrib.auth import get_user_model, login as auth_login
import json
import uuid
import os
from ..models import Comando, Usuario, PendingRegistration, VoiceProfile
from ..services.voz_service import voz_service
from login.views.views import get_redirect_url_by_domain, is_admin_user

def index(request):
    """
    Vista principal que muestra la página de reconocimiento de voz
    """
    # Obtener los comandos más recientes
    comandos = Comando.objects.all().order_by('-fecha')[:20]
    
    context = {
        'comandos': comandos,
        'total_comandos': Comando.objects.count(),
    }
    
    return render(request, 'index.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def iniciar_reconocimiento(request):
    """
    Vista para iniciar el reconocimiento de voz
    """
    try:
        # Iniciar el servicio de reconocimiento de voz
        if voz_service.iniciar_escucha_async():
            return JsonResponse({
                'status': 'ok',
                'message': 'Reconocimiento iniciado correctamente'
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Error al iniciar el reconocimiento de voz'
            })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error: {str(e)}'
        })


@csrf_exempt
@require_http_methods(["POST"])
def detener_reconocimiento(request):
    """
    Vista para detener el reconocimiento de voz
    """
    try:
        voz_service.detener_escucha()
        return JsonResponse({
            'status': 'ok',
            'message': 'Reconocimiento de voz detenido'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error: {str(e)}'
        })


def obtener_comandos(request):
    """
    Vista para obtener los comandos más recientes (AJAX)
    """
    try:
        comandos = Comando.objects.all().order_by('-fecha')[:20]
        comandos_data = []
        
        for comando in comandos:
            comandos_data.append({
                'id': comando.id,
                'comando': comando.comando,
                'fecha': comando.fecha.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return JsonResponse({
            'status': 'ok',
            'comandos': comandos_data,
            'total': Comando.objects.count()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error: {str(e)}'
        })


def estado_reconocimiento(request):
    """
    Vista para verificar el estado del reconocimiento de voz
    """
    return JsonResponse({
        'is_listening': voz_service.is_listening,
        'comandos_validos': voz_service.comandos_validos
    })


@method_decorator(csrf_exempt, name='dispatch')
class ComandoAPIView(View):
    """
    Vista API para manejar comandos (REST)
    """
    
    def get(self, request):
        """
        Obtener lista de comandos
        """
        try:
            comandos = Comando.objects.all().order_by('-fecha')
            comandos_data = []
            
            for comando in comandos:
                comandos_data.append({
                    'id': comando.id,
                    'comando': comando.comando,
                    'fecha': comando.fecha.isoformat()
                })
            
            return JsonResponse({
                'success': True,
                'data': comandos_data,
                'count': len(comandos_data)
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


@require_http_methods(["GET"])
def check_registered_users(request):
    """
    Endpoint para verificar si existen usuarios registrados con perfiles de voz activos.
    Usado por login.html para determinar si mostrar el botón de activar comandos de voz.
    """
    try:
        # Verificar si hay usuarios registrados en el sistema principal
        from login.models.models import Usuario as UsuarioLogin
        registered_users_count = UsuarioLogin.objects.count()
        
        # Verificar si hay perfiles de voz activos con consentimiento
        active_voice_profiles = VoiceProfile.objects.filter(
            is_active=True,
            consent_given=True
        ).count()
        
        return JsonResponse({
            'success': True,
            'has_registered_users': registered_users_count > 0,
            'has_voice_profiles': active_voice_profiles > 0,
            'registered_users_count': registered_users_count,
            'voice_profiles_count': active_voice_profiles
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)


# ============================================================================
# NUEVAS APIS PARA REGISTRO Y RECONOCIMIENTO DE VOZ
# ============================================================================

def get_client_ip(request):
    """Obtiene la IP del cliente desde el request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_or_create_pending_registration(request):
    """Obtiene o crea un PendingRegistration para la sesión actual"""
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    # Buscar registro pendiente por session_key
    pending = PendingRegistration.objects.filter(
        session_key=session_key,
        is_completed=False
    ).first()
    
    if not pending or pending.is_expired():
        # Crear nuevo registro pendiente
        pending = PendingRegistration.objects.create(
            session_key=session_key,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
    
    return pending


@csrf_exempt
@require_http_methods(["POST"])
def register_audio(request):
    """
    Endpoint para registrar audio de voz del usuario.
    Recibe un archivo de audio y lo asocia con un PendingRegistration o Usuario.
    """
    try:
        # Verificar que se envió un archivo de audio
        if 'audio' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No se encontró archivo de audio'
            }, status=400)
        
        audio_file = request.FILES['audio']
        pending_token = request.POST.get('pending_token', '')
        
        # Validar tamaño del archivo (máximo 10MB)
        if audio_file.size > 10 * 1024 * 1024:
            return JsonResponse({
                'success': False,
                'error': 'El archivo de audio es demasiado grande (máximo 10MB)'
            }, status=400)
        
        # Validar formato de audio
        allowed_formats = ['webm', 'wav', 'mp3', 'ogg']
        file_extension = audio_file.name.split('.')[-1].lower()
        if file_extension not in allowed_formats:
            return JsonResponse({
                'success': False,
                'error': f'Formato de audio no soportado. Formatos permitidos: {", ".join(allowed_formats)}'
            }, status=400)
        
        # Obtener o crear PendingRegistration
        if pending_token:
            try:
                pending = PendingRegistration.objects.get(token=pending_token)
            except PendingRegistration.DoesNotExist:
                pending = get_or_create_pending_registration(request)
        else:
            pending = get_or_create_pending_registration(request)
        
        # Verificar si ya existe un perfil de voz para este registro pendiente
        existing_profile = VoiceProfile.objects.filter(
            pending_registration=pending,
            is_active=True
        ).first()
        
        if existing_profile:
            # Actualizar el perfil existente
            voice_profile = existing_profile
            # Eliminar archivo anterior si existe
            if voice_profile.audio_file:
                default_storage.delete(voice_profile.audio_file.name)
        else:
            # Crear nuevo perfil de voz
            voice_profile = VoiceProfile(pending_registration=pending)
        
        # Generar nombre único para el archivo
        file_name = f"voice_sample_{pending.token}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        
        # Guardar archivo
        file_path = default_storage.save(f"voice_samples/{file_name}", ContentFile(audio_file.read()))
        
        # Actualizar perfil de voz
        voice_profile.audio_file = file_path
        voice_profile.audio_format = file_extension
        voice_profile.audio_duration = request.POST.get('duration', None)
        voice_profile.audio_size = audio_file.size
        
        # Registrar consentimiento (esto no guarda el objeto si es nuevo)
        voice_profile.give_consent(
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Guardar el perfil de voz (esto guardará todos los campos, incluyendo el consentimiento)
        voice_profile.save()
        
        # Marcar el registro pendiente como completado después del registro exitoso de voz
        pending.is_completed = True
        pending.save()
        
        # Actualizar token en sesión para uso futuro
        request.session['pending_token'] = str(pending.token)
        
        return JsonResponse({
            'success': True,
            'message': 'Voz registrada correctamente',
            'data': {
                'profile_id': voice_profile.id,
                'pending_token': str(pending.token),
                'audio_duration': voice_profile.audio_duration,
                'audio_size': voice_profile.audio_size
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def recognize_command(request):
    """
    Endpoint para reconocer comandos de voz y ejecutar acciones.
    Recibe texto reconocido por Web Speech API y ejecuta la acción correspondiente.
    """
    try:
        data = json.loads(request.body)
        command_text = data.get('command', '').strip().lower()
        
        if not command_text:
            return JsonResponse({
                'success': False,
                'error': 'No se proporcionó texto de comando'
            }, status=400)
        
        # Mapeo de comandos
        response_data = {
            'success': True,
            'command': command_text,
            'action': None,
            'target': None,
            'value': None,
            'message': 'Comando no reconocido'
        }
        
        # Comandos para rellenar campos
        if 'coloca en nombres' in command_text or 'poner en nombres' in command_text:
            # Extraer el texto después del comando
            parts = command_text.split('nombres', 1)
            if len(parts) > 1:
                value = parts[1].strip()
                response_data.update({
                    'action': 'fill_field',
                    'target': 'nombres',
                    'value': value,
                    'message': f'Rellenando campo nombres con: {value}'
                })
        
        elif 'coloca en apellidos' in command_text or 'poner en apellidos' in command_text:
            parts = command_text.split('apellidos', 1)
            if len(parts) > 1:
                value = parts[1].strip()
                response_data.update({
                    'action': 'fill_field',
                    'target': 'apellidos',
                    'value': value,
                    'message': f'Rellenando campo apellidos con: {value}'
                })
        
        elif 'coloca en email' in command_text or 'poner en email' in command_text:
            parts = command_text.split('email', 1)
            if len(parts) > 1:
                value = parts[1].strip()
                response_data.update({
                    'action': 'fill_field',
                    'target': 'email',
                    'value': value,
                    'message': f'Rellenando campo email con: {value}'
                })
        
        elif 'coloca en dni' in command_text or 'poner en dni' in command_text:
            parts = command_text.split('dni', 1)
            if len(parts) > 1:
                value = parts[1].strip()
                # Extraer solo números
                value = ''.join(filter(str.isdigit, value))
                response_data.update({
                    'action': 'fill_field',
                    'target': 'dni',
                    'value': value,
                    'message': f'Rellenando campo DNI con: {value}'
                })
        
        # Comandos de acción
        elif 'registrame' in command_text or 'regístrame' in command_text:
            response_data.update({
                'action': 'click_button',
                'target': 'submit-register',
                'message': 'Ejecutando registro'
            })
        
        elif 'inicia sesión' in command_text or 'iniciar sesión' in command_text:
            response_data.update({
                'action': 'click_button',
                'target': 'login-button',
                'message': 'Iniciando sesión'
            })
        
        # Registrar comando en la base de datos
        Comando.objects.create(comando=command_text)
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def voice_status(request):
    """
    Endpoint para obtener el estado del perfil de voz del usuario actual.
    """
    try:
        # Obtener pending_token de la sesión o parámetro
        pending_token = request.GET.get('pending_token') or request.session.get('pending_token')
        
        if not pending_token:
            return JsonResponse({
                'success': True,
                'has_voice_profile': False,
                'message': 'No hay registro pendiente'
            })
        
        try:
            pending = PendingRegistration.objects.get(token=pending_token)
        except PendingRegistration.DoesNotExist:
            return JsonResponse({
                'success': True,
                'has_voice_profile': False,
                'message': 'Registro pendiente no encontrado'
            })
        
        # Buscar perfil de voz asociado
        voice_profile = VoiceProfile.objects.filter(
            pending_registration=pending,
            is_active=True
        ).first()
        
        if voice_profile:
            return JsonResponse({
                'success': True,
                'has_voice_profile': True,
                'profile_data': {
                    'id': voice_profile.id,
                    'consent_given': voice_profile.consent_given,
                    'created_at': voice_profile.created_at.isoformat(),
                    'usage_count': voice_profile.usage_count,
                    'last_used': voice_profile.last_used.isoformat() if voice_profile.last_used else None
                },
                'message': 'Perfil de voz encontrado'
            })
        else:
            return JsonResponse({
                'success': True,
                'has_voice_profile': False,
                'message': 'No hay perfil de voz registrado'
            })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_voice_profile(request, profile_id):
    """
    Endpoint para eliminar un perfil de voz (para privacidad del usuario).
    """
    try:
        voice_profile = get_object_or_404(VoiceProfile, id=profile_id, is_active=True)
        
        # Verificar permisos (simplificado - en producción agregar autenticación)
        pending_token = request.session.get('pending_token')
        if voice_profile.pending_registration and str(voice_profile.pending_registration.token) != pending_token:
            return JsonResponse({
                'success': False,
                'error': 'No tienes permisos para eliminar este perfil'
            }, status=403)
        
        # Eliminar archivo de audio
        if voice_profile.audio_file:
            default_storage.delete(voice_profile.audio_file.name)
        
        # Marcar como inactivo en lugar de eliminar (para auditoría)
        voice_profile.is_active = False
        voice_profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Perfil de voz eliminado correctamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }, status=500)


# Vistas para servir páginas HTML
def registro_page(request):
    """Vista para servir la página de registro"""
    return render(request, 'registro.html')


def login_page(request):
    """Vista para servir la página de login"""
    return render(request, 'login.html')


@csrf_exempt
@require_http_methods(["POST"])
def get_pending_token(request):
    """Obtiene o crea un token de registro pendiente para la sesión actual."""
    try:
        pending_registration = get_or_create_pending_registration(request)
        return JsonResponse({
            'success': True,
            'pending_token': pending_registration.token
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener token: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def registrar_usuario(request):
    """
    Vista para registrar un nuevo usuario con username, password y frase_voz
    """
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        frase_voz = data.get('frase_voz', '').strip()
        
        # Validaciones
        if not username:
            return JsonResponse({
                'status': 'error',
                'message': 'El username es requerido'
            })
        
        if not password:
            return JsonResponse({
                'status': 'error',
                'message': 'La contraseña es requerida'
            })
        
        if not frase_voz:
            return JsonResponse({
                'status': 'error',
                'message': 'La frase de voz es requerida'
            })
        
        # Verificar si el usuario ya existe
        if Usuario.objects.filter(username=username).exists():
            return JsonResponse({
                'status': 'error',
                'message': 'El usuario ya existe'
            })
        
        # Crear el usuario
        usuario = Usuario.objects.create(
            username=username,
            frase_voz=frase_voz.lower()  # Normalizar a minúsculas
        )
        usuario.set_password(password)  # Encriptar contraseña
        usuario.save()
        
        return JsonResponse({
            'status': 'ok',
            'message': f'Usuario {username} registrado exitosamente'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'JSON inválido'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error interno: {str(e)}'
        })


@csrf_exempt
@require_http_methods(["POST"])
def login_usuario(request):
    """
    Vista para login con frase de voz
    """
    try:
        data = json.loads(request.body)
        frase_voz = data.get('frase_voz', '').strip().lower()
        
        if not frase_voz:
            return JsonResponse({
                'status': 'error',
                'message': 'La frase de voz es requerida'
            })
        
        # Buscar usuario por frase de voz en el modelo de voz
        try:
            usuario_voz = Usuario.objects.get(frase_voz=frase_voz)
            
            # Buscar el usuario correspondiente en el modelo de login usando el username
            from login.models.models import Usuario as UsuarioLogin
            try:
                # Intentar buscar por email (asumiendo que username podría ser email)
                usuario_login = UsuarioLogin.objects.get(email=usuario_voz.username)
            except UsuarioLogin.DoesNotExist:
                # Si no se encuentra por email, buscar por nombres o apellidos
                usuario_login = UsuarioLogin.objects.filter(
                    nombres__icontains=usuario_voz.username
                ).first()
                
                if not usuario_login:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Usuario no encontrado en el sistema principal'
                    })
            
            # Autenticar al usuario en la sesión
            auth_login(request, usuario_login, backend='django.contrib.auth.backends.ModelBackend')
            
            # Determinar redirección basada en el dominio del email
            redirect_url = get_redirect_url_by_domain(usuario_login.email)
            response_data = {
                'status': 'ok',
                'message': 'Login exitoso',
                'usuario': usuario_voz.username,
                'redirect': redirect_url
            }
            
            # Agregar información adicional para administradores
            if is_admin_user(usuario_login.email):
                response_data['is_admin'] = True
                response_data['username'] = usuario_login.nombres
            
            return JsonResponse(response_data)
            
        except Usuario.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Frase incorrecta'
            })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'JSON inválido'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error interno: {str(e)}'
        })
    
    def post(self, request):
        """
        Crear un nuevo comando manualmente (para testing)
        """
        try:
            data = json.loads(request.body)
            comando_texto = data.get('comando', '').strip()
            
            if not comando_texto:
                return JsonResponse({
                    'success': False,
                    'error': 'El comando no puede estar vacío'
                }, status=400)
            
            # Verificar si es un comando válido
            if comando_texto.lower() not in voz_service.comandos_validos:
                return JsonResponse({
                    'success': False,
                    'error': f'Comando no válido. Comandos válidos: {", ".join(voz_service.comandos_validos)}'
                }, status=400)
            
            # Crear el comando
            comando = Comando.objects.create(comando=comando_texto.lower())
            
            return JsonResponse({
                'success': True,
                'data': {
                    'id': comando.id,
                    'comando': comando.comando,
                    'fecha': comando.fecha.isoformat()
                },
                'message': f'Comando "{comando.comando}" creado correctamente'
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'JSON inválido'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)