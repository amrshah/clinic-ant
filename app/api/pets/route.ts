import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { getPets } from '@/lib/api/pets'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId')

  try {
    const data = await getPets(clinicId)
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'pets', 'create')
  if (denied) return denied

  const body = await req.json()

  const targetClinicId = ctx.profile.clinic_id === 'all' ? ctx.profile.default_clinic_id : ctx.profile.clinic_id

  const { data, error } = await ctx.supabase
    .from('pets')
    .insert({
      ...body,
      organization_id: ctx.profile.org_id,
      clinic_id: targetClinicId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'pets',
    record_id: data.id,
    details: { name: body.name, species: body.species },
  })

  return NextResponse.json(data, { status: 201 })
}
