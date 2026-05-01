import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const clinicId = searchParams.get('clinicId')
    const ctx = await getAuthContext(clinicId)
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'inventory', 'edit')
    if (denied) return denied

    const body = await req.json()
    const { item_id, type, quantity, reason } = body

    if (!item_id || !type || quantity === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch current item to get org/clinic IDs and verify access
    const { data: item, error: itemError } = await adminSupabase
        .from('inventory_items')
        .select('current_stock, organization_id, clinic_id')
        .eq('id', item_id)
        .eq('organization_id', ctx.profile.org_id)
        .single()

    if (itemError || !item) {
        logger.error('Inventory item not found or unauthorized', itemError, { item_id, org_id: ctx.profile.org_id })
        return NextResponse.json({ error: 'Item not found or access denied' }, { status: 404 })
    }

    // 2. Insert transaction with full context
    // NOTE: The database trigger 'trg_update_inventory_stock' will automatically 
    // update the current_stock in the inventory_items table after this insert.
    const { data: transaction, error: txError } = await adminSupabase
        .from('inventory_transactions')
        .insert({
            item_id,
            organization_id: item.organization_id,
            clinic_id: item.clinic_id,
            type,
            quantity: Number(quantity),
            reason,
            created_by: ctx.user.id,
        })
        .select()
        .single()

    if (txError) {
        logger.error('Failed to insert inventory transaction', txError, { item_id, type, quantity })
        return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // 3. Log Audit
    await createAuditLog(ctx.supabase, {
        user_id: ctx.user.id,
        org_id: ctx.profile.org_id,
        clinic_id: ctx.profile.clinic_id,
        action: 'create',
        module: 'inventory',
        record_id: transaction.id,
        details: { item_id, type, quantity, note: 'Stock updated via database trigger' },
    })

    return NextResponse.json(transaction, { status: 201 })
}
