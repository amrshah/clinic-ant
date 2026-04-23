import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'users', 'view')
  if (denied) return denied

  let query = ctx.supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', ctx.profile.org_id)
  
  if (ctx.profile.clinic_id !== 'all') {
    query = query.eq('default_clinic_id', ctx.profile.clinic_id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'users', 'create')
  if (denied) return denied

  // Admin can only update role/clinic for existing profiles
  // Actual user creation is via sign-up flow
  return NextResponse.json({ error: 'Users are created via the sign-up flow. Use PATCH to assign roles.' }, { status: 400 })
}
