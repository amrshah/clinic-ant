'use client'

import useSWR, { mutate } from 'swr'
import type {
  Pet, Owner, Appointment, MedicalRecord, AgentSettings, DashboardData,
  Invoice, InvoiceItem, InventoryItem, InventoryTransaction, Clinic
} from './types'
import { useClinic } from '@/components/providers/clinic-provider'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// === Clinics ===
export function useClinics() {
  const { data, error, isLoading } = useSWR<Clinic[]>('/api/clinics', fetcher)
  return { clinics: data ?? [], error, isLoading }
}

// === Dashboard ===
export function useDashboard(initialData?: DashboardData) {
  const { currentClinicId } = useClinic()
  // Key changes whenever clinic switches, forcing a new fetch
  const key = currentClinicId ? `/api/dashboard?clinicId=${currentClinicId}` : null
  
  const { data, error, isLoading } = useSWR<DashboardData>(key, fetcher, {
    // Never use SSR fallback — always fetch fresh data for the selected clinic
    revalidateOnMount: true,
    revalidateOnFocus: false,
    dedupingInterval: 0, // No deduplication so switching clinics always re-fetches
  })
  
  return {
    stats: data?.stats ?? { totalPets: 0, totalOwners: 0, totalAppointments: 0, totalRecords: 0, todayAppointments: 0, totalRevenue: 0, lowStockAlerts: 0 },
    recentAppointments: data?.recentAppointments ?? [],
    recentRecords: data?.recentRecords ?? [],
    error,
    isLoading: !data && isLoading,
  }
}

// === Pets ===
export function usePets(initialData?: Pet[]) {
  const { currentClinicId } = useClinic()
  const key = currentClinicId ? `/api/pets?clinicId=${currentClinicId}` : '/api/pets'
  
  // Only use server-side fallback if we are on the default clinic
  const effectiveFallback = !currentClinicId ? initialData : undefined

  const { data, error, isLoading } = useSWR<Pet[]>(key, fetcher, {
    fallbackData: effectiveFallback,
    revalidateOnFocus: false,
  })
  return { pets: data ?? [], error, isLoading: !data && isLoading }
}

export function usePet(id: string, initialData?: Pet) {
  const { currentClinicId } = useClinic()
  const key = id ? (currentClinicId ? `/api/pets/${id}?clinicId=${currentClinicId}` : `/api/pets/${id}`) : null
  const { data, error, isLoading } = useSWR<Pet>(key, fetcher, {
    fallbackData: initialData,
  })
  return { pet: data ?? null, error, isLoading: !data && isLoading }
}

