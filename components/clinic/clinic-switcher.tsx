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
import { Store, ChevronDown } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export function ClinicSwitcher() {
  const { clinics, isLoading: clinicsLoading } = useClinics()
  const { currentClinicId, setCurrentClinicId, isLoading: contextLoading } = useClinic()
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const currentClinic = clinics.find((c) => c.id === currentClinicId)

  // Auto-select based on priority: profile default (new session) -> localStorage -> first available
  React.useEffect(() => {
    if (contextLoading || clinicsLoading || clinics.length === 0) return
    
    const sessionStarted = sessionStorage.getItem('clinic_session_started')
    
    if (!sessionStarted && profile?.default_clinic_id) {
      // New session: Always use profile default
      setCurrentClinicId(profile.default_clinic_id)
      sessionStorage.setItem('clinic_session_started', 'true')
    } else if (!currentClinicId) {
      // Fallback for subsequent loads or if no profile default
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
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50",
            isOpen ? "bg-muted/30" : ""
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="size-3 shrink-0 text-primary" />
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-700">
              {currentClinic?.name || '✨ Consolidated View'}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-3 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="flex flex-col gap-1.5 px-1">
          <ShadcnSelect
            value={currentClinicId || 'all'}
            onValueChange={(value) => {
              setCurrentClinicId(value)
              setIsOpen(false)
            }}
          >
            <ShadcnSelectTrigger className="h-9 w-full bg-sidebar-accent/30 text-xs hover:bg-sidebar-accent border-primary/10">
              <ShadcnSelectValue placeholder="Select Branch" />
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
      </CollapsibleContent>
    </Collapsible>
  )
}
