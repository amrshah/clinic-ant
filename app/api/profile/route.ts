import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, clinics:default_clinic_id(id, name, city, province_state), organizations:organization_id(id, name)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: null,
      org_id: null,
      clinic_id: null,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      needs_setup: true,
    })
  }

  return NextResponse.json({
    ...profile,
    email: user.email,
    org_id: profile.organization_id,
    clinic_id: profile.default_clinic_id,
    needs_setup: !profile.organization_id || !profile.default_clinic_id,
  })
}
