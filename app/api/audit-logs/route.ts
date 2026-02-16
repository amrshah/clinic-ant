import { NextResponse } from 'next/server'
import { getAuthContext, checkPermission, isAuthContext } from '@/lib/api-helpers'

export async function GET() {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const denied = checkPermission(ctx, 'audit_logs', 'view')
  if (denied) return denied

  const { data, error } = await ctx.supabase
    .from('audit_logs')
    .select('*, profiles(first_name, last_name, role)')
    .eq('clinic_id', ctx.profile.clinic_id)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
