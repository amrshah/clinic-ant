import { createClient } from '@/lib/supabase/server'
import { type Invoice } from '@/lib/types'

export async function getInvoices() {
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
        .from('invoices')
        .select('*, owners(id, display_name)')
        .eq('clinic_id', profile.default_clinic_id)
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data as (Invoice & { owners: { id: string, display_name: string } })[]
}

export async function getInvoice(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invoices')
        .select('*, owners(*), invoice_items(*)')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}
