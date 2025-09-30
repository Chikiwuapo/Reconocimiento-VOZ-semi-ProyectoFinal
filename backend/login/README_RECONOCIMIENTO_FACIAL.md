# Reconocimiento Facial - Aplicación Login

## Descripción General

La aplicación de login implementa un sistema de autenticación biométrica basado en reconocimiento facial que permite a los usuarios registrarse e iniciar sesión utilizando su rostro como método de identificación.

## Librerías Utilizadas

### Backend (Python/Django)

#### 1. OpenCV (opencv-python>=4.10.0.84)
- **Propósito**: Procesamiento y manipulación de imágenes
- **Funciones principales**:
  - Decodificación de imágenes base64 recibidas del frontend
  - Conversión de formatos de color (BGR a RGB)
  - Redimensionamiento de imágenes
  - Procesamiento básico de frames de video

#### 2. face_recognition (>=1.3.0)
- **Propósito**: Reconocimiento facial específico y generación de embeddings
- **Funciones principales**:
  - `face_locations()`: Detecta la ubicación de rostros en una imagen
  - `face_encodings()`: Genera embeddings faciales de 128 dimensiones
  - Utiliza el modelo HOG (Histogram of Oriented Gradients) para detección
  - Permite comparación de rostros mediante distancia euclidiana

### Frontend (JavaScript)

#### 3. MediaPipe (CDN)
- **Propósito**: Detección facial en tiempo real en el navegador
- **Implementación**: Se carga desde CDN de Google
- **Funciones principales**:
  - Detección facial en vivo desde la cámara web
  - Análisis de posición y calidad del rostro
  - Feedback visual en tiempo real al usuario
  - No requiere instalación local (se ejecuta en el navegador)

## Flujo de Funcionamiento

### Registro de Usuario
1. **Frontend**: MediaPipe detecta el rostro en tiempo real
2. **Frontend**: Captura frames cuando el rostro está bien posicionado
3. **Backend**: OpenCV procesa las imágenes recibidas
4. **Backend**: face_recognition genera embeddings faciales únicos
5. **Backend**: Se almacenan los embeddings en la base de datos

### Inicio de Sesión
1. **Frontend**: MediaPipe detecta y valida la posición del rostro
2. **Frontend**: Captura frame del rostro del usuario
3. **Backend**: OpenCV procesa la imagen
4. **Backend**: face_recognition genera embedding del rostro actual
5. **Backend**: Compara el embedding con los almacenados en la base de datos
6. **Backend**: Autentica si la distancia euclidiana es menor a 0.6

## Características Técnicas

### Seguridad
- Los embeddings faciales son vectores de 128 dimensiones
- Se utiliza distancia euclidiana para comparación (umbral < 0.6)
- Sistema de fallback en caso de que face_recognition no esté disponible
- Validación de posición facial para evitar suplantación

### Compatibilidad
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Requiere cámara web funcional
- **Sistema de fallback**: Si face_recognition falla, usa método alternativo con OpenCV

### Rendimiento
- Detección en tiempo real con MediaPipe
- Procesamiento optimizado de imágenes
- Embeddings compactos para almacenamiento eficiente

## Instalación de Dependencias

### Backend
```bash
pip install -r requirements.txt
```

**Nota importante**: Si `face_recognition` presenta problemas de instalación, instalar dependencias previas:
```bash
pip install cmake
pip install dlib
pip install face_recognition
```

### Frontend
Las dependencias de MediaPipe se cargan automáticamente desde CDN, no requieren instalación local.

## Archivos Principales

- `views/views.py`: Lógica principal de reconocimiento facial
- `static/js/facemesh.js`: Integración con MediaPipe
- `templates/login/login.html`: Interfaz de usuario
- `templates/login/register.html`: Registro con captura facial

## Consideraciones de Uso

1. **Iluminación**: Requiere buena iluminación frontal
2. **Posición**: El rostro debe estar centrado y a distancia adecuada
3. **Calidad**: La cámara debe tener resolución mínima de 480p
4. **Privacidad**: Los embeddings faciales no permiten reconstruir la imagen original

## Troubleshooting

### Error: face_recognition no encontrado
- Verificar instalación: `pip list | grep face-recognition`
- Reinstalar con: `pip install face_recognition`

### Error: OpenCV no funciona
- Verificar instalación: `pip list | grep opencv`
- Reinstalar con: `pip install opencv-python`

### MediaPipe no carga
- Verificar conexión a internet (se carga desde CDN)
- Verificar permisos de cámara en el navegador