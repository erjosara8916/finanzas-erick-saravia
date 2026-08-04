import type { DriveStep } from 'driver.js';

export const financialHealthTourSteps: DriveStep[] = [
  {
    element: '[data-tour="fh-page-header"]',
    popover: {
      title: 'Bienvenido a Salud Financiera',
      description: 'Te mostramos cómo evaluar tu capacidad de endeudamiento en pocos pasos.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tx-form"]',
    popover: {
      title: 'Registra tus transacciones',
      description: 'Agrega aquí tus ingresos y gastos mensuales. Mientras más completa sea la información, más preciso será tu análisis.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tx-list"]',
    popover: {
      title: 'Tus transacciones',
      description: 'Aquí verás la lista de ingresos y gastos que has registrado, organizados en columnas.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-step-index="1"]',
    popover: {
      title: 'Análisis financiero',
      description: 'Cuando registres al menos un ingreso, aquí podrás ver tu análisis completo: capacidad de pago sugerida y tu relación deuda-ingreso (DTI).',
      side: 'bottom',
      align: 'center',
    },
  },
];
