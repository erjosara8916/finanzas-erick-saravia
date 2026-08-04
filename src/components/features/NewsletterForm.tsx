import { useState, FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import ErrorBoundary from '../analytics/ErrorBoundary';
import { Button } from '../ui/button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { sendNewsletterSubscription } from '../../lib/emailService';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function NewsletterForm() {
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const { trackCTAClick, trackNewsletterSubscription, trackError } = useAnalytics();

  const handleSubscription = async (e: FormEvent) => {
    e.preventDefault();
    setSubscriptionError(null);

    trackNewsletterSubscription('attempt', subscriptionEmail, !!subscriptionName);

    if (!subscriptionEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriptionEmail)) {
      setSubscriptionError('Por favor, ingresa un email válido');
      trackNewsletterSubscription('error', subscriptionEmail, !!subscriptionName, 'validation');
      return;
    }

    setIsSubscribing(true);

    try {
      await sendNewsletterSubscription({
        email: subscriptionEmail,
        name: subscriptionName || undefined,
      });

      trackNewsletterSubscription('success', subscriptionEmail, !!subscriptionName);
      trackCTAClick('newsletter', 'Suscribirme', 'newsletter_subscription');

      setIsSubscribed(true);
      setSubscriptionEmail('');
      setSubscriptionName('');

      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Hubo un error al suscribirte. Por favor, intenta nuevamente.';
      setSubscriptionError(errorMessage);
      trackNewsletterSubscription('error', subscriptionEmail, !!subscriptionName, 'api');
      trackError('api', errorMessage, 'NewsletterForm.handleSubscription', 'newsletter_subscription');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <ErrorBoundary>
    <Card className="p-8 max-w-2xl mx-auto">
      {isSubscribed && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200">
            ¡Te has suscrito exitosamente! Recibirás notificaciones sobre el proyecto.
          </p>
        </div>
      )}

      {subscriptionError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium mb-1">Error al suscribirte</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{subscriptionError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubscription} className="space-y-4">
        <div>
          <Label htmlFor="subscription-email">Correo Electrónico *</Label>
          <Input
            id="subscription-email"
            type="email"
            value={subscriptionEmail}
            onChange={(e) => setSubscriptionEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            disabled={isSubscribing}
          />
        </div>

        <div>
          <Label htmlFor="subscription-name">Nombre (Opcional)</Label>
          <Input
            id="subscription-name"
            type="text"
            value={subscriptionName}
            onChange={(e) => setSubscriptionName(e.target.value)}
            placeholder="Tu nombre"
            disabled={isSubscribing}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubscribing}
          className="w-full h-12 px-6 text-lg"
          size="lg"
          variant="default"
          onClick={() => trackCTAClick('newsletter', 'Suscribirme', 'newsletter_subscription')}
        >
          {isSubscribing ? (
            <span>Suscribiendo...</span>
          ) : (
            <>
              <Send />
              Suscribirme
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center mt-2">
          Nunca compartimos tu correo. Cero spam, prometido.
        </p>
      </form>
    </Card>
    </ErrorBoundary>
  );
}
