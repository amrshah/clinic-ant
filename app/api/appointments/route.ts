import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { sendAppointmentConfirmation } from '@/lib/notifications'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'appointments', 'view')
  if (denied) return denied

  let query = ctx.supabase
    .from('appointments')
    .select('*, pets(id, name, species), owners(id, display_name, phone, email), vet:profiles!veterinarian_id(id, first_name, last_name)')

  if (ctx.profile.clinic_id !== 'all') {
    query = query.eq('clinic_id', ctx.profile.clinic_id)
  }

  const { data, error } = await query.order('date', { ascending: true })

  if (error) {
     logger.error('Failed to fetch appointments', error)
     return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const ctx = await getAuthContext(clinicId)
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'appointments', 'create')
  if (denied) return denied

  const body = await req.json()
  logger.info('Creating new appointment', { org_id: ctx.profile.org_id, pet_id: body.pet_id })

  // Validate overlapping appointments
  const { data: conflicts, error: conflictError } = await ctx.supabase
    .from('appointments')
    .select('id, pet_id, veterinarian_id')
    .eq('date', body.date)
    .eq('time', body.time)
    .eq('organization_id', ctx.profile.org_id)
    .not('status', 'eq', 'cancelled')

  if (conflictError) {
      logger.error('Database error checking conflicts', conflictError)
      return NextResponse.json({ error: conflictError.message }, { status: 500 })
  }

  const isConflict = conflicts?.some(c => 
      c.pet_id === body.pet_id || c.veterinarian_id === body.veterinarian_id
  )

  if (isConflict) {
      return NextResponse.json({ error: 'Conflict: The pet or veterinarian is already booked for this time.' }, { status: 409 })
  }

    const targetClinicId = ctx.profile.clinic_id === 'all' ? ctx.profile.default_clinic_id : ctx.profile.clinic_id

    const { data, error } = await ctx.supabase
    .from('appointments')
    .insert({
      ...body,
      organization_id: ctx.profile.org_id,
      clinic_id: targetClinicId,
    })
    .select('*, pets(id, name, species), owners(id, display_name, phone, email), vet:profiles!veterinarian_id(id, first_name, last_name)')
    .single()

  if (error) {
     logger.error('Database error creating appointment', error)
     return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'create',
    module: 'appointments',
    record_id: data.id,
    details: { date: body.date, type: body.type },
  })

  // Trigger immediate confirmation notification
  try {
    const notificationCtx = {
      supabase: ctx.supabase,
      userId: ctx.user.id,
      orgId: ctx.profile.org_id,
      clinicId: ctx.profile.clinic_id
    }
    
    // Using the fully populated data object which has pets and owners joined from the .select()
    const owner = data.owners
    const pet = data.pets
    
    if (owner && pet) {
      await sendAppointmentConfirmation(notificationCtx, data, owner, pet)
    }
  } catch (err) {
    logger.error('Failed to send appointment confirmation notification', err, { appointment_id: data.id })
    // Do not block the appointment creation response
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
    const ctx = await getAuthContext()
    if (!isAuthContext(ctx)) return ctx

    const denied = checkPermission(ctx, 'appointments', 'edit')
    if (denied) return denied

    const body = await req.json()
    const { id, ...updateData } = body

    logger.info('Updating appointment', { appointment_id: id, updates: updateData })

    if (updateData.date || updateData.time || updateData.pet_id || updateData.veterinarian_id) {
        const { data: currentApt, error: fetchErr } = await ctx.supabase.from('appointments').select('date, time, pet_id, veterinarian_id').eq('id', id).single()
        
        if (!fetchErr && currentApt) {
            const checkDate = updateData.date || currentApt.date
            const checkTime = updateData.time || currentApt.time
            const checkPetId = updateData.pet_id || currentApt.pet_id
            const checkVetId = updateData.veterinarian_id || currentApt.veterinarian_id

            const { data: conflicts } = await ctx.supabase
                .from('appointments')
                .select('id, pet_id, veterinarian_id')
                .eq('date', checkDate)
                .eq('time', checkTime)
                .eq('organization_id', ctx.profile.org_id)
                .neq('id', id)
                .not('status', 'eq', 'cancelled')

            const isConflict = conflicts?.some(c => 
                c.pet_id === checkPetId || c.veterinarian_id === checkVetId
            )

            if (isConflict) {
                return NextResponse.json({ error: 'Conflict: The pet or veterinarian is already booked for this time.' }, { status: 409 })
            }
        }
    }

    const { data, error } = await ctx.supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', ctx.profile.org_id)
        .select()
        .single()

    if (error) {
         logger.error('Failed to update appointment', error, { appointment_id: id })
         return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await createAuditLog(ctx.supabase, {
        user_id: ctx.user.id,
        org_id: ctx.profile.org_id,
        clinic_id: ctx.profile.clinic_id,
        action: 'update',
        module: 'appointments',
        record_id: data.id,
        details: updateData,
    })

    return NextResponse.json(data)
}
