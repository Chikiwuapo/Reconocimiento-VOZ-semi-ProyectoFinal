# 🤖 Sistema de Reconocimiento de Gestos con MediaPipe

Un sistema completo de reconocimiento de gestos de manos desarrollado con **Django** y **MediaPipe** que permite entrenar gestos personalizados y ejecutar acciones automáticamente.

## 🌟 Características

- ✅ **Reconocimiento en tiempo real** de gestos de manos
- ✅ **Entrenamiento personalizado** de nuevos gestos
- ✅ **Ejecución automática** de funciones asociadas a gestos
- ✅ **Interfaz web moderna** con MediaPipe desde CDN
- ✅ **API REST** completa para integración
- ✅ **Sistema de autenticación** de usuarios
- ✅ **Gestión de modelos** de machine learning
- ✅ **Estadísticas y métricas** de rendimiento

## 🛠️ Tecnologías Utilizadas

### Backend
- **Django 5.2.6** - Framework web
- **Django REST Framework** - API REST
- **MediaPipe 0.10.14** - Detección de landmarks de manos
- **OpenCV 4.10.0** - Procesamiento de imágenes
- **Scikit-learn 1.5.1** - Machine Learning
- **PostgreSQL** - Base de datos

### Frontend
- **MediaPipe desde CDN** - Detección en tiempo real
- **HTML5/CSS3/JavaScript** - Interfaz de usuario
- **Canvas API** - Visualización de landmarks

## 📋 Requisitos Previos

- **Python 3.8+**
- **PostgreSQL 12+**
- **Navegador web moderno** (Chrome, Firefox, Edge)
- **Cámara web** para captura de gestos

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Reconocimiento-VOZ-semi-ProyectoFinal
```

### 2. Configurar el Entorno Virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### 3. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar Base de Datos

#### Opción A: PostgreSQL (Recomendado)

1. **Instalar PostgreSQL** y crear una base de datos:
```sql
CREATE DATABASE gesture_recognition;
CREATE USER gesture_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE gesture_recognition TO gesture_user;
```

2. **Configurar variables de entorno** (crear archivo `.env` en `/backend/`):
```env
DEBUG=True
SECRET_KEY=tu_clave_secreta_aqui
DB_NAME=gesture_recognition
DB_USER=gesture_user
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
```

#### Opción B: SQLite (Para desarrollo rápido)

Si prefieres usar SQLite, modifica `backend/server/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### 5. Ejecutar Migraciones

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 6. Crear Superusuario (Opcional)

```bash
python manage.py createsuperuser
```

## 🎯 Ejecución del Proyecto

### 1. Iniciar el Servidor de Desarrollo

```bash
cd backend
python manage.py runserver
```

El servidor estará disponible en: **http://127.0.0.1:8000/**

### 2. Acceder a la Aplicación

Abre tu navegador y navega a:
- **Página principal**: http://127.0.0.1:8000/
- **Dashboard**: http://127.0.0.1:8000/dashboard/
- **Entrenamiento**: http://127.0.0.1:8000/training/
- **Reconocimiento**: http://127.0.0.1:8000/interaction/

## 📱 Uso del Sistema

### 1. Registro e Inicio de Sesión

1. Accede a la página principal
2. Regístrate con un nuevo usuario o inicia sesión
3. Serás redirigido al dashboard

### 2. Entrenar un Nuevo Gesto

1. Ve a la sección **"Entrenamiento"**
2. Ingresa un nombre para tu gesto
3. Haz clic en **"Iniciar Cámara"**
4. Permite el acceso a la cámara cuando se solicite
5. Realiza el gesto frente a la cámara
6. Haz clic en **"Capturar Muestra"** múltiples veces (mínimo 10 muestras)
7. Haz clic en **"Entrenar Modelo"** para crear el clasificador

### 3. Reconocimiento en Tiempo Real

1. Ve a la sección **"Interacción"**
2. Selecciona un gesto entrenado del dropdown
3. Haz clic en **"Iniciar Reconocimiento"**
4. Realiza el gesto frente a la cámara
5. El sistema detectará automáticamente el gesto y ejecutará la función asociada

