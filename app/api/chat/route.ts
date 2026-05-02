import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { getAuthContext, checkPermission, createAuditLog, isAuthContext } from '@/lib/api-helpers'

export async function POST(req: Request) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'assistant', 'view')
  if (denied) return denied

  const { messages, model: modelId, temperature, systemPrompt }: { 
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
    details: { message_count: messages.length, model: modelId },
  })

  // Select provider and model
  let model;
  try {
    if (modelId?.startsWith('openai/')) {
      model = openai(modelId.replace('openai/', ''))
    } else if (modelId?.startsWith('anthropic/')) {
      const anthropicModel = modelId.replace('anthropic/', '')
      // Map friendly names to actual API names if needed
      const modelMap: Record<string, string> = {
        'claude-3-5-sonnet': 'claude-3-5-sonnet-20240620',
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-5-haiku': 'claude-3-5-haiku-20241022'
      }
      model = anthropic(modelMap[anthropicModel] || anthropicModel)
    } else {
      model = anthropic('claude-3-5-sonnet-20240620')
    }

    const result = streamText({
      model,
      system: systemPrompt || 'You are a helpful veterinary assistant for Clinic Flow.',
      messages: await convertToModelMessages(messages),
      temperature: temperature ?? 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('AI Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'AI request failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

