/**
 * Initialize Sentry
 * Only runs in production to avoid cluttering error logs in development
 */
export const initSentry = () => {
  // Only initialize in production
  if (import.meta.env.MODE !== 'production') {
    console.log('ℹ️ [Sentry] Skipping in development mode');
    return;
  }

  // Get DSN from environment variable or use placeholder
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn || dsn === 'YOUR_SENTRY_DSN_HERE') {
    console.info(
      '📊 [Sentry] Error monitoring not configured (optional).\n' +
      '   To enable: Set VITE_SENTRY_DSN in your environment variables.\n' +
      '   Sign up for free at https://sentry.io'
    );
    return;
  }

  Sentry.init({
    dsn,
    
    // Integration with React Router for better error context
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Only capture replays for errors to save quota
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
    
    // Session Replay
    replaysSessionSampleRate: 0, // Don't record normal sessions
    replaysOnErrorSampleRate: 1.0, // Record 100% of sessions with errors
    
    // Environment
    environment: import.meta.env.MODE,
    
    // Release tracking (optional - helps track which version has bugs)
    // release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Ignore known errors that don't need tracking
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors (handled by app)
      'NetworkError',
      'Failed to fetch',
      // User cancellations
      'AbortError',
      'User cancelled',
    ],
    
    // Add user context (if authenticated)
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (import.meta.env.MODE === 'development') {
        return null;
      }
      
      // Add custom context
      event.tags = {
        ...event.tags,
        app_section: window.location.pathname.split('/')[1] || 'home',
      };
      
      return event;
    },
  });

  console.log('[Sentry] Error monitoring initialized successfully ✓');
};

/**
 * Manually capture an error
 */
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.MODE === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('[Sentry] Error captured (not sent in dev):', error, context);
  }
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.MODE === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[Sentry] Message captured (not sent in dev) [${level}]:`, message);
  }
};

/**
 * Set user context for error tracking
 */
export const setUser = (user: { id: string; email?: string; username?: string } | null) => {
  if (import.meta.env.MODE === 'production') {
    Sentry.setUser(user);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category?: string, data?: Record<string, unknown>) => {
  if (import.meta.env.MODE === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
};

// Export Sentry for advanced usage
export { Sentry };