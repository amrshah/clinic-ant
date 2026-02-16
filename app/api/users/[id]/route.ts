import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'users', 'edit')
  if (denied) return denied

  const { id } = await params
  const body = await req.json()

  // Only allow updating role, clinic_id, first_name, last_name
  const allowedFields: Record<string, unknown> = {}
  if (body.role) allowedFields.role = body.role
  if (body.default_clinic_id) allowedFields.default_clinic_id = body.default_clinic_id
  if (body.first_name !== undefined) allowedFields.first_name = body.first_name
  if (body.last_name !== undefined) allowedFields.last_name = body.last_name

  const { data, error } = await ctx.supabase
    .from('profiles')
    .update(allowedFields)
    .eq('id', id)
    .eq('organization_id', ctx.profile.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'update',
    module: 'users',
    record_id: id,
    details: { updated_fields: Object.keys(allowedFields) },
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'users', 'delete')
  if (denied) return denied

  const { id } = await params

  // Don't allow deleting yourself
  if (id === ctx.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  const { error } = await ctx.supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .eq('organization_id', ctx.profile.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'delete',
    module: 'users',
    record_id: id,
  })

  return NextResponse.json({ success: true })
}
