export const PERMISSIONS = {
  MANAGE_TERMINALS: 'manage_terminals',
  MANAGE_DRIVERS: 'manage_drivers',
  MANAGE_VEHICLES: 'manage_vehicles',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  CHECK_IN_OUT: 'check_in_out',
  REPORT_DAMAGE: 'report_damage'
};

export const ROLE_PERMISSIONS = {
  Superadmin: [
    PERMISSIONS.MANAGE_TERMINALS,
    PERMISSIONS.MANAGE_DRIVERS,
    PERMISSIONS.MANAGE_VEHICLES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CHECK_IN_OUT,
    PERMISSIONS.REPORT_DAMAGE
  ],
  Admin: [
    PERMISSIONS.MANAGE_DRIVERS,
    PERMISSIONS.MANAGE_VEHICLES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CHECK_IN_OUT,
    PERMISSIONS.REPORT_DAMAGE
  ]
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
};

export const canAccessResource = (user, resourceOwnerId) => {
  if (!user) return false;
  if (user.role === 'Superadmin') return true;
  return user.terminalId === resourceOwnerId;
};