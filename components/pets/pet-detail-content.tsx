'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePet, useMedicalRecords, useAppointments } from '@/lib/data-store'
import { useAuth } from '@/components/providers/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  PawPrint, User, Calendar, FileText, Edit, ArrowLeft,
  Syringe, Stethoscope, Pill, FlaskConical, StickyNote,
} from 'lucide-react'
import { PetFormDialog } from './pet-form-dialog'

interface PetDetailContentProps { petId: string }

const recordTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  vaccination: Syringe, diagnosis: Stethoscope, prescription: Pill,
  procedure: FlaskConical, 'lab-result': FlaskConical, note: StickyNote,
}

export function PetDetailContent({ petId }: PetDetailContentProps) {
  const { pet, isLoading: petLoading } = usePet(petId)
  const { records } = useMedicalRecords(petId)
  const { appointments } = useAppointments()
  const { profile } = useAuth()
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const canEdit = hasPermission(profile?.role, 'pets', 'edit')

  const petAppointments = appointments
    .filter((a) => a.pet_id === petId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birth = new Date(dob)
    let years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) years--
    const monthAge = months < 0 ? 12 + months : months
    return `${years} years${monthAge > 0 ? `, ${monthAge} months` : ''}`
  }

  if (petLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-pulse text-muted-foreground">Loading pet details...</div></div>
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <PawPrint className="size-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Pet Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested pet could not be found.</p>
        <Button asChild><Link href="/pets"><ArrowLeft className="size-4 mr-2" />Back to Pets</Link></Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/pets"><ArrowLeft className="size-4" /></Link></Button>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><PawPrint className="size-6" /></div>
            <div>
              <h1 className="text-2xl font-bold">{pet.name}</h1>
              <p className="text-muted-foreground">{pet.breed} ({pet.species})</p>
            </div>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => setEditDialogOpen(true)}><Edit className="size-4 mr-2" />Edit Pet</Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PawPrint className="size-5" />Pet Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Species</p><p className="font-medium capitalize">{pet.species}</p></div>
                <div><p className="text-sm text-muted-foreground">Breed</p><p className="font-medium">{pet.breed}</p></div>
                <div><p className="text-sm text-muted-foreground">Age</p><p className="font-medium">{calculateAge(pet.date_of_birth)}</p></div>
                <div><p className="text-sm text-muted-foreground">Weight</p><p className="font-medium">{pet.weight} kg</p></div>
                <div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-medium">{new Date(pet.date_of_birth).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <div><p className="text-sm text-muted-foreground">Registered</p><p className="font-medium">{new Date(pet.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
              </div>
              {pet.notes && (<><Separator className="my-4" /><div><p className="text-sm text-muted-foreground mb-1">Notes</p><p className="text-sm">{pet.notes}</p></div></>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="size-5" />Medical History</CardTitle>
              <CardDescription>{records.length} records on file</CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No medical records yet</div>
              ) : (
                <div className="space-y-4">
                  {records.slice(0, 5).map((record) => {
                    const Icon = recordTypeIcons[record.type] || FileText
                    return (
                      <div key={record.id} className="flex gap-4 rounded-lg border p-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"><Icon className="size-5" /></div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{record.title}</p>
                              <p className="text-sm text-muted-foreground">{record.veterinarian ?? 'N/A'} - {new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">{record.type.replace('-', ' ')}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{record.description}</p>
                        </div>
                      </div>
                    )
                  })}
                  {records.length > 5 && (
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/medical-records?petId=${petId}`}>View All Records ({records.length})</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pet.owners && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="size-5" />Owner Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/owners/${pet.owner_id}`} className="text-lg font-medium hover:text-primary transition-colors">{pet.owners.display_name}</Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="size-5" />Appointments</CardTitle>
              <CardDescription>Recent and upcoming visits</CardDescription>
            </CardHeader>
            <CardContent>
              {petAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">No appointments scheduled</div>
              ) : (
                <div className="space-y-3">
                  {petAppointments.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium capitalize">{apt.type.replace('-', ' ')}</p>
                        <p className="text-muted-foreground">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                      </div>
                      <Badge variant={apt.status === 'completed' ? 'secondary' : apt.status === 'confirmed' ? 'default' : 'outline'}>{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PetFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} pet={pet} />
    </div>
  )
}
