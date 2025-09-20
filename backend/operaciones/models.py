from django.db import models
from django.core.validators import MinLengthValidator
import json

class TipoOperacion(models.TextChoices):
    """Tipos de operaciones matemáticas disponibles"""
    SUMA = 'suma', 'Suma (+)'
    RESTA = 'resta', 'Resta (-)'
    MULTIPLICACION = 'multiplicacion', 'Multiplicación (×)'
    DIVISION = 'division', 'División (÷)'

class TipoGesto(models.TextChoices):
    """Tipos de gestos disponibles - Números del 0 al 50"""
    # Generamos dinámicamente los números del 0 al 50
    @classmethod
    def get_numero_choices(cls):
        choices = []
        for i in range(51):  # 0 a 50
            choices.append((str(i), f'Número {i}'))
        return choices

class TipoMano(models.TextChoices):
    """Tipos de mano para el reconocimiento"""
    IZQUIERDA = 'left', 'Mano Izquierda'
    DERECHA = 'right', 'Mano Derecha'
    AMBAS = 'both', 'Ambas Manos'

class GestoMano(models.Model):
    """Modelo para almacenar gestos de mano entrenados"""
    numero_vinculado = models.IntegerField(
        help_text="Número del 0 al 50 vinculado al gesto",
        null=True,
        blank=True
    )
    
    operacion_vinculada = models.CharField(
        max_length=20,
        choices=TipoOperacion.choices,
        help_text="Operación matemática vinculada al gesto",
        null=True,
        blank=True
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
        verbose_name = "Gesto de Mano"
        verbose_name_plural = "Gestos de Mano"
        ordering = ['numero_vinculado', 'operacion_vinculada', 'tipo_mano']

    def __str__(self):
        if self.numero_vinculado is not None:
            return f"Número {self.numero_vinculado} - {self.get_tipo_mano_display()}"
        elif self.operacion_vinculada:
            return f"{self.get_operacion_vinculada_display()} - {self.get_tipo_mano_display()}"
        else:
            return f"Gesto sin vincular - {self.get_tipo_mano_display()}"
    
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
        return self.numero_vinculado is not None
    
    @property
    def es_operacion(self):
        """Verifica si el gesto es una operación matemática"""
        return self.operacion_vinculada is not None
    
    @property
    def valor_display(self):
        """Retorna el valor a mostrar del gesto"""
        if self.es_numero:
            return str(self.numero_vinculado)
        elif self.es_operacion:
            operacion_symbols = {
                'suma': '+',
                'resta': '-',
                'multiplicacion': '×',
                'division': '÷'
            }
            return operacion_symbols.get(self.operacion_vinculada, self.operacion_vinculada)
        return "Sin vincular"

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