### 4. Configurar Funciones de Gestos

Los gestos pueden ejecutar diferentes tipos de acciones:
- **Abrir aplicaciones** (calculadora, notepad, etc.)
- **Comandos del sistema** (apagar, reiniciar, etc.)
- **Acciones web** (abrir URLs)
- **Control de medios** (reproducir, pausar, etc.)
- **Scripts personalizados**
- **Notificaciones del sistema**

## 🔧 API Endpoints

### Autenticación
- `POST /auth/register/` - Registro de usuario
- `POST /auth/login/` - Inicio de sesión
- `POST /auth/logout/` - Cerrar sesión

### Gestos
- `GET /api/gestures/` - Listar gestos del usuario
- `POST /api/gestures/` - Crear nuevo gesto
- `DELETE /api/gestures/{id}/` - Eliminar gesto

### Entrenamiento
- `POST /api/training/start/` - Iniciar sesión de entrenamiento
- `POST /api/training/capture/` - Capturar muestra
- `POST /api/training/train/` - Entrenar modelo

### Reconocimiento
- `POST /api/recognize/` - Reconocer gesto
- `GET /api/available-gestures/` - Gestos disponibles
- `GET /api/statistics/` - Estadísticas de uso

## 📁 Estructura del Proyecto

```
Reconocimiento-VOZ-semi-ProyectoFinal/
├── backend/
│   ├── api/                    # Configuración de API
│   ├── operaciones/           # App principal
│   │   ├── models.py         # Modelos de base de datos
│   │   ├── views.py          # Vistas web
│   │   ├── api_views.py      # API endpoints
│   │   ├── gesture_recognition.py  # Lógica de ML
│   │   ├── gesture_functions.py   # Funciones ejecutables
│   │   └── templates/        # Templates HTML
│   ├── server/               # Configuración Django
│   ├── static/              # Archivos estáticos
│   ├── gesture_models/      # Modelos entrenados
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Frontend alternativo (React)
└── README.md
```

## 🐛 Solución de Problemas

### Error de Cámara
- **Problema**: "No se puede acceder a la cámara"
- **Solución**: Asegúrate de permitir el acceso a la cámara en tu navegador

### Error de MediaPipe
- **Problema**: "MediaPipe no se carga"
- **Solución**: Verifica tu conexión a internet (MediaPipe se carga desde CDN)

### Error de Base de Datos
- **Problema**: "No se puede conectar a la base de datos"
- **Solución**: Verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas

### Error de Dependencias
- **Problema**: "ModuleNotFoundError"
- **Solución**: Ejecuta `pip install -r requirements.txt` nuevamente

## 🔒 Consideraciones de Seguridad

- Las claves secretas deben configurarse en variables de entorno
- No subir archivos `.env` al repositorio
- Usar HTTPS en producción
- Configurar CORS apropiadamente para producción

## 🚀 Despliegue en Producción

### Variables de Entorno Requeridas
```env
DEBUG=False
SECRET_KEY=clave_secreta_muy_segura
ALLOWED_HOSTS=tu-dominio.com
DB_NAME=gesture_recognition_prod
DB_USER=usuario_prod
DB_PASSWORD=password_seguro
DB_HOST=host_base_datos
DB_PORT=5432
```

### Comandos de Despliegue
```bash
# Recopilar archivos estáticos
python manage.py collectstatic

# Aplicar migraciones
python manage.py migrate

# Usar servidor WSGI (Gunicorn)
pip install gunicorn
gunicorn server.wsgi:application
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [Tu GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- **MediaPipe** por la tecnología de detección de landmarks
- **Django** por el framework web
- **OpenCV** por el procesamiento de imágenes
- **Scikit-learn** por las herramientas de machine learning

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de **Solución de Problemas**
2. Busca en los **Issues** del repositorio
3. Crea un nuevo **Issue** con detalles del problema
4. Incluye logs de error y pasos para reproducir

**¡Disfruta creando gestos personalizados! 🎉**
