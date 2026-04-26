'use client'

import { useState } from 'react'
import { useAppointments, updateAppointment, deleteAppointment, addInvoice } from '@/lib/data-store'
import type { Appointment } from '@/lib/types'
import { useAuth } from '@/components/providers/auth-provider'
import { useClinic } from '@/components/providers/clinic-provider'
import { hasPermission } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, Check, X, Clock, Play, LogIn, Stethoscope, Receipt } from 'lucide-react'
import Link from 'next/link'
import { AppointmentFormDialog } from '@/components/appointments/appointment-form-dialog'
import { formatStaffName } from '@/lib/utils'

type StatusFilter = Appointment['status'] | 'all'
type TypeFilter = Appointment['type'] | 'all'

export function AppointmentsContent() {
  const { currentClinicId } = useClinic()
  const { appointments, isLoading } = useAppointments()
  const { profile } = useAuth()
  const role = profile?.role
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null)

  const canCreate = hasPermission(role, 'appointments', 'create')
  const canEdit = hasPermission(role, 'appointments', 'edit')
  const canDelete = hasPermission(role, 'appointments', 'delete')

  const filteredAppointments = appointments
    .filter((apt) => {
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
      const matchesType = typeFilter === 'all' || apt.type === typeFilter
      return matchesStatus && matchesType
    })
    .sort((a, b) => {
      const dateA = a.date || ''
      const dateB = b.date || ''
      const dateCompare = dateA.localeCompare(dateB)
      if (dateCompare !== 0) return dateCompare
      
      const timeA = a.time || ''
      const timeB = b.time || ''
      return timeA.localeCompare(timeB)
    })

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Status' }, 
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'checked-in', label: 'Checked In' }, 
    { value: 'in-exam', label: 'In Exam' }, 
    { value: 'billing', label: 'Billing' },
    { value: 'completed', label: 'Completed' }, 
    { value: 'cancelled', label: 'Cancelled' },
  ]
  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All Types' }, { value: 'checkup', label: 'Checkup' },
    { value: 'vaccination', label: 'Vaccination' }, { value: 'surgery', label: 'Surgery' },
    { value: 'grooming', label: 'Grooming' }, { value: 'emergency', label: 'Emergency' },
    { value: 'follow-up', label: 'Follow-up' },
  ]

  const getStatusBadge = (status: Appointment['status']) => {
    const v: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'secondary',
      'checked-in': 'default',
      'in-exam': 'outline',
      billing: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    }
    const colors: Record<string, string> = {
      'checked-in': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
      'in-exam': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
      'billing': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    }
    return (
      <Badge 
        variant={v[status] ?? 'outline'} 
        className={`capitalize ${colors[status] ?? ''}`}
      >
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const handleEdit = (apt: Appointment) => { setEditingAppointment(apt); setDialogOpen(true) }
  const handleStatusChange = async (appointment: Appointment, status: Appointment['status']) => {
    try { 
      await updateAppointment(appointment.id, { status }, currentClinicId || undefined) 
      
      // Auto-trigger billing if moving to 'billing' status
      if (status === 'billing') {
        try {
          await addInvoice({
            owner_id: appointment.owner_id,
            appointment_id: appointment.id,
            status: 'draft',
            total_amount: 0,
            tax_amount: 0,
            currency: 'USD',
            notes: `Auto-generated draft for appointment on ${appointment.date}`
          }, currentClinicId || undefined)
        } catch (err) {
          console.error('Failed to auto-create invoice:', err)
        }
      }
    } catch (err) { 
      console.error('Failed to update status:', err)
    }
  }
  const confirmDelete = async () => {
    if (deletingAppointment) {
      try { await deleteAppointment(deletingAppointment.id) } catch { /* toast */ }
      setDeletingAppointment(null)
    }
  }
  const handleDialogClose = () => { setDialogOpen(false); setEditingAppointment(null) }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-pulse text-muted-foreground">Loading appointments...</div></div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage appointments</p>
        </div>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}><Plus className="size-4 mr-2" />New Appointment</Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Appointment Schedule</CardTitle>
              <CardDescription>{filteredAppointments.length} appointments</CardDescription>
            </div>
            <div className="flex gap-1 flex-wrap">
              {statusOptions.map((o) => (
                <button key={o.value} type="button" onClick={() => setStatusFilter(o.value === statusFilter ? 'all' : o.value)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${statusFilter === o.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >{o.label}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 flex-wrap mt-2">
            {typeOptions.map((o) => (
              <button key={o.value} type="button" onClick={() => setTypeFilter(o.value === typeFilter ? 'all' : o.value)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${typeFilter === o.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >{o.label}</button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No appointments found</h3>
              <p className="text-muted-foreground">{statusFilter !== 'all' || typeFilter !== 'all' ? 'Try adjusting your filters' : 'Schedule your first appointment'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Pet</TableHead>
                    <TableHead className="hidden sm:table-cell">Owner</TableHead>
                    <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Veterinarian</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {apt.date ? new Date(apt.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : 'No Date'}
                            </p>
                            <p className="text-sm text-muted-foreground">{apt.time || 'No Time'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/pets/${apt.pet_id}`} className="font-medium hover:text-primary transition-colors">{apt.pets?.name ?? 'Unknown'}</Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Link href={`/owners/${apt.owner_id}`} className="hover:text-primary transition-colors">{apt.owners?.display_name ?? 'Unknown'}</Link>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{apt.type.replace('-', ' ')}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{apt.vet ? formatStaffName(apt.vet.first_name, apt.vet.last_name, 'veterinarian') : 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Quick Actions based on current status */}
                          {apt.status === 'scheduled' && (
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => handleStatusChange(apt, 'checked-in')}>
                              <LogIn className="size-3 mr-1" /> Check-in
                            </Button>
                          )}
                          {apt.status === 'checked-in' && (
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => handleStatusChange(apt, 'in-exam')}>
                              <Stethoscope className="size-3 mr-1" /> Exam
                            </Button>
                          )}
                          {apt.status === 'in-exam' && (
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100" onClick={() => handleStatusChange(apt, 'billing')}>
                              <Receipt className="size-3 mr-1" /> Billing
                            </Button>
                          )}
                          {apt.status === 'billing' && (
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs border-green-200 bg-green-50 text-green-700 hover:bg-green-100" onClick={() => handleStatusChange(apt, 'completed')}>
                              <Check className="size-3 mr-1" /> Complete
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /><span className="sr-only">Actions</span></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEdit && <DropdownMenuItem onClick={() => handleEdit(apt)}><Edit className="size-4 mr-2" />Edit</DropdownMenuItem>}
                              {canEdit && (<>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'scheduled')} disabled={apt.status === 'scheduled'}><Clock className="size-4 mr-2" />Re-schedule</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'checked-in')} disabled={apt.status === 'checked-in'}><LogIn className="size-4 mr-2" />Check-in</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'in-exam')} disabled={apt.status === 'in-exam'}><Stethoscope className="size-4 mr-2" />In Exam</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'billing')} disabled={apt.status === 'billing'}><Receipt className="size-4 mr-2" />Move to Billing</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'completed')} disabled={apt.status === 'completed'}><Check className="size-4 mr-2" />Complete</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(apt, 'cancelled')} disabled={apt.status === 'cancelled'}><X className="size-4 mr-2" />Cancel</DropdownMenuItem>
                              </>)}
                              {canDelete && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setDeletingAppointment(apt)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem></>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentFormDialog open={dialogOpen} onOpenChange={handleDialogClose} appointment={editingAppointment} />

      <AlertDialog open={!!deletingAppointment} onOpenChange={() => setDeletingAppointment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this appointment? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
