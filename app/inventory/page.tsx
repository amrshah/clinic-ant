'use client'

import { AppLayout } from '@/components/app-layout'
import { InventoryContent } from '@/components/inventory/inventory-content'

export default function InventoryPage() {
    return (
        <AppLayout breadcrumbs={[{ label: 'Inventory' }]}>
            <InventoryContent />
        </AppLayout>
    )
}
