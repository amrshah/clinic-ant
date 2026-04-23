import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withSentryConfig(nextConfig, {
  // GlitchTip is Sentry-compatible — just set SENTRY_DSN to your GlitchTip project DSN.
  // If SENTRY_DSN is not set, the SDK is included but initializes as a no-op.
  silent: true, // Suppress Sentry CLI output during builds

  // Disable source-map upload to Sentry servers (we're using GlitchTip self-hosted).
  // Enable if your GlitchTip instance has source-map upload configured.
  sourcemaps: {
    disable: true,
  },

  // Disable automatic Vercel Cron monitor wrapping (not applicable).
  automaticVercelMonitors: false,
})
