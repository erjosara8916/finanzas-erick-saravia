import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, BarChart3, Shield, Zap, CheckCircle2, Heart, Mail, Send, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { sendNewsletterSubscription } from '../lib/emailService';
import { useAnalytics, useEngagementTracking } from '../hooks/useAnalytics';

export default function LandingPage() {
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionName, setSubscriptionName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const { trackCTAClick, trackNewsletterSubscription, trackError } = useAnalytics();
  
  // Tracking de engagement
  useEngagementTracking('landing');

  const features = [
    {
      icon: Calculator,
      title: 'Precisión Financiera',
      description: 'Evita errores de cálculo manual. Nuestros algoritmos replican las condiciones bancarias estándar para darte proyecciones fidedignas.',
    },
    {
      icon: TrendingUp,
      title: 'Perspectiva Clara',
      description: 'Entiende la curva de tu amortización de un vistazo. Transformamos tablas complejas en gráficos intuitivos.',
    },
    {
      icon: BarChart3,
      title: 'Control Mes a Mes',
      description: 'Desglosamos cada cuota para que entiendas la proporción exacta entre capital e intereses en cada pago.',
    },
    {
      icon: Shield,
      title: 'Planificación a Futuro',
      description: 'Proyecta cómo quedarían tus finanzas al liquidar anticipadamente y toma decisiones basadas en números.',
    },
  ];

  const benefits = [
    'Proyecciones exactas sin el margen de error humano.',
    'Planificación flexible: Ajusta pagos extra según tu realidad económica.',
    'Privacidad total: Tus datos financieros se procesan en tu dispositivo, garantizando confidencialidad.',
    'Interfaz amigable diseñada para usuarios, no para contadores.',
  ];

  const steps = [
    {
      number: '1',
      title: 'Digitaliza tu préstamo',
      description: 'Ingresa los datos actuales de tu crédito (tasa, plazo y monto).',
    },
    {
      number: '2',
      title: 'Diseña tu estrategia',
      description: 'Prueba diferentes escenarios de abonos a capital y pagos extra.',
    },
    {
      number: '3',
      title: 'Visualiza el impacto',
      description: 'Conoce cuánto tiempo y dinero ahorras siendo disciplinado con tu plan.',
    },
  ];

  const tools = [
    {
      title: 'Simulador Estratégico',
      description: 'Analiza el impacto matemático de tus pagos. Descubre cómo pequeños aportes adicionales transforman el costo final de tu financiamiento.',
      icon: Calculator,
      link: '/proyeccion-crediticia',
      color: 'blue',
      buttonText: 'Simular escenarios',
    },
    {
      title: 'Chequeo de Solvencia',
      description: 'Conoce tu capacidad real de pago antes de solicitar nuevo capital. Mantén un perfil financiero saludable.',
      icon: Heart,
      link: '/salud-financiera',
      color: 'green',
      buttonText: 'Evaluar mi perfil',
    },
  ];

  const handleSubscription = async (e: FormEvent) => {
    e.preventDefault();
    setSubscriptionError(null);

    // Trackear intento de suscripción
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
      
      // Trackear éxito
      trackNewsletterSubscription('success', subscriptionEmail, !!subscriptionName);
      trackCTAClick('newsletter', 'Quiero aprender más', 'newsletter_subscription');
      
      setIsSubscribed(true);
      setSubscriptionEmail('');
      setSubscriptionName('');
      
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Hubo un error al suscribirte. Por favor, intenta nuevamente.';
      setSubscriptionError(errorMessage);
      // Trackear error
      trackNewsletterSubscription('error', subscriptionEmail, !!subscriptionName, 'api');
      trackError('api', errorMessage, 'LandingPage.handleSubscription', 'newsletter_subscription');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Section */}
      <section data-section-name="hero" className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            ¿Realmente tienes el control de tu crédito?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Un préstamo es una herramienta poderosa, pero solo si sabes gestionarla. Visualiza tu deuda, planifica tus abonos y optimiza tus finanzas con datos reales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link 
              to="/proyeccion-crediticia"
              onClick={() => trackCTAClick('hero', 'Optimizar mi Préstamo', '/proyeccion-crediticia')}
            >
              <Button size="lg" variant="cta" className="w-full sm:w-auto">
                <Zap className="mr-2 h-5 w-5" />
                Optimizar mi Préstamo
              </Button>
            </Link>
            {/* <Link to="/contacto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Saber más
              </Button>
            </Link> */}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Tus datos se procesan localmente en tu dispositivo
          </p>
        </div>
      </section>

      {/* Tools Section */}
      <section data-section-name="tools" className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Tecnología para decisiones inteligentes
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Explora nuestras herramientas diseñadas para darte claridad financiera.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const colorClasses = {
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              };
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-6 p-4 ${colorClasses[tool.color as keyof typeof colorClasses]} rounded-lg`}>
                      <Icon className="h-12 w-12" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {tool.description}
                    </p>
                    <Link 
                      to={tool.link}
                      onClick={() => trackCTAClick('tools_card', tool.buttonText, tool.link)}
                    >
                      <Button size="lg" variant="cta" className="w-full sm:w-auto">
                        <Zap className="mr-2 h-5 w-5" />
                        {tool.buttonText}
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                      Tus datos se procesan localmente en tu dispositivo
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-section-name="features" className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Claridad financiera al instante
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section data-section-name="benefits" className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Tu asistente financiero personal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section data-section-name="how-it-works" className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Toma el mando en 3 pasos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section data-section-name="newsletter" className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mejora tu IQ Financiero
            </h2>
            <p className="text-xl text-blue-100">
              Recibe consejos sobre cómo utilizar los productos bancarios a tu favor, estrategias de ahorro y actualizaciones de nuestras herramientas.
            </p>
          </div>

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
                  <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                    Error al suscribirte
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {subscriptionError}
                  </p>
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
                className="w-full"
                size="lg"
                variant="cta"
                onClick={() => trackCTAClick('newsletter', 'Quiero aprender más', 'newsletter_subscription')}
              >
                {isSubscribing ? (
                  <>
                    <span className="mr-2">Suscribiendo...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Quiero aprender más
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center mt-2">
                Tus datos se procesan localmente en tu dispositivo
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section data-section-name="cta" className="bg-gray-900 dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Explora nuestras herramientas financieras y toma el control de tus finanzas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/salud-financiera"
              onClick={() => trackCTAClick('footer', 'Salud Financiera', '/salud-financiera')}
            >
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Salud Financiera
              </Button>
            </Link>
            <Link 
              to="/proyeccion-crediticia"
              onClick={() => trackCTAClick('footer', 'Proyección Crediticia', '/proyeccion-crediticia')}
            >
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Proyección Crediticia
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

