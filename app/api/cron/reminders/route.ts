import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { sendAppointmentReminder } from '@/lib/notifications'

// We need a Service Role client to bypass RLS for cron jobs, since they are unauthenticated
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  // In a real production environment, you should secure this endpoint
  // by verifying a CRON_SECRET header to ensure only your scheduling service can hit it.
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Find appointments scheduled for exactly tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const targetDateStr = tomorrow.toISOString().split('T')[0]

    logger.info(`Running reminder cron job for date: ${targetDateStr}`)

    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select('*, pets(id, name, species), owners(id, display_name, phone, email, organization_id)')
      .eq('date', targetDateStr)
      .not('status', 'eq', 'cancelled')

    if (error) {
      logger.error('Failed to fetch upcoming appointments for reminders', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: 'No appointments scheduled for tomorrow.', processed: 0 })
    }

    // Process reminders
    let processedCount = 0
    for (const apt of appointments) {
      // Idempotency Check: Verify if a reminder was already sent for this appointment today
      // This prevents spamming if the cron runs multiple times
      const { data: existingLogs } = await supabaseAdmin
        .from('audit_logs')
        .select('id')
        .eq('module', 'communications')
        .eq('action', 'send_reminder')
        .eq('record_id', apt.id)
        .limit(1)

      if (existingLogs && existingLogs.length > 0) {
        logger.info(`Reminder already sent for appointment ${apt.id}. Skipping.`)
        continue
      }

      const owner = apt.owners
      const pet = apt.pets

      if (owner && pet) {
        // Construct a mock auth context for the notification logger
        // Using a generic 'system' user since this is an automated job
        const notificationCtx = {
          supabase: supabaseAdmin,
          userId: '00000000-0000-0000-0000-000000000000', // System user UUID placeholder
          orgId: apt.organization_id || owner.organization_id,
          clinicId: apt.clinic_id
        }

        try {
          await sendAppointmentReminder(notificationCtx, apt, owner, pet)
          processedCount++
        } catch (err) {
          logger.error(`Failed to send reminder for appointment ${apt.id}`, err)
        }
      }
    }

    return NextResponse.json({
      message: `Cron job completed successfully`,
      found: appointments.length,
      processed: processedCount
    })

  } catch (error) {
    logger.error('Unexpected error in reminders cron', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
