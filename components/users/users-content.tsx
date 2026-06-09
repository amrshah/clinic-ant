'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { hasPermission, ROLE_LABELS, ACTIVE_ROLES, type UserRole } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ShieldCheck, MoreHorizontal, UserCog, Trash2, ShieldAlert } from 'lucide-react'
import { formatStaffName } from '@/lib/utils'

interface StaffProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole | null
  clinic_id: string | null
  created_at: string
}

export function UsersContent() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [changingRole, setChangingRole] = useState<{ user: StaffProfile; newRole: UserRole } | null>(null)
  const [deletingUser, setDeletingUser] = useState<StaffProfile | null>(null)

  const canEdit = hasPermission(profile?.role, 'users', 'edit')
  const canDelete = hasPermission(profile?.role, 'users', 'delete')

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) setUsers(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const confirmRoleChange = async () => {
    if (!changingRole) return
    try {
      const res = await fetch(`/api/users/${changingRole.user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: changingRole.newRole }),
      })
      if (res.ok) fetchUsers()
    } catch { /* ignore */ }
    setChangingRole(null)
  }

  const confirmDelete = async () => {
    if (!deletingUser) return
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, { method: 'DELETE' })
      if (res.ok) fetchUsers()
    } catch { /* ignore */ }
    setDeletingUser(null)
  }

  if (!hasPermission(profile?.role, 'users', 'view')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="size-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to manage users.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-pulse text-muted-foreground">Loading users...</div></div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage staff accounts and role assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5" />Staff Members</CardTitle>
          <CardDescription>{users.length} registered staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {formatStaffName(u.first_name || '', u.last_name || '', u.role || undefined)}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {canEdit && u.id !== profile?.id ? (
                        <Select value={u.role ?? ''} onValueChange={(v) => setChangingRole({ user: u, newRole: v as UserRole })}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ACTIVE_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{u.role ? ROLE_LABELS[u.role] : 'No role'}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(u.created_at).toLocaleDateString('en-CA')}</TableCell>
                    <TableCell>
                      {canDelete && u.id !== profile?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDeletingUser(u)} className="text-destructive"><Trash2 className="size-4 mr-2" />Remove User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!changingRole} onOpenChange={() => setChangingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change {changingRole?.user.first_name || 'this user'}&apos;s role to{' '}
              <strong>{changingRole?.newRole ? ROLE_LABELS[changingRole.newRole] : ''}</strong>?
              This will immediately change their access permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletingUser?.first_name || 'this user'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
