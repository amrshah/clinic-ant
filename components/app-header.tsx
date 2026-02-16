'use client'

import { Menu, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useSidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/components/providers/auth-provider'
import { ROLE_LABELS } from '@/lib/permissions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface AppHeaderProps {
  breadcrumbs?: { label: string; href?: string }[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar()
  const { profile, signOut } = useAuth()

  const initials = profile
    ? `${(profile.first_name?.[0] ?? '').toUpperCase()}${(profile.last_name?.[0] ?? '').toUpperCase()}` || 'U'
    : 'U'

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
    : ''

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background md:bg-background bg-sidebar text-sidebar-foreground md:text-foreground border-sidebar-border md:border-border px-4 md:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto order-last text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>
      )}
      
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbLink href="/" className="font-semibold text-sidebar-primary md:text-primary">
            ClinicAnt
          </BreadcrumbLink>
          
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="contents">
              <BreadcrumbSeparator className="text-sidebar-foreground/50 md:text-muted-foreground" />
              {index === breadcrumbs.length - 1 || !crumb.href ? (
                <BreadcrumbPage className="text-sidebar-foreground md:text-foreground">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href} className="text-sidebar-foreground/80 md:text-muted-foreground">{crumb.label}</BreadcrumbLink>
              )}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {profile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2 h-auto py-1.5 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              {profile.role && (
                <p className="text-xs text-muted-foreground mt-0.5">{ROLE_LABELS[profile.role]}</p>
              )}
              {profile.clinics?.name && (
                <p className="text-xs text-muted-foreground">{profile.clinics.name}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}
