'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollText, Search, ShieldAlert } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  module: string
  record_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  profiles?: { first_name: string | null; last_name: string | null; email: string | null; role: string | null } | null
}

const actionBadge = (action: string) => {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    create: 'default',
    read: 'secondary',
    update: 'outline',
    delete: 'destructive',
    login: 'secondary',
    logout: 'outline'
  }
  return <Badge variant={map[action] ?? 'outline'} className="capitalize">{action}</Badge>
}

export function AuditLogsContent() {
  const { profile, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit-logs')
      if (res.ok) {
        setLogs(await res.json())
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile) {
      fetchLogs()
    }
  }, [profile, fetchLogs])

  // Show loading while auth is still determining the user profile
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Verifying access...</div>
      </div>
    )
  }

  // Then check permissions
  if (!hasPermission(profile?.role, 'audit_logs', 'view')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <ShieldAlert className="size-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          You do not have permission to view audit logs. Please contact your clinic administrator if you believe this is an error.
        </p>
      </div>
    )
  }

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase()
    const name = [log.profiles?.first_name, log.profiles?.last_name].filter(Boolean).join(' ').toLowerCase()
    return (
      name.includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      (log.profiles?.email ?? '').toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-pretty">Track all staff actions on sensitive patient data and clinic records</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ScrollText className="size-5" />Activity Log</CardTitle>
              <CardDescription>{filtered.length} entries shown</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or module..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ScrollText className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No logs found</h3>
              <p className="text-muted-foreground">Audit entries will appear here as staff perform actions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead className="hidden md:table-cell">Record ID</TableHead>
                    <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="tabular-nums">
                          <p>{new Date(log.created_at).toLocaleDateString('en-CA')}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString('en-CA')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="font-medium truncate">{[log.profiles?.first_name, log.profiles?.last_name].filter(Boolean).join(' ') || 'System'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{log.profiles?.role?.replace('_', ' ') ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {actionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.module?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                          {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
                        </code>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                        {log.ip_address ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
