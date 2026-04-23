'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCard, ShieldCheck, CheckCircle2, Loader2, Info } from 'lucide-react'
import type { Invoice } from '@/lib/types'

interface MockPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onPaymentSuccess: (invoiceId: string) => void
}

export function MockPaymentDialog({ open, onOpenChange, invoice, onPaymentSuccess }: MockPaymentDialogProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')

  const handlePay = () => {
    setStep('processing')
    setTimeout(() => {
      setStep('success')
      if (invoice) onPaymentSuccess(invoice.id)
    }, 2000)
  }

  const handleManualPay = () => {
    if (invoice) onPaymentSuccess(invoice.id)
    setStep('success')
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset after animation
    setTimeout(() => setStep('details'), 300)
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] overflow-hidden">
        {step === 'details' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] tracking-widest font-bold">
                  Demo Mode
                </Badge>
              </div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Secure Payment
              </DialogTitle>
              <DialogDescription>
                Complete payment for Invoice <span className="font-mono text-foreground font-medium">{invoice.id.split('-')[0].toUpperCase()}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-muted/30 p-4 rounded-xl border space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payable Amount</span>
                  <span className="font-medium text-foreground">${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total to Pay</span>
                  <span className="text-2xl font-bold text-primary">${Number(invoice.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <div className="relative">
                    <Input 
                      id="card" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-6 h-4 bg-blue-600 rounded-sm opacity-50" />
                      <div className="w-6 h-4 bg-orange-500 rounded-sm opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" defaultValue="12 / 28" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" defaultValue="123" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100/50 text-amber-800 text-xs">
                <Info className="size-4 shrink-0 mt-0.5" />
                <p>
                  This is a <strong>simulated payment gateway</strong> for demonstration purposes. No real charges will be processed.
                </p>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:justify-start">
              <Button type="button" className="w-full h-11 text-lg font-semibold shadow-lg shadow-primary/20" onClick={handlePay}>
                Pay ${Number(invoice.total_amount).toFixed(2)}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary" onClick={handleManualPay}>
                Or Mark as Paid (Manual Override)
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="size-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Processing Transaction</h3>
              <p className="text-sm text-muted-foreground">Communicating with bank servers...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Payment Successful</h3>
              <p className="text-muted-foreground max-w-[280px]">
                Invoice {invoice.id.split('-')[0].toUpperCase()} has been marked as paid.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Return to Billing
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3" />
              <span>Reference: TXN-{Math.random().toString(36).substring(7).toUpperCase()}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
