import { createClient } from '@/lib/supabase/server'
import { type DashboardData } from '@/lib/types'

export async function getDashboardData(requestedClinicId?: string | null) {
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

    const clinicId = requestedClinicId || profile.default_clinic_id
    const isConsolidated = requestedClinicId === 'all'

    // Helper for conditional clinic filtering
    const applyClinicFilter = (query: any) => {
        // In consolidated mode, we remove clinic filters entirely and let RLS handle the ORG boundary.
        // This is safer than matching orgId which might be misaligned globally.
        if (isConsolidated) {
            return query
        }
        return query.eq('clinic_id', clinicId)
    }

    const [petsRes, ownersRes, appointmentsRes, recordsRes, todayApptsRes, revenueRes, inventoryRes] = await Promise.all([
        applyClinicFilter(supabase.from('pets').select('id', { count: 'exact', head: true }).eq('is_deleted', false)),
        applyClinicFilter(supabase.from('owners').select('id', { count: 'exact', head: true }).eq('is_deleted', false)),
        applyClinicFilter(supabase.from('appointments').select('id', { count: 'exact', head: true })),
        applyClinicFilter(supabase.from('medical_records').select('id', { count: 'exact', head: true })),
        applyClinicFilter(supabase.from('appointments')
            .select('*')
            .gte('date', new Date().toISOString().split('T')[0])
            .lte('date', new Date().toISOString().split('T')[0] + 'T23:59:59')
            .order('date', { ascending: true })
            .limit(10)),
        applyClinicFilter(supabase.from('invoices')
            .select('total_amount')
            .eq('status', 'paid')),
        applyClinicFilter(supabase.from('inventory_items')
            .select('id, current_stock, low_stock_threshold')
            .eq('is_deleted', false))
    ])

    const totalRevenue = (revenueRes.data || []).reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0)
    const lowStockAlerts = (inventoryRes.data || []).filter((item: any) => item.current_stock <= item.low_stock_threshold).length

    // Recent appointments
    const { data: recentAppointments } = await applyClinicFilter(
        supabase.from('appointments')
            .select('*, pets(id, name, species), owners(id, display_name), vet:profiles!veterinarian_id(id, first_name, last_name)')
    )
        .order('date', { ascending: true })
        .limit(5)

    // Recent medical records
    const { data: recentRecords } = await applyClinicFilter(
        supabase.from('medical_records')
            .select('*, pets(id, name, species)')
    )
        .order('date', { ascending: false })
        .limit(5)

    return {
        clinicId: isConsolidated ? 'all' : clinicId,
        stats: {
            totalPets: petsRes.count || 0,
            totalOwners: ownersRes.count || 0,
            totalAppointments: appointmentsRes.count || 0,
            totalRecords: recordsRes.count || 0,
            todayAppointments: todayApptsRes.data?.length || 0,
            totalRevenue,
            lowStockAlerts,
        },
        recentAppointments: recentAppointments || [],
        recentRecords: recentRecords || [],
    } as DashboardData
}
