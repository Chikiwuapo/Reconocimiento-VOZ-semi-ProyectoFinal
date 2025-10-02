# Documentación de la API - Sistema de Reconocimiento de Voz y Gestos

## 📋 Introducción y Propósito

Esta API REST proporciona servicios para un sistema educativo de reconocimiento de voz y gestos de manos. El sistema permite:

- **Autenticación de usuarios** con reconocimiento facial
- **Reconocimiento de gestos** para números, operaciones matemáticas, vocales, letras y palabras
- **Reconocimiento de voz** con comandos personalizados
- **Chatbot educativo** con inteligencia artificial
- **Gestión de entrenamientos** y estadísticas de práctica

## 🔧 Requisitos Previos

### Dependencias del Sistema
- **Python 3.8+**
- **Django 5.2+**
- **MediaPipe** para reconocimiento de gestos
- **OpenCV** para procesamiento de imágenes
- **NumPy** para cálculos matemáticos
- **Base de datos** (SQLite por defecto, PostgreSQL recomendado para producción)

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor de desarrollo
python manage.py runserver
```

### Variables de Entorno
Crear archivo `.env` basado en `.env.example`:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 🔐 Autenticación

El sistema utiliza **autenticación basada en sesiones de Django** combinada con **reconocimiento facial** para algunos endpoints.

### Tipos de Autenticación:
1. **Sesión Django**: Para endpoints web tradicionales
2. **Reconocimiento Facial**: Para login con biometría
3. **Sin autenticación**: Para endpoints públicos de registro

## 📚 Endpoints de la API

### 🔑 Módulo de Autenticación (`/api/`)

#### POST `/api/login/`
Autentica usuario mediante reconocimiento facial.

**Parámetros del cuerpo:**
```json
{
  "email": "usuario@ejemplo.com",
  "facial_frame": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "position_data": {
    "x": 100,
    "y": 150,
    "width": 200,
    "height": 250
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez"
  }
}
```

**Respuesta de error (400/401):**
```json
{
  "ok": false,
  "error": "Credenciales inválidas"
}
```

#### POST `/api/register-basic/`
Registra un nuevo usuario básico.

**Parámetros del cuerpo:**
```json
{
  "email": "nuevo@ejemplo.com",
  "nombre": "Nuevo Usuario",
  "password": "contraseña123"
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "message": "Usuario registrado exitosamente",
  "user_id": 2
}
```

#### POST `/api/encode/`
Codifica imagen facial para registro biométrico.

**Parámetros del cuerpo:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Respuesta exitosa (200):**
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

#### GET `/api/validate-user/`
Valida si un usuario existe por email.

**Parámetros de consulta:**
- `email`: Email del usuario a validar

**Respuesta exitosa (200):**
```json
{
  "exists": true,
  "user_id": 1
}
```

### 🔢 Módulo de Operaciones Matemáticas (`/api/operaciones/`)

#### GET `/api/operaciones/gestos-entrenados/`
Obtiene lista de gestos numéricos entrenados.

**Respuesta exitosa (200):**
```json
{
  "gestos": [
    {
      "id": 1,
      "numero_vinculado": 5,
      "tipo_mano": "right",
      "precision_entrenamiento": 0.95,
      "numero_muestras": 50,
      "fecha_creacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/operaciones/guardar-gesto/`
Guarda un nuevo gesto numérico entrenado.

**Parámetros del cuerpo:**
```json
{
  "numero_vinculado": 7,
  "tipo_mano": "right",
  "landmarks_data": "[{\"x\": 0.5, \"y\": 0.3, \"z\": 0.1}, ...]",
  "numero_muestras": 30,
  "precision_entrenamiento": 0.88
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Gesto guardado exitosamente",
  "gesto_id": 15
}
```

#### POST `/api/operaciones/reconocer-gesto/`
Reconoce un gesto numérico en tiempo real.

**Parámetros del cuerpo:**
```json
{
  "landmarks": "[{\"x\": 0.5, \"y\": 0.3, \"z\": 0.1}, ...]",
  "tipo_mano": "right"
}
```

**Respuesta exitosa (200):**
```json
{
  "reconocido": true,
  "numero": 8,
  "confianza": 0.92,
  "gesto_id": 12
}
```

#### POST `/api/operaciones/calcular-operacion/`
Calcula operación matemática basada en gestos reconocidos.

**Parámetros del cuerpo:**
```json
{
  "operando1": "15",
  "operador": "+",
  "operando2": "23"
}
```

**Respuesta exitosa (200):**
```json
{
  "resultado": "38",
  "expresion": "15 + 23 = 38",
  "operacion_id": 45
}
```

### 🗣️ Módulo de Vocales (`/api/vocales/`)

#### GET `/api/vocales/api/vocales-capturadas/`
Obtiene lista de gestos de vocales entrenados.

**Respuesta exitosa (200):**
```json
{
  "vocales": [
    {
      "id": 1,
      "vocal_vinculada": "A",
      "tipo_mano": "right",
      "precision_entrenamiento": 0.93,
      "numero_muestras": 40,
      "fecha_creacion": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### POST `/api/vocales/api/guardar-gesto/`
Guarda un nuevo gesto de vocal entrenado.

**Parámetros del cuerpo:**
```json
{
  "vocal_vinculada": "E",
  "tipo_mano": "right",
  "landmarks_data": "[{\"x\": 0.4, \"y\": 0.6, \"z\": 0.2}, ...]",
  "numero_muestras": 35,
  "precision_entrenamiento": 0.91
}
```

#### POST `/api/vocales/api/reconocer-gesto/`
Reconoce un gesto de vocal en tiempo real.

**Parámetros del cuerpo:**
```json
{
  "landmarks": "[{\"x\": 0.4, \"y\": 0.6, \"z\": 0.2}, ...]",
  "tipo_mano": "right"
}
```

**Respuesta exitosa (200):**
```json
{
  "reconocido": true,
  "vocal": "I",
  "confianza": 0.89,
  "vocal_id": 8
}
```

#### GET `/api/vocales/api/estadisticas-practica/`
Obtiene estadísticas de práctica de vocales.

**Respuesta exitosa (200):**
```json
{
  "total_practicas": 150,
  "aciertos": 135,
  "precision_general": 0.90,
  "por_vocal": {
    "A": {"practicas": 30, "aciertos": 28, "precision": 0.93},
    "E": {"practicas": 30, "aciertos": 27, "precision": 0.90}
  }
}
```

### 🔤 Módulo de Abecedario (`/api/abecedario/`)

#### GET `/api/abecedario/api/letras-capturadas/`
Obtiene lista de gestos de letras entrenados.

#### POST `/api/abecedario/api/guardar-gesto/`
Guarda un nuevo gesto de letra entrenado.

#### POST `/api/abecedario/api/reconocer-gesto/`
Reconoce un gesto de letra en tiempo real.

#### GET `/api/abecedario/api/estadisticas-practica/`
Obtiene estadísticas de práctica de letras.

*Los parámetros y respuestas son similares al módulo de vocales, pero con letras del abecedario.*

### 📝 Módulo de Palabras (`/api/palabras/`)

#### GET `/api/palabras/api/palabras-capturadas/`
Obtiene lista de gestos de palabras entrenados.

#### POST `/api/palabras/api/guardar-gesto/`
Guarda un nuevo gesto de palabra entrenado.

#### POST `/api/palabras/api/reconocer-gesto/`
Reconoce un gesto de palabra en tiempo real.

*Los parámetros y respuestas siguen el mismo patrón que los módulos anteriores.*

### 🎤 Módulo de Reconocimiento de Voz (`/voz/`)

#### POST `/voz/iniciar/`
Inicia sesión de reconocimiento de voz.

**Respuesta exitosa (200):**
```json
{
  "status": "iniciado",
  "session_id": "abc123",
  "message": "Reconocimiento de voz iniciado"
}
```

#### POST `/voz/detener/`
Detiene sesión de reconocimiento de voz.

#### GET `/voz/estado/`
Obtiene estado actual del reconocimiento de voz.

**Respuesta exitosa (200):**
```json
{
  "activo": true,
  "session_id": "abc123",
  "tiempo_activo": 120
}
```

#### POST `/voz/api/register_audio/`
Registra muestra de audio para entrenamiento.

**Parámetros del cuerpo:**
```json
{
  "audio_data": "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC...",
  "command": "abrir aplicación",
  "user_id": 1
}
```

#### POST `/voz/api/recognize_command/`
Reconoce comando de voz en tiempo real.

**Parámetros del cuerpo:**
```json
{
  "audio_data": "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC..."
}
```

**Respuesta exitosa (200):**
```json
{
  "reconocido": true,
  "comando": "abrir aplicación",
  "confianza": 0.87,
  "accion": "ejecutar_comando"
}
```

### 🤖 Módulo de Chatbot Educativo (`/chatbot/`)

#### POST `/chatbot/api/chat/`
Envía mensaje al chatbot educativo.

**Parámetros del cuerpo:**
```json
{
  "message": "¿Cómo se hace una suma?",
  "session_id": "user123",
  "context": "matematicas"
}
```

**Respuesta exitosa (200):**
```json
{
  "response": "Para hacer una suma, debes juntar las cantidades. Por ejemplo: 2 + 3 = 5",
  "session_id": "user123",
  "confidence": 0.95,
  "suggestions": ["¿Quieres practicar sumas?", "¿Te explico la resta?"]
}
```

#### GET `/chatbot/api/history/`
Obtiene historial de conversación.

**Parámetros de consulta:**
- `session_id`: ID de la sesión
- `limit`: Número máximo de mensajes (por defecto: 50)

**Respuesta exitosa (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "message": "Hola",
      "response": "¡Hola! ¿En qué puedo ayudarte hoy?",
      "timestamp": "2024-01-15T14:30:00Z",
      "session_id": "user123"
    }
  ],
  "total": 1
}
```

#### POST `/chatbot/api/clear-session/`
Limpia historial de sesión del chatbot.

#### GET `/chatbot/api/health/`
Verifica estado de salud del chatbot.

**Respuesta exitosa (200):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "last_update": "2024-01-15T12:00:00Z"
}
```

## 📊 Códigos de Estado HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Parámetros inválidos o faltantes |
| 401 | Unauthorized | Autenticación requerida |
| 403 | Forbidden | Sin permisos para acceder |
| 404 | Not Found | Recurso no encontrado |
| 405 | Method Not Allowed | Método HTTP no permitido |
| 500 | Internal Server Error | Error interno del servidor |

## ⚠️ Limitaciones y Consideraciones

### Limitaciones Técnicas
- **Tamaño de archivos**: Máximo 10MB para imágenes y audio
- **Rate limiting**: 100 solicitudes por minuto por IP
- **Formatos soportados**: 
  - Imágenes: JPEG, PNG, WebP
  - Audio: WebM, WAV, MP3
- **Resolución mínima**: 640x480 para reconocimiento facial
- **Calidad de audio**: Mínimo 16kHz para reconocimiento de voz

### Consideraciones de Rendimiento
- **Reconocimiento en tiempo real**: Latencia típica 100-300ms
- **Entrenamiento de gestos**: Requiere mínimo 20 muestras por gesto
- **Precisión**: Varía según condiciones de iluminación y calidad de cámara
- **Memoria**: Cada modelo de reconocimiento usa ~50-100MB RAM

### Consideraciones de Seguridad
- **HTTPS requerido** en producción
- **Validación de entrada** en todos los endpoints
- **Sanitización de datos** para prevenir inyecciones
- **Límites de sesión**: 24 horas máximo

## 🐛 Códigos de Error Comunes

### Error 400 - Bad Request
```json
{
  "error": "Parámetros faltantes",
  "details": "Se requiere 'landmarks_data'",
  "code": "MISSING_PARAMETER"
}
```
**Solución**: Verificar que todos los parámetros requeridos estén presentes.

### Error 401 - Unauthorized
```json
{
  "error": "Autenticación requerida",
  "code": "AUTH_REQUIRED"
}
```
**Solución**: Iniciar sesión o proporcionar credenciales válidas.

### Error 404 - Not Found
```json
{
  "error": "Gesto no encontrado",
  "code": "GESTURE_NOT_FOUND"
}
```
**Solución**: Verificar que el ID del recurso sea válido.

### Error 500 - Internal Server Error
```json
{
  "error": "Error procesando imagen",
  "code": "PROCESSING_ERROR"
}
```
**Solución**: Verificar formato y calidad de la imagen/audio.

## 📞 Soporte y Contacto

Para reportar problemas o solicitar nuevas funcionalidades:

- **Issues**: Crear issue en el repositorio
- **Documentación**: Consultar archivos README específicos de cada módulo
- **Logs**: Revisar logs del servidor para errores detallados

## 🔄 Versionado

- **Versión actual**: 1.0.0
- **Compatibilidad**: Mantiene retrocompatibilidad con versiones 0.x
- **Actualizaciones**: Seguir semantic versioning (semver.org)

---

*Última actualización: Enero 2024*