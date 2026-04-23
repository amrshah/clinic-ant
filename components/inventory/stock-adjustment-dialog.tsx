'use client'

import React, { useState, useEffect } from 'react'
import { addInventoryTransaction } from '@/lib/data-store'
import type { InventoryItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
}

export function StockAdjustmentDialog({ open, onOpenChange, item }: StockAdjustmentDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    type: 'out',
    quantity: 1,
    reason: '',
  })

  useEffect(() => {
    if (!open) return
    setFormData({
      type: 'out',
      quantity: 1,
      reason: '',
    })
  }, [open, item])

  if (!item) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.quantity <= 0) return
    
    setSubmitting(true)
    try {
      await addInventoryTransaction({
        item_id: item.id,
        type: formData.type,
        quantity: Number(formData.quantity),
        reason: formData.reason,
      })
      onOpenChange(false)
    } catch (err) {
      alert("Failed to record stock adjustment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Pre-calculate what the stock will be
  const newStock = Number(item.current_stock) + (['in', 'return'].includes(formData.type) ? Number(formData.quantity) : formData.type === 'adjustment' && Number(formData.quantity) < 0 ? Number(formData.quantity) : -Number(formData.quantity))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {item.name}</DialogTitle>
          <DialogDescription>Record a manual adjustment to your clinic's physical stock.</DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between mb-2 border">
            <span className="text-sm font-medium">Current Stock</span>
            <span className="text-lg font-bold">{item.current_stock} <span className="text-xs text-muted-foreground font-normal ml-1">{item.unit}</span></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="out"><span className="flex items-center"><ArrowDownRight className="size-3 mr-2 text-red-500"/> Disperse (Use)</span></SelectItem>
                  <SelectItem value="in"><span className="flex items-center"><ArrowUpRight className="size-3 mr-2 text-green-500"/> Restock</span></SelectItem>
                  <SelectItem value="adjustment">Count Adjustment</SelectItem>
                  <SelectItem value="return">Patient Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                step="0.01" 
                min={formData.type !== 'adjustment' ? "0.01" : undefined}
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} 
                required 
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="reason">Reason / Notes</Label>
              <Textarea 
                id="reason" 
                value={formData.reason} 
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
                placeholder="e.g. Daily use, damaged item, inventory count..." 
                rows={2} 
              />
            </div>
          </div>

          <div className="pt-2 flex items-center text-sm">
            <span className="text-muted-foreground mr-2">New projected stock:</span>
            <span className={`font-bold ${newStock < item.low_stock_threshold ? 'text-orange-600' : 'text-green-600'}`}>
                {newStock}
            </span>
            {newStock < item.low_stock_threshold && (
                <span className="flex items-center text-orange-600 text-xs ml-2">
                    <AlertTriangle className="size-3 mr-1" /> Below threshold
                </span>
            )}
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || formData.quantity === 0}>
                {submitting ? 'Applying...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
