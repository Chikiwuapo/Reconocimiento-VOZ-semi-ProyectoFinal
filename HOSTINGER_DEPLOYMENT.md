# Hostinger Deployment Guide

Esta guía proporciona instrucciones paso a paso para desplegar la aplicación frontend en el hosting de Hostinger.

## Información del Proyecto

- **Backend URL**: https://reconocimiento-voz-backend.onrender.com/ <mcreference link="https://reconocimiento-voz-backend.onrender.com/" index="0">0</mcreference>
- **Frontend Host**: devproyectos.com
- **Plataforma Backend**: Render
- **Plataforma Frontend**: Hostinger

## Prerrequisitos

- Cuenta de hosting en Hostinger con acceso al administrador de archivos
- Backend desplegado en Render (https://reconocimiento-voz-backend.onrender.com/)
- Node.js y npm instalados localmente para la compilación

## Configuración del Entorno

### 1. Variables de Entorno de Producción

La aplicación usa variables de entorno para la configuración de producción. El archivo `.env.production` ya está configurado:

```env
# Backend URL en Render
VITE_API_BASE_URL=https://reconocimiento-voz-backend.onrender.com
VITE_NODE_ENV=production
VITE_BUILD_MODE=production
```

### 2. Configuración de API

La aplicación detecta automáticamente el entorno y usa la URL base de API apropiada:
- **Desarrollo**: Usa proxy de Vite hacia `http://127.0.0.1:8000`
- **Producción**: Usa `VITE_API_BASE_URL` desde las variables de entorno

## Proceso de Compilación

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Crear Compilación de Producción

```bash
npm run build
```

Este comando:
- Ejecuta la compilación de TypeScript (`tsc -b`)
- Compila la aplicación usando Vite
- Genera archivos optimizados en la carpeta `dist`
- Crea bundles CSS y JavaScript minificados

### 3. Resultado de la Compilación

El proceso de compilación genera la siguiente estructura en la carpeta `dist`:
```
dist/
├── index.html          # Archivo HTML principal
├── assets/
│   ├── index-*.css     # CSS minificado (~140KB)
│   ├── index-*.js      # Bundle principal de la aplicación (~3.2MB)
│   ├── vendor-*.js     # Librerías de terceros
│   └── otros chunks    # Fragmentos de código adicionales
```

## Pasos de Despliegue en Hostinger

### 1. Acceder al Administrador de Archivos

1. Inicia sesión en tu panel de control de Hostinger
2. Navega a **Administrador de Archivos**
3. Ve al directorio `public_html` (o el directorio raíz de tu dominio devproyectos.com)

### 2. Subir Archivos de Compilación

1. **Limpia archivos existentes** (si los hay) del directorio de destino
2. **Sube todo el contenido** de la carpeta `dist` al directorio raíz de tu dominio
3. Asegúrate de que la estructura de archivos se vea así:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-*.css
   │   ├── index-*.js
   │   └── otros archivos de assets
   ```

### 3. Configurar Dominio

1. Asegúrate de que tu dominio devproyectos.com apunte al directorio correcto
2. El archivo `index.html` debe estar en la raíz del directorio de tu dominio
3. Prueba el despliegue visitando devproyectos.com

## Notas de Configuración Importantes

### Integración con Backend

- El frontend está configurado para trabajar con el backend desplegado en Render
- Asegúrate de que tu backend tenga la configuración CORS adecuada para tu dominio de Hostinger
- Actualiza el `CORS_ALLOWED_ORIGINS` del backend para incluir devproyectos.com

### Comportamiento Específico del Entorno

- **Desarrollo**: Usa servidor de desarrollo de Vite con configuración de proxy
- **Producción**: Hace llamadas API directas a la URL del backend configurada
- La aplicación detecta automáticamente el entorno y se ajusta en consecuencia

### Optimización de Compilación

La compilación incluye varias optimizaciones:
- **División de código**: Las librerías de terceros se separan en chunks
- **Minificación**: Todo el código se minifica usando Terser
- **Tree shaking**: Se elimina el código no utilizado
- **Optimización de assets**: CSS y JavaScript se optimizan para producción

## Solución de Problemas

### Problemas Comunes

1. **Fallan las llamadas API**:
   - Verifica la `VITE_API_BASE_URL` en `.env.production`
   - Revisa la configuración CORS del backend
   - Asegúrate de que el backend sea accesible desde tu dominio

2. **Errores de compilación**:
   - Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas
   - Revisa errores de TypeScript con `npm run build`
   - Asegúrate de que todas las variables no utilizadas estén eliminadas

3. **Archivos no cargan**:
   - Verifica que todos los archivos de la carpeta `dist` estén subidos
   - Revisa los permisos de archivos en Hostinger
   - Asegúrate de que `index.html` esté en el directorio correcto

### Consideraciones de Rendimiento

- El bundle principal es aproximadamente 3.2MB (892KB comprimido con gzip)
- Considera implementar carga perezosa para componentes grandes si es necesario
- Monitorea los tiempos de carga y optimiza más si es necesario

## Mantenimiento

### Actualizar la Aplicación

1. Haz cambios en el código fuente
2. Actualiza variables de entorno si es necesario
3. Ejecuta `npm run build` para crear una nueva compilación de producción
4. Sube el nuevo contenido de `dist` a Hostinger
5. Limpia la caché del navegador para ver los cambios

### Monitoreo

- Monitorea el rendimiento de la aplicación a través de las herramientas de desarrollo del navegador
- Revisa errores en la consola después del despliegue
- Prueba toda la funcionalidad para asegurar la integración adecuada con el backend

## Notas de Seguridad

- Nunca hagas commit de `.env.production` con credenciales reales al control de versiones
- Asegúrate de que tu backend tenga autenticación y autorización adecuadas
- Usa HTTPS tanto para el frontend como para el backend en producción
- Actualiza regularmente las dependencias para parches de seguridad

## URLs del Proyecto

- **Frontend**: https://devproyectos.com
- **Backend**: https://reconocimiento-voz-backend.onrender.com/
- **Documentación**: Este archivo (HOSTINGER_DEPLOYMENT.md)

### 2. API Configuration

The application automatically detects the environment and uses the appropriate API base URL:
- **Development**: Uses Vite proxy to `http://127.0.0.1:8000`
- **Production**: Uses `VITE_API_BASE_URL` from environment variables

## Build Process

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Production Build

```bash
npm run build
```

This command will:
- Run TypeScript compilation (`tsc -b`)
- Build the application using Vite
- Generate optimized files in the `dist` folder
- Create minified CSS and JavaScript bundles

### 3. Build Output

The build process generates the following structure in the `dist` folder:
```
dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-*.css     # Minified CSS (~140KB)
│   ├── index-*.js      # Main application bundle (~3.2MB)
│   ├── vendor-*.js     # Vendor libraries
│   └── other chunks    # Additional code chunks
```

## Hostinger Deployment Steps

### 1. Access File Manager

1. Log in to your Hostinger control panel
2. Navigate to **File Manager**
3. Go to the `public_html` directory (or your domain's root directory)

### 2. Upload Build Files

1. **Clear existing files** (if any) from the target directory
2. **Upload all contents** from the `dist` folder to your domain's root directory
3. Ensure the file structure looks like:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-*.css
   │   ├── index-*.js
   │   └── other asset files
   ```

### 3. Configure Domain

1. Ensure your domain points to the correct directory
2. The `index.html` file should be in the root of your domain directory
3. Test the deployment by visiting your domain

## Important Configuration Notes

### Backend Integration

- The frontend is configured to work with a backend deployed on Render
- Ensure your backend has proper CORS configuration for your Hostinger domain
- Update the backend's `CORS_ALLOWED_ORIGINS` to include your Hostinger domain

### Environment-Specific Behavior

- **Development**: Uses Vite dev server with proxy configuration
- **Production**: Makes direct API calls to the configured backend URL
- The application automatically detects the environment and adjusts accordingly

### Build Optimization

The build includes several optimizations:
- **Code splitting**: Vendor libraries are separated into chunks
- **Minification**: All code is minified using Terser
- **Tree shaking**: Unused code is removed
- **Asset optimization**: CSS and JavaScript are optimized for production

## Troubleshooting

### Common Issues

1. **API calls failing**:
   - Verify the `VITE_API_BASE_URL` in `.env.production`
   - Check backend CORS configuration
   - Ensure backend is accessible from your domain

2. **Build errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors with `npm run build`
   - Ensure all unused variables are removed

3. **Files not loading**:
   - Verify all files from `dist` folder are uploaded
   - Check file permissions on Hostinger
   - Ensure `index.html` is in the correct directory

### Performance Considerations

- The main bundle is approximately 3.2MB (892KB gzipped)
- Consider implementing lazy loading for large components if needed
- Monitor loading times and optimize further if necessary

## Maintenance

### Updating the Application

1. Make changes to the source code
2. Update environment variables if needed
3. Run `npm run build` to create a new production build
4. Upload the new `dist` contents to Hostinger
5. Clear browser cache to see changes

### Monitoring

- Monitor application performance through browser developer tools
- Check for console errors after deployment
- Test all functionality to ensure proper integration with the backend

## Security Notes

- Never commit `.env.production` with real credentials to version control
- Ensure your backend has proper authentication and authorization
- Use HTTPS for both frontend and backend in production
- Regularly update dependencies for security patches