import { createAuditLog } from '@/lib/api-helpers'

export type NotificationType = 'sms' | 'email'
export type NotificationContext = {
  supabase: any
  userId: string
  orgId: string
  clinicId: string
}

/**
 * Mock provider for sending SMS
 */
export async function sendSMS(to: string, message: string) {
  // In a real implementation, we would use Twilio SDK here
  console.log('--------------------------------------------------')
  console.log(`[MOCK SMS] To: ${to}`)
  console.log(`[MOCK SMS] Message: ${message}`)
  console.log('--------------------------------------------------')
  return { success: true, messageId: `mock-sms-${Date.now()}` }
}

/**
 * Mock provider for sending Emails
 */
export async function sendEmail(to: string, subject: string, html: string) {
  // In a real implementation, we would use Resend/SendGrid SDK here
  console.log('--------------------------------------------------')
  console.log(`[MOCK EMAIL] To: ${to}`)
  console.log(`[MOCK EMAIL] Subject: ${subject}`)
  console.log(`[MOCK EMAIL] Body: ${html.substring(0, 100)}...`)
  console.log('--------------------------------------------------')
  return { success: true, messageId: `mock-email-${Date.now()}` }
}

/**
 * Logs a notification to the audit_logs table
 */
export async function logNotification(
  ctx: NotificationContext,
  recipient: string,
  type: NotificationType,
  action: string,
  content: string,
  recordId?: string
) {
  await createAuditLog(ctx.supabase, {
    user_id: ctx.userId,
    org_id: ctx.orgId,
    clinic_id: ctx.clinicId,
    action: action, // e.g., 'send_confirmation', 'send_reminder'
    module: 'communications',
    record_id: recordId,
    details: {
      type,
      recipient,
      content,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Dispatches an appointment confirmation notification
 */
export async function sendAppointmentConfirmation(
  ctx: NotificationContext,
  appointment: any,
  owner: any,
  pet: any
) {
  const dateStr = new Date(appointment.date).toLocaleDateString()
  const timeStr = appointment.time

  // Send SMS if phone is available
  if (owner.phone) {
    const msg = `VetCare: Your appointment for ${pet?.name || 'your pet'} is confirmed for ${dateStr} at ${timeStr}.`
    await sendSMS(owner.phone, msg)
    await logNotification(ctx, owner.phone, 'sms', 'send_confirmation', msg, appointment.id)
  }

  // Send Email if email is available
  if (owner.email) {
    const subject = `Appointment Confirmation: ${pet?.name || 'Your Pet'} at VetCare`
    const html = `<p>Hello ${owner.display_name || 'Pet Owner'},</p>
                  <p>Your appointment for <strong>${pet?.name || 'your pet'}</strong> is confirmed.</p>
                  <p><strong>Date:</strong> ${dateStr}<br/><strong>Time:</strong> ${timeStr}</p>
                  <p>Thank you for choosing VetCare!</p>`
    await sendEmail(owner.email, subject, html)
    await logNotification(ctx, owner.email, 'email', 'send_confirmation', html, appointment.id)
  }
}

/**
 * Dispatches an appointment reminder (24h before)
 */
export async function sendAppointmentReminder(
  ctx: NotificationContext,
  appointment: any,
  owner: any,
  pet: any
) {
  const dateStr = new Date(appointment.date).toLocaleDateString()
  const timeStr = appointment.time

  // Send SMS if phone is available
  if (owner.phone) {
    const msg = `VetCare Reminder: You have an upcoming appointment for ${pet?.name || 'your pet'} tomorrow (${dateStr}) at ${timeStr}. Reply C to cancel.`
    await sendSMS(owner.phone, msg)
    await logNotification(ctx, owner.phone, 'sms', 'send_reminder', msg, appointment.id)
  }

  // Send Email if email is available
  if (owner.email) {
    const subject = `Reminder: Appointment tomorrow for ${pet?.name || 'Your Pet'}`
    const html = `<p>Hello ${owner.display_name || 'Pet Owner'},</p>
                  <p>This is a reminder that you have an appointment for <strong>${pet?.name || 'your pet'}</strong> tomorrow.</p>
                  <p><strong>Date:</strong> ${dateStr}<br/><strong>Time:</strong> ${timeStr}</p>
                  <p>If you need to reschedule, please contact us.</p>`
    await sendEmail(owner.email, subject, html)
    await logNotification(ctx, owner.email, 'email', 'send_reminder', html, appointment.id)
  }
}
