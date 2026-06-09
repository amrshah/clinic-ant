'use client'

import React, { useState, useEffect, useRef } from 'react'
import { addAppointment, updateAppointment, usePets, useOwners } from '@/lib/data-store'
import type { Appointment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Select as ShadcnSelect, 
  SelectContent as ShadcnSelectContent, 
  SelectItem as ShadcnSelectItem, 
  SelectTrigger as ShadcnSelectTrigger, 
  SelectValue as ShadcnSelectValue 
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useSWR from 'swr'
import { useClinic } from '@/components/providers/clinic-provider'
import { formatStaffName } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment | null
}

const typeOptions: { value: string; label: string }[] = [
  { value: 'checkup', label: 'Checkup' }, 
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'surgery', label: 'Surgery' }, 
  { value: 'grooming', label: 'Grooming' },
  { value: 'emergency', label: 'Emergency' }, 
  { value: 'follow-up', label: 'Follow-up' },
]

const statusOptions: { value: string; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' }, 
  { value: 'checked-in', label: 'Checked In' }, 
  { value: 'in-exam', label: 'In Exam' }, 
  { value: 'billing', label: 'Billing' },
  { value: 'completed', label: 'Completed' }, 
  { value: 'cancelled', label: 'Cancelled' },
]

export function AppointmentFormDialog({ open, onOpenChange, appointment }: AppointmentFormDialogProps) {
  const { currentClinicId } = useClinic()
  const { pets } = usePets()
  const { owners } = useOwners()
  const { data: staffList } = useSWR<any>(
    open ? (currentClinicId ? `/api/users?clinicId=${currentClinicId}` : '/api/users') : null,
    fetcher
  )
  
  const vets = Array.isArray(staffList) ? staffList.filter((s) => s.role === 'veterinarian') : []
  const isEditing = !!appointment
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  
  // Use a ref to track if we've initialized the form for the current open/appointment state
  const initialized = useRef(false)

  const [formData, setFormData] = useState({
    pet_id: '', 
    owner_id: '', 
    date: '', 
    time: '', 
    type: 'checkup' as Appointment['type'],
    status: 'scheduled' as Appointment['status'], 
    notes: '', 
    veterinarian_id: '',
  })

  useEffect(() => {
    if (!open) {
      initialized.current = false
      return
    }
    
    if (initialized.current) return
    initialized.current = true

    if (appointment) {
      setFormData({
        pet_id: appointment.pet_id, 
        owner_id: appointment.owner_id,
        date: appointment.date, 
        time: appointment.time, 
        type: appointment.type,
        status: appointment.status, 
        notes: appointment.notes ?? '',
        veterinarian_id: appointment.veterinarian_id ?? '',
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        pet_id: '', 
        owner_id: '', 
        date: today, 
        time: '09:00',
        type: 'checkup', 
        status: 'scheduled', 
        notes: '', 
        veterinarian_id: '',
      })
    }
  }, [open, appointment])

  const handlePetChange = (petId: string) => {
    const pet = pets.find((p) => p.id === petId)
    setFormData((prev) => ({ 
      ...prev, 
      pet_id: petId, 
      owner_id: pet?.owner_id || prev.owner_id 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        pet_id: formData.pet_id,
        owner_id: formData.owner_id,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        status: formData.status,
        notes: formData.notes || null,
        veterinarian_id: formData.veterinarian_id || null,
      }
      
      if (isEditing && appointment) {
        await updateAppointment(appointment.id, payload, currentClinicId || undefined)
        toast({ title: "Appointment Updated", description: "The appointment has been successfully updated." })
      } else {
        await addAppointment(payload, currentClinicId || undefined)
        toast({ title: "Appointment Scheduled", description: "A new appointment has been successfully scheduled." })
      }
      onOpenChange(false)
    } catch (err: any) { 
      toast({
        title: "Action Failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally { 
      setSubmitting(false) 
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the appointment details below.' : 'Fill in the details to schedule a new appointment.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pet Selection */}
            <div className="space-y-2">
              <Label htmlFor="pet">Pet</Label>
              <ShadcnSelect value={formData.pet_id} onValueChange={handlePetChange}>
                <ShadcnSelectTrigger id="pet">
                  <ShadcnSelectValue placeholder="Select pet" />
                </ShadcnSelectTrigger>
                <ShadcnSelectContent>
                  {pets.map((p) => (
                    <ShadcnSelectItem key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </ShadcnSelectItem>
                  ))}
                </ShadcnSelectContent>
              </ShadcnSelect>
            </div>

            {/* Owner Selection */}
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <ShadcnSelect 
                value={formData.owner_id} 
                onValueChange={(v) => setFormData((prev) => ({ ...prev, owner_id: v }))}
              >
                <ShadcnSelectTrigger id="owner">
                  <ShadcnSelectValue placeholder="Select owner" />
                </ShadcnSelectTrigger>
                <ShadcnSelectContent>
                  {owners.map((o) => (
                    <ShadcnSelectItem key={o.id} value={o.id}>
                      {o.display_name}
                    </ShadcnSelectItem>
                  ))}
                </ShadcnSelectContent>
              </ShadcnSelect>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))} 
                required 
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={formData.time} 
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))} 
                required 
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <ShadcnSelect 
                value={formData.type} 
                onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as Appointment['type'] }))}
              >
                <ShadcnSelectTrigger id="type">
                  <ShadcnSelectValue />
                </ShadcnSelectTrigger>
                <ShadcnSelectContent>
                  {typeOptions.map((o) => (
                    <ShadcnSelectItem key={o.value} value={o.value}>
                      {o.label}
                    </ShadcnSelectItem>
                  ))}
                </ShadcnSelectContent>
              </ShadcnSelect>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <ShadcnSelect 
                value={formData.status} 
                onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as Appointment['status'] }))}
              >
                <ShadcnSelectTrigger id="status">
                  <ShadcnSelectValue />
                </ShadcnSelectTrigger>
                <ShadcnSelectContent>
                  {statusOptions.map((o) => (
                    <ShadcnSelectItem key={o.value} value={o.value}>
                      {o.label}
                    </ShadcnSelectItem>
                  ))}
                </ShadcnSelectContent>
              </ShadcnSelect>
            </div>
          </div>

          {/* Veterinarian */}
          <div className="space-y-2">
            <Label htmlFor="vet">Veterinarian</Label>
            <ShadcnSelect 
              value={formData.veterinarian_id} 
              onValueChange={(v) => setFormData((prev) => ({ ...prev, veterinarian_id: v }))}
            >
              <ShadcnSelectTrigger id="vet">
                <ShadcnSelectValue placeholder="Select veterinarian" />
              </ShadcnSelectTrigger>
              <ShadcnSelectContent>
                {vets.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground">No veterinarians found in this clinic</div>
                ) : (
                  vets.map((v) => (
                    <ShadcnSelectItem key={v.id} value={v.id}>
                      {formatStaffName(v.first_name, v.last_name, 'veterinarian')}
                    </ShadcnSelectItem>
                  ))
                )}
              </ShadcnSelectContent>
            </ShadcnSelect>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes} 
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} 
              placeholder="Any additional notes..." 
              rows={3} 
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
