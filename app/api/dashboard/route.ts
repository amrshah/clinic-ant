import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/api/dashboard'

export async function GET() {
  try {
    const data = await getDashboardData()
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
