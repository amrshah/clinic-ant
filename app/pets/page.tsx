import { Suspense } from 'react'
import { AppLayout } from '@/components/app-layout'
import { PetsContent } from '@/components/pets/pets-content'
import { getPets } from '@/lib/api/pets'

export const dynamic = 'force-dynamic'

export default async function PetsPage() {
  let initialData = undefined
  try {
    initialData = await getPets()
  } catch (error) {
    console.error('Failed to pre-fetch pets:', error)
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'Pets' }]}>
      <Suspense fallback={<div className="p-8 animate-pulse text-muted-foreground">Loading pets...</div>}>
        <PetsContent initialData={initialData} />
      </Suspense>
    </AppLayout>
  )
}
