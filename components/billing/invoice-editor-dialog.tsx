'use client'

import React, { useState, useEffect } from 'react'
import { useInvoice, updateInvoice, useOwners, useInventory } from '@/lib/data-store'
import type { InvoiceItem, InventoryItem, Invoice } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useClinic } from '@/components/providers/clinic-provider'
import { useToast } from '@/hooks/use-toast'

interface InvoiceEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string | null
}

type PartialInvoiceItem = Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>

const tomkenServices = [
  { name: 'Wellness Exam', price: 85.00, category: 'service' },
  { name: 'Vaccination', price: 45.00, category: 'vaccine' },
  { name: 'Cat Spay', price: 250.00, category: 'service' },
  { name: 'Dog Spay', price: 350.00, category: 'service' },
  { name: 'Lab Diagnostics', price: 120.00, category: 'lab' },
  { name: 'Dentistry', price: 400.00, category: 'service' },
  { name: 'Urgent Care', price: 150.00, category: 'service' },
]

export function InvoiceEditorDialog({ open, onOpenChange, invoiceId }: InvoiceEditorDialogProps) {
  const { currentClinicId } = useClinic()
  const { invoice, isLoading: invoiceLoading } = useInvoice(invoiceId || '')
  const { owners } = useOwners()
  const { inventory } = useInventory()
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    owner_id: '',
    due_date: '',
    status: 'draft',
    notes: '',
    tax_rate: 13,
    discount_amount: 0,
  })

  const [items, setItems] = useState<PartialInvoiceItem[]>([])

  useEffect(() => {
    if (open && invoice) {
      setFormData({
        owner_id: invoice.owner_id,
        due_date: invoice.due_date || '',
        status: invoice.status,
        notes: invoice.notes || '',
        tax_rate: 13, // Defaulting if not in schema, or we could calculate from tax_amount
        discount_amount: 0, // Defaulting
      })
      
      if ((invoice as any).invoice_items) {
        setItems((invoice as any).invoice_items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.total_price,
          inventory_item_id: i.inventory_item_id
        })))
      }
    }
  }, [open, invoice])

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
  const discountTotal = formData.discount_amount
  const taxableAmount = Math.max(0, subtotal - discountTotal)
  const taxTotal = (taxableAmount * formData.tax_rate) / 100
  const finalTotal = taxableAmount + taxTotal

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unit_price: 0, total_price: 0, inventory_item_id: null }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PartialInvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = Number(newItems[index].quantity) * Number(newItems[index].unit_price)
    }
    setItems(newItems)
  }

  const applyServiceFromCatalog = (index: number, selectionId: string) => {
    const service = tomkenServices.find(s => s.name === selectionId)
    if (service) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        name: service.name,
        unit_price: service.price,
        total_price: service.price * newItems[index].quantity,
        inventory_item_id: null
      }
      setItems(newItems)
      return
    }

    const invItem = inventory.find(i => i.id === selectionId)
    if (invItem) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        name: invItem.name,
        unit_price: Number(invItem.price),
        total_price: Number(invItem.price) * newItems[index].quantity,
        inventory_item_id: invItem.id
      }
      setItems(newItems)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceId || items.length === 0) return
    
    setSubmitting(true)
    try {
      await updateInvoice(invoiceId, {
        ...formData,
        total_amount: finalTotal,
        tax_amount: taxTotal,
        items: items
      }, currentClinicId)
      toast({ title: "Invoice Updated", description: "Changes have been saved successfully." })
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>Modify invoice details and line items.</DialogDescription>
        </DialogHeader>

        {invoiceLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p>Loading invoice data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="owner">Client / Owner</Label>
                <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                  <SelectTrigger id="owner"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {owners.map((o) => <SelectItem key={o.id} value={o.id}>{o.display_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Due Date</Label>
                <Input id="date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-3">
                 <Label htmlFor="status">Status</Label>
                 <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                   <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="draft">Draft</SelectItem>
                     <SelectItem value="sent">Sent to Client</SelectItem>
                     <SelectItem value="paid">Paid</SelectItem>
                     <SelectItem value="cancelled">Cancelled</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="size-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col gap-3 border p-3 rounded-lg bg-muted/20 relative group">
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <div className="flex-1 space-y-2 w-full">
                        <Label className="text-xs">Service / Product</Label>
                        <div className="flex gap-2">
                          <Select onValueChange={(v) => applyServiceFromCatalog(index, v)}>
                            <SelectTrigger className="w-10 px-0 flex justify-center shrink-0 h-9" title="Services Catalog">
                              <Plus className="size-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">Services</div>
                              {tomkenServices.map(s => (
                                <SelectItem key={s.name} value={s.name}>{s.name} (${s.price})</SelectItem>
                              ))}
                              {inventory.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1 border-t">Inventory Products</div>
                                  {inventory.map(i => (
                                    <SelectItem key={i.id} value={i.id}>{i.name} (${Number(i.price).toFixed(2)})</SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <Input 
                            value={item.name} 
                            onChange={(e) => updateItem(index, 'name', e.target.value)} 
                            placeholder="Item name..." 
                            required 
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="w-20 space-y-2 shrink-0">
                        <Label className="text-xs">Qty</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          step="1"
                          value={item.quantity} 
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} 
                        />
                      </div>
                      <div className="w-24 space-y-2 shrink-0">
                        <Label className="text-xs">Price</Label>
                        <Input 
                          type="number" 
                          min="0"
                          step="0.01" 
                          value={item.unit_price} 
                          onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))} 
                        />
                      </div>
                      <div className="pt-7 shrink-0">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-500/10 h-9 w-9"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-6 border-t pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input 
                      id="tax_rate" 
                      type="number" 
                      value={formData.tax_rate} 
                      onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Amount ($)</Label>
                    <Input 
                      id="discount" 
                      type="number" 
                      value={formData.discount_amount} 
                      onChange={(e) => setFormData({ ...formData, discount_amount: Number(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>-${discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax ({formData.tax_rate}%)</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t mt-2 pt-2">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-xl font-black text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Notes for Client</Label>
              <Textarea id="desc" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="..." rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || items.length === 0}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
