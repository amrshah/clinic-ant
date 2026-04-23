import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
    const ctx = await getAuthContext()
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'inventory', 'edit')
    if (denied) return denied

    const body = await req.json()
    const { item_id, type, quantity, reason } = body

    if (!item_id || !type || quantity === undefined) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Insert transaction
    const { data: transaction, error: txError } = await ctx.supabase
        .from('inventory_transactions')
        .insert({
            item_id,
            type,
            quantity: Number(quantity),
            reason,
            created_by: ctx.user.id,
        })
        .select()
        .single()

    if (txError) return NextResponse.json({ error: txError.message }, { status: 500 })

    // 2. Fetch current item stock
    const { data: item, error: itemError } = await ctx.supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', item_id)
        .eq('organization_id', ctx.profile.org_id)
        .single()

    if (itemError) {
        return NextResponse.json({ error: 'Failed to fetch item for stock update' }, { status: 500 })
    }

    // 3. Calculate new stock
    let stockChange = Number(quantity)
    if (type === 'out') {
        stockChange = -Number(quantity)
    }

    const newStock = Number(item.current_stock) + stockChange

    // 4. Update item stock
    const { error: updateError } = await ctx.supabase
        .from('inventory_items')
        .update({ current_stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item_id)

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update item stock' }, { status: 500 })
    }

    await createAuditLog(ctx.supabase, {
        user_id: ctx.user.id,
        org_id: ctx.profile.org_id,
        clinic_id: ctx.profile.clinic_id,
        action: 'create',
        module: 'inventory',
        record_id: transaction.id,
        details: { item_id, type, quantity, new_stock: newStock },
    })

    return NextResponse.json(transaction, { status: 201 })
}
