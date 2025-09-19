# 🔐 Sistema de Reconocimiento Facial

## 📋 ¿Qué es el proyecto?

Este es un sistema completo de **reconocimiento facial** desarrollado con Django y React que permite a los usuarios registrarse y autenticarse utilizando su rostro como método de identificación biométrica.

## 🎯 ¿Qué función tiene?

El sistema implementa dos funcionalidades principales:

### 🔑 **Autenticación Facial**
- **Registro de usuarios:** Captura múltiples fotos del rostro para crear un perfil biométrico único
- **Login facial:** Autenticación mediante reconocimiento facial en tiempo real
- **Sistema de voting:** Utiliza 7 frames con algoritmo de voting para mayor precisión en el reconocimiento

### 🛡️ **Seguridad Biométrica**
- Procesamiento de embeddings faciales con **Mediapipe**
- Almacenamiento seguro en base de datos **MySQL**
- Integración completa con el sistema de autenticación de **Django**

## ⚙️ ¿Qué se hace?

1. **Registro:** El usuario proporciona sus datos personales y toma múltiples fotos de su rostro
2. **Procesamiento:** El sistema genera embeddings faciales únicos usando Mediapipe
3. **Almacenamiento:** Los datos se guardan en MySQL con relación Usuario↔Persona
4. **Login:** El usuario se posiciona frente a la cámara para el reconocimiento
5. **Reconocimiento:** El sistema compara el rostro actual con todos los embeddings almacenados
6. **Autenticación:** Si hay match exitoso, el usuario queda autenticado automáticamente

## 🔌 Endpoints para Postman

### 📝 **Endpoint de Registro**

**POST** `http://localhost:8000/api/reconocimiento/register/`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "username": "juan_perez",
    "email": "juan@email.com",
    "dni": "12345678",
    "images": [
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    ]
}
```

**Response (Éxito):**
```json
{
    "status": "ok",
    "person_id": 1,
    "user_id": 1,
    "username": "juan_perez",
    "email": "juan@email.com",
    "dni": "12345678",
    "images_saved": 3,
    "message": "Registro exitoso. Se procesaron 3 imágenes."
}
```

### 🔐 **Endpoint de Login Facial**

**POST** `http://localhost:8000/api/reconocimiento/phase1/`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
    "frames": [
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995200000,
            "frame_number": 1
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995200500,
            "frame_number": 2
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995201000,
            "frame_number": 3
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995201500,
            "frame_number": 4
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995202000,
            "frame_number": 5
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995202500,
            "frame_number": 6
        },
        {
            "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
            "timestamp": 1640995203000,
            "frame_number": 7
        }
    ],
    "user_id": "test_user",
    "session_id": "session_test_123"
}
```

**Response (Reconocimiento Exitoso):**
```json
{
    "status": "ok",
    "matched": true,
    "person_id": 1,
    "score": 0.85,
    "confidence": 0.92,
    "frames_processed": 7,
    "current_attempts": 0,
    "max_attempts": 3,
    "message": "¡Bienvenido juan_perez! Reconocimiento exitoso.",
    "username": "juan_perez"
}
```

**Response (Reconocimiento Fallido):**
```json
{
    "status": "ok",
    "matched": false,
    "person_id": null,
    "score": 0.45,
    "confidence": 0.52,
    "frames_processed": 7,
    "current_attempts": 1,
    "max_attempts": 3,
    "message": "No se pudo verificar tu identidad. Verifica la iluminación y posición del rostro."
}
```

## 🚀 Cómo ejecutar el proyecto

### 1️⃣ **Crear Entorno Virtual**
```bash
python -m venv env
```

### 2️⃣ **Activar Entorno Virtual**
```bash
.\env\Scripts\activate
```

### 3️⃣ **Navegar al Backend**
```bash
cd backend
```

### 4️⃣ **Instalar Dependencias**
```bash
pip install -r requirements.txt
```

### 5️⃣ **Configurar Variables de Entorno**

Copia el archivo `.env.example` y renómbralo a `.env`:
```bash
copy .env.example .env
```

**🗄️ Configuración de Base de Datos:**

El proyecto está configurado para usar **SQLite por defecto** (no requiere instalación adicional).

**Para usar SQLite (Recomendado para desarrollo):**
- No necesitas cambiar nada en el archivo `.env`
- El archivo `db.sqlite3` se creará automáticamente

**Para usar MySQL (Opcional):**
1. Instala MySQL en tu sistema
2. Crea una base de datos llamada `reconocimiento_voz_db`
3. Edita el archivo `.env` y cambia:
   ```
   DB_ENGINE=mysql
   DB_NAME=reconocimiento_voz_db
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   ```

### 6️⃣ **Crear Migraciones**
```bash
python manage.py makemigrations
```

### 7️⃣ **Aplicar Migraciones**
```bash
python manage.py migrate
```

### 8️⃣ **Ejecutar Servidor Backend**
```bash
python manage.py runserver
```

### 9️⃣ **Configurar Frontend (Opcional)**

Si quieres ejecutar también el frontend React:

1. **Abrir nueva terminal** y navegar al frontend:
```bash
cd frontend
```

2. **Instalar dependencias de Node.js:**
```bash
npm install
```

3. **Ejecutar servidor de desarrollo:**
```bash
npm run dev
```

### ✅ **¡Listo!**
- **Backend:** `http://127.0.0.1:8000/`
- **Frontend:** `http://localhost:5173/` (si ejecutaste el frontend)

---

**🎯 Sistema desarrollado con Django + MySQL + Mediapipe para reconocimiento facial biométrico**
