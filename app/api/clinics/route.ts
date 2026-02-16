import { NextResponse } from 'next/server'
import { getAuthContext, isAuthContext } from '@/lib/api-helpers'

export async function GET() {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  const { data, error } = await ctx.supabase
    .from('clinics')
    .select('*')
    .eq('org_id', ctx.profile.org_id)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
