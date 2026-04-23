import { createClient } from '@/lib/supabase/server'
import { type Owner } from '@/lib/types'

export async function getOwners(requestedClinicId?: string | null) {
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
        .from('owners')
        .select('*, pets(id, name, species)')

    if (!isConsolidated && clinicId) {
        query = query.eq('clinic_id', clinicId)
    }

    const { data, error } = await query
        .eq('is_deleted', false)
        .order('display_name', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data as Owner[]
}

export async function getOwner(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('owners')
        .select('*, pets(*)')
        .eq('id', id)
        .eq('is_deleted', false)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as Owner
}
