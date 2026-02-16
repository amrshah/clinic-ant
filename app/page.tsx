import { Suspense } from 'react'
import { AppLayout } from '@/components/app-layout'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { getDashboardData } from '@/lib/api/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Fetch data on the server for faster initial load
  let initialData = undefined
  try {
    initialData = await getDashboardData()
  } catch (error) {
    console.error('Failed to pre-fetch dashboard data:', error)
  }

  return (
    <AppLayout>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent initialData={initialData} />
      </Suspense>
    </AppLayout>
  )
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse text-muted-foreground transition-all duration-300">
        Loading dashboard...
      </div>
    </div>
  )
}
