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

    const [petsRes, ownersRes, appointmentsRes, recordsRes, todayApptsRes, revenueRes, inventoryRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        supabase.from('owners').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('is_deleted', false),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
        supabase.from('medical_records').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
        // Use ISO string for consistent date filtering across server/client
        supabase.from('appointments')
            .select('*')
            .eq('clinic_id', clinicId)
            .gte('date', new Date().toISOString().split('T')[0])
            .lte('date', new Date().toISOString().split('T')[0] + 'T23:59:59')
            .order('date', { ascending: true })
            .limit(10),
        supabase.from('invoices')
            .select('total_amount')
            .eq('clinic_id', clinicId)
            .eq('status', 'paid'),
        supabase.from('inventory_items')
            .select('id, current_stock, low_stock_threshold')
            .eq('clinic_id', clinicId)
            .eq('is_deleted', false)
    ])

    const totalRevenue = (revenueRes.data || []).reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0)
    const lowStockAlerts = (inventoryRes.data || []).filter((item: any) => item.current_stock <= item.low_stock_threshold).length

    // Recent appointments
    const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('*, pets(id, name, species), owners(id, display_name), vet:profiles!veterinarian_id(id, first_name, last_name)')
        .eq('clinic_id', clinicId)
        .order('date', { ascending: true })
        .limit(5)

    // Recent medical records
    const { data: recentRecords } = await supabase
        .from('medical_records')
        .select('*, pets(id, name, species)')
        .eq('clinic_id', clinicId)
        .order('date', { ascending: false })
        .limit(5)

    return {
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
