'use client'

import React, { useState, useEffect, useRef } from 'react'
import { addPet, updatePet, useOwners, addOwner } from '@/lib/data-store'
import type { Pet } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, UserPlus } from 'lucide-react'

interface PetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet?: Pet | null
  preselectedOwnerId?: string
}

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' },
]

export function PetFormDialog({ open, onOpenChange, pet, preselectedOwnerId }: PetFormDialogProps) {
  const { owners } = useOwners()
  const isEditing = !!pet
  const [submitting, setSubmitting] = useState(false)
  const [showQuickAddOwner, setShowQuickAddOwner] = useState(false)
  const [addingOwner, setAddingOwner] = useState(false)
  const initialized = useRef(false)

  const [formData, setFormData] = useState({
    name: '', species: 'dog', breed: '', date_of_birth: '', weight: '', owner_id: '', notes: '',
  })

  const [quickOwner, setQuickOwner] = useState({
    first_name: '', last_name: '', email: '', phone: '',
  })

  useEffect(() => {
    if (!open) {
      initialized.current = false
      setShowQuickAddOwner(false)
      setQuickOwner({ first_name: '', last_name: '', email: '', phone: '' })
      return
    }
    if (initialized.current) return
    initialized.current = true

    if (pet) {
      setFormData({
        name: pet.name, species: pet.species, breed: pet.breed,
        date_of_birth: pet.date_of_birth ?? '',
        weight: pet.weight != null ? String(pet.weight) : '',
        owner_id: pet.owner_id ?? '', notes: pet.notes ?? '',
      })
    } else {
      setFormData({
        name: '', species: 'dog', breed: '', date_of_birth: '', weight: '',
        owner_id: preselectedOwnerId || '', notes: '',
      })
    }
  }, [open, pet, preselectedOwnerId])

  const handleQuickAddOwner = async () => {
    if (!quickOwner.first_name || !quickOwner.last_name) return
    setAddingOwner(true)
    try {
      const newOwner = await addOwner(quickOwner)
      setFormData(prev => ({ ...prev, owner_id: newOwner.id }))
      setShowQuickAddOwner(false)
      setQuickOwner({ first_name: '', last_name: '', email: '', phone: '' })
    } catch {
      /* handled */
    } finally {
      setAddingOwner(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.owner_id) return
    setSubmitting(true)
    try {
      const body = {
        name: formData.name, species: formData.species, breed: formData.breed,
        date_of_birth: formData.date_of_birth,
        weight: parseFloat(formData.weight) || 0,
        owner_id: formData.owner_id, notes: formData.notes || null,
      }
      if (isEditing && pet) {
        await updatePet(pet.id, body)
      } else {
        await addPet(body)
      }
      onOpenChange(false)
    } catch { /* error handling */ } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update the pet information below.' : 'Enter the details for the new pet.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Pet's name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Select value={formData.species} onValueChange={(v) => setFormData({ ...formData, species: v })}>
                <SelectTrigger id="species"><SelectValue placeholder="Select species" /></SelectTrigger>
                <SelectContent>{speciesOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="e.g., Golden Retriever" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" min="0" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="0.0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              {owners.length > 0 ? (
                <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                  <SelectTrigger id="owner"><SelectValue placeholder="Select owner" /></SelectTrigger>
                  <SelectContent>{owners.map((o) => <SelectItem key={o.id} value={o.id}>{o.display_name}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground py-2">No owners yet. Add one below.</p>
              )}
              {!showQuickAddOwner && (
                <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={() => setShowQuickAddOwner(true)}>
                  <UserPlus className="size-4 mr-2" />New Owner
                </Button>
              )}
            </div>
          </div>

          {showQuickAddOwner && (
            <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2"><Plus className="size-4" />Quick Add Owner</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowQuickAddOwner(false)}>Cancel</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="qo_first" className="text-xs">First Name</Label>
                  <Input id="qo_first" value={quickOwner.first_name} onChange={(e) => setQuickOwner({ ...quickOwner, first_name: e.target.value })} placeholder="John" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qo_last" className="text-xs">Last Name</Label>
                  <Input id="qo_last" value={quickOwner.last_name} onChange={(e) => setQuickOwner({ ...quickOwner, last_name: e.target.value })} placeholder="Doe" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qo_email" className="text-xs">Email</Label>
                  <Input id="qo_email" type="email" value={quickOwner.email} onChange={(e) => setQuickOwner({ ...quickOwner, email: e.target.value })} placeholder="john@email.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="qo_phone" className="text-xs">Phone</Label>
                  <Input id="qo_phone" type="tel" value={quickOwner.phone} onChange={(e) => setQuickOwner({ ...quickOwner, phone: e.target.value })} placeholder="(555) 123-4567" />
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleQuickAddOwner} disabled={addingOwner || !quickOwner.first_name || !quickOwner.last_name}>
                {addingOwner ? 'Adding...' : 'Add & Select Owner'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes about the pet..." rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !formData.owner_id}>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Pet'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
