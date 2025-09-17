# Proyecto Full‑Stack: React + Vite + TypeScript (Frontend) / Django + DRF + MySQL (Backend)

Este repositorio contiene una plantilla full‑stack con:

- Frontend: React + Vite + TypeScript (`frontend/`)
- Backend: Django + Django REST Framework + CORS (`backend/`)
- Base de datos en desarrollo: SQLite por defecto (para iniciar rápido)
- Base de datos en producción/real: MySQL (conmutación por `.env`)

---

## Requisitos previos

- Node.js 18+ y npm
- Python 3.10+ (Windows: `py` launcher recomendado)
- MySQL Server (opcional para desarrollo inicial; requerido si vas a usar MySQL de inmediato)

> Nota Windows: PowerShell es recomendado. Si usas `cmd`, adapta los comandos de activación del entorno virtual.

---

## Estructura del proyecto

```
Reconocimiento-de-voz/
├─ backend/
│  ├─ api/
│  │  ├─ urls.py           # rutas de la API (incluye /health/)
│  │  └─ views.py          # vistas DRF/JSON (endpoint de salud)
│  ├─ server/
│  │  ├─ __init__.py       # pymysql.install_as_MySQLdb()
│  │  ├─ settings.py       # configuración Django, DRF, CORS, DB
│  │  └─ urls.py           # rutas raíz (incluye api.urls)
│  ├─ manage.py
│  ├─ venv/                # entorno virtual (local)
│  └─ .env                 # variables de entorno del backend
└─ frontend/
   ├─ src/
   │  └─ App.tsx           # ejemplo: consulta GET /api/health/
   ├─ vite.config.ts       # proxy /api -> http://127.0.0.1:8000
   └─ package.json
```

---

## Inicio rápido (desarrollo)

### 1) Backend (Django)

Desde `backend/`:

- Crear/activar entorno virtual (si no está activo):
  - PowerShell:
    ```powershell
    py -m venv venv
    .\venv\Scripts\Activate.ps1
    ```
- Instalar dependencias:
  ```powershell
  python -m pip install --upgrade pip
  pip install django djangorestframework django-cors-headers pymysql django-environ
  ```
- Migraciones (usa SQLite por defecto):
  ```powershell
  python manage.py migrate
  ```
- Arrancar servidor:
  ```powershell
  python manage.py runserver
  ```
- Probar endpoint de salud:
  - http://127.0.0.1:8000/api/health/

### 2) Frontend (Vite)

Desde `frontend/`:

- Instalar dependencias:
  ```powershell
  npm install
  ```
- Arrancar servidor de desarrollo:
  ```powershell
  npm run dev
  ```
- Abrir en el navegador:
  - http://localhost:5173/
  - En pantalla verás “Backend health: ok” si el backend está arriba.

> El proxy de Vite redirige cualquier llamada que empiece con `/api` hacia `http://127.0.0.1:8000`. Configurado en `frontend/vite.config.ts`.

---

## Variables de entorno (backend/.env)

Archivo `backend/.env` de ejemplo (ya creado):

```
# Django
DEBUG=True
SECRET_KEY=dev-secret-key-change-me
ALLOWED_HOSTS=localhost,127.0.0.1

# Database engine: sqlite (default) o mysql
DB_ENGINE=sqlite

# MySQL (solo si usas DB_ENGINE=mysql)
MYSQL_DATABASE=app_db
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306

# CORS (Vite dev server)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> Cambia `SECRET_KEY` en producción. En desarrollo puedes dejarlo así.

---

## Cambiar a MySQL

1) Asegúrate de que MySQL Server esté corriendo y crea base de datos/usuario (ejemplo):
   ```sql
   CREATE DATABASE app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'tu_password';
   GRANT ALL PRIVILEGES ON app_db.* TO 'app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2) Edita `backend/.env`:
   ```env
   DB_ENGINE=mysql
   MYSQL_DATABASE=app_db
   MYSQL_USER=app_user
   MYSQL_PASSWORD=tu_password
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   ```

3) Reinicia el servidor de Django y aplica migraciones contra MySQL:
   ```powershell
   python manage.py migrate
   ```

> La configuración de DB en `backend/server/settings.py` conmuta en función de `DB_ENGINE`.

---

## Comandos útiles

- Backend:
  - Activar venv (PowerShell): `./venv/Scripts/Activate.ps1`
  - Migraciones: `python manage.py makemigrations && python manage.py migrate`
  - Superusuario: `python manage.py createsuperuser`
  - Correr servidor: `python manage.py runserver`

- Frontend:
  - Instalar deps: `npm install`
  - Dev server: `npm run dev`
  - Build: `npm run build`
  - Preview build: `npm run preview`

---

## Endpoints iniciales

- `GET /api/health/` → `{ "status": "ok" }`

> Agrega más rutas en `backend/api/urls.py` y vistas en `backend/api/views.py`. Recuerda incluirlas en `server/urls.py` si creas nuevos módulos.

---

## CORS y Proxy

- CORS: Configurado en `backend/server/settings.py` con `django-cors-headers`.
- Proxy Vite: Configurado en `frontend/vite.config.ts` para evitar problemas de CORS en desarrollo (`/api` → `http://127.0.0.1:8000`).

---

## Solución de problemas (Troubleshooting)

- Error de conexión MySQL durante `migrate`:
  - Verifica que el servicio MySQL esté activo y que `DB_ENGINE=mysql` junto con credenciales en `.env` sean correctos.
  - Si solo estás desarrollando el frontend/backend, usa `DB_ENGINE=sqlite` para avanzar sin MySQL.

- Vite no arranca en 5173:
  - Verifica si hay otro proceso ocupando el puerto o usa: `npm run dev -- --port 5174 --host`.

- CORS bloqueado:
  - Asegura que `CORS_ALLOWED_ORIGINS` contenga el origen del frontend (`http://localhost:5173`).

- No carga el endpoint `/api/health/` desde el frontend:
  - Verifica que el backend esté corriendo en `http://127.0.0.1:8000`.
  - Revisa el proxy en `vite.config.ts`.

---

## Siguientes pasos sugeridos

- Crear un CRUD de ejemplo con DRF (por ejemplo, `tasks`).
- Autenticación con JWT (djangorestframework-simplejwt) y consumo desde el frontend.
- Configuración de producción (servir frontend compilado, Nginx, Gunicorn/Uvicorn, etc.).
- Docker/Docker Compose para orquestar backend, frontend y MySQL.
