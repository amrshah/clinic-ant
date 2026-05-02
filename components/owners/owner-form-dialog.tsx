'use client'

import React, { useState, useEffect, useRef } from 'react'
import { addOwner, updateOwner, addPet } from '@/lib/data-store'
import type { Owner } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, PawPrint } from 'lucide-react'
import { useClinic } from '@/components/providers/clinic-provider'

interface OwnerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  owner?: Owner | null
}

const speciesOptions = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' },
]

export function OwnerFormDialog({ open, onOpenChange, owner }: OwnerFormDialogProps) {
  const { currentClinicId } = useClinic()
  const isEditing = !!owner
  const [submitting, setSubmitting] = useState(false)
  const [showQuickAddPet, setShowQuickAddPet] = useState(false)
  const initialized = useRef(false)

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', address: '', city: '', province_state: '', postal_code: '',
  })

  const [quickPet, setQuickPet] = useState({
    name: '', species: 'dog', breed: '', date_of_birth: '', weight: '',
  })

  useEffect(() => {
    if (!open) {
      initialized.current = false
      setShowQuickAddPet(false)
      setQuickPet({ name: '', species: 'dog', breed: '', date_of_birth: '', weight: '' })
      return
    }
    if (initialized.current) return
    initialized.current = true

    if (owner) {
      setFormData({
        first_name: owner.first_name ?? '', last_name: owner.last_name ?? '',
        email: owner.email ?? '', phone: owner.phone ?? '',
        address: owner.address ?? '', city: owner.city ?? '',
        province_state: owner.province_state ?? '', postal_code: owner.postal_code ?? '',
      })
    } else {
      setFormData({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', province_state: '', postal_code: '' })
    }
  }, [open, owner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEditing && owner) {
        await updateOwner(owner.id, formData, currentClinicId)
      } else {
        const newOwner = await addOwner(formData, currentClinicId)
        // If the user also filled in a quick pet, create that too
        if (showQuickAddPet && quickPet.name && quickPet.breed) {
          await addPet({
            name: quickPet.name,
            species: quickPet.species,
            breed: quickPet.breed,
            date_of_birth: quickPet.date_of_birth,
            weight: parseFloat(quickPet.weight) || 0,
            owner_id: newOwner.id,
            notes: null,
          }, currentClinicId)
        }
      }
      onOpenChange(false)
    } catch (err: any) { 
      console.error('Failed to save owner:', err)
      alert(err.message || 'Failed to save owner. Please check your connection and try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Update the client information below.' : 'Enter the details for the new client.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main Street" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Toronto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" value={formData.province_state} onChange={(e) => setFormData({ ...formData, province_state: e.target.value })} placeholder="ON" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input id="postal_code" value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} placeholder="M5V 1A1" />
            </div>
          </div>

          {!isEditing && (
            <>
              {!showQuickAddPet ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickAddPet(true)}>
                  <PawPrint className="size-4 mr-2" />Also add a pet for this client
                </Button>
              ) : (
                <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex items-center gap-2"><Plus className="size-4" />Quick Add Pet</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowQuickAddPet(false)}>Cancel</Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="qp_name" className="text-xs">Pet Name</Label>
                      <Input id="qp_name" value={quickPet.name} onChange={(e) => setQuickPet({ ...quickPet, name: e.target.value })} placeholder="Buddy" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qp_species" className="text-xs">Species</Label>
                      <Select value={quickPet.species} onValueChange={(v) => setQuickPet({ ...quickPet, species: v })}>
                        <SelectTrigger id="qp_species"><SelectValue /></SelectTrigger>
                        <SelectContent>{speciesOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qp_breed" className="text-xs">Breed</Label>
                      <Input id="qp_breed" value={quickPet.breed} onChange={(e) => setQuickPet({ ...quickPet, breed: e.target.value })} placeholder="Golden Retriever" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qp_dob" className="text-xs">Date of Birth</Label>
                      <Input id="qp_dob" type="date" value={quickPet.date_of_birth} onChange={(e) => setQuickPet({ ...quickPet, date_of_birth: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qp_weight" className="text-xs">Weight (kg)</Label>
                      <Input id="qp_weight" type="number" step="0.1" value={quickPet.weight} onChange={(e) => setQuickPet({ ...quickPet, weight: e.target.value })} placeholder="0.0" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">This pet will be created automatically when you save the client.</p>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Client'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
