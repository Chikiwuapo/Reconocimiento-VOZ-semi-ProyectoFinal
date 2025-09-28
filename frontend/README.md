# 🎯 Frontend - Sistema de Reconocimiento Multimodal

## 📋 Descripción del Proyecto

Este es el frontend de un sistema avanzado de **reconocimiento multimodal** que integra tecnologías de **Inteligencia Artificial** para el reconocimiento facial, de voz y gestos. La aplicación está construida con **React 19**, **TypeScript** y **Tailwind CSS**, ofreciendo una experiencia de usuario moderna y fluida.

## ✨ Características Principales

### 🔐 **Autenticación Biométrica**
- **Registro facial**: Captura múltiple de rostros con MediaPipe
- **Login facial**: Autenticación mediante reconocimiento facial
- **Validación en tiempo real**: Detección de rostros con feedback visual
- **Consentimiento de datos**: Modal de autorización para captura biométrica

### 🎤 **Reconocimiento de Voz**
- **Patrones vocálicos**: Reconocimiento de vocales A-E-I-O-U
- **Palabras clave**: Detección de comandos específicos
- **Abecedario completo**: Reconocimiento de letras
- **Métricas de precisión**: Análisis de confianza en tiempo real

### 👋 **Reconocimiento de Gestos**
- **Operaciones matemáticas**: Suma, resta, multiplicación, división
- **Gestos de manos**: Detección con MediaPipe Hands
- **Validación gestual**: Confirmación de operaciones aritméticas
- **Feedback visual**: Indicadores de confianza y precisión

### 📊 **Dashboard Administrativo**
- **Métricas en tiempo real**: CPU, RAM, almacenamiento, red
- **Analytics avanzados**: Usuarios activos, sesiones, precisión global
- **Modelos de IA**: Rendimiento y estadísticas de cada modelo
- **Visualizaciones interactivas**: Gráficos dinámicos y modales detallados

### 🎓 **Sistema de Cursos**
- **Cursos especializados**: Reconocimiento facial, voz y gestos
- **Progreso gamificado**: Sistema de XP y recompensas
- **Misiones**: Tareas específicas con diferentes dificultades
- **Certificaciones**: Validación de conocimientos adquiridos

## 🛠️ Tecnologías Utilizadas

### **Core Framework**
- **React 19.1.1** - Framework principal
- **TypeScript 5.8.3** - Tipado estático
- **Vite 7.1.2** - Build tool y dev server

### **Styling & UI**
- **Tailwind CSS 4.1.13** - Framework de CSS utility-first
- **Framer Motion 12.23.15** - Animaciones y transiciones
- **GSAP 3.13.0** - Animaciones avanzadas
- **Lucide React 0.544.0** - Iconografía moderna

### **Routing & Navigation**
- **React Router DOM 7.9.1** - Enrutamiento SPA

### **3D & Multimedia**
- **Spline React 4.1.0** - Modelos 3D interactivos
- **MediaPipe** - Procesamiento de video y detección facial

### **Development Tools**
- **ESLint 9.33.0** - Linting de código
- **PostCSS 8.5.6** - Procesamiento de CSS
- **Autoprefixer 10.4.21** - Compatibilidad CSS

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   └── logo-a.svg                    # Logo de la aplicación
├── src/
│   ├── assets/                       # Recursos estáticos
│   │   ├── avatar.svg
│   │   ├── placeholder.svg
│   │   └── react.svg
│   ├── auth/                         # Sistema de autenticación
│   │   ├── AuthFlowPage.tsx         # Flujo de autenticación
│   │   ├── storage.ts               # Almacenamiento local
│   │   ├── types.ts                 # Tipos de autenticación
│   │   ├── useFaceCapture.ts        # Hook para captura facial
│   │   └── userStore.tsx            # Store de usuario
│   ├── components/                   # Componentes reutilizables
│   │   ├── Blackboard/              # Componentes del dashboard
│   │   │   ├── ActivityCard.tsx
│   │   │   ├── HeroUnified.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── MissionEffects.tsx
│   │   │   ├── MissionsPanel.tsx
│   │   │   ├── ModelDetailsModal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── ProfileModal.tsx
│   │   │   └── RobotSpline.tsx
│   │   ├── Course/                  # Componentes de cursos
│   │   │   ├── Comments.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── InstructorCard.tsx
│   │   │   ├── LessonContent.tsx
│   │   │   ├── LessonSidebar.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── LandingComponents/       # Componentes de landing
│   │   │   ├── Benefits.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Examples.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── OurTeam.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── PromoCarousel.tsx
│   │   │   ├── Registration.tsx
│   │   │   ├── ScrollStack.tsx
│   │   │   └── Security.tsx
│   │   ├── stepper/                 # Componentes de pasos
│   │   │   ├── Modal.tsx
│   │   │   ├── StepLoginFace.tsx
│   │   │   ├── StepLoginForm.tsx
│   │   │   ├── StepRegisterFace.tsx
│   │   │   ├── StepRegisterForm.tsx
│   │   │   └── Stepper.tsx
│   │   ├── background/
│   │   │   └── DotGrid.tsx          # Fondo animado
│   │   └── SplashScreen.tsx         # Pantalla de carga
│   ├── pages/                       # Páginas principales
│   │   ├── Blackboard/              # Dashboard y herramientas
│   │   │   ├── Arithmetic/          # Operaciones matemáticas
│   │   │   ├── Dashboard.tsx        # Dashboard principal
│   │   │   ├── Dashboard_admin.tsx  # Dashboard administrativo
│   │   │   └── Models.tsx           # Gestión de modelos
│   │   ├── Courses/
│   │   │   └── CoursePage.tsx       # Página de cursos
│   │   ├── Dashboard-admin/         # Administración avanzada
│   │   │   ├── UI/
│   │   │   ├── hook/
│   │   │   └── service/
│   │   └── landing/
│   │       └── Landing.tsx          # Página de inicio
│   ├── services/                    # Servicios y APIs
│   │   └── authService.ts           # Servicio de autenticación
│   ├── styles/                      # Estilos adicionales
│   │   └── udemy-cards.css
│   ├── types/                       # Definiciones de tipos
│   │   ├── index.ts
│   │   └── motion-react.d.ts
│   ├── App.tsx                      # Componente principal
│   ├── main.tsx                     # Punto de entrada
│   ├── index.css                    # Estilos globales
│   └── vite-env.d.ts               # Tipos de Vite
├── package.json                     # Dependencias y scripts
├── vite.config.ts                   # Configuración de Vite
├── tailwind.config.js               # Configuración de Tailwind
├── tsconfig.json                    # Configuración de TypeScript
└── README.md                        # Este archivo
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cámara web (para funcionalidades de reconocimiento facial)
- Micrófono (para reconocimiento de voz)

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local
VITE_API_URL=http://localhost:8000
VITE_MEDIAPIPE_CDN=https://cdn.jsdelivr.net/npm/@mediapipe
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:5173
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Construcción
npm run build        # Construye la aplicación para producción