export async function addPet(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/pets?clinicId=${clinicId}` : '/api/pets'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add pet' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/pets'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

export async function updatePet(id: string, body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/pets/${id}?clinicId=${clinicId}` : `/api/pets/${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update pet' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/pets'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

export async function deletePet(id: string, clinicId?: string) {
  const url = clinicId ? `/api/pets/${id}?clinicId=${clinicId}` : `/api/pets/${id}`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete pet' }))
    throw new Error(err.error)
  }
  mutate(key => typeof key === 'string' && key.startsWith('/api/pets'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return true
}

// === Owners ===
export function useOwners(initialData?: Owner[]) {
  const { currentClinicId } = useClinic()
  const key = currentClinicId ? `/api/owners?clinicId=${currentClinicId}` : '/api/owners'

  // Only use server-side fallback if we are on the default clinic
  const effectiveFallback = !currentClinicId ? initialData : undefined

  const { data, error, isLoading } = useSWR<Owner[]>(key, fetcher, {
    fallbackData: effectiveFallback,
    revalidateOnFocus: false,
  })
  return { owners: data ?? [], error, isLoading: !data && isLoading }
}

export function useOwner(id: string, initialData?: Owner) {
  const { currentClinicId } = useClinic()
  const key = id ? (currentClinicId ? `/api/owners/${id}?clinicId=${currentClinicId}` : `/api/owners/${id}`) : null
  const { data, error, isLoading } = useSWR<Owner>(key, fetcher, {
    fallbackData: initialData,
  })
  return { owner: data ?? null, error, isLoading: !data && isLoading }
}

export async function addOwner(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/owners?clinicId=${clinicId}` : '/api/owners'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add owner' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/owners'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

export async function updateOwner(id: string, body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/owners/${id}?clinicId=${clinicId}` : `/api/owners/${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update owner' }))
    throw new Error(err.error)
  }
  mutate(key => typeof key === 'string' && key.startsWith('/api/owners'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return true
}

export async function deleteOwner(id: string, clinicId?: string) {
  const url = clinicId ? `/api/owners/${id}?clinicId=${clinicId}` : `/api/owners/${id}`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete owner' }))
    throw new Error(err.error)
  }
  mutate(key => typeof key === 'string' && key.startsWith('/api/owners'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return true
}

// === Appointments ===
export function useAppointments() {
  const { currentClinicId } = useClinic()
  const key = currentClinicId ? `/api/appointments?clinicId=${currentClinicId}` : '/api/appointments'
  const { data, error, isLoading } = useSWR<Appointment[]>(key, fetcher)
  return { appointments: data ?? [], error, isLoading }
}

export async function addAppointment(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/appointments?clinicId=${clinicId}` : '/api/appointments'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add appointment' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/appointments'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

export async function updateAppointment(id: string, body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/appointments/${id}?clinicId=${clinicId}` : `/api/appointments/${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update appointment' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/appointments'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

export async function deleteAppointment(id: string) {
  const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete appointment' }))
    throw new Error(err.error)
  }
  mutate('/api/appointments')
  mutate('/api/dashboard')
  return true
}

// === Medical Records ===
export function useMedicalRecords(petId?: string) {
  const key = petId ? `/api/medical-records?petId=${petId}` : '/api/medical-records'
  const { data, error, isLoading } = useSWR<MedicalRecord[]>(key, fetcher)
  return { records: data ?? [], error, isLoading }
}

export async function addMedicalRecord(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/medical-records?clinicId=${clinicId}` : '/api/medical-records'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add record' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/medical-records'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

// === Agent Settings (client-side only, no API) ===
const defaultAgentSettings: AgentSettings = {
  model: 'anthropic/claude-opus-4.5',
  temperature: 0.7,
  systemPrompt: `You are a helpful veterinary assistant for Clinic Flow. You help staff with:
- Looking up patient and owner information
- Scheduling appointments
- Answering common veterinary questions
- Providing reminders about vaccinations and follow-ups

Always be professional, empathetic, and accurate in your responses.`,
}

let agentSettingsStore: AgentSettings = { ...defaultAgentSettings }
const agentSettingsFetcher = () => Promise.resolve(agentSettingsStore)

export function useAgentSettings() {
  const { data, error, isLoading } = useSWR<AgentSettings>('agent-settings', agentSettingsFetcher)
  return { settings: data ?? agentSettingsStore, error, isLoading }
}

export function updateAgentSettings(settings: Partial<AgentSettings>) {
  agentSettingsStore = { ...agentSettingsStore, ...settings }
  mutate('agent-settings')
  return agentSettingsStore
}

// === Billing ===
export function useInvoices() {
  const { currentClinicId } = useClinic()
  const key = currentClinicId ? `/api/invoices?clinicId=${currentClinicId}` : '/api/invoices'
  const { data, error, isLoading } = useSWR<Invoice[]>(key, fetcher, {
    revalidateOnFocus: false,
  })
  return { invoices: data ?? [], error, isLoading }
}

export function useInvoice(id: string) {
  const { data, error, isLoading } = useSWR<Invoice>(id ? `/api/invoices/${id}` : null, fetcher)
  return { invoice: data ?? null, error, isLoading }
}

export async function addInvoice(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/invoices?clinicId=${clinicId}` : '/api/invoices'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add invoice' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/invoices'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/inventory'))
  return data
}

export async function updateInvoice(id: string, body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/invoices?clinicId=${clinicId}` : `/api/invoices`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...body }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update invoice' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/invoices'))
  mutate(key => typeof key === 'string' && key.startsWith('/api/dashboard'))
  return data
}

// === Inventory ===
export function useInventory() {
  const { currentClinicId } = useClinic()
  const key = currentClinicId ? `/api/inventory?clinicId=${currentClinicId}` : '/api/inventory'
  const { data, error, isLoading } = useSWR<InventoryItem[]>(key, fetcher, {
    revalidateOnFocus: false,
  })
  return { inventory: data ?? [], error, isLoading }
}

export function useInventoryItem(id: string) {
  const { data, error, isLoading } = useSWR<InventoryItem>(id ? `/api/inventory/${id}` : null, fetcher)
  return { item: data ?? null, error, isLoading }
}

export async function addInventoryItem(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/inventory?clinicId=${clinicId}` : '/api/inventory'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add item' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate(key => typeof key === 'string' && key.startsWith('/api/inventory'))
  return data
}

export async function addInventoryTransaction(body: Record<string, unknown>, clinicId?: string) {
  const url = clinicId ? `/api/inventory/transactions?clinicId=${clinicId}` : '/api/inventory/transactions'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add transaction' }))
    throw new Error(err.error)
  }
  mutate(key => typeof key === 'string' && key.startsWith('/api/inventory'))
  if (body.item_id) mutate(key => typeof key === 'string' && key.includes(`/api/inventory/${body.item_id}`))
  return true
}

