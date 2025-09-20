from django.contrib import admin
from .models import GestureFunction, Gesture, TrainingSession, GestureSample, RecognitionLog


@admin.register(GestureFunction)
class GestureFunctionAdmin(admin.ModelAdmin):
    list_display = ['name', 'function_type', 'is_active', 'created_at']
    list_filter = ['function_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'function_type', 'description', 'is_active')
        }),
        ('Configuración', {
            'fields': ('code', 'parameters')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Gesture)
class GestureAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'gesture_type', 'status', 'accuracy', 'training_samples_count', 'created_at']
    list_filter = ['gesture_type', 'status', 'user', 'created_at']
    search_fields = ['name', 'description', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'last_trained_at']
    raw_id_fields = ['user', 'gesture_function']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('user', 'name', 'gesture_type', 'description', 'status')
        }),
        ('Función Asociada', {
            'fields': ('gesture_function',)
        }),
        ('Datos del Modelo', {
            'fields': ('feature_data', 'accuracy', 'confidence_threshold', 'training_samples_count'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at', 'last_trained_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'gesture_function')


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ['session_name', 'gesture', 'status', 'samples_count', 'accuracy_achieved', 'created_at']
    list_filter = ['status', 'created_at', 'gesture__gesture_type']
    search_fields = ['session_name', 'gesture__name', 'gesture__user__username']
    readonly_fields = ['created_at', 'started_at', 'completed_at', 'duration_display']
    raw_id_fields = ['gesture']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('gesture', 'session_name', 'status')
        }),
        ('Configuración de Entrenamiento', {
            'fields': ('epochs', 'learning_rate', 'batch_size')
        }),
        ('Resultados', {
            'fields': ('samples_count', 'accuracy_achieved', 'loss_value', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Datos de Entrenamiento', {
            'fields': ('training_data',),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'started_at', 'completed_at', 'duration_display'),
            'classes': ('collapse',)
        })
    )
    
    def duration_display(self, obj):
        duration = obj.duration
        if duration:
            return str(duration)
        return "No completado"
    duration_display.short_description = "Duración"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('gesture', 'gesture__user')


@admin.register(GestureSample)
class GestureSampleAdmin(admin.ModelAdmin):
    list_display = ['id', 'training_session', 'quality_score', 'is_valid', 'capture_timestamp']
    list_filter = ['is_valid', 'capture_timestamp', 'training_session__status']
    search_fields = ['training_session__session_name', 'training_session__gesture__name']
    readonly_fields = ['capture_timestamp']
    raw_id_fields = ['training_session']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('training_session', 'quality_score', 'is_valid')
        }),
        ('Datos de la Muestra', {
            'fields': ('landmark_data', 'features'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('capture_timestamp',),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('training_session', 'training_session__gesture')


@admin.register(RecognitionLog)
class RecognitionLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'recognized_gesture_name', 'confidence_score', 'execution_successful', 'processing_time_ms', 'timestamp']
    list_filter = ['execution_successful', 'timestamp', 'user']
    search_fields = ['recognized_gesture_name', 'user__username', 'gesture__name']
    readonly_fields = ['timestamp']
    raw_id_fields = ['user', 'gesture']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Información del Reconocimiento', {
            'fields': ('user', 'gesture', 'recognized_gesture_name', 'confidence_score')
        }),
        ('Resultado de Ejecución', {
            'fields': ('execution_successful', 'execution_result', 'error_message')
        }),
        ('Metadatos', {
            'fields': ('timestamp', 'processing_time_ms'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'gesture')
