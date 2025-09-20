"""
Serializers para la API REST del sistema de reconocimiento de gestos
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Gesture, GestureFunction, TrainingSession, GestureSample, RecognitionLog


class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo User"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class GestureFunctionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo GestureFunction"""
    
    class Meta:
        model = GestureFunction
        fields = [
            'id', 'name', 'function_type', 'description', 'code', 
            'parameters', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validar que el nombre de la función sea único"""
        if GestureFunction.objects.filter(name=value).exists():
            if self.instance and self.instance.name != value:
                raise serializers.ValidationError("Ya existe una función con este nombre")
            elif not self.instance:
                raise serializers.ValidationError("Ya existe una función con este nombre")
        return value


class GestureListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar gestos"""
    user = UserSerializer(read_only=True)
    gesture_function = GestureFunctionSerializer(read_only=True)
    
    class Meta:
        model = Gesture
        fields = [
            'id', 'name', 'gesture_type', 'status', 'accuracy', 
            'user', 'gesture_function', 'created_at', 'last_trained_at'
        ]


class GestureDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para gestos"""
    user = UserSerializer(read_only=True)
    gesture_function = GestureFunctionSerializer(read_only=True)
    training_sessions_count = serializers.SerializerMethodField()
    recognition_logs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Gesture
        fields = [
            'id', 'name', 'gesture_type', 'description', 'status', 
            'accuracy', 'training_samples_count', 'feature_data',
            'user', 'gesture_function', 'created_at', 'updated_at', 
            'last_trained_at', 'training_sessions_count', 'recognition_logs_count'
        ]
        read_only_fields = [
            'id', 'user', 'accuracy', 'training_samples_count', 
            'feature_data', 'created_at', 'updated_at', 'last_trained_at'
        ]
    
    def get_training_sessions_count(self, obj):
        """Obtener el número de sesiones de entrenamiento"""
        return obj.training_sessions.count()
    
    def get_recognition_logs_count(self, obj):
        """Obtener el número de logs de reconocimiento"""
        return obj.recognition_logs.count()


class GestureCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear gestos"""
    gesture_function_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Gesture
        fields = [
            'name', 'gesture_type', 'description', 'gesture_function_id'
        ]
    
    def validate_gesture_function_id(self, value):
        """Validar que la función existe y está activa"""
        try:
            function = GestureFunction.objects.get(id=value, is_active=True)
            return value
        except GestureFunction.DoesNotExist:
            raise serializers.ValidationError("La función especificada no existe o no está activa")
    
    def validate(self, attrs):
        """Validaciones adicionales"""
        user = self.context['request'].user
        name = attrs.get('name')
        
        # Verificar que el usuario no tenga otro gesto con el mismo nombre
        if Gesture.objects.filter(user=user, name=name).exists():
            raise serializers.ValidationError({
                'name': 'Ya tienes un gesto con este nombre'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear el gesto"""
        function_id = validated_data.pop('gesture_function_id')
        gesture_function = GestureFunction.objects.get(id=function_id)
        
        gesture = Gesture.objects.create(
            user=self.context['request'].user,
            gesture_function=gesture_function,
            status='draft',
            **validated_data
        )
        
        return gesture


class GestureSampleSerializer(serializers.ModelSerializer):
    """Serializer para muestras de gestos"""
    
    class Meta:
        model = GestureSample
        fields = [
            'id', 'training_session', 'landmark_data', 'features',
            'quality_score', 'is_valid', 'created_at'
        ]
        read_only_fields = ['id', 'features', 'quality_score', 'is_valid', 'created_at']


class TrainingSessionListSerializer(serializers.ModelSerializer):
    """Serializer para listar sesiones de entrenamiento"""
    gesture = GestureListSerializer(read_only=True)
    samples_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = [
            'id', 'gesture', 'session_name', 'status', 'samples_count',
            'accuracy_achieved', 'created_at', 'started_at', 'completed_at'
        ]
    
    def get_samples_count(self, obj):
        """Obtener el número de muestras válidas"""
        return obj.samples.filter(is_valid=True).count()


class TrainingSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado para sesiones de entrenamiento"""
    gesture = GestureDetailSerializer(read_only=True)
    samples = GestureSampleSerializer(many=True, read_only=True)
    valid_samples_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = [
            'id', 'gesture', 'session_name', 'status', 'samples_count',
            'accuracy_achieved', 'loss_value', 'error_message',
            'created_at', 'started_at', 'completed_at', 'samples',
            'valid_samples_count'
        ]
        read_only_fields = [
            'id', 'samples_count', 'accuracy_achieved', 'loss_value',
            'error_message', 'created_at', 'started_at', 'completed_at'
        ]
    
    def get_valid_samples_count(self, obj):
        """Obtener el número de muestras válidas"""
        return obj.samples.filter(is_valid=True).count()


class TrainingSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear sesiones de entrenamiento"""
    gesture_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TrainingSession
        fields = ['gesture_id', 'session_name']
    
    def validate_gesture_id(self, value):
        """Validar que el gesto existe y pertenece al usuario"""
        user = self.context['request'].user
        try:
            gesture = Gesture.objects.get(id=value, user=user)
            return value
        except Gesture.DoesNotExist:
            raise serializers.ValidationError("El gesto especificado no existe o no te pertenece")
    
    def create(self, validated_data):
        """Crear la sesión de entrenamiento"""
        gesture_id = validated_data.pop('gesture_id')
        gesture = Gesture.objects.get(id=gesture_id)
        
        # Actualizar estado del gesto
        gesture.status = 'training'
        gesture.save()
        
        session = TrainingSession.objects.create(
            gesture=gesture,
            status='pending',
            **validated_data
        )
        
        return session


class RecognitionLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de reconocimiento"""
    user = UserSerializer(read_only=True)
    gesture = GestureListSerializer(read_only=True)
    
    class Meta:
        model = RecognitionLog
        fields = [
            'id', 'user', 'gesture', 'recognized_gesture_name',
            'confidence_score', 'execution_successful', 'execution_result',
            'error_message', 'processing_time_ms', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class GestureRecognitionRequestSerializer(serializers.Serializer):
    """Serializer para solicitudes de reconocimiento de gestos"""
    landmarks = serializers.ListField(
        child=serializers.DictField(),
        min_length=21,
        max_length=21,
        help_text="Lista de 21 landmarks de la mano con coordenadas x, y, z"
    )
    
    def validate_landmarks(self, value):
        """Validar la estructura de los landmarks"""
        if len(value) != 21:
            raise serializers.ValidationError("Se requieren exactamente 21 landmarks")
        
        for i, landmark in enumerate(value):
            if not isinstance(landmark, dict):
                raise serializers.ValidationError(f"Landmark {i} debe ser un diccionario")
            
            required_keys = ['x', 'y', 'z']
            for key in required_keys:
                if key not in landmark:
                    raise serializers.ValidationError(f"Landmark {i} debe contener la clave '{key}'")
                
                if not isinstance(landmark[key], (int, float)):
                    raise serializers.ValidationError(f"Landmark {i}.{key} debe ser un número")
        
        return value


class GestureRecognitionResponseSerializer(serializers.Serializer):
    """Serializer para respuestas de reconocimiento de gestos"""
    recognized = serializers.BooleanField()
    gesture_name = serializers.CharField(required=False)
    confidence = serializers.FloatField(required=False)
    function_name = serializers.CharField(required=False)
    execution_result = serializers.CharField(required=False)
    execution_successful = serializers.BooleanField(required=False)
    processing_time_ms = serializers.IntegerField(required=False)
    message = serializers.CharField(required=False)
    error = serializers.CharField(required=False)


class TrainingSampleRequestSerializer(serializers.Serializer):
    """Serializer para solicitudes de guardado de muestras de entrenamiento"""
    landmarks = serializers.ListField(
        child=serializers.DictField(),
        min_length=21,
        max_length=21,
        help_text="Lista de 21 landmarks de la mano con coordenadas x, y, z"
    )
    
    def validate_landmarks(self, value):
        """Validar la estructura de los landmarks"""
        if len(value) != 21:
            raise serializers.ValidationError("Se requieren exactamente 21 landmarks")
        
        for i, landmark in enumerate(value):
            if not isinstance(landmark, dict):
                raise serializers.ValidationError(f"Landmark {i} debe ser un diccionario")
            
            required_keys = ['x', 'y', 'z']
            for key in required_keys:
                if key not in landmark:
                    raise serializers.ValidationError(f"Landmark {i} debe contener la clave '{key}'")
                
                if not isinstance(landmark[key], (int, float)):
                    raise serializers.ValidationError(f"Landmark {i}.{key} debe ser un número")
        
        return value


class TrainingSampleResponseSerializer(serializers.Serializer):
    """Serializer para respuestas de guardado de muestras"""
    success = serializers.BooleanField()
    sample_id = serializers.IntegerField(required=False)
    quality_score = serializers.FloatField(required=False)
    total_samples = serializers.IntegerField(required=False)
    error = serializers.CharField(required=False)


class ModelTrainingResponseSerializer(serializers.Serializer):
    """Serializer para respuestas de entrenamiento de modelos"""
    success = serializers.BooleanField()
    accuracy = serializers.FloatField(required=False)
    message = serializers.CharField(required=False)
    error = serializers.CharField(required=False)


class StatisticsSerializer(serializers.Serializer):
    """Serializer para estadísticas del usuario"""
    total_gestures = serializers.IntegerField()
    active_gestures = serializers.IntegerField()
    training_gestures = serializers.IntegerField()
    total_recognitions = serializers.IntegerField()
    successful_recognitions = serializers.IntegerField()
    avg_accuracy = serializers.FloatField()
    avg_processing_time = serializers.FloatField()
    success_rate = serializers.SerializerMethodField()
    
    def get_success_rate(self, obj):
        """Calcular tasa de éxito"""
        total = obj.get('total_recognitions', 0)
        successful = obj.get('successful_recognitions', 0)
        
        if total > 0:
            return round((successful / total) * 100, 2)
        return 0.0