# Linting
npm run lint         # Ejecuta ESLint para verificar el código

# Preview
npm run preview      # Previsualiza la build de producción
```

## 🎯 Funcionalidades Detalladas

### **1. Sistema de Autenticación Biométrica**

#### **Registro Facial**
- Captura múltiple de rostros (5 muestras por defecto)
- Detección en tiempo real con MediaPipe Face Mesh
- Validación de posición y calidad del rostro
- Feedback visual con indicadores de estado
- Modal de consentimiento para protección de datos

#### **Login Facial**
- Autenticación mediante comparación de embeddings faciales
- Detección automática de rostro en tiempo real
- Validación de confianza y precisión
- Redirección automática tras autenticación exitosa

### **2. Dashboard Administrativo Avanzado**

#### **Métricas del Sistema**
- **CPU**: Uso en tiempo real con gráficos de área
- **RAM**: Memoria utilizada con visualización de onda
- **Almacenamiento**: Espacio en disco con gráfico circular
- **Red**: Latencia y velocidad con gráficos lineales
- **Uptime**: Tiempo de actividad con barras

#### **Analytics de Usuario**
- Usuarios totales y activos
- Sesiones diarias
- Tiempo promedio de sesión
- Precisión global del sistema
- Distribución de tipos de reconocimiento

#### **Modelos de IA**
- Rendimiento individual de cada modelo
- Estadísticas de uso y precisión
- Modelos de voz, facial y gestos
- Métricas de velocidad de procesamiento

### **3. Sistema de Reconocimiento Multimodal**

#### **Reconocimiento Facial**
- Detección con MediaPipe Face Mesh
- Extracción de embeddings faciales
- Comparación con base de datos
- Validación de confianza en tiempo real

#### **Reconocimiento de Voz**
- Patrones vocálicos (A, E, I, O, U)
- Reconocimiento de palabras clave
- Abecedario completo
- Análisis de confianza y precisión

#### **Reconocimiento de Gestos**
- Operaciones matemáticas básicas
- Detección de gestos de manos
- Validación de operaciones aritméticas
- Feedback visual en tiempo real

### **4. Sistema de Cursos y Gamificación**

#### **Cursos Disponibles**
- Reconocimiento Facial Avanzado
- Reconocimiento de Voz con IA
- Operaciones Matemáticas con Gestos
- Desarrollo de Agentes IA
- Construcción de Chatbots

#### **Sistema de Misiones**
- Tareas con diferentes dificultades
- Sistema de recompensas XP
- Progreso gamificado
- Certificaciones por completar cursos

## 🎨 Temas y Personalización

### **Tema Oscuro por Defecto**
- Diseño moderno con colores oscuros
- Gradientes y efectos de cristal (glassmorphism)
- Animaciones fluidas con Framer Motion
- Componentes responsivos

### **Paleta de Colores**
- **Primario**: `#5227FF` (Púrpura)
- **Fondo**: `#0A0A0A` (Negro profundo)
- **Superficie**: `#1A1A1A` (Gris oscuro)
- **Texto**: `#F5F5F5` (Blanco suave)
- **Acentos**: Gradientes multicolor

## 🔧 Configuración Avanzada

### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5227FF',
        dark: '#0A0A0A'
      }
    }
  }
}
```

## 🧪 Testing y Calidad

### **Linting**
- ESLint configurado con reglas estrictas
- Verificación de hooks de React
- Compatibilidad con TypeScript

### **Tipos TypeScript**
- Tipado estricto en toda la aplicación
- Interfaces para datos de reconocimiento
- Tipos para componentes y hooks

## 🚀 Deployment

### **Build de Producción**
```bash
npm run build
```

### **Optimizaciones**
- Code splitting automático
- Lazy loading de componentes
- Optimización de assets
- Minificación de código

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Frontend Developer**: Desarrollo de la interfaz y experiencia de usuario
- **AI Engineer**: Integración de modelos de reconocimiento
- **UX/UI Designer**: Diseño de la experiencia de usuario

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Email**: support@aresdigitalacademy.com
- **Documentación**: [Enlace a la documentación]
- **Issues**: [Enlace al repositorio de issues]

---

**🎯 Sistema de Reconocimiento Multimodal - Frontend**  
*Desarrollado con ❤️ por AresDigitalAcademy*
