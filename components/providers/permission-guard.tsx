'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { hasPermission, canAccessModule, type Module, type Action } from '@/lib/permissions'
import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PermissionGuardProps {
  module: Module
  action?: Action
  children: React.ReactNode
  fallback?: React.ReactNode
  hide?: boolean
}

export function PermissionGuard({ module, action, children, fallback, hide = false }: PermissionGuardProps) {
  const { profile } = useAuth()

  const hasAccess = action
    ? hasPermission(profile?.role, module, action)
    : canAccessModule(profile?.role, module)

  if (!hasAccess) {
    if (hide) return null
    if (fallback) return <>{fallback}</>
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You do not have permission to access this module. Contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Hook version for inline checks
export function usePermission(module: Module, action: Action): boolean {
  const { profile } = useAuth()
  return hasPermission(profile?.role, module, action)
}

export function useModuleAccess(module: Module): boolean {
  const { profile } = useAuth()
  return canAccessModule(profile?.role, module)
}
