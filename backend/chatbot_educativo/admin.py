from django.contrib import admin
from .models import ChatSession, ChatMessage, ChatAnalytics

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_id', 'created_at', 'updated_at', 'is_active')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('session_id', 'user__username', 'user__email')
    readonly_fields = ('session_id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Información de Sesión', {
            'fields': ('user', 'session_id', 'is_active')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'message_type', 'content_preview', 'bot_confidence', 'timestamp')
    list_filter = ('message_type', 'timestamp', 'bot_confidence')
    search_fields = ('content', 'session__session_id', 'session__user__username')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Información del Mensaje', {
            'fields': ('session', 'message_type', 'content')
        }),
        ('Datos del Bot', {
            'fields': ('bot_confidence', 'intent_detected', 'entities_extracted'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        """Muestra una vista previa del contenido del mensaje"""
        if len(obj.content) > 50:
            return obj.content[:50] + "..."
        return obj.content
    content_preview.short_description = 'Vista Previa'
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo las relaciones"""
        return super().get_queryset(request).select_related('session', 'session__user')

@admin.register(ChatAnalytics)
class ChatAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'total_messages', 'user_messages', 'bot_messages', 
                   'average_confidence', 'session_duration_minutes')
    list_filter = ('average_confidence', 'most_common_category')
    search_fields = ('session__session_id', 'session__user__username')
    readonly_fields = ('session_duration_minutes',)
    ordering = ('-session__updated_at',)
    
    fieldsets = (
        ('Información de Sesión', {
            'fields': ('session',)
        }),
        ('Estadísticas de Mensajes', {
            'fields': ('total_messages', 'user_messages', 'bot_messages')
        }),
        ('Métricas de Rendimiento', {
            'fields': ('average_confidence', 'session_duration', 'session_duration_minutes')
        }),
        ('Categorías', {
            'fields': ('most_common_category',),
            'classes': ('collapse',)
        }),
    )
    
    def session_duration_minutes(self, obj):
        """Convierte la duración de la sesión a minutos"""
        if obj.session_duration:
            return f"{obj.session_duration.total_seconds() / 60:.1f} min"
        return "N/A"
    session_duration_minutes.short_description = 'Duración (min)'
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo las relaciones"""
        return super().get_queryset(request).select_related('session', 'session__user')

# Configuración adicional del admin
admin.site.site_header = "Chatbot Educativo - Administración"
admin.site.site_title = "Chatbot Admin"
admin.site.index_title = "Panel de Administración del Chatbot"