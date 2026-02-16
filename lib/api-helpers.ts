import { createClient } from '@/lib/supabase/server'
import { hasPermission, type Module, type Action, type UserRole } from '@/lib/permissions'
import { NextResponse } from 'next/server'

export interface AuthContext {
  user: { id: string; email: string }
  profile: {
    id: string
    role: UserRole
    org_id: string
    clinic_id: string
    first_name: string | null
    last_name: string | null
  }
  supabase: Awaited<ReturnType<typeof createClient>>
}

export async function getAuthContext(): Promise<AuthContext | NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found. Please contact your administrator.' }, { status: 403 })
  }

  if (profile.role === 'client') {
    return NextResponse.json({ error: 'Client access is not yet available.' }, { status: 403 })
  }

  if (!profile.organization_id || !profile.default_clinic_id) {
    return NextResponse.json({ error: 'You have not been assigned to a clinic yet. Please contact your administrator.' }, { status: 403 })
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      org_id: profile.organization_id,
      clinic_id: profile.default_clinic_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
    supabase,
  }
}

export function checkPermission(ctx: AuthContext, module: Module, action: Action): NextResponse | null {
  if (!hasPermission(ctx.profile.role, module, action)) {
    return NextResponse.json(
      { error: `You do not have permission to ${action} in ${module}. Your role (${ctx.profile.role}) does not allow this action.` },
      { status: 403 }
    )
  }
  return null
}

export async function createAuditLog(
  supabase: AuthContext['supabase'],
  params: {
    user_id: string
    org_id: string
    clinic_id: string
    action: string
    module: string
    record_id?: string
    details?: Record<string, unknown>
  }
) {
  await supabase.from('audit_logs').insert({
    user_id: params.user_id,
    organization_id: params.org_id,
    clinic_id: params.clinic_id,
    action: params.action,
    module: params.module,
    record_id: params.record_id || null,
    details: params.details || null,
  })
}

export function isAuthContext(ctx: AuthContext | NextResponse): ctx is AuthContext {
  return 'user' in ctx
}
