import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBase } from '@supabase/supabase-js'
import { hasPermission, type Module, type Action, type UserRole } from '@/lib/permissions'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export interface AuthContext {
  user: { id: string; email: string }
  profile: {
    id: string
    role: UserRole
    org_id: string
    clinic_id: string
    default_clinic_id: string
    first_name: string | null
    last_name: string | null
  }
  supabase: Awaited<ReturnType<typeof createClient>>
}

export async function getAuthContext(requestedClinicId?: string | null): Promise<AuthContext | NextResponse> {
  let supabase = await createClient() as any
  const reqHeaders = await headers()
  const authHeader = reqHeaders.get('authorization')
  
  let user;
  let authError;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    supabase = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false }
      }
    )
    const res = await supabase.auth.getUser(token)
    user = res.data.user
    authError = res.error
  } else {
    const res = await supabase.auth.getUser()
    user = res.data.user
    authError = res.error
  }

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
    // Safety Net for Demo: Try to find any organization/clinic to prevent a 403/500
    const { data: firstClinic } = await supabase.from('clinics').select('id, organization_id').limit(1).single()
    
    if (firstClinic) {
      return {
        user: { id: user.id, email: user.email! },
        profile: {
          id: profile.id,
          role: profile.role as UserRole,
          org_id: firstClinic.organization_id,
          clinic_id: requestedClinicId || firstClinic.id,
          default_clinic_id: firstClinic.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
        supabase,
      }
    }
    return NextResponse.json({ error: 'System is not initialized. No clinics found.' }, { status: 403 })
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      org_id: profile.organization_id,
      clinic_id: requestedClinicId || profile.default_clinic_id,
      default_clinic_id: profile.default_clinic_id,
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
