import json
import threading
import time
from django.utils import timezone

# Importación opcional para evitar errores durante migraciones
try:
    import vosk
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    print("Vosk no está disponible. Instala con: pip install vosk")

# Importación tardía del modelo para evitar errores circulares
def get_comando_model():
    from .models import Comando
    return Comando


class VozService:
    """
    Servicio para reconocimiento de voz offline usando Vosk
    Nota: Funcionalidad de audio en tiempo real removida - solo procesamiento de texto
    """
    
    def __init__(self):
        self.model = None
        self.rec = None
        self.comandos_validos = ["encender luz", "apagar luz"]
        
    def inicializar_modelo(self):
        if not VOSK_AVAILABLE:
            return False, "Error: Vosk no está disponible"
        
        try:
            # Ruta al modelo de Vosk descargado
            import os
            model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "vosk-model-small-es-0.42")
            if not os.path.exists(model_path):
                return False, f"Error: Modelo no encontrado en {model_path}"
            
            self.model = vosk.Model(model_path)
            self.rec = vosk.KaldiRecognizer(self.model, self.RATE)
            return True, "Modelo inicializado correctamente"
        except Exception as e:
            return False, f"Error al inicializar modelo: {str(e)}"
    
    def procesar_comando(self, texto):
        """
        Procesa el texto reconocido y verifica si es un comando válido
        """
        texto = texto.lower().strip()
        Comando = get_comando_model()
        
        for comando in self.comandos_validos:
            if comando in texto:
                try:
                    # Guardar comando en la base de datos
                    nuevo_comando = Comando.objects.create(
                        comando=comando,
                        fecha=timezone.now()
                    )
                    
                    # Imprimir mensaje en consola
                    print(f"Comando detectado: {comando} – acción ejecutada")
                    
                    return True
                except Exception as e:
                    print(f"Error al guardar comando: {e}")
                    return False
        
        return False

    def obtener_comandos_recientes(self, limite=10):
        """
        Obtiene los comandos más recientes de la base de datos
        """
        try:
            Comando = get_comando_model()
            return Comando.objects.all().order_by('-fecha')[:limite]
        except Exception as e:
            print(f"Error al obtener comandos: {e}")
            return []


# Instancia global del servicio
voz_service = VozService()