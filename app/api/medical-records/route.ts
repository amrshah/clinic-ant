import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const requestedClinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(requestedClinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'medical_records', 'view')
  if (denied) return denied

  const petId = searchParams.get('petId')

  let query = ctx.supabase
    .from('medical_records')
    .select('*, pets(id, name, species), vet:profiles!veterinarian_id(id, first_name, last_name)')
    .eq('clinic_id', ctx.profile.clinic_id)

  if (petId) {
    query = query.eq('pet_id', petId)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'medical_records', 'create')
  if (denied) return denied

  const body = await req.json()

  const targetClinicId = ctx.profile.clinic_id === 'all' ? ctx.profile.default_clinic_id : ctx.profile.clinic_id

  const { data, error } = await ctx.supabase
    .from('medical_records')
    .insert({
      ...body,
      organization_id: ctx.profile.org_id,
      clinic_id: targetClinicId,
      veterinarian_id: body.veterinarian_id || ctx.user.id,
    })
    .select('*, pets(id, name, species), vet:profiles!veterinarian_id(id, first_name, last_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'medical_records',
    record_id: data.id,
    details: { pet_id: body.pet_id, type: body.type },
  })

  return NextResponse.json(data, { status: 201 })
}
