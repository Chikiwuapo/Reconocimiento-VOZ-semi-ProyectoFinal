import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve'
  const isProd = mode === 'production'

  return {
    plugins: [react()],
    
    // Build configuration for production
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            // Removed MediaPipe from manual chunks to avoid build issues
          },
        },
      },
    },

    // Development server configuration
    server: {
      host: true,
      port: 5173,
      // Only use proxy in development
      proxy: isDev ? {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/operaciones': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // Importante: NO proxyear todas las rutas de /vocales para evitar capturar rutas de la SPA.
        // Solo proxyear los endpoints de backend que usamos desde Vocales.
        '/vocales/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/vocales/gestos_entrenados': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/vocales/eliminar-gesto': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // No proxyear todo /abecedario; solo endpoints de backend necesarios
        '/abecedario/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/abecedario/gestos_entrenados': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/abecedario/eliminar-gesto': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // No proxyear todo /palabras; solo endpoints de backend necesarios
        '/palabras/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/palabras/gestos_entrenados': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/palabras/eliminar-gesto': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // Endpoints de guardado de Palabras
        '/palabras/guardar-gesto': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/palabras/guardar_gesto': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // Django views (HTML) used by the registration flow for CSRF and POST form
        '/register': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/login': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // Voice endpoints
        '/voz': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        // Chatbot endpoints
        '/chatbot': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },

    // Define global constants
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
    },
  }
})
