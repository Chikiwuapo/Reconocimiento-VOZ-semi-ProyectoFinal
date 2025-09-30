"""
Modelos de Django para el Chatbot Educativo
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ChatSession(models.Model):
    """Modelo para sesiones de chat"""
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Usuario asociado a la sesión (opcional para usuarios anónimos)"
    )
    session_id = models.CharField(
        max_length=100, 
        unique=True,
        help_text="Identificador único de la sesión"
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        help_text="Fecha y hora de creación de la sesión"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última actualización"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si la sesión está activa"
    )
    
    class Meta:
        verbose_name = "Sesión de Chat"
        verbose_name_plural = "Sesiones de Chat"
        ordering = ['-updated_at']
    
    def __str__(self):
        if self.user:
            return f"Sesión de {self.user.username} - {self.session_id[:8]}"
        return f"Sesión anónima - {self.session_id[:8]}"


class ChatMessage(models.Model):
    """Modelo para mensajes individuales del chat"""
    
    MESSAGE_TYPES = [
        ('user', 'Usuario'),
        ('bot', 'Bot'),
        ('system', 'Sistema'),
    ]
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="Sesión a la que pertenece el mensaje"
    )
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPES,
        default='user',
        help_text="Tipo de mensaje"
    )
    content = models.TextField(
        help_text="Contenido del mensaje"
    )
    timestamp = models.DateTimeField(
        default=timezone.now,
        help_text="Fecha y hora del mensaje"
    )
    
    # Campos específicos para respuestas del bot
    bot_confidence = models.FloatField(
        null=True,
        blank=True,
        help_text="Nivel de confianza de la respuesta del bot (0.0 - 1.0)"
    )
    bot_category = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Categoría identificada por el bot"
    )
    bot_redirect = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        help_text="URL de redirección sugerida por el bot"
    )
    
    # Metadatos adicionales
    user_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP del usuario"
    )
    user_agent = models.TextField(
        null=True,
        blank=True,
        help_text="User agent del navegador"
    )
    
    class Meta:
        verbose_name = "Mensaje de Chat"
        verbose_name_plural = "Mensajes de Chat"
        ordering = ['timestamp']
    
    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.get_message_type_display()}: {content_preview}"
    
    @property
    def is_user_message(self):
        """Verifica si el mensaje es del usuario"""
        return self.message_type == 'user'
    
    @property
    def is_bot_message(self):
        """Verifica si el mensaje es del bot"""
        return self.message_type == 'bot'
    
    def get_confidence_percentage(self):
        """Retorna la confianza como porcentaje"""
        if self.bot_confidence is not None:
            return round(self.bot_confidence * 100, 1)
        return None


class ChatAnalytics(models.Model):
    """Modelo para analíticas del chatbot"""
    
    session = models.OneToOneField(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='analytics',
        help_text="Sesión asociada a las analíticas"
    )
    total_messages = models.PositiveIntegerField(
        default=0,
        help_text="Total de mensajes en la sesión"
    )
    user_messages = models.PositiveIntegerField(
        default=0,
        help_text="Mensajes del usuario"
    )
    bot_messages = models.PositiveIntegerField(
        default=0,
        help_text="Mensajes del bot"
    )
    average_confidence = models.FloatField(
        null=True,
        blank=True,
        help_text="Confianza promedio de las respuestas del bot"
    )
    session_duration = models.DurationField(
        null=True,
        blank=True,
        help_text="Duración total de la sesión"
    )
    most_common_category = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Categoría más común en la sesión"
    )
    
    class Meta:
        verbose_name = "Analítica de Chat"
        verbose_name_plural = "Analíticas de Chat"
    
    def __str__(self):
        return f"Analíticas - {self.session}"
    
    def update_analytics(self):
        """Actualiza las analíticas basadas en los mensajes de la sesión"""
        messages = self.session.messages.all()
        
        self.total_messages = messages.count()
        self.user_messages = messages.filter(message_type='user').count()
        self.bot_messages = messages.filter(message_type='bot').count()
        
        # Calcular confianza promedio
        bot_messages_with_confidence = messages.filter(
            message_type='bot',
            bot_confidence__isnull=False
        )
        if bot_messages_with_confidence.exists():
            confidences = [msg.bot_confidence for msg in bot_messages_with_confidence]
            self.average_confidence = sum(confidences) / len(confidences)
        
        # Calcular duración de sesión
        if messages.exists():
            first_message = messages.first()
            last_message = messages.last()
            self.session_duration = last_message.timestamp - first_message.timestamp
        
        # Encontrar categoría más común
        categories = messages.filter(
            message_type='bot',
            bot_category__isnull=False
        ).values_list('bot_category', flat=True)
        
        if categories:
            from collections import Counter
            category_counts = Counter(categories)
            self.most_common_category = category_counts.most_common(1)[0][0]
        
        self.save()