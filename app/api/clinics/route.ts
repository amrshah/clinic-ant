import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // In a real app, we'd filter by the user's organization
  // For the demo, we fetch all clinics in our demo organization
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('organization_id', 'a0000000-0000-0000-0000-000000000001')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
