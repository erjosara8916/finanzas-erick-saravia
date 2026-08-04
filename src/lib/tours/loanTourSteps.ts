import type { DriveStep } from 'driver.js';

export const loanTourSteps: DriveStep[] = [
  {
    element: '[data-tour="loan-page-header"]',
    popover: {
      title: '¡Bienvenido al simulador de préstamos!',
      description: 'Te mostramos rápidamente cómo usar esta herramienta para calcular tu tabla de amortización.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#principal',
    popover: {
      title: 'Monto principal',
      description: 'Ingresa el monto total del préstamo que vas a solicitar. Sobre este valor se calcularán los intereses.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#annualRate',
    popover: {
      title: 'Tasa de interés anual',
      description: 'La tasa que te ofrece el banco. Determina cuánto pagarás en intereses durante la vida del préstamo.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#termMonths',
    popover: {
      title: 'Plazo en meses',
      description: 'El número de meses en los que pagarás el préstamo. A mayor plazo, menor cuota mensual pero más interés total.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-step-index="1"]',
    popover: {
      title: 'Abonos a capital',
      description: 'En este paso podrás registrar abonos extra a capital para reducir tu deuda y pagar menos intereses.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="loan-amortization-table"]',
    popover: {
      title: 'Tabla de amortización',
      description: 'Aquí verás cada cuota mes a mes: cuánto va a capital, cuánto a interés y el saldo restante.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="loan-summary"]',
    popover: {
      title: 'Resumen del préstamo',
      description: 'Un resumen con el total a pagar, el costo total en intereses y el plazo real considerando tus abonos extra.',
      side: 'top',
      align: 'start',
    },
  },
];
