import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { getInvoices } from '@/lib/api/billing'

export async function GET() {
    try {
        const data = await getInvoices()
        return NextResponse.json(data)
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const ctx = await getAuthContext()
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'billing', 'create')
    if (denied) return denied

    const body = await req.json()

    const { data, error } = await ctx.supabase
        .from('invoices')
        .insert({
            ...body,
            organization_id: ctx.profile.org_id,
            clinic_id: ctx.profile.clinic_id,
            created_by: ctx.user.id,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await createAuditLog(ctx.supabase, {
        user_id: ctx.user.id,
        org_id: ctx.profile.org_id,
        clinic_id: ctx.profile.clinic_id,
        action: 'create',
        module: 'billing',
        record_id: data.id,
        details: { owner_id: body.owner_id, total_amount: body.total_amount },
    })

    return NextResponse.json(data, { status: 201 })
}
