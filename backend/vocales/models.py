from django.db import models
from django.core.validators import MinLengthValidator
import json

class TipoVocal(models.TextChoices):
    """Tipos de vocales disponibles"""
    A = 'A', 'Vocal A'
    E = 'E', 'Vocal E'
    I = 'I', 'Vocal I'
    O = 'O', 'Vocal O'
    U = 'U', 'Vocal U'

class TipoMano(models.TextChoices):
    """Tipos de mano para el reconocimiento"""
    IZQUIERDA = 'left', 'Mano Izquierda'
    DERECHA = 'right', 'Mano Derecha'
    AMBAS = 'both', 'Ambas Manos'

class VocalCapturada(models.Model):
    """Modelo para almacenar gestos de vocales entrenados"""
    vocal_vinculada = models.CharField(
        max_length=1,
        choices=TipoVocal.choices,
        help_text="Vocal vinculada al gesto"
    )
    
    tipo_mano = models.CharField(
        max_length=10,
        choices=TipoMano.choices,
        default=TipoMano.DERECHA,
        help_text="Tipo de mano utilizada para el gesto"
    )
    
    nombre_display = models.CharField(
        max_length=50,
        help_text="Nombre descriptivo del gesto"
    )
    
    landmarks_data = models.TextField(
        help_text="Datos de landmarks de MediaPipe en formato JSON",
        validators=[MinLengthValidator(10)]
    )
    
    landmarks_mano_izquierda = models.TextField(
        blank=True,
        null=True,
        help_text="Landmarks específicos de la mano izquierda"
    )
    
    landmarks_mano_derecha = models.TextField(
        blank=True,
        null=True,
        help_text="Landmarks específicos de la mano derecha"
    )
    
    numero_muestras = models.IntegerField(
        default=0,
        help_text="Número de muestras capturadas durante el entrenamiento"
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación del gesto"
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        help_text="Fecha y hora de última actualización"
    )
    
    activo = models.BooleanField(
        default=True,
        help_text="Indica si el gesto está activo para reconocimiento"
    )
    
    precision_entrenamiento = models.FloatField(
        default=0.0,
        help_text="Precisión del gesto durante el entrenamiento (0.0 - 1.0)"
    )

    class Meta:
        verbose_name = "Vocal Capturada"
        verbose_name_plural = "Vocales Capturadas"
        ordering = ['vocal_vinculada', 'tipo_mano']

    def __str__(self):
        return f"Vocal {self.vocal_vinculada} - {self.get_tipo_mano_display()}"

    def get_landmarks_as_dict(self):
        """Convierte los landmarks de JSON string a diccionario"""
        try:
            return json.loads(self.landmarks_data)
        except json.JSONDecodeError:
            return {}

    def set_landmarks_from_dict(self, landmarks_dict):
        """Convierte un diccionario de landmarks a JSON string"""
        self.landmarks_data = json.dumps(landmarks_dict)

    @property
    def valor_display(self):
        """Retorna el valor para mostrar en la interfaz"""
        return self.vocal_vinculada

class HistorialReconocimientoVocal(models.Model):
    """Modelo para el historial de reconocimientos de vocales"""
    vocal_reconocida = models.ForeignKey(
        VocalCapturada,
        on_delete=models.CASCADE,
        related_name='reconocimientos'
    )
    
    confianza = models.FloatField(
        help_text="Nivel de confianza del reconocimiento (0.0 - 1.0)"
    )
    
    fecha_reconocimiento = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora del reconocimiento"
    )
    
    landmarks_reconocidos = models.TextField(
        help_text="Landmarks detectados durante el reconocimiento",
        blank=True
    )

    class Meta:
        verbose_name = "Historial de Reconocimiento Vocal"
        verbose_name_plural = "Historial de Reconocimientos Vocales"
        ordering = ['-fecha_reconocimiento']

    def __str__(self):
        return f"Reconocimiento: {self.vocal_reconocida.vocal_vinculada} - {self.confianza:.2f}"

class PracticaVocal(models.Model):
    """Modelo para almacenar sesiones de práctica de vocales"""
    vocal_objetivo = models.CharField(
        max_length=1,
        choices=TipoVocal.choices,
        help_text="Vocal que se intentaba reconocer"
    )
    
    vocal_reconocida = models.CharField(
        max_length=1,
        choices=TipoVocal.choices,
        help_text="Vocal que fue reconocida",
        null=True,
        blank=True
    )
    
    fue_correcta = models.BooleanField(
        default=False,
        help_text="Indica si el reconocimiento fue correcto"
    )
    
    confianza = models.FloatField(
        help_text="Nivel de confianza del reconocimiento"
    )
    
    fecha_practica = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de la práctica"
    )
    
    tiempo_respuesta = models.FloatField(
        help_text="Tiempo en segundos que tomó el reconocimiento",
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Práctica de Vocal"
        verbose_name_plural = "Prácticas de Vocales"
        ordering = ['-fecha_practica']

    def __str__(self):
        status = "✓" if self.fue_correcta else "✗"
        return f"{status} {self.vocal_objetivo} → {self.vocal_reconocida or 'N/A'}"
