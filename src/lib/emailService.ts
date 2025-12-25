import emailjs from '@emailjs/browser';

// Configuración de EmailJS desde variables de entorno
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Email de destino
const TO_EMAIL = 'ericksaravia16@gmail.com';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Envía un email usando EmailJS
 */
export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  // Validar que las variables de entorno estén configuradas
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS no está configurado correctamente. Por favor, configura las variables de entorno VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID y VITE_EMAILJS_PUBLIC_KEY'
    );
  }

  // Inicializar EmailJS con la clave pública
  emailjs.init(PUBLIC_KEY);

  // Preparar los parámetros del template
  const templateParams = {
    to_email: TO_EMAIL,
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    reply_to: formData.email,
  };

  // Enviar el email
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
}


