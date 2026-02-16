import { AppLayout } from '@/components/app-layout'
import { AuditLogsContent } from '@/components/audit-logs/audit-logs-content'

export default function AuditLogsPage() {
  return (
    <AppLayout breadcrumbs={[{ label: 'Audit Logs' }]}>
      <AuditLogsContent />
    </AppLayout>
  )
}
