# Configuración de GitHub Actions

## Variables de Entorno

Este proyecto utiliza GitHub Actions para construir y desplegar la aplicación. Para que funcione correctamente, necesitas configurar los siguientes secretos en tu repositorio de GitHub.

### Configurar el secreto VITE_GA_MEASUREMENT_ID

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Nombre: `VITE_GA_MEASUREMENT_ID`
5. Valor: Tu ID de Google Analytics 4 (formato: `G-XXXXXXXXXX`)
6. Haz clic en **Add secret**

### Workflows disponibles

#### `deploy.yml`
- Se ejecuta automáticamente cuando se hace push a las ramas `main` o `master`
- Construye la aplicación con la variable de entorno configurada
- Despliega a GitHub Pages
- También se puede ejecutar manualmente desde la pestaña **Actions**

#### `ci.yml`
- Se ejecuta en pull requests y pushes a `main` o `master`
- Ejecuta el linter
- Construye la aplicación para verificar que no hay errores
- No requiere el secreto de GA (usa un placeholder si no está configurado)

### Notas importantes

- El secreto `VITE_GA_MEASUREMENT_ID` es opcional para el workflow de CI, pero **requerido** para el despliegue
- Si no configuras el secreto, la aplicación se construirá pero Google Analytics no funcionará
- El archivo CNAME se copia automáticamente al directorio `dist` durante el build

