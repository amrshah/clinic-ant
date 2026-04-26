import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { SWRProvider } from '@/components/providers/swr-provider'
import { ClinicProvider } from '@/components/providers/clinic-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Clinic Flow - Veterinary Clinic Dashboard',
  description: 'Complete veterinary clinic CRM with pet records, appointments, medical history, and AI assistant.',
  icons: {
    icon: [
      { url: '/clinicflow-logo.webp', type: 'image/webp' },
    ],
    apple: '/clinicflow-logo.webp',
  },
  openGraph: {
    type: 'website',
        title: 'Clinic Flow - Veterinary Clinic Dashboard',
        description: 'Complete veterinary clinic CRM with pet records, appointments, medical history, and AI assistant.',
        images: [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Clinic Flow Dashboard Preview',
          },
        ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinic Flow - Veterinary Clinic Dashboard',
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
          <ClinicProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ClinicProvider>
        </SWRProvider>
      </body>
    </html>
  )
}

