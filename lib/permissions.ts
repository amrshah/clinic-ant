export type UserRole = 'administrator' | 'veterinarian' | 'nurse_assistant' | 'reception' | 'technician' | 'client'

export type Module = 'dashboard' | 'pets' | 'owners' | 'appointments' | 'medical_records' | 'settings' | 'assistant' | 'users' | 'audit_logs' | 'privacy' | 'billing' | 'inventory'

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export'

export interface RolePermission {
  module: Module
  actions: Action[]
}

// Complete RBAC matrix from the attached role-permissions document
export const ROLE_PERMISSIONS: Record<UserRole, RolePermission[]> = {
  administrator: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pets', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'owners', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'appointments', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'medical_records', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'billing', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'inventory', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { module: 'settings', actions: ['view', 'edit'] },
    { module: 'assistant', actions: ['view'] },
    { module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'audit_logs', actions: ['view', 'export'] },
    { module: 'privacy', actions: ['view', 'edit', 'delete'] },
  ],
  veterinarian: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pets', actions: ['view', 'create', 'edit'] },
    { module: 'owners', actions: ['view'] },
    { module: 'appointments', actions: ['view', 'create', 'edit'] },
    { module: 'medical_records', actions: ['view', 'create', 'edit'] },
    { module: 'billing', actions: ['view'] },
    { module: 'inventory', actions: ['view', 'edit'] },
    { module: 'settings', actions: ['view'] },
    { module: 'assistant', actions: ['view'] },
    { module: 'users', actions: ['view'] },
    { module: 'audit_logs', actions: [] },
    { module: 'privacy', actions: [] },
  ],
  nurse_assistant: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pets', actions: ['view', 'create', 'edit'] },
    { module: 'owners', actions: ['view'] },
    { module: 'appointments', actions: ['view', 'create', 'edit'] },
    { module: 'medical_records', actions: ['view', 'create'] },
    { module: 'billing', actions: ['view'] },
    { module: 'inventory', actions: ['view', 'edit'] },
    { module: 'settings', actions: ['view'] },
    { module: 'assistant', actions: ['view'] },
    { module: 'users', actions: ['view'] },
    { module: 'audit_logs', actions: [] },
    { module: 'privacy', actions: [] },
  ],
  reception: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pets', actions: ['view', 'create'] },
    { module: 'owners', actions: ['view', 'create', 'edit'] },
    { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'medical_records', actions: [] },
    { module: 'billing', actions: ['view', 'create', 'edit'] },
    { module: 'inventory', actions: ['view'] },
    { module: 'settings', actions: ['view'] },
    { module: 'assistant', actions: [] },
    { module: 'users', actions: ['view'] },
    { module: 'audit_logs', actions: [] },
    { module: 'privacy', actions: [] },
  ],
  technician: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'pets', actions: ['view', 'edit'] },
    { module: 'owners', actions: ['view'] },
    { module: 'appointments', actions: ['view'] },
    { module: 'medical_records', actions: ['view', 'create'] },
    { module: 'billing', actions: ['view'] },
    { module: 'inventory', actions: ['view', 'edit'] },
    { module: 'settings', actions: ['view'] },
    { module: 'assistant', actions: ['view'] },
    { module: 'users', actions: ['view'] },
    { module: 'audit_logs', actions: [] },
    { module: 'privacy', actions: [] },
  ],
  client: [
    { module: 'dashboard', actions: [] },
    { module: 'pets', actions: [] },
    { module: 'owners', actions: [] },
    { module: 'appointments', actions: [] },
    { module: 'medical_records', actions: [] },
    { module: 'billing', actions: [] },
    { module: 'inventory', actions: [] },
    { module: 'settings', actions: [] },
    { module: 'assistant', actions: [] },
    { module: 'users', actions: [] },
    { module: 'audit_logs', actions: [] },
    { module: 'privacy', actions: [] },
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Administrator',
  veterinarian: 'Veterinarian',
  nurse_assistant: 'Nurse / Assistant',
  reception: 'Reception',
  technician: 'Technician',
  client: 'Client',
}

export const ACTIVE_ROLES: UserRole[] = ['administrator', 'veterinarian', 'nurse_assistant', 'reception', 'technician']

export function hasPermission(role: UserRole | undefined | null, module: Module, action: Action): boolean {
  if (!role) return false
  const normalizedRole = role.toLowerCase() as UserRole
  if (normalizedRole === 'client') return false
  const perms = ROLE_PERMISSIONS[normalizedRole]
  if (!perms) return false
  const modulePerm = perms.find((p) => p.module === module)
  if (!modulePerm) return false
  return modulePerm.actions.includes(action)
}

export function canAccessModule(role: UserRole | undefined | null, module: Module): boolean {
  if (!role) return false
  const normalizedRole = role.toLowerCase() as UserRole
  if (normalizedRole === 'client') return false
  const perms = ROLE_PERMISSIONS[normalizedRole]
  if (!perms) return false
  const modulePerm = perms.find((p) => p.module === module)
  if (!modulePerm) return false
  return modulePerm.actions.length > 0
}

export function getAccessibleModules(role: UserRole | undefined | null): Module[] {
  if (!role) return []
  if (role === 'client') return []
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return []
  return perms.filter((p) => p.actions.length > 0).map((p) => p.module)
}
