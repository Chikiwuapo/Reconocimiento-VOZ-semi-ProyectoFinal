from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.conf import settings
import json
import logging
import time
import numpy as np
from datetime import datetime, timedelta

from .models import Gesture, GestureFunction, TrainingSession, GestureSample, RecognitionLog
from .utils import GestureProcessor, ModelTrainer, GestureRecognizer

logger = logging.getLogger(__name__)


# ==================== VISTAS DE AUTENTICACIÓN ====================

def login_view(request):
    """Vista de login para usuarios"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'¡Bienvenido {user.username}!')
            return redirect('operaciones:dashboard')
        else:
            messages.error(request, 'Credenciales inválidas')
    
    return render(request, 'operaciones/auth/login.html')


@login_required
def logout_view(request):
    """Vista de logout"""
    logout(request)
    messages.info(request, 'Sesión cerrada correctamente')
    return redirect('operaciones:login')


# ==================== VISTAS PRINCIPALES ====================

@login_required
def dashboard(request):
    """Dashboard principal del usuario"""
    user_gestures = Gesture.objects.filter(user=request.user)
    
    # Estadísticas del usuario
    stats = {
        'total_gestures': user_gestures.count(),
        'active_gestures': user_gestures.filter(status='active').count(),
        'training_gestures': user_gestures.filter(status='training').count(),
        'avg_accuracy': user_gestures.aggregate(avg_acc=Avg('accuracy'))['avg_acc'] or 0,
    }
    
    # Gestos recientes
    recent_gestures = user_gestures.order_by('-created_at')[:5]
    
    # Logs de reconocimiento recientes
    recent_logs = RecognitionLog.objects.filter(user=request.user).order_by('-timestamp')[:10]
    
    context = {
        'stats': stats,
        'recent_gestures': recent_gestures,
        'recent_logs': recent_logs,
    }
    
    return render(request, 'operaciones/dashboard.html', context)


# ==================== GESTIÓN DE FUNCIONES ====================

@login_required
def gesture_functions_list(request):
    """Lista de funciones disponibles"""
    functions = GestureFunction.objects.filter(is_active=True).order_by('name')
    
    # Filtros
    function_type = request.GET.get('type')
    search = request.GET.get('search')
    
    if function_type:
        functions = functions.filter(function_type=function_type)
    
    if search:
        functions = functions.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    
    paginator = Paginator(functions, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'function_types': GestureFunction.FUNCTION_TYPES,
        'current_type': function_type,
        'search_query': search,
    }
    
    return render(request, 'operaciones/functions/list.html', context)


@login_required
def create_gesture_function(request):
    """Crear nueva función de gesto"""
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            function_type = request.POST.get('function_type')
            description = request.POST.get('description', '')
            code = request.POST.get('code')
            
            # Validar que el nombre no exista
            if GestureFunction.objects.filter(name=name).exists():
                messages.error(request, f'Ya existe una función con el nombre "{name}"')
                return render(request, 'operaciones/functions/create.html', {
                    'function_types': GestureFunction.FUNCTION_TYPES
                })
            
            # Crear la función
            gesture_function = GestureFunction.objects.create(
                name=name,
                function_type=function_type,
                description=description,
                code=code,
                parameters={}
            )
            
            messages.success(request, f'Función "{name}" creada exitosamente')
            return redirect('operaciones:gesture_functions_list')
            
        except Exception as e:
            logger.error(f"Error creando función: {e}")
            messages.error(request, 'Error al crear la función')
    
    context = {
        'function_types': GestureFunction.FUNCTION_TYPES
    }
    
    return render(request, 'operaciones/functions/create.html', context)


# ==================== GESTIÓN DE GESTOS ====================

@login_required
def gestures_list(request):
    """Lista de gestos del usuario"""
    gestures = Gesture.objects.filter(user=request.user).select_related('gesture_function')
    
    # Filtros
    status = request.GET.get('status')
    gesture_type = request.GET.get('type')
    search = request.GET.get('search')
    
    if status:
        gestures = gestures.filter(status=status)
    
    if gesture_type:
        gestures = gestures.filter(gesture_type=gesture_type)
    
    if search:
        gestures = gestures.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    
    gestures = gestures.order_by('-created_at')
    
    paginator = Paginator(gestures, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'status_choices': Gesture.STATUS_CHOICES,
        'gesture_types': Gesture.GESTURE_TYPES,
        'current_status': status,
        'current_type': gesture_type,
        'search_query': search,
    }
    
    return render(request, 'operaciones/gestures/list.html', context)


@login_required
def create_gesture(request):
    """Crear nuevo gesto"""
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            gesture_type = request.POST.get('gesture_type')
            description = request.POST.get('description', '')
            function_id = request.POST.get('gesture_function')
            
            # Validar que el nombre no exista para este usuario
            if Gesture.objects.filter(user=request.user, name=name).exists():
                messages.error(request, f'Ya tienes un gesto con el nombre "{name}"')
                return render(request, 'operaciones/gestures/create.html', {
                    'gesture_types': Gesture.GESTURE_TYPES,
                    'functions': GestureFunction.objects.filter(is_active=True)
                })
            
            # Obtener la función
            gesture_function = get_object_or_404(GestureFunction, id=function_id, is_active=True)
            
            # Crear el gesto
            gesture = Gesture.objects.create(
                user=request.user,
                name=name,
                gesture_type=gesture_type,
                description=description,
                gesture_function=gesture_function,
                status='draft'
            )
            
            messages.success(request, f'Gesto "{name}" creado exitosamente')
            return redirect('operaciones:gesture_detail', gesture_id=gesture.id)
            
        except Exception as e:
            logger.error(f"Error creando gesto: {e}")
            messages.error(request, 'Error al crear el gesto')
    
    context = {
        'gesture_types': Gesture.GESTURE_TYPES,
        'functions': GestureFunction.objects.filter(is_active=True)
    }
    
    return render(request, 'operaciones/gestures/create.html', context)


@login_required
def gesture_detail(request, gesture_id):
    """Detalle de un gesto específico"""
    gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
    
    # Sesiones de entrenamiento
    training_sessions = gesture.training_sessions.order_by('-created_at')[:5]
    
    # Logs de reconocimiento
    recognition_logs = gesture.recognition_logs.order_by('-timestamp')[:10]
    
    context = {
        'gesture': gesture,
        'training_sessions': training_sessions,
        'recognition_logs': recognition_logs,
    }
    
    return render(request, 'operaciones/gestures/detail.html', context)


@login_required
def delete_gesture(request, gesture_id):
    """Eliminar un gesto"""
    gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
    
    if request.method == 'POST':
        gesture_name = gesture.name
        gesture.delete()
        messages.success(request, f'Gesto "{gesture_name}" eliminado exitosamente')
        return redirect('operaciones:gestures_list')
    
    return render(request, 'operaciones/gestures/delete.html', {'gesture': gesture})


# ==================== ENTRENAMIENTO DE MODELOS ====================

@login_required
def training_view(request):
    """Vista principal de entrenamiento"""
    user_gestures = Gesture.objects.filter(user=request.user).exclude(status='active')
    
    context = {
        'gestures': user_gestures,
    }
    
    return render(request, 'operaciones/training/index.html', context)


@login_required
def start_training_session(request, gesture_id):
    """Iniciar sesión de entrenamiento para un gesto"""
    gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
    
    if request.method == 'POST':
        session_name = request.POST.get('session_name', f'Sesión {timezone.now().strftime("%Y%m%d_%H%M%S")}')
        
        # Crear nueva sesión de entrenamiento
        training_session = TrainingSession.objects.create(
            gesture=gesture,
            session_name=session_name,
            status='pending'
        )
        
        # Actualizar estado del gesto
        gesture.status = 'training'
        gesture.save()
        
        messages.success(request, f'Sesión de entrenamiento "{session_name}" iniciada')
        return redirect('operaciones:training_capture', session_id=training_session.id)
    
    context = {
        'gesture': gesture,
    }
    
    return render(request, 'operaciones/training/start_session.html', context)


@login_required
def training_capture(request, session_id):
    """Vista de captura de muestras para entrenamiento"""
    training_session = get_object_or_404(
        TrainingSession, 
        id=session_id, 
        gesture__user=request.user
    )
    
    context = {
        'training_session': training_session,
        'gesture': training_session.gesture,
    }
    
    return render(request, 'operaciones/training/capture.html', context)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def save_training_sample(request, session_id):
    """Guardar muestra de entrenamiento (API endpoint)"""
    try:
        training_session = get_object_or_404(
            TrainingSession, 
            id=session_id, 
            gesture__user=request.user
        )
        
        data = json.loads(request.body)
        landmark_data = data.get('landmarks')
        
        if not landmark_data:
            return JsonResponse({'error': 'No se proporcionaron datos de landmarks'}, status=400)
        
        # Procesar los landmarks y extraer características
        processor = GestureProcessor()
        features = processor.extract_features(landmark_data)
        quality_score = processor.calculate_quality_score(landmark_data)
        
        # Guardar la muestra
        sample = GestureSample.objects.create(
            training_session=training_session,
            landmark_data=landmark_data,
            features=features,
            quality_score=quality_score,
            is_valid=quality_score > 0.5  # Umbral de calidad
        )
        
        # Actualizar contador de muestras
        training_session.samples_count = training_session.samples.filter(is_valid=True).count()
        training_session.save()
        
        return JsonResponse({
            'success': True,
            'sample_id': sample.id,
            'quality_score': quality_score,
            'total_samples': training_session.samples_count
        })
        
    except Exception as e:
        logger.error(f"Error guardando muestra: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def train_model(request, session_id):
    """Entrenar el modelo con las muestras capturadas"""
    try:
        training_session = get_object_or_404(
            TrainingSession, 
            id=session_id, 
            gesture__user=request.user
        )
        
        # Verificar que hay suficientes muestras
        valid_samples = training_session.samples.filter(is_valid=True)
        if valid_samples.count() < 10:
            return JsonResponse({
                'error': 'Se necesitan al menos 10 muestras válidas para entrenar'
            }, status=400)
        
        # Actualizar estado
        training_session.status = 'in_progress'
        training_session.started_at = timezone.now()
        training_session.save()
        
        # Entrenar el modelo
        trainer = ModelTrainer()
        result = trainer.train_gesture_model(training_session)
        
        if result['success']:
            # Actualizar sesión de entrenamiento
            training_session.status = 'completed'
            training_session.completed_at = timezone.now()
            training_session.accuracy_achieved = result['accuracy']
            training_session.loss_value = result.get('loss', 0)
            training_session.save()
            
            # Actualizar gesto
            gesture = training_session.gesture
            gesture.accuracy = result['accuracy']
            gesture.training_samples_count = valid_samples.count()
            gesture.last_trained_at = timezone.now()
            gesture.status = 'trained' if result['accuracy'] > 0.8 else 'training'
            gesture.feature_data = result.get('model_data', {})
            gesture.save()
            
            return JsonResponse({
                'success': True,
                'accuracy': result['accuracy'],
                'message': 'Modelo entrenado exitosamente'
            })
        else:
            training_session.status = 'failed'
            training_session.error_message = result.get('error', 'Error desconocido')
            training_session.save()
            
            return JsonResponse({
                'error': result.get('error', 'Error entrenando el modelo')
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error entrenando modelo: {e}")
        return JsonResponse({'error': str(e)}, status=500)


# ==================== RECONOCIMIENTO EN TIEMPO REAL ====================

@login_required
def interaction_view(request):
    """Vista principal de interacción/reconocimiento"""
    active_gestures = Gesture.objects.filter(
        user=request.user, 
        status__in=['trained', 'active']
    ).select_related('gesture_function')
    
    context = {
        'active_gestures': active_gestures,
    }
    
    return render(request, 'operaciones/interaction/index.html', context)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def recognize_gesture(request):
    """Reconocer gesto en tiempo real (API endpoint)"""
    start_time = time.time()
    
    try:
        data = json.loads(request.body)
        landmark_data = data.get('landmarks')
        
        if not landmark_data:
            return JsonResponse({'error': 'No se proporcionaron datos de landmarks'}, status=400)
        
        # Obtener gestos activos del usuario
        user_gestures = Gesture.objects.filter(
            user=request.user,
            status__in=['trained', 'active']
        ).select_related('gesture_function')
        
        if not user_gestures.exists():
            return JsonResponse({
                'error': 'No tienes gestos entrenados disponibles'
            }, status=400)
        
        # Reconocer el gesto
        recognizer = GestureRecognizer()
        result = recognizer.recognize(landmark_data, user_gestures)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        if result['recognized']:
            gesture = result['gesture']
            confidence = result['confidence']
            
            # Ejecutar la función asociada
            execution_result = None
            execution_successful = False
            error_message = ""
            
            try:
                # Aquí se ejecutaría la función asociada al gesto
                # Por ahora, simulamos la ejecución
                execution_result = f"Ejecutando: {gesture.gesture_function.name}"
                execution_successful = True
            except Exception as e:
                error_message = str(e)
                execution_successful = False
            
            # Registrar el reconocimiento
            RecognitionLog.objects.create(
                user=request.user,
                gesture=gesture,
                recognized_gesture_name=gesture.name,
                confidence_score=confidence,
                execution_successful=execution_successful,
                execution_result=execution_result,
                error_message=error_message,
                processing_time_ms=processing_time
            )
            
            return JsonResponse({
                'recognized': True,
                'gesture_name': gesture.name,
                'confidence': confidence,
                'function_name': gesture.gesture_function.name,
                'execution_result': execution_result,
                'execution_successful': execution_successful,
                'processing_time_ms': processing_time
            })
        else:
            return JsonResponse({
                'recognized': False,
                'message': 'No se reconoció ningún gesto',
                'processing_time_ms': processing_time
            })
            
    except Exception as e:
        logger.error(f"Error en reconocimiento: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def gesture_guide(request, gesture_id):
    """Vista de guía para realizar un gesto específico"""
    gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
    
    context = {
        'gesture': gesture,
    }
    
    return render(request, 'operaciones/interaction/guide.html', context)


# ==================== VISTAS DE ESTADÍSTICAS ====================

@login_required
def statistics_view(request):
    """Vista de estadísticas del usuario"""
    user_gestures = Gesture.objects.filter(user=request.user)
    user_logs = RecognitionLog.objects.filter(user=request.user)
    
    # Estadísticas generales
    stats = {
        'total_gestures': user_gestures.count(),
        'active_gestures': user_gestures.filter(status='active').count(),
        'total_recognitions': user_logs.count(),
        'successful_recognitions': user_logs.filter(execution_successful=True).count(),
        'avg_accuracy': user_gestures.aggregate(avg_acc=Avg('accuracy'))['avg_acc'] or 0,
        'avg_processing_time': user_logs.aggregate(avg_time=Avg('processing_time_ms'))['avg_time'] or 0,
    }
    
    # Estadísticas por gesto
    gesture_stats = user_gestures.annotate(
        recognition_count=Count('recognition_logs'),
        success_rate=Avg('recognition_logs__execution_successful')
    ).order_by('-recognition_count')[:10]
    
    # Actividad reciente (últimos 30 días)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_activity = user_logs.filter(timestamp__gte=thirty_days_ago)
    
    context = {
        'stats': stats,
        'gesture_stats': gesture_stats,
        'recent_activity': recent_activity,
    }
    
    return render(request, 'operaciones/statistics.html', context)
