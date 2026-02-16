import { createClient } from '@/lib/supabase/server'
import { type DashboardData } from '@/lib/types'

export async function getDashboardData() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        throw new Error('Profile not found')
    }

    const clinicId = profile.default_clinic_id

    const [petsRes, ownersRes, appointmentsRes, recordsRes, todayApptsRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        supabase.from('owners').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        supabase.from('medical_records').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        // Use ISO string for consistent date filtering across server/client
        supabase.from('appointments')
            .select('*')
            .eq('clinic_id', clinicId)
            .eq('is_deleted', false)
            .gte('date', new Date().toISOString().split('T')[0])
            .lte('date', new Date().toISOString().split('T')[0] + 'T23:59:59')
            .order('date', { ascending: true })
            .limit(10),
    ])

    // Recent appointments
    const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('*, pets(id, name, species), owners(id, display_name), vet:profiles!veterinarian_id(id, first_name, last_name)')
        .eq('clinic_id', clinicId)
        .eq('is_deleted', false)
        .order('date', { ascending: true })
        .limit(5)

    return {
        stats: {
            totalPets: petsRes.count || 0,
            totalOwners: ownersRes.count || 0,
            totalAppointments: appointmentsRes.count || 0,
            totalRecords: recordsRes.count || 0,
            todayAppointments: todayApptsRes.data?.length || 0,
        },
        recentAppointments: recentAppointments || [],
    } as DashboardData
}
