# Despliegue en Render - Backend Django

Este documento contiene las instrucciones para desplegar el backend del proyecto de Reconocimiento de Voz en Render.

## Archivos de Configuración

### 1. render.yaml
Archivo principal de configuración para Render que define:
- Servicio web Django con Python 3.11.0
- Base de datos PostgreSQL
- Variables de entorno necesarias
- Comandos de build y start

### 2. build.sh
Script de construcción que:
- Instala dependencias de Python
- Recolecta archivos estáticos
- Ejecuta migraciones de base de datos
- Crea superusuario (opcional)
- Inicializa modelos del chatbot

### 3. requirements.txt
Dependencias optimizadas para producción incluyendo:
- Django y Django REST Framework
- Bibliotecas ML/AI compatibles (TensorFlow, scikit-learn, etc.)
- PostgreSQL y herramientas de base de datos
- Servidor de producción (Gunicorn)
- WhiteNoise para archivos estáticos

## Pasos para el Despliegue

### 1. Preparación del Repositorio
```bash
# Asegúrate de que todos los archivos estén en el repositorio
git add .
git commit -m "Configuración para despliegue en Render"
git push origin main
```

### 2. Configuración en Render

1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio**: Conecta tu repositorio de GitHub/GitLab
3. **Usar render.yaml**: Render detectará automáticamente el archivo `render.yaml`

### 3. Variables de Entorno

Configura las siguientes variables en el dashboard de Render:

#### Variables Requeridas:
- `SECRET_KEY`: Clave secreta de Django (genera una nueva)
- `DEBUG`: `False` para producción
- `ALLOWED_HOSTS`: Tu dominio de Render (ej: `tu-app.onrender.com`)
- `CORS_ALLOWED_ORIGINS`: Dominios permitidos para CORS
- `CSRF_TRUSTED_ORIGINS`: Dominios confiables para CSRF

#### Variables Automáticas:
- `DATABASE_URL`: Se configura automáticamente con PostgreSQL

### 4. Configuración de Base de Datos

La base de datos PostgreSQL se crea automáticamente según `render.yaml`. Las migraciones se ejecutan durante el build.

## Características del Despliegue

### Seguridad
- HTTPS forzado en producción
- Headers de seguridad configurados
- CORS y CSRF configurados correctamente

### Rendimiento
- WhiteNoise para servir archivos estáticos
- Gunicorn como servidor WSGI
- Configuración optimizada para producción

### Compatibilidad
- Versiones compatibles de bibliotecas ML/AI
- Manejo de errores para dependencias opcionales
- Soporte para múltiples tipos de base de datos

## Solución de Problemas

### Error de Build
- Verifica que `build.sh` tenga permisos de ejecución
- Revisa los logs de build en Render
- Asegúrate de que todas las dependencias estén en `requirements.txt`

### Error de Base de Datos
- Verifica que `DATABASE_URL` esté configurada
- Revisa las migraciones en los logs
- Asegúrate de que el servicio de PostgreSQL esté activo

### Error de Archivos Estáticos
- Verifica que `STATIC_ROOT` esté configurado
- Asegúrate de que WhiteNoise esté en `MIDDLEWARE`
- Revisa que `collectstatic` se ejecute en el build

## Monitoreo

- **Logs**: Disponibles en el dashboard de Render
- **Métricas**: CPU, memoria y tráfico en tiempo real
- **Health Checks**: Configurados automáticamente

## Actualizaciones

Para actualizar el despliegue:
1. Haz push de los cambios al repositorio
2. Render detectará automáticamente los cambios
3. Se ejecutará un nuevo build y despliegue

## Contacto

Para problemas específicos del despliegue, revisa:
- Logs de Render
- Documentación oficial: https://render.com/docs
- Este archivo de configuración