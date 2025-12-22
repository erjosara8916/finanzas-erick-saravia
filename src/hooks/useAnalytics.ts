import { useCallback } from 'react';
import { trackEvent, trackEventWithParams, trackPageView, hasUserConsent } from '../lib/analytics';

/**
 * Hook personalizado para facilitar el tracking de eventos en componentes
 */
export const useAnalytics = () => {
  const canTrack = hasUserConsent();

  /**
   * Trackea un evento personalizado
   */
  const track = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      if (!canTrack) return;
      trackEvent(action, category, label, value);
    },
    [canTrack]
  );

  /**
   * Trackea un evento con parámetros personalizados
   */
  const trackWithParams = useCallback(
    (action: string, params?: Record<string, string | number | boolean>) => {
      if (!canTrack) return;
      trackEventWithParams(action, params);
    },
    [canTrack]
  );

  /**
   * Trackea una vista de página
   */
  const trackPage = useCallback(
    (path: string) => {
      if (!canTrack) return;
      trackPageView(path);
    },
    [canTrack]
  );

  /**
   * Trackea cambios en campos de formulario
   */
  const trackFormFieldChange = useCallback(
    (fieldName: string, value?: string | number) => {
      if (!canTrack) return;
      trackEventWithParams('form_field_change', {
        field_name: fieldName,
        value: value?.toString() || '',
      });
    },
    [canTrack]
  );

  /**
   * Trackea errores de validación
   */
  const trackValidationError = useCallback(
    (fieldName: string, error: string) => {
      if (!canTrack) return;
      trackEventWithParams('form_validation_error', {
        field_name: fieldName,
        error_message: error,
      });
    },
    [canTrack]
  );

  /**
   * Trackea navegación en stepper
   */
  const trackStepperNavigation = useCallback(
    (stepIndex: number, stepLabel: string, action: 'next' | 'previous' | 'click') => {
      if (!canTrack) return;
      trackEventWithParams('stepper_navigation', {
        step_index: stepIndex,
        step_label: stepLabel,
        action,
      });
    },
    [canTrack]
  );

  /**
   * Trackea cálculos completados
   */
  const trackCalculation = useCallback(
    (calculationType: string, params?: Record<string, string | number>) => {
      if (!canTrack) return;
      trackEventWithParams('calculation_complete', {
        calculation_type: calculationType,
        ...params,
      });
    },
    [canTrack]
  );

  /**
   * Trackea abonos extra agregados
   */
  const trackExtraPaymentAdded = useCallback(
    (period: number, amount: number, paymentType: 'single' | 'periodic') => {
      if (!canTrack) return;
      trackEventWithParams('extra_payment_added', {
        period,
        amount,
        payment_type: paymentType,
      });
    },
    [canTrack]
  );

  /**
   * Trackea abonos extra eliminados
   */
  const trackExtraPaymentRemoved = useCallback(
    (period: number) => {
      if (!canTrack) return;
      trackEventWithParams('extra_payment_removed', {
        period,
      });
    },
    [canTrack]
  );

  return {
    canTrack,
    track,
    trackWithParams,
    trackPage,
    trackFormFieldChange,
    trackValidationError,
    trackStepperNavigation,
    trackCalculation,
    trackExtraPaymentAdded,
    trackExtraPaymentRemoved,
  };
};

