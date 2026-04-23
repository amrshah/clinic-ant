/**
 * Next.js Instrumentation Hook
 * Bootstraps GlitchTip/Sentry on server and edge runtimes.
 * This file is automatically loaded by Next.js before the app starts.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

/**
 * Forwards unhandled server errors to GlitchTip.
 * Runs on every request error in the App Router.
 */
export const onRequestError = async (
  err: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string }
) => {
  const { captureRequestError } = await import('@sentry/nextjs')
  captureRequestError(err, request, context)
}
