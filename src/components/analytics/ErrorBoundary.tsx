import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackEventWithParams, hasUserConsent, sanitizeErrorMessage } from '../../lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Trackear el error en Google Analytics
    if (hasUserConsent()) {
      trackEventWithParams('error_occurred', {
        error_type: 'unknown',
        error_message: sanitizeErrorMessage(error.message),
        error_location: errorInfo.componentStack?.split('\n')[1]?.trim() || 'unknown',
        error_stack: sanitizeErrorMessage(error.stack || ''),
      });
    }

    // Log en consola para desarrollo
    if (import.meta.env.DEV) {
      console.error('Error capturado por ErrorBoundary:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, recarga la página o intenta nuevamente más tarde.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

