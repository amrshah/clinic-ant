import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function POST(req: Request) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'assistant', 'view')
  if (denied) return denied

  const { messages, model, temperature, systemPrompt }: { 
    messages: UIMessage[]
    model?: string
    temperature?: number
    systemPrompt?: string
  } = await req.json()

  await createAuditLog(ctx.supabase, {
    user_id: ctx.user.id,
    org_id: ctx.profile.org_id,
    clinic_id: ctx.profile.clinic_id,
    action: 'use',
    module: 'assistant',
    details: { message_count: messages.length },
  })

  const result = streamText({
    model: model || 'anthropic/claude-opus-4.5',
    system: systemPrompt || 'You are a helpful veterinary assistant for ClinicFlow.',
    messages: await convertToModelMessages(messages),
    temperature: temperature ?? 0.7,
  })

  return result.toUIMessageStreamResponse()
}

