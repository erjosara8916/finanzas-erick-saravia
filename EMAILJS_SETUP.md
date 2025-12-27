# Configuración de EmailJS

Este proyecto usa EmailJS para enviar correos desde el formulario de contacto a `ericksaravia16@gmail.com`.

## Pasos para Configurar

### 1. Crear cuenta en EmailJS
1. Ve a https://www.emailjs.com/
2. Crea una cuenta gratuita (permite hasta 200 emails/mes)

### 2. Configurar un Servicio de Email
1. En el dashboard de EmailJS, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona **Gmail** (o el proveedor que prefieras)
4. Conecta tu cuenta de Gmail (ericksaravia16@gmail.com)
5. Copia el **Service ID** que se genera

### 3. Crear un Template de Email
1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Configura el template con estos campos:

**Template Name:** Contact Form

**Subject:** Nuevo mensaje de contacto: {{subject}}

**Content:**
```
Has recibido un nuevo mensaje del formulario de contacto:

Nombre: {{from_name}}
Email: {{from_email}}
Asunto: {{subject}}

Mensaje:
{{message}}

---
Puedes responder directamente a este correo para contactar a {{from_name}}.
```

4. En **Settings**, asegúrate de que:
   - **To Email:** ericksaravia16@gmail.com
   - **From Name:** {{from_name}}
   - **Reply To:** {{reply_to}}

5. Copia el **Template ID** que se genera

### 4. Obtener la Public Key
1. Ve a **Account** → **General**
2. Copia tu **Public Key**

### 5. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

**Importante:** No subas el archivo `.env` al repositorio. Está en `.gitignore`.

### 6. Reiniciar el servidor de desarrollo
Después de crear el archivo `.env`, reinicia el servidor:
```bash
npm run dev
```

## Variables del Template

El template debe incluir estas variables:
- `{{to_email}}` - Email de destino (ericksaravia16@gmail.com)
- `{{from_name}}` - Nombre del remitente
- `{{from_email}}` - Email del remitente
- `{{subject}}` - Asunto del mensaje
- `{{message}}` - Contenido del mensaje
- `{{reply_to}}` - Email para responder (mismo que from_email)

## Prueba

Una vez configurado, puedes probar el formulario de contacto en `/contacto`. Los correos se enviarán a `ericksaravia16@gmail.com`.



