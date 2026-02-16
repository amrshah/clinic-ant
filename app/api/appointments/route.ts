import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function GET() {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'appointments', 'view')
  if (denied) return denied

  const { data, error } = await ctx.supabase
    .from('appointments')
    .select('*, pets(id, name, species), owners(id, display_name), vet:profiles!veterinarian_id(id, first_name, last_name)')
    .eq('clinic_id', ctx.profile.clinic_id)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'appointments', 'create')
  if (denied) return denied

  const body = await req.json()

  const { data, error } = await ctx.supabase
    .from('appointments')
    .insert({
      ...body,
      organization_id: ctx.profile.org_id,
      clinic_id: ctx.profile.clinic_id,
    })
    .select('*, pets(id, name, species), owners(id, display_name), vet:profiles!veterinarian_id(id, first_name, last_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'appointments',
    record_id: data.id,
    details: { date: body.date, type: body.type },
  })

  return NextResponse.json(data, { status: 201 })
}
