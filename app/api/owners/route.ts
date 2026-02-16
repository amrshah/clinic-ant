import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

const ENCRYPTION_KEY = process.env.OWNER_PII_ENCRYPTION_KEY || 'default-dev-key-change-me'

export async function GET() {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'view')
  if (denied) return denied

  const { data, error } = await ctx.supabase.rpc('get_owners_decrypted', {
    p_clinic_id: ctx.profile.clinic_id,
    p_key: ENCRYPTION_KEY,
  })

  if (error) {
    // Fallback: fetch without decryption
    const { data: fallback, error: fallbackErr } = await ctx.supabase
      .from('owners')
      .select('id, display_name, city, province_state, postal_code, notes, created_at, updated_at, clinic_id')
      .eq('clinic_id', ctx.profile.clinic_id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (fallbackErr) return NextResponse.json({ error: fallbackErr.message }, { status: 500 })
    return NextResponse.json(fallback)
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'create')
  if (denied) return denied

  const body = await req.json()
  const { first_name, last_name, email, phone, address, city, province, postal_code, notes } = body

  const display_name = `${first_name} ${last_name}`

  const { data, error } = await ctx.supabase.rpc('insert_owner_encrypted', {
    p_org_id: ctx.profile.org_id,
    p_clinic_id: ctx.profile.clinic_id,
    p_first_name: first_name,
    p_last_name: last_name,
    p_email: email || null,
    p_phone: phone || null,
    p_address: address || null,
    p_city: city || null,
    p_province: province || null,
    p_postal_code: postal_code || null,
    p_display_name: display_name,
    p_notes: notes || null,
    p_created_by: ctx.user.id,
    p_key: ENCRYPTION_KEY,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'owners',
    record_id: data,
    details: { display_name },
  })

  return NextResponse.json({ id: data, display_name }, { status: 201 })
}
