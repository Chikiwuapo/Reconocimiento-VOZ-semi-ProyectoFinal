from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator
import json


class GestureFunction(models.Model):
    """
    Modelo para almacenar las funciones personalizadas que ejecutarán los gestos
    """
    FUNCTION_TYPES = [
        ('math', 'Operación Matemática'),
        ('command', 'Comando Personalizado'),
        ('action', 'Acción del Sistema'),
    ]
    
    name = models.CharField(
        max_length=100, 
        unique=True,
        validators=[MinLengthValidator(2)],
        help_text="Nombre único de la función"
    )
    function_type = models.CharField(
        max_length=20, 
        choices=FUNCTION_TYPES,
        default='command'
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción de lo que hace la función"
    )
    code = models.TextField(
        help_text="Código o comando que se ejecutará"
    )
    parameters = models.JSONField(
        default=dict,
        blank=True,
        help_text="Parámetros adicionales para la función"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gesture_functions'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['function_type']),
        ]
        
    def __str__(self):
        return f"{self.name} ({self.get_function_type_display()})"


class Gesture(models.Model):
    """
    Modelo principal para almacenar los gestos de la mano
    """
    GESTURE_TYPES = [
        ('static', 'Gesto Estático'),
        ('dynamic', 'Gesto Dinámico'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('training', 'En Entrenamiento'),
        ('trained', 'Entrenado'),
        ('active', 'Activo'),
        ('inactive', 'Inactivo'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='gestures'
    )
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(2)],
        help_text="Nombre único del gesto para el usuario"
    )
    gesture_type = models.CharField(
        max_length=20, 
        choices=GESTURE_TYPES,
        default='static'
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción del gesto"
    )
    
    # Datos de características del gesto (landmarks, distancias, etc.)
    feature_data = models.JSONField(
        default=dict,
        help_text="Datos de características extraídas del gesto"
    )
    
    # Función asociada al gesto
    gesture_function = models.ForeignKey(
        GestureFunction,
        on_delete=models.CASCADE,
        related_name='gestures'
    )
    
    # Estado del gesto
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    
    # Métricas del modelo
    accuracy = models.FloatField(
        default=0.0,
        help_text="Precisión del modelo entrenado (0-1)"
    )
    confidence_threshold = models.FloatField(
        default=0.7,
        help_text="Umbral de confianza para reconocimiento (0-1)"
    )
    
    # Metadatos
    training_samples_count = models.PositiveIntegerField(default=0)
    last_trained_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gestures'
        unique_together = ['user', 'name']  # Nombre único por usuario
        indexes = [
            models.Index(fields=['user', 'name']),
            models.Index(fields=['status']),
            models.Index(fields=['gesture_type']),
            models.Index(fields=['user', 'status']),
        ]
        
    def __str__(self):
        return f"{self.user.username} - {self.name}"
    
    def get_feature_summary(self):
        """Retorna un resumen de las características del gesto"""
        if not self.feature_data:
            return "Sin datos de características"
        
        landmarks_count = len(self.feature_data.get('landmarks', []))
        return f"Landmarks: {landmarks_count}, Tipo: {self.get_gesture_type_display()}"


class TrainingSession(models.Model):
    """
    Modelo para almacenar información sobre las sesiones de entrenamiento
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]
    
    gesture = models.ForeignKey(
        Gesture,
        on_delete=models.CASCADE,
        related_name='training_sessions'
    )
    session_name = models.CharField(
        max_length=100,
        help_text="Nombre de la sesión de entrenamiento"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Datos de entrenamiento
    training_data = models.JSONField(
        default=list,
        help_text="Muestras de entrenamiento capturadas"
    )
    
    # Métricas de entrenamiento
    samples_count = models.PositiveIntegerField(default=0)
    accuracy_achieved = models.FloatField(
        null=True, 
        blank=True,
        help_text="Precisión alcanzada en esta sesión"
    )
    loss_value = models.FloatField(
        null=True, 
        blank=True,
        help_text="Valor de pérdida del entrenamiento"
    )
    
    # Configuración de entrenamiento
    epochs = models.PositiveIntegerField(default=100)
    learning_rate = models.FloatField(default=0.001)
    batch_size = models.PositiveIntegerField(default=32)
    
    # Metadatos
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'training_sessions'
        indexes = [
            models.Index(fields=['gesture', 'status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.gesture.name} - {self.session_name} ({self.get_status_display()})"
    
    @property
    def duration(self):
        """Calcula la duración de la sesión de entrenamiento"""
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None


class GestureSample(models.Model):
    """
    Modelo para almacenar muestras individuales de gestos durante el entrenamiento
    """
    training_session = models.ForeignKey(
        TrainingSession,
        on_delete=models.CASCADE,
        related_name='samples'
    )
    
    # Datos de la muestra
    landmark_data = models.JSONField(
        help_text="Datos de landmarks de MediaPipe para esta muestra"
    )
    features = models.JSONField(
        default=dict,
        help_text="Características extraídas de la muestra"
    )
    
    # Metadatos de captura
    capture_timestamp = models.DateTimeField(auto_now_add=True)
    quality_score = models.FloatField(
        default=1.0,
        help_text="Puntuación de calidad de la muestra (0-1)"
    )
    is_valid = models.BooleanField(
        default=True,
        help_text="Indica si la muestra es válida para entrenamiento"
    )
    
    class Meta:
        db_table = 'gesture_samples'
        indexes = [
            models.Index(fields=['training_session', 'is_valid']),
            models.Index(fields=['capture_timestamp']),
        ]
        ordering = ['capture_timestamp']
        
    def __str__(self):
        return f"Muestra {self.id} - {self.training_session.gesture.name}"


class RecognitionLog(models.Model):
    """
    Modelo para registrar el historial de reconocimientos de gestos
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='recognition_logs'
    )
    gesture = models.ForeignKey(
        Gesture,
        on_delete=models.CASCADE,
        related_name='recognition_logs',
        null=True,
        blank=True
    )
    
    # Datos del reconocimiento
    recognized_gesture_name = models.CharField(
        max_length=100,
        help_text="Nombre del gesto reconocido"
    )
    confidence_score = models.FloatField(
        help_text="Puntuación de confianza del reconocimiento (0-1)"
    )
    execution_successful = models.BooleanField(
        default=False,
        help_text="Indica si la función asociada se ejecutó correctamente"
    )
    execution_result = models.TextField(
        blank=True,
        help_text="Resultado de la ejecución de la función"
    )
    error_message = models.TextField(blank=True)
    
    # Metadatos
    timestamp = models.DateTimeField(auto_now_add=True)
    processing_time_ms = models.PositiveIntegerField(
        default=0,
        help_text="Tiempo de procesamiento en milisegundos"
    )
    
    class Meta:
        db_table = 'recognition_logs'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['gesture', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.username} - {self.recognized_gesture_name} ({self.confidence_score:.2f})"
