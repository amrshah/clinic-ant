import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { getInvoices } from '@/lib/api/billing'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

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
    
    const adminSupabase = createAdminClient()
    
    const { data: invoice, error } = await adminSupabase
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
        // Use correct column names: inventory_item_id, name (matching actual schema)
        // Removed category as it does not exist in the actual table
        const invoiceItems = items.map((item: any) => ({
            invoice_id: invoice.id,
            inventory_item_id: item.item_id || item.inventory_item_id, // handle both
            name: item.title || item.name, // handle both
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
        }))
        
        const { error: itemsError } = await adminSupabase
            .from('invoice_items')
            .insert(invoiceItems)
            
        if (itemsError) {
            logger.error('Failed to insert invoice items', itemsError, { invoice_id: invoice.id })
            // We don't return 500 here to allow the invoice to exist even if items fail
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
    const { id, items, ...updateData } = body

    if (!id) return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })

    logger.info('Updating invoice', { invoice_id: id, org_id: ctx.profile.org_id, has_items: !!items })

    const adminSupabase = createAdminClient()

    // 1. Update invoice metadata
    const { data: results, error } = await adminSupabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', ctx.profile.org_id)
        .select()

    if (error) {
         logger.error('Failed to update invoice', error, { invoice_id: id })
         return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!results || results.length === 0) {
        return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 })
    }

    // 2. Update invoice items if provided
    if (items && Array.isArray(items)) {
        // Delete existing items
        const { error: deleteError } = await adminSupabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', id)
        
        if (deleteError) {
            logger.error('Failed to clear invoice items', deleteError, { invoice_id: id })
        } else {
            // Insert new items
            const invoiceItems = items.map((item: any) => ({
                invoice_id: id,
                inventory_item_id: item.inventory_item_id || null,
                name: item.name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price
            }))

            const { error: itemsError } = await adminSupabase
                .from('invoice_items')
                .insert(invoiceItems)
            
            if (itemsError) {
                logger.error('Failed to re-insert invoice items', itemsError, { invoice_id: id })
            }
        }
    }

    return NextResponse.json(results[0])
}


