from django.db import models
from django.core.validators import MinLengthValidator
import json

class TipoGesto(models.TextChoices):
    """Tipos de gestos disponibles"""
    NUMERO_0 = '0', 'Número 0'
    NUMERO_1 = '1', 'Número 1'
    NUMERO_2 = '2', 'Número 2'
    NUMERO_3 = '3', 'Número 3'
    NUMERO_4 = '4', 'Número 4'
    NUMERO_5 = '5', 'Número 5'
    NUMERO_6 = '6', 'Número 6'
    NUMERO_7 = '7', 'Número 7'
    NUMERO_8 = '8', 'Número 8'
    NUMERO_9 = '9', 'Número 9'
    SUMA = '+', 'Suma (+)'
    RESTA = '-', 'Resta (-)'
    MULTIPLICACION = '*', 'Multiplicación (*)'
    DIVISION = '/', 'División (/)'
    IGUAL = '=', 'Igual (=)'

class GestoMano(models.Model):
    """Modelo para almacenar gestos de mano entrenados"""
    tipo_gesto = models.CharField(
        max_length=20,
        choices=TipoGesto.choices,
        unique=True,
        help_text="Tipo de gesto (número u operación)"
    )
    
    nombre_display = models.CharField(
        max_length=50,
        help_text="Nombre descriptivo del gesto"
    )
    
    landmarks_data = models.TextField(
        help_text="Datos de landmarks de MediaPipe en formato JSON",
        validators=[MinLengthValidator(10)]
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
        verbose_name = "Gesto de Mano"
        verbose_name_plural = "Gestos de Mano"
        ordering = ['tipo_gesto']

    def __str__(self):
        return f"{self.get_tipo_gesto_display()}"
    
    def get_landmarks_as_dict(self):
        """Convierte los landmarks de JSON a diccionario"""
        try:
            return json.loads(self.landmarks_data)
        except json.JSONDecodeError:
            return {}
    
    def set_landmarks_from_dict(self, landmarks_dict):
        """Convierte un diccionario de landmarks a JSON"""
        self.landmarks_data = json.dumps(landmarks_dict)
    
    @property
    def es_numero(self):
        """Verifica si el gesto es un número"""
        return self.tipo_gesto.isdigit()
    
    @property
    def es_operacion(self):
        """Verifica si el gesto es una operación matemática"""
        return self.tipo_gesto in ['+', '-', '*', '/', '=']

class HistorialReconocimiento(models.Model):
    """Modelo para almacenar el historial de reconocimientos"""
    gesto_reconocido = models.ForeignKey(
        GestoMano,
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
        verbose_name = "Historial de Reconocimiento"
        verbose_name_plural = "Historial de Reconocimientos"
        ordering = ['-fecha_reconocimiento']

    def __str__(self):
        return f"{self.gesto_reconocido} - {self.confianza:.2f} - {self.fecha_reconocimiento.strftime('%Y-%m-%d %H:%M')}"

class OperacionMatematica(models.Model):
    """Modelo para almacenar operaciones matemáticas realizadas"""
    operando1 = models.CharField(
        max_length=10,
        help_text="Primer operando de la operación"
    )
    
    operador = models.CharField(
        max_length=1,
        choices=[('+', 'Suma'), ('-', 'Resta'), ('*', 'Multiplicación'), ('/', 'División')],
        help_text="Operador matemático"
    )
    
    operando2 = models.CharField(
        max_length=10,
        help_text="Segundo operando de la operación"
    )
    
    resultado = models.CharField(
        max_length=20,
        help_text="Resultado de la operación"
    )
    
    fecha_operacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de la operación"
    )
    
    gestos_utilizados = models.ManyToManyField(
        GestoMano,
        help_text="Gestos utilizados en esta operación"
    )

    class Meta:
        verbose_name = "Operación Matemática"
        verbose_name_plural = "Operaciones Matemáticas"
        ordering = ['-fecha_operacion']

    def __str__(self):
        return f"{self.operando1} {self.operador} {self.operando2} = {self.resultado}"
    
    @property
    def expresion_completa(self):
        """Retorna la expresión matemática completa"""
        return f"{self.operando1} {self.operador} {self.operando2} = {self.resultado}"
