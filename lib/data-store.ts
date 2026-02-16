'use client'

import useSWR, { mutate } from 'swr'
import type { Pet, Owner, Appointment, MedicalRecord, AgentSettings, DashboardData } from './types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// === Dashboard ===
export function useDashboard(initialData?: DashboardData) {
  const { data, error, isLoading } = useSWR<DashboardData>('/api/dashboard', fetcher, {
    fallbackData: initialData,
  })
  return {
    stats: data?.stats ?? { totalPets: 0, totalOwners: 0, totalAppointments: 0, totalRecords: 0, todayAppointments: 0 },
    recentAppointments: data?.recentAppointments ?? [],
    error,
    isLoading: !data && isLoading,
  }
}

// === Pets ===
export function usePets(initialData?: Pet[]) {
  const { data, error, isLoading } = useSWR<Pet[]>('/api/pets', fetcher, {
    fallbackData: initialData,
  })
  return { pets: data ?? [], error, isLoading: !data && isLoading }
}

export function usePet(id: string, initialData?: Pet) {
  const { data, error, isLoading } = useSWR<Pet>(id ? `/api/pets/${id}` : null, fetcher, {
    fallbackData: initialData,
  })
  return { pet: data ?? null, error, isLoading: !data && isLoading }
}

export async function addPet(body: Record<string, unknown>) {
  const res = await fetch('/api/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add pet' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/pets')
  mutate('/api/dashboard')
  return data
}

export async function updatePet(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/pets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update pet' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/pets')
  mutate(`/api/pets/${id}`)
  mutate('/api/dashboard')
  return data
}

export async function deletePet(id: string) {
  const res = await fetch(`/api/pets/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete pet' }))
    throw new Error(err.error)
  }
  mutate('/api/pets')
  mutate('/api/dashboard')
  return true
}

// === Owners ===
export function useOwners(initialData?: Owner[]) {
  const { data, error, isLoading } = useSWR<Owner[]>('/api/owners', fetcher, {
    fallbackData: initialData,
  })
  return { owners: data ?? [], error, isLoading: !data && isLoading }
}

export function useOwner(id: string, initialData?: Owner) {
  const { data, error, isLoading } = useSWR<Owner>(id ? `/api/owners/${id}` : null, fetcher, {
    fallbackData: initialData,
  })
  return { owner: data ?? null, error, isLoading: !data && isLoading }
}

export async function addOwner(body: Record<string, unknown>) {
  const res = await fetch('/api/owners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add owner' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/owners')
  mutate('/api/dashboard')
  return data
}

export async function updateOwner(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/owners/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update owner' }))
    throw new Error(err.error)
  }
  mutate('/api/owners')
  mutate(`/api/owners/${id}`)
  mutate('/api/dashboard')
  return true
}

export async function deleteOwner(id: string) {
  const res = await fetch(`/api/owners/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to delete owner' }))
    throw new Error(err.error)
  }
  mutate('/api/owners')
  mutate('/api/dashboard')
  return true
}

// === Appointments ===
export function useAppointments() {
  const { data, error, isLoading } = useSWR<Appointment[]>('/api/appointments', fetcher)
  return { appointments: data ?? [], error, isLoading }
}

export async function addAppointment(body: Record<string, unknown>) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add appointment' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/appointments')
  mutate('/api/dashboard')
  return data
}

export async function updateAppointment(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update appointment' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/appointments')
  mutate('/api/dashboard')
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
  const key = '/api/medical-records'
  const { data, error, isLoading } = useSWR<MedicalRecord[]>(key, fetcher)
  const records = petId ? (data ?? []).filter((r) => r.pet_id === petId) : data ?? []
  return { records, error, isLoading }
}

export async function addMedicalRecord(body: Record<string, unknown>) {
  const res = await fetch('/api/medical-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add record' }))
    throw new Error(err.error)
  }
  const data = await res.json()
  mutate('/api/medical-records')
  mutate('/api/dashboard')
  return data
}

// === Agent Settings (client-side only, no API) ===
const defaultAgentSettings: AgentSettings = {
  model: 'anthropic/claude-opus-4.5',
  temperature: 0.7,
  systemPrompt: `You are a helpful veterinary assistant for ClinicAnt. You help staff with:
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
