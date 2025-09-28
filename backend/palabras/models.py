from django.db import models
from django.core.validators import MinLengthValidator
import json

class TipoPalabra(models.TextChoices):
    """Tipos de palabras disponibles para el reconocimiento"""
    HOLA = 'HOLA', 'Hola'
    ADIOS = 'ADIOS', 'Adiós'
    GRACIAS = 'GRACIAS', 'Gracias'
    POR_FAVOR = 'POR_FAVOR', 'Por favor'
    SI = 'SI', 'Sí'
    NO = 'NO', 'No'
    AGUA = 'AGUA', 'Agua'
    COMIDA = 'COMIDA', 'Comida'
    CASA = 'CASA', 'Casa'
    FAMILIA = 'FAMILIA', 'Familia'
    AMOR = 'AMOR', 'Amor'
    TRABAJO = 'TRABAJO', 'Trabajo'
    ESCUELA = 'ESCUELA', 'Escuela'
    AMIGO = 'AMIGO', 'Amigo'
    TIEMPO = 'TIEMPO', 'Tiempo'
    DINERO = 'DINERO', 'Dinero'
    SALUD = 'SALUD', 'Salud'
    FELIZ = 'FELIZ', 'Feliz'
    TRISTE = 'TRISTE', 'Triste'
    BUENO = 'BUENO', 'Bueno'
    MALO = 'MALO', 'Malo'
    GRANDE = 'GRANDE', 'Grande'
    PEQUEÑO = 'PEQUEÑO', 'Pequeño'
    RAPIDO = 'RAPIDO', 'Rápido'
    LENTO = 'LENTO', 'Lento'

class TipoMano(models.TextChoices):
    """Tipos de mano para el reconocimiento"""
    IZQUIERDA = 'left', 'Mano Izquierda'
    DERECHA = 'right', 'Mano Derecha'
    AMBAS = 'both', 'Ambas Manos'

class PalabraCapturada(models.Model):
    """Modelo para almacenar gestos de palabras entrenados"""
    palabra_vinculada = models.CharField(
        max_length=50,
        help_text="Palabra vinculada al gesto (cualquier palabra personalizada)"
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
        verbose_name = "Palabra Capturada"
        verbose_name_plural = "Palabras Capturadas"
        ordering = ['palabra_vinculada', 'tipo_mano']

    def __str__(self):
        return f"Palabra {self.palabra_vinculada} - {self.get_tipo_mano_display()}"

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
        return self.palabra_vinculada

class HistorialReconocimientoPalabra(models.Model):
    """Modelo para el historial de reconocimientos de palabras"""
    palabra_reconocida = models.ForeignKey(
        PalabraCapturada,
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
        verbose_name = "Historial de Reconocimiento Palabra"
        verbose_name_plural = "Historial de Reconocimientos Palabras"
        ordering = ['-fecha_reconocimiento']

    def __str__(self):
        return f"Reconocimiento: {self.palabra_reconocida.palabra_vinculada} - {self.confianza:.2f}"

class PracticaPalabra(models.Model):
    """Modelo para almacenar sesiones de práctica de palabras"""
    palabra_objetivo = models.CharField(
        max_length=20,
        choices=TipoPalabra.choices,
        help_text="Palabra que se intentaba reconocer"
    )
    
    palabra_reconocida = models.CharField(
        max_length=20,
        choices=TipoPalabra.choices,
        help_text="Palabra que fue reconocida",
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
        verbose_name = "Práctica de Palabra"
        verbose_name_plural = "Prácticas de Palabras"
        ordering = ['-fecha_practica']

    def __str__(self):
        status = "✓" if self.fue_correcta else "✗"
        return f"{status} {self.palabra_objetivo} → {self.palabra_reconocida or 'N/A'}"
