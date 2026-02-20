'use client'

import { AppLayout } from '@/components/app-layout'
import { BillingContent } from '@/components/billing/billing-content'

export default function BillingPage() {
    return (
        <AppLayout breadcrumbs={[{ label: 'Billing' }]}>
            <BillingContent />
        </AppLayout>
    )
}
