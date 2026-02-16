import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { SWRProvider } from '@/components/providers/swr-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ClinicAnt - Veterinary Clinic Dashboard',
  description: 'Complete veterinary clinic CRM with pet records, appointments, medical history, and AI assistant.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'ClinicAnt - Veterinary Clinic Dashboard',
    description: 'Complete veterinary clinic CRM with pet records, appointments, medical history, and AI assistant.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ClinicAnt Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicAnt - Veterinary Clinic Dashboard',
    description: 'Complete veterinary clinic CRM with pet records, appointments, medical history, and AI assistant.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SWRProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  )
}
