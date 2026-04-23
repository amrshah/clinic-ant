'use client'

import * as React from 'react'
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@/components/ui/select'
import { useClinics } from '@/lib/data-store'
import { useClinic } from '@/components/providers/clinic-provider'
import { Store } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export function ClinicSwitcher() {
  const { clinics, isLoading: clinicsLoading } = useClinics()
  const { currentClinicId, setCurrentClinicId, isLoading: contextLoading } = useClinic()
  const { profile } = useAuth()

  // Auto-select based on priority: localStorage -> assigned branch -> consolidated
  React.useEffect(() => {
    if (contextLoading || clinicsLoading || clinics.length === 0) return
    
    if (!currentClinicId) {
      const saved = localStorage.getItem('currentClinicId')
      if (saved) {
        setCurrentClinicId(saved)
      } else if (profile?.default_clinic_id) {
        setCurrentClinicId(profile.default_clinic_id)
      } else {
        setCurrentClinicId('all')
      }
    }
  }, [clinics, clinicsLoading, contextLoading, currentClinicId, setCurrentClinicId, profile])

  if (clinicsLoading || contextLoading) {
    return (
      <div className="flex h-10 w-full animate-pulse items-center rounded-md bg-muted/50 px-3">
        <div className="size-4 rounded bg-muted"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 px-1 py-2">
      <div className="flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        <Store className="size-3" />
        <span>Select Clinic Branch</span>
      </div>
      <ShadcnSelect
        value={currentClinicId || 'all'}
        onValueChange={(value) => setCurrentClinicId(value)}
      >
        <ShadcnSelectTrigger className="h-9 w-full bg-sidebar-accent/50 text-xs hover:bg-sidebar-accent border-primary/20">
          <ShadcnSelectValue placeholder="ShadcnSelect Branch" />
        </ShadcnSelectTrigger>
        <ShadcnSelectContent>
          <ShadcnSelectItem value="all" className="text-xs font-semibold text-primary border-b mb-1 uppercase tracking-tighter">
            ✨ Consolidated View
          </ShadcnSelectItem>
          {clinics.map((clinic) => (
            <ShadcnSelectItem key={clinic.id} value={clinic.id} className="text-xs">
              {clinic.name}
            </ShadcnSelectItem>
          ))}
        </ShadcnSelectContent>
      </ShadcnSelect>
    </div>
  )
}
