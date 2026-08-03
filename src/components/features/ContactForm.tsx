import { useState, FormEvent } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import ErrorBoundary from '../analytics/ErrorBoundary';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { useAnalytics } from '../../hooks/useAnalytics';
import { sendContactEmail } from '../../lib/emailService';

export default function ContactForm() {
  const { track } = useAnalytics();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      track('form_validation_error', 'contact', 'validation_failed');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    track('form_submit', 'contact', 'contact_form');

    try {
      await sendContactEmail(formData);

      setIsSubmitting(false);
      setIsSubmitted(true);
      track('form_submit_success', 'contact', 'contact_form');

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.';
      setSubmitError(errorMessage);
      track('form_submit_error', 'contact', 'send_failed');
      console.error('Error enviando email:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <ErrorBoundary>
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Envíanos un Mensaje</h2>

      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200">¡Mensaje enviado exitosamente! Te responderemos pronto.</p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium mb-1">Error al enviar el mensaje</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="subject">Asunto *</Label>
          <Input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="¿Sobre qué quieres contactarnos?"
            className={errors.subject ? 'border-red-500' : ''}
          />
          {errors.subject && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>}
        </div>

        <div>
          <Label htmlFor="name">Nombre (Opcional)</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Tu nombre completo"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Correo (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tu@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1234567890"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="message">Mensaje *</Label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto" size="lg">
          {isSubmitting ? (
            <span className="mr-2">Enviando...</span>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Enviar Mensaje
            </>
          )}
        </Button>
      </form>
    </Card>
    </ErrorBoundary>
  );
}
