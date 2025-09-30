import json
import threading
import time
from django.utils import timezone

# Importaciones opcionales para evitar errores durante migraciones
try:
    import pyaudio
    PYAUDIO_AVAILABLE = True
except ImportError:
    PYAUDIO_AVAILABLE = False
    print("PyAudio no está disponible. Instala con: pip install pyaudio")

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
    """
    
    def __init__(self):
        self.model = None
        self.rec = None
        self.audio = None
        self.stream = None
        self.is_listening = False
        self.comandos_validos = ["encender luz", "apagar luz"]
        
        # Configuración de audio
        self.CHUNK = 4096
        self.FORMAT = 16 if not PYAUDIO_AVAILABLE else pyaudio.paInt16  # Valor por defecto si PyAudio no está disponible
        self.CHANNELS = 1
        self.RATE = 16000
        
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
    
    def inicializar_audio(self):
        """
        Inicializa PyAudio para captura de audio
        """
        if not PYAUDIO_AVAILABLE:
            print("Error: PyAudio no está disponible")
            return False
            
        try:
            self.audio = pyaudio.PyAudio()
            self.stream = self.audio.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                input=True,
                frames_per_buffer=self.CHUNK
            )
            print("Audio inicializado correctamente")
            return True
        except Exception as e:
            print(f"Error al inicializar audio: {e}")
            return False
    
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
    
    def escuchar_continuamente(self):
        """
        Escucha continuamente el micrófono y procesa comandos
        """
        if not self.model or not self.rec:
            print("Error: Modelo no inicializado")
            return
            
        if not self.stream:
            print("Error: Audio no inicializado")
            return
        
        print("Iniciando reconocimiento de voz...")
        print("Comandos válidos: 'encender luz', 'apagar luz'")
        print("Presiona Ctrl+C para detener")
        
        self.is_listening = True
        
        try:
            while self.is_listening:
                data = self.stream.read(self.CHUNK, exception_on_overflow=False)
                
                if self.rec.AcceptWaveform(data):
                    result = json.loads(self.rec.Result())
                    texto = result.get('text', '')
                    
                    if texto:
                        print(f"Texto reconocido: {texto}")
                        self.procesar_comando(texto)
                
                # Pequeña pausa para no sobrecargar el CPU
                time.sleep(0.01)
                
        except KeyboardInterrupt:
            print("\nDeteniendo reconocimiento de voz...")
        except Exception as e:
            print(f"Error durante el reconocimiento: {e}")
        finally:
            self.detener_escucha()
    
    def iniciar_escucha_async(self):
        """
        Inicia la escucha en un hilo separado
        """
        if self.is_listening:
            print("Ya se está escuchando")
            return False
            
        if not self.inicializar_modelo():
            return False
            
        if not self.inicializar_audio():
            return False
        
        # Iniciar en un hilo separado
        thread = threading.Thread(target=self.escuchar_continuamente)
        thread.daemon = True
        thread.start()
        
        return True
    
    def detener_escucha(self):
        """
        Detiene la escucha y libera recursos
        """
        self.is_listening = False
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        if self.audio:
            self.audio.terminate()
            self.audio = None
        
        print("Reconocimiento de voz detenido")
    
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