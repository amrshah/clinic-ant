'use client'

import React, { useState, useEffect } from 'react'
import { addInventoryItem, addInventoryTransaction } from '@/lib/data-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClinic } from '@/components/providers/clinic-provider'

interface InventoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryOptions = [
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'medication', label: 'Medication' },
  { value: 'product', label: 'Product' },
  { value: 'other', label: 'Other' },
]

export function InventoryFormDialog({ open, onOpenChange }: InventoryFormDialogProps) {
  const { currentClinicId } = useClinic()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'product',
    unit: 'unit',
    current_stock: 0,
    low_stock_threshold: 5,
    price: 0,
    cost: 0,
  })

  useEffect(() => {
    if (!open) return
    setFormData({
      name: '',
      sku: '',
      category: 'product',
      unit: 'unit',
      current_stock: 0,
      low_stock_threshold: 5,
      price: 0,
      cost: 0,
    })
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Create the item
      const newItem = await addInventoryItem({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        unit: formData.unit,
        low_stock_threshold: Number(formData.low_stock_threshold),
        price: Number(formData.price),
        cost: Number(formData.cost),
      }, currentClinicId)

      // If there is initial stock, create a transaction
      if (Number(formData.current_stock) > 0 && newItem && newItem.id) {
          await addInventoryTransaction({
              item_id: newItem.id,
              type: 'in',
              quantity: Number(formData.current_stock),
              reason: 'Initial stock entry'
          }, currentClinicId)
      }

      onOpenChange(false)
    } catch (err) {
      alert("Failed to add inventory item")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>Add a new product, medication, or vaccine to your clinic's inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Heartgard" required />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. MED-HG-01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit Type</Label>
              <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. tablet, box, vial" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Client Price ($)</Label>
              <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Unit Cost ($)</Label>
              <Input id="cost" type="number" step="0.01" min="0" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })} required />
            </div>

            <div className="space-y-2 pt-2 border-t sm:col-span-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Stock Levels</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">Initial Stock</Label>
              <Input id="current_stock" type="number" step="1" min="0" value={formData.current_stock} onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Warning At</Label>
              <Input id="low_stock_threshold" type="number" step="1" min="0" value={formData.low_stock_threshold} onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })} required />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !formData.name}>
                {submitting ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
