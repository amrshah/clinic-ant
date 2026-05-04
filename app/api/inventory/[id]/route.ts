import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { searchParams } = new URL(req.url)
    const clinicId = searchParams.get('clinicId')
    const ctx = await getAuthContext(clinicId)
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'inventory', 'delete')
    if (denied) return denied

    const { id } = await params
    logger.info('Deleting inventory item', { org_id: ctx.profile.org_id, item_id: id })

    const isConsolidated = ctx.profile.clinic_id === 'all'
    const adminSupabase = createAdminClient()

    let deleteQuery = adminSupabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
    
    if (!isConsolidated) {
        deleteQuery = deleteQuery.eq('clinic_id', ctx.profile.clinic_id)
    }

    const { error } = await deleteQuery

    if (error) {
        logger.error('Database error deleting inventory item', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await createAuditLog(ctx.supabase, {
        user_id: ctx.user.id,
        org_id: ctx.profile.org_id,
        clinic_id: ctx.profile.clinic_id,
        action: 'delete',
        module: 'inventory',
        record_id: id,
    })

    return NextResponse.json({ success: true })
}
