from django.db import models
from django.core.validators import MinLengthValidator
import json

class TipoLetra(models.TextChoices):
    """Tipos de letras del abecedario disponibles"""
    A = 'A', 'Letra A'
    B = 'B', 'Letra B'
    C = 'C', 'Letra C'
    D = 'D', 'Letra D'
    E = 'E', 'Letra E'
    F = 'F', 'Letra F'
    G = 'G', 'Letra G'
    H = 'H', 'Letra H'
    I = 'I', 'Letra I'
    J = 'J', 'Letra J'
    K = 'K', 'Letra K'
    L = 'L', 'Letra L'
    M = 'M', 'Letra M'
    N = 'N', 'Letra N'
    O = 'O', 'Letra O'
    P = 'P', 'Letra P'
    Q = 'Q', 'Letra Q'
    R = 'R', 'Letra R'
    S = 'S', 'Letra S'
    T = 'T', 'Letra T'
    U = 'U', 'Letra U'
    V = 'V', 'Letra V'
    W = 'W', 'Letra W'
    X = 'X', 'Letra X'
    Y = 'Y', 'Letra Y'
    Z = 'Z', 'Letra Z'

class TipoMano(models.TextChoices):
    """Tipos de mano para el reconocimiento"""
    IZQUIERDA = 'left', 'Mano Izquierda'
    DERECHA = 'right', 'Mano Derecha'
    AMBAS = 'both', 'Ambas Manos'

class LetraCapturada(models.Model):
    """Modelo para almacenar gestos de letras entrenados"""
    letra_vinculada = models.CharField(
        max_length=1,
        choices=TipoLetra.choices,
        help_text="Letra vinculada al gesto"
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
        verbose_name = "Letra Capturada"
        verbose_name_plural = "Letras Capturadas"
        ordering = ['letra_vinculada', 'tipo_mano']

    def __str__(self):
        return f"Letra {self.letra_vinculada} - {self.get_tipo_mano_display()}"

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
        return self.letra_vinculada

class HistorialReconocimientoLetra(models.Model):
    """Modelo para el historial de reconocimientos de letras"""
    letra_reconocida = models.ForeignKey(
        LetraCapturada,
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
        verbose_name = "Historial de Reconocimiento Letra"
        verbose_name_plural = "Historial de Reconocimientos Letras"
        ordering = ['-fecha_reconocimiento']

    def __str__(self):
        return f"Reconocimiento: {self.letra_reconocida.letra_vinculada} - {self.confianza:.2f}"

class PracticaLetra(models.Model):
    """Modelo para almacenar sesiones de práctica de letras"""
    letra_objetivo = models.CharField(
        max_length=1,
        choices=TipoLetra.choices,
        help_text="Letra que se intentaba reconocer"
    )
    
    letra_reconocida = models.CharField(
        max_length=1,
        choices=TipoLetra.choices,
        help_text="Letra que fue reconocida",
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
        verbose_name = "Práctica de Letra"
        verbose_name_plural = "Prácticas de Letras"
        ordering = ['-fecha_practica']

    def __str__(self):
        status = "✓" if self.fue_correcta else "✗"
        return f"{status} {self.letra_objetivo} → {self.letra_reconocida or 'N/A'}"
