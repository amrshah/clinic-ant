/**
 * Server-side Structured Logger
 *
 * Dual-sink design:
 *   1. Stdout (always on) — structured JSON, ingestion-ready for Docker / CloudWatch / ELK.
 *   2. GlitchTip via Sentry SDK (activated when SENTRY_DSN env var is set) — captures errors
 *      with full context for alerting and aggregation.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Invoice generated', { invoiceId: 123, total: 50.00 });
 *   logger.error('Failed to create invoice', error, { owner_id: '...' });
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class StructuredLogger {
  /** Whether GlitchTip / Sentry reporting is active (DSN is configured). */
  private get glitchtipEnabled(): boolean {
    return !!process.env.SENTRY_DSN
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const logEntry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    }

    if (error) {
      if (error instanceof Error) {
        logEntry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } else {
        logEntry.error = error
      }
    }

    return JSON.stringify(logEntry)
  }

  info(message: string, context?: LogContext) {
    // Sink 1: stdout
    console.log(this.formatLog('info', message, context))
    // GlitchTip: info events are not captured (noise reduction — errors only)
  }

  warn(message: string, context?: LogContext) {
    // Sink 1: stdout
    console.warn(this.formatLog('warn', message, context))

    // Sink 2: GlitchTip — capture warnings as breadcrumbs for error context
    if (this.glitchtipEnabled) {
      Sentry.addBreadcrumb({ level: 'warning', message, data: context })
    }
  }

  error(message: string, error?: unknown, context?: LogContext) {
    // Sink 1: stdout (always — stdout is the fallback even if GlitchTip is down)
    console.error(this.formatLog('error', message, context, error))

    // Sink 2: GlitchTip — capture as a full exception event
    if (this.glitchtipEnabled) {
      Sentry.withScope((scope) => {
        scope.setTag('logger', 'structured')
        if (context) scope.setContext('details', context as Record<string, unknown>)
        scope.setExtra('log_message', message)

        if (error instanceof Error) {
          Sentry.captureException(error)
        } else {
          Sentry.captureMessage(`${message}${error ? `: ${JSON.stringify(error)}` : ''}`, 'error')
        }
      })
    }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, context))
    }
  }
}

export const logger = new StructuredLogger()

