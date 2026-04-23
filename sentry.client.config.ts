/**
 * GlitchTip Client-Side Configuration (via @sentry/nextjs)
 * Uses NEXT_PUBLIC_SENTRY_DSN so the DSN is available in the browser bundle.
 * DSN: https://8e3eb96a6cd347648a51b2aa456c5bf8@app.glitchtip.com/22080
 */
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,

    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',

    // 1% in production — GlitchTip recommendation to save disk space.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 1.0,

    // GlitchTip does not support session tracking — must be disabled.
    autoSessionTracking: false,
  })
}
