'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ShieldAlert, Send, Smartphone, Mail } from 'lucide-react'

interface CommunicationLog {
  id: string
  action: string
  record_id: string | null
  details: {
    type: 'sms' | 'email'
    recipient: string
    content: string
    timestamp: string
  } | null
  created_at: string
}

export function CommunicationsContent() {
  const { profile, loading: authLoading } = useAuth()
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLogs = useCallback(async () => {
    try {
      // Reusing the audit-logs endpoint but we filter on the client for now
      // A dedicated communications API endpoint would be better for pagination
      const res = await fetch('/api/audit-logs')
      if (res.ok) {
        const allLogs = await res.json()
        const commLogs = allLogs.filter((log: any) => log.module === 'communications')
        setLogs(commLogs)
      }
    } catch (err) {
      console.error('Failed to fetch communication logs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (profile) {
      fetchLogs()
    }
  }, [profile, fetchLogs])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Verifying access...</div>
      </div>
    )
  }

  if (!hasPermission(profile?.role, 'communications', 'view')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <ShieldAlert className="size-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          You do not have permission to view communications logs.
        </p>
      </div>
    )
  }

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase()
    const recipient = log.details?.recipient?.toLowerCase() || ''
    const content = log.details?.content?.toLowerCase() || ''
    return recipient.includes(q) || content.includes(q) || log.action.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading communications...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
        <p className="text-muted-foreground text-pretty">Track automated SMS and Email reminders sent to clients</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Send className="size-5" />Message Log</CardTitle>
              <CardDescription>{filtered.length} messages shown</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recipient or content..."
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
              <Send className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No messages found</h3>
              <p className="text-muted-foreground">Automated notifications will appear here once dispatched.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="w-1/2">Message Content</TableHead>
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
                        {log.details?.type === 'sms' ? (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                            <Smartphone className="size-3" /> SMS
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                            <Mail className="size-3" /> Email
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.details?.recipient || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {log.action?.replace('send_', '') || 'Notification'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        <div className="truncate text-sm text-muted-foreground" title={log.details?.content?.replace(/<[^>]*>?/gm, '')}>
                           {log.details?.content?.replace(/<[^>]*>?/gm, '') || '-'}
                        </div>
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
