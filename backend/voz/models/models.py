from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
import uuid


class Usuario(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    frase_voz = models.CharField(max_length=255)
    fecha_registro = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'usuarios'
        ordering = ['-fecha_registro']
    
    def set_password(self, raw_password):
        """Encripta y guarda la contraseña"""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Verifica si la contraseña es correcta"""
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return f"{self.username} - {self.fecha_registro}"


class Comando(models.Model):
    """
    Modelo para almacenar los comandos de voz detectados
    """
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    comando = models.CharField(max_length=255, verbose_name="Comando")
    fecha = models.DateTimeField(default=timezone.now, verbose_name="Fecha")
    
    class Meta:
        db_table = 'comandos'
        verbose_name = 'Comando'
        verbose_name_plural = 'Comandos'
        ordering = ['-fecha']
    
    def __str__(self):
        usuario_str = f" ({self.usuario.username})" if self.usuario else ""
        return f"{self.comando}{usuario_str} - {self.fecha.strftime('%Y-%m-%d %H:%M:%S')}"


class PendingRegistration(models.Model):
    """
    Modelo para manejar registros temporales antes de que se complete el registro del usuario.
    Permite asociar datos de voz con usuarios que aún no han completado su registro.
    """
    id = models.AutoField(primary_key=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nombres = models.CharField(max_length=150, blank=True)
    apellidos = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    dni = models.CharField(max_length=20, blank=True)
    
    # Datos de sesión
    session_key = models.CharField(max_length=40, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    
    # Estado
    is_completed = models.BooleanField(default=False)
    completed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='completed_registrations'
    )
    
    class Meta:
        db_table = 'pending_registrations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['session_key']),
            models.Index(fields=['expires_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Expira en 24 horas por defecto
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def __str__(self):
        return f"PendingRegistration {self.token} - {self.email or 'Sin email'}"


class VoiceProfile(models.Model):
    """
    Modelo para almacenar perfiles de voz de usuarios registrados.
    Incluye consentimiento, datos de audio y metadatos de privacidad.
    """
    id = models.AutoField(primary_key=True)
    
    # Relaciones
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='voice_profile'
    )
    pending_registration = models.ForeignKey(
        PendingRegistration,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='voice_profiles'
    )
    
    # Datos de audio
    audio_file = models.FileField(upload_to='voice_samples/', null=True, blank=True)
    audio_format = models.CharField(max_length=10, default='webm')
    audio_duration = models.FloatField(null=True, blank=True)  # en segundos
    audio_size = models.IntegerField(null=True, blank=True)  # en bytes
    
    # Embeddings/características de voz (para reconocimiento biométrico)
    voice_embeddings = models.JSONField(default=list, blank=True)
    voice_features = models.JSONField(default=dict, blank=True)
    
    # Consentimiento y privacidad
    consent_given = models.BooleanField(default=False)
    consent_at = models.DateTimeField(null=True, blank=True)
    consent_ip = models.GenericIPAddressField(null=True, blank=True)
    consent_user_agent = models.TextField(blank=True)
    
    # Metadatos
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Estadísticas de uso
    usage_count = models.IntegerField(default=0)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'voice_profiles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['pending_registration']),
            models.Index(fields=['consent_given']),
            models.Index(fields=['is_active']),
        ]
    
    def record_usage(self):
        """Registra el uso del perfil de voz"""
        self.usage_count += 1
        self.last_used = timezone.now()
        self.save(update_fields=['usage_count', 'last_used'])
    
    def give_consent(self, ip_address=None, user_agent=None):
        """Registra el consentimiento del usuario"""
        self.consent_given = True
        self.consent_at = timezone.now()
        self.consent_ip = ip_address
        self.consent_user_agent = user_agent or ''
        
        # Si el objeto ya existe en la base de datos, usar update_fields para eficiencia
        # Si no existe (pk es None), hacer un save() completo
        if self.pk:
            self.save(update_fields=['consent_given', 'consent_at', 'consent_ip', 'consent_user_agent'])
        else:
            # El objeto será guardado completamente en el flujo principal
            pass
    
    def __str__(self):
        if self.user:
            return f"VoiceProfile for {self.user.email}"
        elif self.pending_registration:
            return f"VoiceProfile for pending {self.pending_registration.token}"
        return f"VoiceProfile {self.id}"