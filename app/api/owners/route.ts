import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

const ENCRYPTION_KEY = process.env.OWNER_PII_ENCRYPTION_KEY || 'default-dev-key-change-me'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'view')
  if (denied) return denied

  try {
    const isConsolidated = ctx.profile.clinic_id === 'all'
    let data = null
    let error = null

    if (!isConsolidated) {
      const rpcResult = await ctx.supabase.rpc('get_owners_decrypted', {
        p_clinic_id: ctx.profile.clinic_id,
        p_key: ENCRYPTION_KEY,
      })
      data = rpcResult.data
      error = rpcResult.error
    } else {
      error = new Error("Bypassing RPC for consolidated view")
    }

    if (error) {
      if (!isConsolidated) console.error('RPC get_owners_decrypted failed:', error)
      // Attempt fallback to non-encrypted data
      let fallbackQuery = ctx.supabase
        .from('owners')
        .select('id, display_name, city, notes, created_at, updated_at, clinic_id')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (!isConsolidated) {
        fallbackQuery = fallbackQuery.eq('clinic_id', ctx.profile.clinic_id)
      }

      const { data: fallback, error: fallbackErr } = await fallbackQuery

      if (fallbackErr) {
        console.error('Fallback fetch failed:', fallbackErr)
        return NextResponse.json({ error: 'Database access failed', details: fallbackErr.message }, { status: 500 })
      }
      return NextResponse.json(fallback || [])
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Unexpected Owners API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'owners', 'create')
  if (denied) return denied

  const body = await req.json()
  const { first_name, last_name, email, phone, address, city, province, postal_code, notes } = body

  const display_name = `${first_name} ${last_name}`

  const targetClinicId = ctx.profile.clinic_id === 'all' ? ctx.profile.default_clinic_id : ctx.profile.clinic_id

  const { data, error } = await ctx.supabase.from('owners').insert({
    organization_id: ctx.profile.org_id,
    clinic_id: targetClinicId,
    first_name: first_name || null,
    last_name: last_name || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    province: province || null,
    display_name: display_name,
    notes: notes || null,
    created_by: ctx.user.id
  }).select().single()

  if (error) {
    console.error('Database error creating owner:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'owners',
    record_id: data.id,
    details: { display_name },
  })

  return NextResponse.json({ id: data.id, display_name }, { status: 201 })
}
