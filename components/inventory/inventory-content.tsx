'use client'

import React from 'react'
import { useInventory } from '@/lib/data-store'
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
    Package,
    AlertTriangle,
    TrendingUp,
    Plus,
    Box,
} from 'lucide-react'

export function InventoryContent() {
    const { inventory, isLoading } = useInventory()

    const stats = {
        totalItems: inventory.length,
        lowStockItems: inventory.filter((i) => i.current_stock <= i.low_stock_threshold).length,
        totalValue: inventory.reduce((acc, i) => acc + (Number(i.price) * Number(i.current_stock)), 0),
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
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
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground text-sm">Track medical supplies, medicines, and clinic stock.</p>
                </div>
                <Button className="shrink-0">
                    <Plus className="size-4 mr-2" />
                    Add Item
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Package className="size-3 mr-1" />
                            Unique product types
                        </div>
                    </CardContent>
                </Card>

                <Card className={stats.lowStockItems > 0 ? "border-orange-200 bg-orange-50/50" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.lowStockItems > 0 ? "text-orange-600" : ""}`}>
                            {stats.lowStockItems}
                        </div>
                        <div className="flex items-center mt-1 text-xs">
                            <AlertTriangle className={`size-3 mr-1 ${stats.lowStockItems > 0 ? "text-orange-600" : "text-muted-foreground"}`} />
                            Items below threshold
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                        <div className="flex items-center mt-1 text-xs text-green-600">
                            <TrendingUp className="size-3 mr-1" />
                            Asset valuation
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stock Levels</CardTitle>
                    <CardDescription>Real-time inventory levels across your clinic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Current Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Box className="size-8 opacity-20" />
                                            <p>Inventory is empty</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {item.sku || 'N/A'}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {item.category || 'General'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={item.current_stock <= item.low_stock_threshold ? "text-orange-600 font-bold" : ""}>
                                                {item.current_stock}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                                        </TableCell>
                                        <TableCell>${Number(item.price).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {item.current_stock <= item.low_stock_threshold ? (
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                                                    Low Stock
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                                    In Stock
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Edit
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
