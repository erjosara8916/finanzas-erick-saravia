import { useCallback, useEffect, useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';

interface UseTourOptions {
  enabled?: boolean;
}

/**
 * Wraps driver.js: auto-starts the tour once per browser (tracked via
 * `storageKey` in localStorage) and exposes `startTour` to replay it manually.
 */
export function useTour(steps: DriveStep[], storageKey: string, options: UseTourOptions = {}) {
  const { enabled = true } = options;
  const hasAutoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    const tourDriver = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps,
      onDestroyed: () => {
        localStorage.setItem(storageKey, 'true');
      },
    });
    tourDriver.drive();
  }, [steps, storageKey]);

  useEffect(() => {
    if (!enabled || hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;
    if (!localStorage.getItem(storageKey)) {
      startTour();
    }
  }, [enabled, startTour, storageKey]);

  return { startTour };
}
