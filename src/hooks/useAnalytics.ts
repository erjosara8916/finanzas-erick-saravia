import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent, trackEventWithParams, trackPageView, hasUserConsent, sanitizeEmail, amountToRange, sanitizeErrorMessage } from '../lib/analytics';

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
    (calculationType: string, params?: Record<string, string | number | boolean>) => {
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
    (
      period: number, 
      amount: number, 
      paymentType: 'single' | 'periodic',
      additionalParams?: {
        totalExtraPayments?: number;
        totalExtraAmount?: number;
        loanPrincipal?: number;
      }
    ) => {
      if (!canTrack) return;
      const params: Record<string, string | number | boolean> = {
        period,
        amount,
        payment_type: paymentType,
      };
      
      if (additionalParams) {
        if (additionalParams.totalExtraPayments !== undefined) {
          params.total_extra_payments = additionalParams.totalExtraPayments;
        }
        if (additionalParams.totalExtraAmount !== undefined) {
          params.total_extra_amount = additionalParams.totalExtraAmount;
        }
        if (additionalParams.loanPrincipal !== undefined) {
          params.loan_principal = additionalParams.loanPrincipal;
        }
      }
      
      trackEventWithParams('extra_payment_added', params);
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

  /**
   * Trackea clics en botones CTA
   */
  const trackCTAClick = useCallback(
    (ctaLocation: 'hero' | 'tools_card' | 'newsletter' | 'footer', ctaText: string, destination: string) => {
      if (!canTrack) return;
      trackEventWithParams('cta_click', {
        ctaLocation,
        ctaText,
        destination,
      });
    },
    [canTrack]
  );

  /**
   * Trackea suscripciones al newsletter
   */
  const trackNewsletterSubscription = useCallback(
    (eventType: 'attempt' | 'success' | 'error', email?: string, hasName?: boolean, errorType?: string) => {
      if (!canTrack) return;
      
      const params: Record<string, string | number | boolean> = {
        has_name: hasName || false,
      };

      if (email) {
        params.email_domain = sanitizeEmail(email);
      }

      if (errorType) {
        params.error_type = errorType;
      }

      trackEventWithParams(`newsletter_subscription_${eventType}`, params);
    },
    [canTrack]
  );

  /**
   * Trackea exportaciones de PDF
   */
  const trackPDFExport = useCallback(
    (exportType: string, hasExtraPayments: boolean, totalPeriods: number, fileSizeEstimate?: number) => {
      if (!canTrack) return;
      trackEventWithParams('pdf_export', {
        export_type: exportType,
        has_extra_payments: hasExtraPayments,
        total_periods: totalPeriods,
        ...(fileSizeEstimate && { file_size_estimate: fileSizeEstimate }),
      });
    },
    [canTrack]
  );

  /**
   * Trackea errores
   */
  const trackError = useCallback(
    (errorType: 'validation' | 'calculation' | 'api' | 'unknown', errorMessage: string, errorLocation: string, userAction?: string) => {
      if (!canTrack) return;
      trackEventWithParams('error_occurred', {
        error_type: errorType,
        error_message: sanitizeErrorMessage(errorMessage),
        error_location: errorLocation,
        ...(userAction && { user_action: userAction }),
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
    trackCTAClick,
    trackNewsletterSubscription,
    trackPDFExport,
    trackError,
  };
};

/**
 * Hook para tracking de engagement (scroll depth y tiempo en página)
 */
export const useEngagementTracking = (pageName: string) => {
  const canTrack = hasUserConsent();
  const [scrollDepthsTracked, setScrollDepthsTracked] = useState<Set<number>>(new Set());
  const [timeEventsTracked, setTimeEventsTracked] = useState(0);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxTimeEvents = 5;

  // Tracking de scroll depth
  useEffect(() => {
    if (!canTrack) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      // Trackear en 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercentage >= milestone && !scrollDepthsTracked.has(milestone)) {
          trackEventWithParams('scroll_depth', {
            page_name: pageName,
            scroll_depth: milestone,
          });
          setScrollDepthsTracked((prev) => new Set(prev).add(milestone));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [canTrack, pageName, scrollDepthsTracked]);

  // Tracking de tiempo en página
  useEffect(() => {
    if (!canTrack) return;
    if (timeEventsTracked >= maxTimeEvents) return;

    startTimeRef.current = Date.now();
    let lastTrackedTime = 0;

    timeIntervalRef.current = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Trackear cada 30 segundos (solo si no se ha trackeado este intervalo)
      if (timeSpent > 0 && timeSpent >= lastTrackedTime + 30 && timeEventsTracked < maxTimeEvents) {
        trackEventWithParams('time_on_page', {
          page_name: pageName,
          time_seconds: timeSpent,
        });
        setTimeEventsTracked((prev) => prev + 1);
        lastTrackedTime = timeSpent;
      }
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [canTrack, pageName, timeEventsTracked]);

  // Tracking de secciones visibles (Intersection Observer)
  useEffect(() => {
    if (!canTrack) return;

    const sections = document.querySelectorAll('section[data-section-name]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute('data-section-name');
          if (sectionName) {
            trackEventWithParams('section_view', {
              page_name: pageName,
              section_name: sectionName,
            });
            // Dejar de observar después de trackear
            observer.unobserve(entry.target);
          }
        }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [canTrack, pageName]);
};

