import { AppLayout } from '@/components/app-layout'
import { UsersContent } from '@/components/users/users-content'

export default function UsersPage() {
  return (
    <AppLayout breadcrumbs={[{ label: 'User Management' }]}>
      <UsersContent />
    </AppLayout>
  )
}
