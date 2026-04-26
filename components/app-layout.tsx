'use client'

import React from "react"

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <footer className="border-t py-4 px-6 text-center text-xs text-muted-foreground">
          <span>
            Powered by{' '}
            <a
              href="http://silverantmarketing.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Silver Ant Marketing
            </a>
            {' '}&middot;{' '}&copy; {new Date().getFullYear()} Clinic Flow
          </span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}

