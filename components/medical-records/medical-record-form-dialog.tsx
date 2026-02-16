'use client'

import React, { useState, useEffect } from 'react'
import { addMedicalRecord, usePets } from '@/lib/data-store'
import type { MedicalRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MedicalRecordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId?: string
}

const typeOptions: { value: MedicalRecord['type']; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' }, { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'prescription', label: 'Prescription' }, { value: 'procedure', label: 'Procedure' },
  { value: 'lab-result', label: 'Lab Result' }, { value: 'note', label: 'Note' },
]

export function MedicalRecordFormDialog({ open, onOpenChange, petId: initialPetId }: MedicalRecordFormDialogProps) {
  const { pets } = usePets()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    pet_id: initialPetId || '', date: '', type: 'vaccination' as MedicalRecord['type'],
    title: '', description: '', veterinarian: '',
  })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData({
      pet_id: initialPetId || pets[0]?.id || '', date: today,
      type: 'vaccination', title: '', description: '', veterinarian: '',
    })
  }, [initialPetId, pets, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addMedicalRecord(formData)
      onOpenChange(false)
    } catch { /* error */ } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
          <DialogDescription>Create a new medical record for a patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pet">Patient</Label>
              <Select value={formData.pet_id} onValueChange={(v) => setFormData({ ...formData, pet_id: v })}>
                <SelectTrigger id="pet"><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Record Type</Label>
              <Select value={formData.type} onValueChange={(v: MedicalRecord['type']) => setFormData({ ...formData, type: v })}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>{typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vet">Veterinarian</Label>
              <Input id="vet" value={formData.veterinarian} onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })} placeholder="Dr. Smith" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Annual Vaccination" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed notes..." rows={4} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Record'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
