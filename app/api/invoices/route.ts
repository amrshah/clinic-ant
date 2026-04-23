import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { getInvoices } from '@/lib/api/billing'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get('clinicId')

    try {
        const data = await getInvoices(clinicId)
        return NextResponse.json(data)
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        logger.error('Failed to fetch invoices', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const clinicId = searchParams.get('clinicId')
    const ctx = await getAuthContext(clinicId)
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'billing', 'create')
    if (denied) return denied

    const body = await req.json()
    const { items, ...invoiceData } = body

    logger.info('Creating new invoice', { org_id: ctx.profile.org_id, owner_id: invoiceData.owner_id })

    // Build invoice record
    const targetClinicId = ctx.profile.clinic_id === 'all' ? ctx.profile.default_clinic_id : ctx.profile.clinic_id
    
    const { data: invoice, error } = await ctx.supabase
        .from('invoices')
        .insert({
            organization_id: ctx.profile.org_id,
            clinic_id: targetClinicId,
            owner_id: body.owner_id,
            appointment_id: body.appointment_id || null,
            status: body.status || 'draft',
            total_amount: body.total_amount || 0,
            tax_amount: body.tax_amount || 0,
            currency: body.currency || 'USD',
            due_date: body.due_date || null,
            notes: body.notes || null,
            inventory_deducted: false
        })
        .select()
        .single()

    if (error) {
        logger.error('Database error creating invoice', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Insert line items
    if (items && Array.isArray(items) && items.length > 0) {
        const invoiceItems = items.map((item: any) => ({
            ...item,
            invoice_id: invoice.id,
        }))
        const { error: itemsError } = await ctx.supabase
            .from('invoice_items')
            .insert(invoiceItems)
            
        if (itemsError) {
            logger.error('Failed to insert invoice items', itemsError, { invoice_id: invoice.id })
        }
    }

    return NextResponse.json(invoice, { status: 201 })
}

export async function PATCH(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const clinicId = searchParams.get('clinicId')
    const ctx = await getAuthContext(clinicId)
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'billing', 'edit')
    if (denied) return denied

    const body = await req.json()
    const { id, ...updateData } = body

    logger.info('Updating invoice', { invoice_id: id, updates: updateData })

    const { data: invoice, error } = await ctx.supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', ctx.profile.org_id)
        .select()
        .single()

    if (error) {
         logger.error('Failed to update invoice', error, { invoice_id: id })
         return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(invoice)
}


