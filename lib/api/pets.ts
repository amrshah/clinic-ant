import { createClient } from '@/lib/supabase/server'
import { type Pet } from '@/lib/types'

export async function getPets() {
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
        .from('pets')
        .select('*, owners(id, display_name)')
        .eq('clinic_id', profile.default_clinic_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data as Pet[]
}

export async function getPet(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('pets')
        .select('*, owners(*)')
        .eq('id', id)
        .eq('is_deleted', false)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data as Pet
}
