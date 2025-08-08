export const PERMISSIONS = {
  user: [
    { name: 'user view', code: 'user:view' },
    { name: 'user create', code: 'user:create' },
    { name: 'user update', code: 'user:update' },
    { name: 'user delete', code: 'user:delete' },
  ],
  employee: [
    { name: 'employee view', code: 'employee:view' },
    { name: 'employee create', code: 'employee:create' },
    { name: 'employee update', code: 'employee:update' },
    { name: 'employee delete', code: 'employee:delete' },
  ],
  role: [
    { name: 'role view', code: 'role:view' },
    { name: 'role create', code: 'role:create' },
    { name: 'role update', code: 'role:update' },
    { name: 'role delete', code: 'role:delete' },
  ],
  permission: [
    { name: 'permission view', code: 'permission:view' },
    { name: 'permission assign', code: 'permission:assign' },
  ],
  branch: [
    { name: 'branch view', code: 'branch:view' },
    { name: 'branch create', code: 'branch:create' },
    { name: 'branch update', code: 'branch:update' },
    { name: 'branch delete', code: 'branch:delete' },
  ],
  category: [
    { name: 'category view', code: 'category:view' },
    { name: 'category create', code: 'category:create' },
    { name: 'category update', code: 'category:update' },
    { name: 'category delete', code: 'category:delete' },
  ],
  brand: [
    { name: 'brand view', code: 'brand:view' },
    { name: 'brand create', code: 'brand:create' },
    { name: 'brand update', code: 'brand:update' },
    { name: 'brand delete', code: 'brand:delete' },
  ],
};

export const PERMISSIONS_CODES = {
  user: {
    read: 'user:view',
    create: 'user:create',
    update: 'user:update',
    delete: 'user:delete',
  },
  employee: {
    read: 'employee:view',
    create: 'employee:create',
    update: 'employee:update',
    delete: 'employee:delete',
  },
  role: {
    read: 'role:view',
    create: 'role:create',
    update: 'role:update',
    delete: 'role:delete',
  },
  permission: {
    read: 'permission:view',
    assign: 'permission:assign',
  },
  branch: {
    read: 'branch:view',
    create: 'branch:create',
    update: 'branch:update',
    delete: 'branch:delete',
  },
  category: {
    read: 'category:view',
    create: 'category:create',
    update: 'category:update',
    delete: 'category:delete',
  },
  brand: {
    read: 'brand:view',
    create: 'brand:create',
    update: 'brand:update',
    delete: 'brand:delete',
  },
};
