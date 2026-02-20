'use client'

import React from 'react'
import { useInvoices } from '@/lib/data-store'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    CreditCard,
    FileText,
    CheckCircle,
    AlertCircle,
    Plus,
} from 'lucide-react'

export function BillingContent() {
    const { invoices, isLoading } = useInvoices()

    const stats = {
        totalRevenue: invoices
            .filter((i) => i.status === 'paid')
            .reduce((acc, i) => acc + Number(i.total_amount), 0),
        outstanding: invoices
            .filter((i) => ['sent', 'overdue'].includes(i.status))
            .reduce((acc, i) => acc + Number(i.total_amount), 0),
        paidCount: invoices.filter((i) => i.status === 'paid').length,
        draftCount: invoices.filter((i) => i.status === 'draft').length,
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="h-32 animate-pulse bg-muted/50" />
                    ))}
                </div>
                <Card className="h-64 animate-pulse bg-muted/50" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Invoicing</h1>
                    <p className="text-muted-foreground text-sm">Manage clinic revenue and patient invoices.</p>
                </div>
                <Button className="shrink-0">
                    <Plus className="size-4 mr-2" />
                    Create Invoice
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center mt-1 text-xs text-green-600">
                            <CheckCircle className="size-3 mr-1" />
                            Settled payments
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.outstanding.toLocaleString()}</div>
                        <div className="flex items-center mt-1 text-xs text-orange-600">
                            <AlertCircle className="size-3 mr-1" />
                            Pending collection
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Paid Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.paidCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.draftCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Under preparation</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>Recent billing activity and payment statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="size-8 opacity-20" />
                                            <p>No invoices found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {invoice.id.split('-')[0].toUpperCase()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {(invoice as any).owners?.display_name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-semibold text-primary">
                                            ${Number(invoice.total_amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    invoice.status === 'paid' ? 'default' :
                                                        ['sent', 'overdue'].includes(invoice.status) ? 'secondary' :
                                                            'outline'
                                                }
                                                className="capitalize"
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
