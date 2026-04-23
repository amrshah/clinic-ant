import { createClient } from '@/lib/supabase/server'
import { type InventoryItem } from '@/lib/types'

export async function getInventory(requestedClinicId?: string | null) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('default_clinic_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        throw new Error('Profile not found')
    }

    const isConsolidated = requestedClinicId === 'all'
    const clinicId = isConsolidated ? null : (requestedClinicId || profile.default_clinic_id)

    let query = supabase
        .from('inventory_items')
        .select('*')
        .eq('is_deleted', false)
        .order('name', { ascending: true })

    if (!isConsolidated && clinicId) {
        query = query.eq('clinic_id', clinicId)
    }

    const { data, error } = await query

    if (error) {
        throw new Error(error.message)
    }

    return data as InventoryItem[]
}

export async function getInventoryItem(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*, inventory_transactions(*)')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}
