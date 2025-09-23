# Frontend — React + TypeScript + Tailwind

Interfaz de usuario para la plataforma de reconocimiento de gestos. Incluye dashboard, navegado responsive (con menú móvil), hero con Spline 3D, y vista de Aritmética con cámara como foco.

## Tabla de Contenidos

- Estructura de carpetas
- Librerías y utilidades
- Theming y dark mode
- Navegación y rutas
- Vista de Aritmética (cámara y acciones)
- Estado (userStore)
- Scripts de desarrollo

## Estructura de carpetas

```
frontend/
└─ src/
   ├─ App.tsx / App.css
   ├─ auth/
   │  └─ userStore.ts
   ├─ components/
   │  ├─ Blackboard/
   │  │  ├─ Navbar.tsx          # Navbar responsive con menú móvil y dark mode
   │  │  ├─ Layout.tsx          # Layout general de páginas
   │  │  ├─ HeroUnified.tsx     # Hero con Spline y tarjetas
   │  │  ├─ ActivityCard.tsx
   │  │  └─ ProfileModal.tsx    # Modal de perfil (tema oscuro soportado)
   │  ├─ Course/
   │  │  └─ CourseCard.tsx
   │  └─ LandingComponents/
   │     ├─ PromoCarousel.tsx
   │     └─ OurTeam.tsx
   └─ pages/
      └─ Blackboard/
         ├─ Dashboard.tsx
         └─ Arithmetic/
            ├─ Arithmetic.tsx        # Cámara, botones de acciones y métricas
            ├─ hooks/useArithmetic.ts
            └─ services/arithmeticService.ts
```

## Librerías y utilidades

- React 18 + TypeScript
- Vite (dev server y build)
- Tailwind CSS (estilos utilitarios)
- Framer Motion (animaciones, hero y cards)
- @splinetool/react-spline (escena 3D del hero)
- react-router-dom (rutas)
- Zustand (`auth/userStore.ts`) para estado de usuario y cursos

## Theming y dark mode

- El hook `useTheme()` expone `isDarkMode` y `toggleDarkMode`.
- Componentes como `Layout`, `Navbar`, `HeroUnified`, `ProfileModal` usan clases condicionales para asegurar contraste y legibilidad.

## Navegación y rutas

- `Navbar.tsx`: menú de escritorio y menú móvil (hamburguesa). En móvil, el dropdown incluye accesos a Inicio, Modelos, Perfil y Cerrar sesión.
- Rutas principales: `Dashboard` y `Arithmetic`.

## Vista de Aritmética

- `Arithmetic.tsx` centra la cámara con un contenedor responsive (`aspect-[4/3]` en móvil y `aspect-video` en escritorio).
- Acciones distribuidas en grilla 2 columnas, botones con altura uniforme (`h-12`) para Entrenamiento y Prueba.
- `useArithmetic.ts` encapsula interacción con MediaPipe y la lógica de captura/entrenamiento/recognición.

## Estado (userStore)

- `auth/userStore.ts` maneja perfil (nombre, email, avatar), cursos vistos, modelos y favoritos. Expone utilidades como `toggleFavorite`, `recordCourseCompleted`, `updateProfile`, `setAvatar`.

## Scripts de desarrollo

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

Ejecutar:

```bash
npm install
npm run dev
```
