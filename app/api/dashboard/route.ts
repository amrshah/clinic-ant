import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/api/dashboard'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicId = searchParams.get('clinicId')

  try {
    const data = await getDashboardData(clinicId)
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Profile not found') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
