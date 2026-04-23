/**
 * GlitchTip Edge Runtime Configuration (via @sentry/nextjs)
 * Covers Next.js middleware and edge API routes.
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,
    // GlitchTip does not support session tracking.
    autoSessionTracking: false,
  })
}
