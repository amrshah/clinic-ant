import { AppLayout } from '@/components/app-layout'
import { CommunicationsContent } from '@/components/communications/communications-content'

export default function CommunicationsPage() {
  return (
    <AppLayout breadcrumbs={[{ label: 'Communications' }]}>
      <CommunicationsContent />
    </AppLayout>
  )
}
