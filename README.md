# Reconocimiento de Gestos con MediaPipe y Django

Este proyecto implementa un sistema de reconocimiento de gestos de manos utilizando MediaPipe (desde CDN) y Django como backend.

## Características

- Reconocimiento de gestos de manos en tiempo real
- Interfaz web interactiva
- Backend Django para gestión de datos
- Uso de MediaPipe desde CDN (sin instalación local)
- Calculadora con gestos de manos

## Requisitos del Sistema

- Python 3.8 o superior
- Navegador web moderno con soporte para cámara web
- Conexión a internet (para MediaPipe CDN)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Reconocimiento-VOZ-semi-ProyectoFinal
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# En Windows
venv\Scripts\activate

# En Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar la base de datos

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

## Ejecución

### 1. Iniciar el servidor Django

```bash
cd backend
python manage.py runserver
```

### 2. Acceder a la aplicación

Abrir el navegador y navegar a:
```
http://127.0.0.1:8000/operaciones/
```

## Uso de la Aplicación

1. **Permitir acceso a la cámara**: Al cargar la página, el navegador solicitará permisos para acceder a la cámara web.

2. **Entrenar gestos**: 
   - Hacer clic en "Entrenar Gesto"
   - Realizar el gesto frente a la cámara
   - Asignar un valor numérico al gesto
   - Guardar el gesto entrenado

3. **Usar la calculadora**:
   - Los gestos entrenados aparecerán como botones
   - Realizar operaciones matemáticas usando gestos
   - Ver resultados en tiempo real

## Estructura del Proyecto

```
backend/
├── operaciones/           # App principal de Django
│   ├── models.py         # Modelos de datos
│   ├── views.py          # Vistas y lógica del backend
│   ├── urls.py           # URLs de la aplicación
│   └── migrations/       # Migraciones de base de datos
├── ejemplo_frontend.html # Interfaz principal
├── manage.py            # Script de gestión de Django
├── requirements.txt     # Dependencias del proyecto
└── db.sqlite3          # Base de datos SQLite
```

## Tecnologías Utilizadas

- **Backend**: Django 5.2.6, Django REST Framework
- **Frontend**: HTML5, CSS3, JavaScript
- **Reconocimiento de gestos**: MediaPipe (CDN)
- **Base de datos**: SQLite
- **Cámara web**: WebRTC API

## Dependencias

Las dependencias principales están listadas en `requirements.txt`:

- Django 5.2.6
- django-cors-headers
- djangorestframework
- django-environ

**Nota**: MediaPipe se carga desde CDN, por lo que no requiere instalación local.

## Solución de Problemas

### Error de permisos de cámara
- Verificar que el navegador tenga permisos para acceder a la cámara
- Usar HTTPS en producción para acceso a cámara

### Error de CORS
- Verificar que `django-cors-headers` esté instalado y configurado
- Revisar la configuración de CORS en `settings.py`

### Error de MediaPipe
- Verificar conexión a internet
- Comprobar que el navegador soporte WebRTC

## Contribución

1. Fork el proyecto
2. Crear una rama para la nueva característica
3. Commit los cambios
4. Push a la rama
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.