"""
Vistas de la API REST para el sistema de reconocimiento de gestos
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.db import models
from django.utils import timezone
from datetime import timedelta
import logging
from .gesture_recognition import gesture_service
import json
import base64

from .models import Gesture, GestureFunction, TrainingSession, GestureSample, RecognitionLog
from .serializers import (
    GestureListSerializer, GestureDetailSerializer, GestureCreateSerializer,
    GestureFunctionSerializer, TrainingSessionListSerializer, 
    TrainingSessionDetailSerializer, TrainingSessionCreateSerializer,
    GestureSampleSerializer, RecognitionLogSerializer,
    GestureRecognitionRequestSerializer, GestureRecognitionResponseSerializer,
    TrainingSampleRequestSerializer, TrainingSampleResponseSerializer,
    ModelTrainingResponseSerializer, StatisticsSerializer
)
from .utils import GestureProcessor, ModelTrainer, GestureRecognizer

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Paginación estándar para la API"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==================== GESTURE FUNCTIONS API ====================

class GestureFunctionListCreateAPIView(generics.ListCreateAPIView):
    """API para listar y crear funciones de gestos"""
    serializer_class = GestureFunctionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = GestureFunction.objects.filter(is_active=True)
        
        # Filtros
        function_type = self.request.query_params.get('type')
        search = self.request.query_params.get('search')
        
        if function_type:
            queryset = queryset.filter(function_type=function_type)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('name')


class GestureFunctionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API para obtener, actualizar y eliminar funciones de gestos"""
    serializer_class = GestureFunctionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GestureFunction.objects.filter(is_active=True)


# ==================== GESTURES API ====================

class GestureListCreateAPIView(generics.ListCreateAPIView):
    """API para listar y crear gestos"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GestureCreateSerializer
        return GestureListSerializer
    
    def get_queryset(self):
        queryset = Gesture.objects.filter(user=self.request.user).select_related('gesture_function')
        
        # Filtros
        status_filter = self.request.query_params.get('status')
        gesture_type = self.request.query_params.get('type')
        search = self.request.query_params.get('search')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if gesture_type:
            queryset = queryset.filter(gesture_type=gesture_type)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class GestureDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API para obtener, actualizar y eliminar gestos"""
    serializer_class = GestureDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Gesture.objects.filter(user=self.request.user)


# ==================== TRAINING SESSIONS API ====================

class TrainingSessionListCreateAPIView(generics.ListCreateAPIView):
    """API para listar y crear sesiones de entrenamiento"""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TrainingSessionCreateSerializer
        return TrainingSessionListSerializer
    
    def get_queryset(self):
        queryset = TrainingSession.objects.filter(
            gesture__user=self.request.user
        ).select_related('gesture')
        
        # Filtros
        status_filter = self.request.query_params.get('status')
        gesture_id = self.request.query_params.get('gesture_id')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if gesture_id:
            queryset = queryset.filter(gesture_id=gesture_id)
        
        return queryset.order_by('-created_at')


class TrainingSessionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API para obtener, actualizar y eliminar sesiones de entrenamiento"""
    serializer_class = TrainingSessionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TrainingSession.objects.filter(gesture__user=self.request.user)


# ==================== TRAINING SAMPLES API ====================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_training_sample(request, session_id):
    """API para guardar muestras de entrenamiento"""
    try:
        # Verificar que la sesión pertenece al usuario
        training_session = get_object_or_404(
            TrainingSession,
            id=session_id,
            gesture__user=request.user
        )
        
        # Validar datos de entrada
        serializer = TrainingSampleRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Datos inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        landmark_data = serializer.validated_data['landmarks']
        
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
        
        response_data = {
            'success': True,
            'sample_id': sample.id,
            'quality_score': quality_score,
            'total_samples': training_session.samples_count
        }
        
        response_serializer = TrainingSampleResponseSerializer(data=response_data)
        response_serializer.is_valid()
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error guardando muestra: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def train_model(request, session_id):
    """API para entrenar el modelo con las muestras capturadas"""
    try:
        # Verificar que la sesión pertenece al usuario
        training_session = get_object_or_404(
            TrainingSession,
            id=session_id,
            gesture__user=request.user
        )
        
        # Verificar que hay suficientes muestras
        valid_samples = training_session.samples.filter(is_valid=True)
        if valid_samples.count() < 10:
            return Response(
                {'error': 'Se necesitan al menos 10 muestras válidas para entrenar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar estado
        training_session.status = 'in_progress'
        training_session.started_at = timezone.now()
        training_session.save()
        
        # Preparar datos de entrenamiento para el servicio
        training_data = []
        for sample in valid_samples:
            training_data.append({
                'landmarks': sample.landmark_data,
                'features': sample.features,
                'quality_score': sample.quality_score
            })
        
        # Entrenar usando el servicio de reconocimiento de gestos
        result = gesture_service.train_gesture(training_session.gesture.name, training_data)
        
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
            
            response_data = {
                'success': True,
                'accuracy': result['accuracy'],
                'message': 'Modelo entrenado exitosamente'
            }
        else:
            training_session.status = 'failed'
            training_session.error_message = result.get('error', 'Error desconocido')
            training_session.save()
            
            response_data = {
                'success': False,
                'error': result.get('error', 'Error entrenando el modelo')
            }
        
        response_serializer = ModelTrainingResponseSerializer(data=response_data)
        response_serializer.is_valid()
        
        return Response(response_serializer.data)
        
    except Exception as e:
        logger.error(f"Error entrenando modelo: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== GESTURE RECOGNITION API ====================

@api_view(['POST'])
def recognize_gesture(request):
    """Reconoce un gesto desde landmarks o imagen"""
    try:
        image_data = request.data.get('image_data')
        landmarks = request.data.get('landmarks', [])
        
        if not image_data and not landmarks:
            return Response({
                'success': False,
                'error': 'image_data o landmarks son requeridos'
            }, status=400)
        
        # Procesar landmarks o imagen
        if landmarks:
            # Usar landmarks de MediaPipe directamente
            landmarks_data = {
                'success': True,
                'landmarks': landmarks
            }
        else:
            # Procesar imagen para extraer características
            landmarks_data = gesture_service.process_image_for_landmarks(image_data)
        
        if not landmarks_data.get('success'):
            return Response({
                'success': False,
                'error': 'No se pudieron extraer características'
            }, status=400)
        
        # Obtener gestos entrenados del usuario
        user_gestures = Gesture.objects.filter(
            user=request.user,
            status='trained'
        )
        
        if not user_gestures.exists():
            return Response({
                'success': False,
                'error': 'No tienes gestos entrenados'
            }, status=400)
        
        # Reconocer gesto
        gesture_names = [g.name for g in user_gestures]
        result = gesture_service.recognize_gesture(landmarks_data['landmarks'], gesture_names)
        
        if result['recognized']:
            gesture = user_gestures.filter(name=result['gesture_name']).first()
            
            # Ejecutar función asociada si existe
            function_result = None
            if gesture.gesture_function:
                function_result = gesture_service.execute_gesture_function(
                    gesture.gesture_function.function_type,
                    gesture.gesture_function.parameters
                )
            
            # Registrar reconocimiento
            RecognitionLog.objects.create(
                user=request.user,
                gesture=gesture,
                recognized_gesture_name=gesture.name,
                confidence_score=result['confidence'],
                execution_successful=function_result.get('success', False) if function_result else False,
                execution_result=function_result.get('message', '') if function_result else '',
                processing_time_ms=50  # Placeholder
            )
            
            return Response({
                'success': True,
                'gesture': gesture.name,
                'confidence': result['confidence'],
                'function_executed': function_result is not None,
                'function_result': function_result.get('message', '') if function_result else ''
            })
        else:
            return Response({
                'success': True,
                'gesture': None,
                'confidence': 0
            })
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def capture_sample(request):
    """Captura una muestra para entrenamiento"""
    try:
        session_id = request.data.get('session_id')
        image_data = request.data.get('image_data')
        landmarks = request.data.get('landmarks', [])
        
        if not session_id:
            return Response({
                'success': False,
                'error': 'session_id es requerido'
            }, status=400)
        
        # Buscar sesión de entrenamiento
        try:
            session = TrainingSession.objects.get(id=session_id, gesture__user=request.user)
        except TrainingSession.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Sesión de entrenamiento no encontrada'
            }, status=404)
        
        # Procesar landmarks o imagen
        if landmarks:
            # Usar landmarks de MediaPipe directamente
            landmarks_data = {
                'success': True,
                'landmarks': landmarks
            }
        elif image_data:
            # Procesar imagen para extraer características
            landmarks_data = gesture_service.process_image_for_landmarks(image_data)
        else:
            return Response({
                'success': False,
                'error': 'Se requiere image_data o landmarks'
            }, status=400)
        
        if not landmarks_data.get('success'):
            return Response({
                'success': False,
                'error': 'No se pudieron extraer características'
            }, status=400)
        
        # Crear muestra de entrenamiento
        sample = GestureSample.objects.create(
            training_session=session,
            landmark_data=landmarks_data['landmarks'],
            features={},
            quality_score=0.8
        )
        
        return Response({
            'success': True,
            'sample_id': sample.id,
            'sample_count': session.samples.count()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


# ==================== RECOGNITION LOGS API ====================

class RecognitionLogListAPIView(generics.ListAPIView):
    """API para listar logs de reconocimiento"""
    serializer_class = RecognitionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = RecognitionLog.objects.filter(user=self.request.user).select_related('gesture')
        
        # Filtros
        gesture_id = self.request.query_params.get('gesture_id')
        successful = self.request.query_params.get('successful')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if gesture_id:
            queryset = queryset.filter(gesture_id=gesture_id)
        
        if successful is not None:
            queryset = queryset.filter(execution_successful=successful.lower() == 'true')
        
        if date_from:
            try:
                from datetime import datetime
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__gte=date_from)
            except ValueError:
                pass
        
        if date_to:
            try:
                from datetime import datetime
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(timestamp__date__lte=date_to)
            except ValueError:
                pass
        
        return queryset.order_by('-timestamp')


# ==================== STATISTICS API ====================

class UserStatisticsAPIView(APIView):
    """API para obtener estadísticas del usuario"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_gestures = Gesture.objects.filter(user=request.user)
        user_logs = RecognitionLog.objects.filter(user=request.user)
        
        # Estadísticas generales
        stats = {
            'total_gestures': user_gestures.count(),
            'active_gestures': user_gestures.filter(status='active').count(),
            'training_gestures': user_gestures.filter(status='training').count(),
            'total_recognitions': user_logs.count(),
            'successful_recognitions': user_logs.filter(execution_successful=True).count(),
            'avg_accuracy': user_gestures.aggregate(avg_acc=Avg('accuracy'))['avg_acc'] or 0,
            'avg_processing_time': user_logs.aggregate(avg_time=Avg('processing_time_ms'))['avg_time'] or 0,
        }
        
        serializer = StatisticsSerializer(data=stats)
        serializer.is_valid()
        
        return Response(serializer.data)


