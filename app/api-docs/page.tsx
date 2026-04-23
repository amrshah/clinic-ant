'use client'

import React, { useEffect } from 'react'
import { AppLayout } from '@/components/app-layout'

export default function ApiDocsPage() {
  useEffect(() => {
    // Dynamically load Swagger UI scripts
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js'
    script.onload = () => {
      // @ts-ignore
      window.ui = window.SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          // @ts-ignore
          window.SwaggerUIBundle.presets.apis,
          // @ts-ignore
          window.SwaggerUIBundle.presets.SwaggerUIStandalonePreset
        ],
      })
    }
    document.body.appendChild(script)
  }, [])

  return (
    <AppLayout breadcrumbs={[{ label: 'System' }, { label: 'API Docs' }]}>
      <div className="flex-1 bg-white rounded-lg border overflow-y-auto">
        <div id="swagger-ui"></div>
      </div>
    </AppLayout>
  )
}
