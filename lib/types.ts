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
  province?: string
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
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
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
  stats: {
    totalPets: number
    totalOwners: number
    totalAppointments: number
    totalRecords: number
    todayAppointments: number
  }
  recentAppointments: Appointment[]
}

export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}
