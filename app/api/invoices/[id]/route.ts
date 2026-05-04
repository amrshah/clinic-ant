import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, isAuthContext } from '@/lib/api-helpers'
import { getInvoice } from '@/lib/api/billing'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getAuthContext()
  if (!isAuthContext(ctx)) return ctx

  try {
    const invoice = await getInvoice(params.id)
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
