"""
Vistas de autenticación para el sistema de reconocimiento de gestos
"""
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
import json
import logging

logger = logging.getLogger(__name__)


# ==================== VISTAS WEB ====================

def login_view(request):
    """Vista de login para la interfaz web"""
    if request.user.is_authenticated:
        return redirect('operaciones:dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'¡Bienvenido, {user.first_name or user.username}!')
                
                # Redirigir a la página solicitada o al dashboard
                next_url = request.GET.get('next', 'operaciones:dashboard')
                return redirect(next_url)
            else:
                messages.error(request, 'Usuario o contraseña incorrectos.')
        else:
            messages.error(request, 'Por favor, completa todos los campos.')
    
    return render(request, 'operaciones/auth/login.html')


def register_view(request):
    """Vista de registro para la interfaz web"""
    if request.user.is_authenticated:
        return redirect('operaciones:dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        
        # Validaciones
        if not all([username, email, first_name, password, password_confirm]):
            messages.error(request, 'Por favor, completa todos los campos obligatorios.')
            return render(request, 'operaciones/auth/register.html')
        
        if password != password_confirm:
            messages.error(request, 'Las contraseñas no coinciden.')
            return render(request, 'operaciones/auth/register.html')
        
        if len(password) < 8:
            messages.error(request, 'La contraseña debe tener al menos 8 caracteres.')
            return render(request, 'operaciones/auth/register.html')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, 'El nombre de usuario ya está en uso.')
            return render(request, 'operaciones/auth/register.html')
        
        if User.objects.filter(email=email).exists():
            messages.error(request, 'El email ya está registrado.')
            return render(request, 'operaciones/auth/register.html')
        
        try:
            # Crear el usuario
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name or '',
                password=password
            )
            
            # Crear token para API
            Token.objects.create(user=user)
            
            # Autenticar y loguear automáticamente
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                messages.success(request, '¡Cuenta creada exitosamente! Bienvenido al sistema.')
                return redirect('operaciones:dashboard')
            
        except IntegrityError as e:
            logger.error(f"Error creando usuario: {e}")
            messages.error(request, 'Error al crear la cuenta. Inténtalo de nuevo.')
        except Exception as e:
            logger.error(f"Error inesperado: {e}")
            messages.error(request, 'Error inesperado. Inténtalo de nuevo.')
    
    return render(request, 'operaciones/auth/register.html')


@login_required
def logout_view(request):
    """Vista de logout"""
    username = request.user.username
    logout(request)
    messages.success(request, f'¡Hasta luego, {username}!')
    return redirect('operaciones:login')


@login_required
def profile_view(request):
    """Vista del perfil del usuario"""
    if request.method == 'POST':
        user = request.user
        
        # Actualizar información básica
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        
        # Cambiar contraseña si se proporciona
        current_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        if current_password and new_password:
            if user.check_password(current_password):
                if new_password == confirm_password:
                    if len(new_password) >= 8:
                        user.set_password(new_password)
                        messages.success(request, 'Contraseña actualizada exitosamente.')
                    else:
                        messages.error(request, 'La nueva contraseña debe tener al menos 8 caracteres.')
                        return render(request, 'operaciones/auth/profile.html')
                else:
                    messages.error(request, 'Las nuevas contraseñas no coinciden.')
                    return render(request, 'operaciones/auth/profile.html')
            else:
                messages.error(request, 'La contraseña actual es incorrecta.')
                return render(request, 'operaciones/auth/profile.html')
        
        try:
            user.save()
            messages.success(request, 'Perfil actualizado exitosamente.')
            
            # Si cambió la contraseña, re-autenticar
            if new_password:
                user = authenticate(request, username=user.username, password=new_password)
                if user:
                    login(request, user)
                    
        except Exception as e:
            logger.error(f"Error actualizando perfil: {e}")
            messages.error(request, 'Error al actualizar el perfil.')
    
    return render(request, 'operaciones/auth/profile.html')


# ==================== API REST ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """API endpoint para login"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username y password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                # Obtener o crear token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'success': True,
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Cuenta desactivada'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        logger.error(f"Error en API login: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """API endpoint para registro"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name', '')
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        
        # Validaciones
        if not all([username, email, first_name, password]):
            return Response(
                {'error': 'Username, email, first_name y password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if password != password_confirm:
            return Response(
                {'error': 'Las contraseñas no coinciden'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 8:
            return Response(
                {'error': 'La contraseña debe tener al menos 8 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'El username ya está en uso'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'El email ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        
        # Crear token
        token = Token.objects.create(user=user)
        
        return Response({
            'success': True,
            'message': 'Usuario creado exitosamente',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_201_CREATED)
        
    except IntegrityError as e:
        logger.error(f"Error de integridad: {e}")
        return Response(
            {'error': 'Error al crear el usuario'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error en API register: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """API endpoint para logout"""
    try:
        # Eliminar el token del usuario
        request.user.auth_token.delete()
        return Response({
            'success': True,
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error en API logout: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    """API endpoint para obtener perfil del usuario"""
    try:
        user = request.user
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'is_staff': user.is_staff,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error obteniendo perfil: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_profile(request):
    """API endpoint para actualizar perfil del usuario"""
    try:
        user = request.user
        
        # Actualizar campos básicos
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        
        # Cambiar contraseña si se proporciona
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if current_password and new_password:
            if user.check_password(current_password):
                if len(new_password) >= 8:
                    user.set_password(new_password)
                else:
                    return Response(
                        {'error': 'La nueva contraseña debe tener al menos 8 caracteres'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {'error': 'La contraseña actual es incorrecta'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        user.save()
        
        return Response({
            'success': True,
            'message': 'Perfil actualizado exitosamente',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error actualizando perfil: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_change_password(request):
    """API endpoint para cambiar contraseña"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not all([current_password, new_password, confirm_password]):
            return Response(
                {'error': 'Todos los campos son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'La contraseña actual es incorrecta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'Las nuevas contraseñas no coinciden'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'La nueva contraseña debe tener al menos 8 caracteres'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        # Regenerar token
        user.auth_token.delete()
        new_token = Token.objects.create(user=user)
        
        return Response({
            'success': True,
            'message': 'Contraseña cambiada exitosamente',
            'token': new_token.key
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error cambiando contraseña: {e}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )