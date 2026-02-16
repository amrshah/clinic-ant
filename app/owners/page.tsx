import { Suspense } from 'react'
import { AppLayout } from '@/components/app-layout'
import { OwnersContent } from '@/components/owners/owners-content'
import { getOwners } from '@/lib/api/owners'

export const dynamic = 'force-dynamic'

export default async function OwnersPage() {
  let initialData = undefined
  try {
    initialData = await getOwners()
  } catch (error) {
    console.error('Failed to pre-fetch owners:', error)
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'Owners' }]}>
      <Suspense fallback={<div className="p-8 animate-pulse text-muted-foreground">Loading owners...</div>}>
        <OwnersContent initialData={initialData} />
      </Suspense>
    </AppLayout>
  )
}
