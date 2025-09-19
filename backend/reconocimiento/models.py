from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import json


class Capture(models.Model):
    """
    Modelo para registrar cada intento de reconocimiento facial
    para análisis de errores y mejora del sistema
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    person_id = models.IntegerField(null=True, blank=True, help_text="ID de la persona reconocida")
    timestamp = models.DateTimeField(auto_now_add=True)
    match_score = models.FloatField(help_text="Score promedio del voting system")
    matched = models.BooleanField(help_text="Si el reconocimiento fue exitoso")
    region_scores = models.JSONField(
        default=dict,
        help_text="Scores por región facial (ojos, nariz, boca, etc.)"
    )
    frames_count = models.IntegerField(default=0, help_text="Número de frames procesados")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Captura de Reconocimiento"
        verbose_name_plural = "Capturas de Reconocimiento"
    
    def __str__(self):
        status = "✓" if self.matched else "✗"
        return f"{status} {self.timestamp.strftime('%Y-%m-%d %H:%M')} - Score: {self.match_score:.2f}"
    
    def set_region_scores(self, scores_dict):
        """Helper para establecer scores por región"""
        self.region_scores = scores_dict
    
    def get_region_scores(self):
        """Helper para obtener scores por región"""
        return self.region_scores


class Person(models.Model):
    """
    Modelo para almacenar información de personas registradas
    con sus embeddings faciales para reconocimiento
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        help_text="Usuario de Django asociado"
    )
    username = models.CharField(
        max_length=150, 
        unique=True,
        help_text="Nombre de usuario único"
    )
    email = models.EmailField(
        unique=True,
        help_text="Correo electrónico único"
    )
    dni = models.CharField(
        max_length=20,
        unique=True,
        help_text="Documento de identidad único"
    )
    embeddings = models.JSONField(
        default=list,
        help_text="Lista de embeddings faciales para reconocimiento"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Campos adicionales para mejorar la seguridad
    registration_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Persona Registrada"
        verbose_name_plural = "Personas Registradas"
        indexes = [
            models.Index(fields=['dni']),
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.dni})"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar que el DNI no esté vacío
        if not self.dni or not self.dni.strip():
            raise ValidationError({'dni': 'El DNI es obligatorio'})
        
        # Validar formato básico del DNI (solo números y letras)
        if not self.dni.replace(' ', '').isalnum():
            raise ValidationError({'dni': 'El DNI solo puede contener números y letras'})
    
    def save(self, *args, **kwargs):
        """Override save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def add_embedding(self, embedding_data):
        """Agregar un nuevo embedding a la lista"""
        if not isinstance(self.embeddings, list):
            self.embeddings = []
        self.embeddings.append(embedding_data)
        self.save()
    
    def get_embeddings_count(self):
        """Obtener número de embeddings almacenados"""
        return len(self.embeddings) if isinstance(self.embeddings, list) else 0
    
    def clear_embeddings(self):
        """Limpiar todos los embeddings"""
        self.embeddings = []
        self.save()
    
    def update_login_info(self, ip_address=None):
        """Actualizar información del último login"""
        from django.utils import timezone
        self.last_login_at = timezone.now()
        if ip_address:
            self.last_login_ip = ip_address
        self.failed_attempts = 0  # Reset failed attempts on successful login
        self.save()
    
    def increment_failed_attempts(self):
        """Incrementar intentos fallidos"""
        self.failed_attempts += 1
        self.save()
    
    def is_locked(self):
        """Verificar si la cuenta está bloqueada por intentos fallidos"""
        return self.failed_attempts >= 5  # Bloquear después de 5 intentos fallidos
