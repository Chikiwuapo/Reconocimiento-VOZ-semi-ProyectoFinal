# Documentación Detallada (Frontend + Backend)

> Plataforma educativa para reconocimiento de gestos de manos y operaciones aritméticas con IA. Frontend moderno con React + Tailwind, y backend en Django REST. La cámara es el foco principal: la experiencia se ha optimizado para móviles y escritorio con dark mode.

## Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Frontend](#frontend)
- [Backend](#backend)
- [Variables de Entorno](#variables-de-entorno)
- [Endpoints API](#endpoints-api)
- [Flujo de Funcionamiento](#flujo-de-funcionamiento)
- [Accesibilidad y UX](#accesibilidad-y-ux)
- [Pruebas, Lint y Formato](#pruebas-lint-y-formato)
- [Solución de Problemas](#solución-de-problemas)
- [Roadmap](#roadmap)
- [Contribución](#contribución-1)

## Arquitectura General

```mermaid
flowchart LR
  subgraph Browser [Frontend React]
    UI[UI/UX
    Tailwind + Framer] --> Store[Zustand / userStore]
    UI --> MediaPipe[MediaPipe (Web)]
    UI --> Router[react-router]
  end

  subgraph Django [Backend Django REST]
    API[(REST API)]
    DB[(SQLite / PostgreSQL)]
  end

  MediaPipe --> UI
  Store <--> UI
  UI <--> API
  API <--> DB
```

## Estructura del Proyecto

```
.
├─ backend/
│  ├─ operaciones/
│  │  ├─ models.py
│  │  ├─ views.py
│  │  ├─ urls.py
│  │  └─ migrations/
│  ├─ manage.py
│  └─ requirements.txt
└─ frontend/
   └─ src/
      ├─ App.tsx / App.css
      ├─ auth/
      │  └─ userStore.ts           # estado de usuario, cursos vistos, modelos
      ├─ components/
      │  ├─ Blackboard/
      │  │  ├─ Navbar.tsx
      │  │  ├─ Layout.tsx
      │  │  ├─ HeroUnified.tsx
      │  │  ├─ ActivityCard.tsx
      │  │  └─ ProfileModal.tsx
      │  ├─ Course/
      │  │  └─ CourseCard.tsx
      │  └─ LandingComponents/
      │     ├─ PromoCarousel.tsx
      │     └─ OurTeam.tsx
      ├─ pages/
      │  └─ Blackboard/
      │     ├─ Dashboard.tsx
      │     └─ Arithmetic/
      │        ├─ Arithmetic.tsx
      │        ├─ hooks/useArithmetic.ts
      │        └─ services/arithmeticService.ts
      └─ assets/ ...
```

## Stack Tecnológico

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, React Router.
- **Vision / IA en cliente**: MediaPipe Hands (desde CDN), WebRTC para cámara.
- **Estado**: Zustand (`userStore`) para perfil, cursos, modelos favoritos.
- **Backend**: Django, Django REST Framework, django-cors-headers, SQLite (dev) o PostgreSQL (prod).
- **Build**: Vite o CRA (según configuración del proyecto).

## Instalación y Puesta en Marcha

### Requisitos

- Python 3.8+
- Node.js 18+
- Navegador moderno con cámara

### Backend (Django)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Servidor local: http://127.0.0.1:8000/

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Aplicación web: http://localhost:5173/ (según dev server)

## Frontend

- **Theming**: `useTheme()` en `App.tsx` expone `isDarkMode` y `toggleDarkMode`. Componentes clave como `Layout`, `Navbar`, `HeroUnified`, `ProfileModal` respetan el tema.
- **Navegación**: `react-router-dom` con rutas como `Dashboard` y `Arithmetic`. En móvil, el `Navbar.tsx` incluye menú hamburguesa (dropdown) con accesos a vistas y Perfil.
- **Dashboard**:
  - `HeroUnified.tsx`: hero 3D (Spline) + tarjetas de métricas. En móvil, las 4 tarjetas se muestran bajo el hero en grid.
  - Cursos destacados con `CourseCard.tsx` y animaciones `framer-motion`.
- **Aritmética**:
  - `Arithmetic.tsx`: la cámara es el foco (aspect ratio adaptable). Botones uniformes (grid 2 columnas), acciones de Entrenamiento/Prueba y métricas de progreso.
  - `hooks/useArithmetic.ts`: encapsula lógica de MediaPipe, captura de frames, reconocimiento y entrenamiento.
- **Estado de usuario**: `auth/userStore.ts` (Zustand) para nombre, email, avatar, cursos vistos y modelos favoritos.

## Backend

- **Framework**: Django + DRF.
- **App**: `operaciones/` agrupa modelos, vistas y rutas.
- **CORS**: Habilitado con `django-cors-headers` para permitir origen del frontend.
- **DB**: SQLite por defecto; en producción recomendado PostgreSQL.

### Ejemplo de configuración mínima (settings.py)

```python
INSTALLED_APPS = [
  ...,
  'rest_framework',
  'corsheaders',
  'operaciones',
]

MIDDLEWARE = [
  'corsheaders.middleware.CorsMiddleware',
  ...,
]

CORS_ALLOW_ALL_ORIGINS = True  # o especificar dominios permitidos
```

## Variables de Entorno

Crear `.env` (frontend/backend) si aplica:

```
# Backend
DJANGO_DEBUG=true
DB_URL=sqlite:///db.sqlite3

# Frontend
VITE_API_BASE=http://127.0.0.1:8000
```

En frontend, consume con `import.meta.env.VITE_API_BASE`.

## Endpoints API

> La capa API es sencilla y puede variar según la evolución del proyecto. Ejemplos típicos:

- `GET /operaciones/ping/` — salud del servicio.
- `POST /operaciones/gestos/` — registrar o entrenar gesto.
- `POST /operaciones/reconocer/` — reconocer gesto actual y devolver etiqueta/probabilidad.

Consultar `backend/operaciones/urls.py` y `views.py` para la lista vigente.

## Flujo de Funcionamiento

1. El usuario abre `Dashboard` y navega a `Aritmética`.
2. Permite acceso a la cámara; `useArithmetic` inicializa MediaPipe Hands.
3. En Entrenamiento: se graban muestras y se entrena un modelo sencillo (en cliente o mediante backend, según configuración). El progreso se muestra en tiempo real.
4. En Prueba: se reconoce el gesto y se interpreta como parte de una operación aritmética.
5. El usuario puede completar cursos/tutoriales desde el dashboard; el estado se refleja en `userStore`.

## Accesibilidad y UX

- Navegación por teclado y focos visibles en botones y menús.
- Contrastes adecuados para dark mode.
- Diseño responsive mobile-first. En móvil, las tarjetas del hero aparecen bajo la escena y el menú de navegación es desplegable.

## Pruebas, Lint y Formato

- Python: `flake8`/`black` (opcional) — agregar a `requirements-dev.txt` si se desea.
- Frontend: `eslint` + `prettier` (opcional). Scripts sugeridos:

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

## Solución de Problemas

- **Permisos de cámara**: verificar permisos del navegador; usar HTTPS en producción.
- **CORS**: revisar `django-cors-headers` y orígenes permitidos.
- **MediaPipe**: requiere internet (si se usa CDN); comprobar compatibilidad WebRTC del navegador.
- **Rendimiento**: cerrar pestañas con cámara activa, reducir resolución del canvas si el dispositivo es limitado.

## Roadmap

- Modo pantalla completa para la cámara en `Arithmetic`.
- Exportación/Importación de modelos entrenados.
- Panel de métricas de entrenamiento (tiempo, frames útiles, fps).
- Integración con autenticación real y roles.

## Contribución

1. Fork del proyecto.
2. Crear rama feature: `feat/nueva-funcionalidad`.
3. Commit con mensajes claros.
4. Pull Request con descripción y capturas.

---

 AresDigitalAcademy — Plataforma ML educativa.