'use client'

import { useDashboard, usePets } from '@/lib/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PawPrint, Users, Calendar, Clock, CheckCircle, AlertCircle, Search, Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { type DashboardData } from '@/lib/types'

export function DashboardContent({ initialData }: { initialData?: DashboardData }) {
  const { stats, recentAppointments, isLoading } = useDashboard(initialData)
  const { pets } = usePets()

  const statCards = [
    {
      title: 'Patients',
      value: stats.totalPets,
      icon: PawPrint,
      href: '/pets',
    },
    {
      title: 'Clients',
      value: stats.totalOwners,
      icon: Users,
      href: '/owners',
    },
    {
      title: 'Today',
      value: stats.todayAppointments,
      icon: Calendar,
      href: '/appointments',
    },
    {
      title: 'Total Appts',
      value: stats.totalAppointments,
      icon: Clock,
      href: '/appointments',
    },
  ]

  const getAppointmentTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      checkup: 'Checkup',
      vaccination: 'Vaccination',
      surgery: 'Surgery',
      grooming: 'Grooming',
      emergency: 'Emergency',
      'follow-up': 'Follow-up',
    }
    return <Badge variant="outline">{labels[type] || type}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Quick Actions - Mobile First */}
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border transition-colors active:bg-muted">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="size-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-center">{stat.title}</span>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Buttons - Mobile */}
      <div className="flex gap-2 md:hidden">
        <Button asChild className="flex-1 h-12">
          <Link href="/appointments">
            <Plus className="size-4 mr-2" />
            New Appointment
          </Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1 h-12">
          <Link href="/assistant">
            <Search className="size-4 mr-2" />
            Look Up Info
          </Link>
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s your clinic overview.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/appointments">
                <Plus className="size-4 mr-2" />
                New Appointment
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/assistant">
                <Search className="size-4 mr-2" />
                Look Up Info
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Stats */}
      <div className="hidden md:grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Calendar className="size-4 md:size-5 text-primary" />
                Upcoming
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/appointments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle className="size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">All clear for now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAppointments.slice(0, 4).map((appointment) => (
                  <Link
                    key={appointment.id}
                    href="/appointments"
                    className="flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50 active:bg-muted"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <PawPrint className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {appointment.pets?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getAppointmentTypeBadge(appointment.type)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <FileText className="size-4 md:size-5 text-primary" />
                Recent Patients
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/pets">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {pets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle className="size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No patients yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pets.slice(0, 4).map((pet) => (
                  <Link
                    key={pet.id}
                    href={`/pets/${pet.id}`}
                    className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50 active:bg-muted"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <PawPrint className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{pet.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {pet.breed} - {pet.owners?.display_name || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {pet.species}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
