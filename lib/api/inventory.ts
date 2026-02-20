import { createClient } from '@/lib/supabase/server'
import { type InventoryItem } from '@/lib/types'

export async function getInventory() {
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

    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('clinic_id', profile.default_clinic_id)
        .eq('is_deleted', false)
        .order('name', { ascending: true })

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