class GestureStatisticsAPIView(APIView):
    """API para obtener estadísticas por gesto"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Estadísticas por gesto
        gesture_stats = Gesture.objects.filter(user=request.user).annotate(
            recognition_count=Count('recognition_logs'),
            success_count=Count('recognition_logs', filter=Q(recognition_logs__execution_successful=True)),
            avg_confidence=Avg('recognition_logs__confidence_score'),
            avg_processing_time=Avg('recognition_logs__processing_time_ms')
        ).values(
            'id', 'name', 'status', 'accuracy', 'recognition_count',
            'success_count', 'avg_confidence', 'avg_processing_time'
        ).order_by('-recognition_count')
        
        # Calcular tasa de éxito para cada gesto
        for stat in gesture_stats:
            if stat['recognition_count'] > 0:
                stat['success_rate'] = round((stat['success_count'] / stat['recognition_count']) * 100, 2)
            else:
                stat['success_rate'] = 0.0
        
        return Response(list(gesture_stats))


# ==================== UTILITY ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def gesture_choices(request):
    """API para obtener las opciones disponibles para gestos"""
    return Response({
        'gesture_types': dict(Gesture.GESTURE_TYPES),
        'status_choices': dict(Gesture.STATUS_CHOICES),
        'function_types': dict(GestureFunction.FUNCTION_TYPES)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def active_gestures(request):
    """API para obtener gestos activos del usuario"""
    gestures = Gesture.objects.filter(
        user=request.user,
        status__in=['trained', 'active']
    ).select_related('gesture_function')
    
    serializer = GestureListSerializer(gestures, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def activate_gesture(request, gesture_id):
    """API para activar un gesto entrenado"""
    try:
        gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
        
        if gesture.status != 'trained':
            return Response(
                {'error': 'Solo se pueden activar gestos entrenados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gesture.status = 'active'
        gesture.save()
        
        serializer = GestureDetailSerializer(gesture)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error activando gesto: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def deactivate_gesture(request, gesture_id):
    """API para desactivar un gesto"""
    try:
        gesture = get_object_or_404(Gesture, id=gesture_id, user=request.user)
        
        if gesture.status != 'active':
            return Response(
                {'error': 'Solo se pueden desactivar gestos activos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        gesture.status = 'trained'
        gesture.save()
        
        serializer = GestureDetailSerializer(gesture)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error desactivando gesto: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )