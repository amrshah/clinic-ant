'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PawPrint,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  ShieldCheck,
  ScrollText,
  CreditCard,
  Package,
  Send,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/components/providers/auth-provider'
import { canAccessModule, type Module } from '@/lib/permissions'
import Image from 'next/image'
import { ClinicSwitcher } from '@/components/clinic/clinic-switcher'


const navItems: { title: string; href: string; icon: typeof LayoutDashboard; module: Module }[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, module: 'dashboard' },
  { title: 'Pets', href: '/pets', icon: PawPrint, module: 'pets' },
  { title: 'Owners', href: '/owners', icon: Users, module: 'owners' },
  { title: 'Appointments', href: '/appointments', icon: Calendar, module: 'appointments' },
  { title: 'Medical Records', href: '/medical-records', icon: FileText, module: 'medical_records' },
  { title: 'Billing', href: '/billing', icon: CreditCard, module: 'billing' },
  { title: 'Inventory', href: '/inventory', icon: Package, module: 'inventory' },
  { title: 'Communications', href: '/communications', icon: Send, module: 'communications' },
  { title: 'AI Assistant', href: '/assistant', icon: MessageSquare, module: 'assistant' },
]

const adminNavItems: { title: string; href: string; icon: typeof LayoutDashboard; module: Module }[] = [
  { title: 'User Management', href: '/users', icon: ShieldCheck, module: 'users' },
  { title: 'Audit Logs', href: '/audit-logs', icon: ScrollText, module: 'audit_logs' },
]

const bottomNavItems: { title: string; href: string; icon: typeof LayoutDashboard; module: Module }[] = [
  { title: 'Settings', href: '/settings', icon: Settings, module: 'settings' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { profile } = useAuth()
  const role = profile?.role

  const handleNavClick = () => {
    setOpenMobile(false)
  }

  const allNav = [...navItems, ...adminNavItems].filter((item) =>
    canAccessModule(role, item.module)
  )

  const bottomNav = bottomNavItems.filter((item) =>
    canAccessModule(role, item.module)
  )

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={handleNavClick}
        >
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg">
            <Image
              src="/vetcare-logo-transparent.png"
              alt="VetCare Logo"
              width={36}
              height={36}
              className="size-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-none">ClinicFlow</span>
            <span className="text-xs text-sidebar-foreground/70">Clinic Management</span>
          </div>
        </Link>
        <div className="mt-4">
          <ClinicSwitcher />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allNav.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} onClick={handleNavClick}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} onClick={handleNavClick}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}

