import React from "react"

// === Database types (snake_case, matching Supabase schema) ===

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  date_of_birth: string
  weight: number
  owner_id: string
  notes: string | null
  image_url: string | null
  clinic_id: string
  created_at: string
  updated_at: string
  // Joined relation from select('*, owners(id, display_name)')
  owners?: { id: string; display_name: string } | null
}

export interface Owner {
  id: string
  display_name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  province_state?: string
  postal_code?: string
  clinic_id?: string
  created_at: string
  updated_at?: string
  // Joined from owner detail endpoint
  pets?: Pet[]
}

export interface Appointment {
  id: string
  pet_id: string
  owner_id: string
  date: string
  time: string
  type: 'checkup' | 'vaccination' | 'surgery' | 'grooming' | 'emergency' | 'follow-up'
  status: 'scheduled' | 'checked-in' | 'in-exam' | 'billing' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes: string | null
  veterinarian_id: string | null
  clinic_id: string
  created_at: string
  updated_at: string
  // Joined relations
  pets?: { id: string; name: string; species: string } | null
  owners?: { id: string; display_name: string } | null
  vet?: { id: string; first_name: string; last_name: string } | null
}

export interface MedicalRecord {
  id: string
  pet_id: string
  appointment_id?: string | null
  date: string
  type: 'vaccination' | 'prescription' | 'diagnosis' | 'procedure' | 'lab-result' | 'note'
  title: string
  description: string
  veterinarian?: string
  vet_id?: string
  attachments?: string[] | null
  clinic_id: string
  created_at: string
  updated_at: string
  // Joined relations
  pets?: { id: string; name: string; species: string } | null
}

export interface AgentSettings {
  model: string
  temperature: number
  systemPrompt: string
}

export interface DashboardData {
  clinicId: string | null
  stats: {
    totalPets: number
    totalOwners: number
    totalAppointments: number
    totalRecords: number
    todayAppointments: number
    totalRevenue: number
    lowStockAlerts: number
  }
  recentAppointments: Appointment[]
  recentRecords: MedicalRecord[]
}

export interface Invoice {
  id: string
  organization_id: string
  clinic_id: string | null
  owner_id: string
  appointment_id: string | null
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue'
  total_amount: number
  tax_amount: number
  currency: string
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  name: string
  quantity: number
  unit_price: number
  total_price: number
  inventory_item_id: string | null
  created_at: string
}

export interface InventoryItem {
  id: string
  organization_id: string
  clinic_id: string | null
  name: string
  sku: string | null
  category: string | null
  unit: string
  current_stock: number
  low_stock_threshold: number
  price: number
  cost: number
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export interface InventoryTransaction {
  id: string
  item_id: string
  organization_id: string
  clinic_id: string | null
  type: 'in' | 'out' | 'adjustment' | 'return'
  quantity: number
  reason: string | null
  created_at: string
  created_by: string | null
}

export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface Clinic {
  id: string
  organization_id: string
  name: string
  address: string | null
  city: string | null
  province_state: string | null
  postal_code: string | null
  country: string | null
  phone: string | null
  email: string | null
  timezone: string
  tagline: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
