import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

const ENCRYPTION_KEY = process.env.OWNER_PII_ENCRYPTION_KEY || 'default-dev-key-change-me'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'view')
  if (denied) return denied

  const { id } = await params

  const { data, error } = await ctx.supabase.rpc('get_owner_by_id_decrypted', {
    p_owner_id: id,
    p_clinic_id: ctx.profile.clinic_id,
    p_key: ENCRYPTION_KEY,
  })

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
  }

  const owner = Array.isArray(data) ? data[0] : data

  // Also fetch the owner's pets
  const { data: pets } = await ctx.supabase
    .from('pets')
    .select('*')
    .eq('owner_id', id)
    .eq('clinic_id', ctx.profile.clinic_id)

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'view',
    module: 'owners',
    record_id: id,
    details: { accessed_pii: true },
  })

  return NextResponse.json({ ...owner, pets: pets || [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'edit')
  if (denied) return denied

  const { id } = await params
  const body = await req.json()

  const { first_name, last_name, email, phone, address, city, province, postal_code, notes } = body
  const display_name = first_name && last_name ? `${first_name} ${last_name}` : undefined

  const { error } = await ctx.supabase.rpc('update_owner_encrypted', {
    p_owner_id: id,
    p_clinic_id: ctx.profile.clinic_id,
    p_first_name: first_name || null,
    p_last_name: last_name || null,
    p_email: email || null,
    p_phone: phone || null,
    p_address: address || null,
    p_city: city || null,
    p_province: province || null,
    p_postal_code: postal_code || null,
    p_display_name: display_name || null,
    p_notes: notes || null,
    p_key: ENCRYPTION_KEY,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'update',
    module: 'owners',
    record_id: id,
    details: { updated_fields: Object.keys(body) },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'delete')
  if (denied) return denied

  const { id } = await params

  const { error } = await ctx.supabase
    .from('owners')
    .delete()
    .eq('id', id)
    .eq('clinic_id', ctx.profile.clinic_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'delete',
    module: 'owners',
    record_id: id,
  })

  return NextResponse.json({ success: true })
}
