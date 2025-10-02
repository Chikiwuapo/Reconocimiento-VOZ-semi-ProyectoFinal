# Reconocimiento Facial - Aplicación Login

## Descripción General

La aplicación de login implementa un sistema de autenticación biométrica básico que permite a los usuarios registrarse e iniciar sesión utilizando características visuales básicas como método de identificación.

## Librerías Utilizadas

### Backend (Python/Django)

#### 1. OpenCV (opencv-python>=4.8.1.78)
- **Propósito**: Procesamiento y manipulación de imágenes
- **Funciones principales**:
  - Decodificación de imágenes base64 recibidas del frontend
  - Conversión de formatos de color
  - Redimensionamiento de imágenes
  - Procesamiento básico de frames de video
  - Generación de embeddings básicos usando características de píxeles

#### 2. NumPy (>=1.24.3)
- **Propósito**: Operaciones matemáticas y manejo de arrays
- **Funciones principales**:
  - Procesamiento de arrays de imágenes
  - Cálculos de similitud de coseno
  - Normalización de vectores
  - Operaciones matriciales para comparación de embeddings

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
4. **Backend**: Se genera un embedding básico usando características de píxeles
5. **Backend**: Se almacenan los embeddings en la base de datos

### Inicio de Sesión
1. **Frontend**: MediaPipe detecta y valida la posición del rostro
2. **Frontend**: Captura frame del rostro del usuario
3. **Backend**: OpenCV procesa la imagen
4. **Backend**: Se genera un embedding básico del rostro actual usando características de píxeles
5. **Backend**: Compara el embedding con los almacenados en la base de datos usando similitud de coseno
6. **Backend**: Autentica si la similitud de coseno es mayor a 0.85

## Características Técnicas

### Seguridad
- Los embeddings son vectores de características básicas de píxeles
- Se utiliza similitud de coseno para comparación (umbral > 0.85)
- Sistema básico de procesamiento de imágenes con OpenCV
- Validación de posición facial para evitar suplantación

### Compatibilidad
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Requiere cámara web funcional
- **Sistema básico**: Usa solo OpenCV y NumPy para procesamiento

### Rendimiento
- Detección en tiempo real con MediaPipe
- Procesamiento básico de imágenes
- Embeddings simples para almacenamiento eficiente

## Instalación de Dependencias

### Backend
```bash
pip install -r requirements.txt
```

**Nota**: El sistema ahora usa solo OpenCV y NumPy, eliminando dependencias complejas como dlib y face_recognition.

### Frontend
Las dependencias de MediaPipe se cargan automáticamente desde CDN, no requieren instalación local.

## Archivos Principales

- `views/views.py`: Lógica principal de procesamiento de imágenes
- `static/js/facemesh.js`: Integración con MediaPipe
- Interfaces redirigen al frontend React

## Consideraciones de Uso

1. **Iluminación**: Requiere buena iluminación frontal
2. **Posición**: El rostro debe estar centrado y a distancia adecuada
3. **Calidad**: La cámara debe tener resolución mínima de 480p
4. **Privacidad**: Los embeddings básicos no permiten reconstruir la imagen original

## Troubleshooting

### Error: OpenCV no funciona
- Verificar instalación: `pip list | grep opencv`
- Reinstalar con: `pip install opencv-python`

### Error: NumPy no funciona
- Verificar instalación: `pip list | grep numpy`
- Reinstalar con: `pip install numpy`

### MediaPipe no carga
- Verificar conexión a internet (se carga desde CDN)
- Verificar permisos de cámara en el navegador