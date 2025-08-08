export const AuditResource = {
  USER: 'user',
  EMPLOYEE: 'employee',
  ROLE: 'role',
  PERMISSION: 'permission',
  BRANCH: 'branch',
  BRAND: 'brand',
  CATEGORY: 'category',
  SETTING: 'setting',
  CONFIG: 'config',
  LANGUAGE: 'language',
  AUDIT_LOG: 'audit-log',
} as const;

export const AuditAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  RESET_PASSWORD: 'reset-password',
  CHANGE_PASSWORD: 'change-password',
  ASSIGN_ROLE: 'assign-role',
  UNASSIGN_ROLE: 'unassign-role',
  ENABLE: 'enable',
  DISABLE: 'disable',
} as const;

export type AuditResourceType =
  (typeof AuditResource)[keyof typeof AuditResource];

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];
