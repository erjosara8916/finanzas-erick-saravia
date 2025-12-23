import { Link } from 'react-router-dom';
import { Calculator, TrendingUp, BarChart3, Shield, Zap, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function LandingPage() {

  const features = [
    {
      icon: Calculator,
      title: 'Cálculos Precisos',
      description: 'Obtén resultados exactos sin errores. Cada centavo se calcula correctamente.',
    },
    {
      icon: TrendingUp,
      title: 'Gráficos Visuales',
      description: 'Mira cómo evoluciona tu préstamo con gráficos fáciles de entender.',
    },
    {
      icon: BarChart3,
      title: 'Tabla Detallada',
      description: 'Revisa mes a mes cuánto pagas de intereses, cuánto de capital y cuánto te falta por pagar.',
    },
    {
      icon: Shield,
      title: 'Análisis Completo',
      description: 'Descubre cuánto pagarás en total y cómo los pagos extra te ayudan a ahorrar.',
    },
  ];

  const benefits = [
    'Cálculos 100% precisos sin errores de redondeo',
    'Agrega pagos extra cuando quieras para reducir tu deuda más rápido',
    'Las fechas se calculan automáticamente, incluso en años bisiestos',
    'Tus cálculos se guardan automáticamente en tu navegador',
    'Funciona perfectamente en tu computadora, tablet o celular',
    'Modo oscuro disponible para usar cómodamente de noche',
  ];

  const steps = [
    {
      number: '1',
      title: 'Ingresa los datos del préstamo',
      description: 'Monto, tasa de interés anual, plazo y fecha de inicio.',
    },
    {
      number: '2',
      title: 'Agrega pagos extra',
      description: 'Si quieres pagar más en algún mes, agrégalo y verás cómo reduce tu deuda.',
    },
    {
      number: '3',
      title: 'Visualiza la proyección',
      description: 'Revisa la tabla de amortización completa y los gráficos interactivos.',
    },
  ];

  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Proyección Crediticia
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Calcula cuánto pagarás por tu préstamo y descubre cómo ahorrar con pagos adicionales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/proyeccion-crediticia">
              <Button size="lg" className="w-full sm:w-auto">
                <Zap className="mr-2 h-5 w-5" />
                Usar Herramienta
              </Button>
            </Link>
            <Link to="/contacto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Características Principales
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
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Beneficios
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
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Cómo Funciona
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

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para calcular tu préstamo?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comienza a usar la herramienta de proyección crediticia ahora mismo
          </p>
          <Link to="/proyeccion-crediticia">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

