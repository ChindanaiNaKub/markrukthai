type ErrorSource = 'react_error_boundary' | 'async_error_boundary' | 'board_error_boundary' | 'window_error' | 'unhandled_rejection';

interface ReportClientErrorInput {
  source: ErrorSource;
  error: Error;
  componentStack?: string;
}

let initialized = false;

export async function reportClientError(input: ReportClientErrorInput) {
  try {
    await fetch('/api/client-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: input.source,
        message: input.error.message,
        stack: input.error.stack,
        componentStack: input.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    });
  } catch (reportingError) {
    console.error('[errorReporting] Failed to report client error', reportingError);
  }
}

export function initializeGlobalErrorReporting() {
  if (initialized) return;
  initialized = true;

  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message || 'Unknown window error');

    void reportClientError({
      source: 'window_error',
      error,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    void reportClientError({
      source: 'unhandled_rejection',
      error,
    });
  });
}
