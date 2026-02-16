import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'medical_records', 'edit')
  if (denied) return denied

  const { id } = await params
  const body = await req.json()

  const { data, error } = await ctx.supabase
    .from('medical_records')
    .update(body)
    .eq('id', id)
    .eq('clinic_id', ctx.profile.clinic_id)
    .select('*, pets(id, name, species)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'update',
    module: 'medical_records',
    record_id: id,
    details: { updated_fields: Object.keys(body) },
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'medical_records', 'delete')
  if (denied) return denied

  const { id } = await params

  const { error } = await ctx.supabase
    .from('medical_records')
    .delete()
    .eq('id', id)
    .eq('clinic_id', ctx.profile.clinic_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'delete',
    module: 'medical_records',
    record_id: id,
  })

  return NextResponse.json({ success: true })
}
