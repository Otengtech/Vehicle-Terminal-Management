import { useAuth } from './useAuth';

export const useRole = () => {
  const { user, hasRole } = useAuth();

  const isSuperadmin = user?.role === 'Superadmin';
  const isAdmin = user?.role === 'Admin';
  const canManageTerminals = isSuperadmin || isAdmin;
  const canManageUsers = isSuperadmin;
  const canViewAllTerminals = isSuperadmin;

  return {
    isSuperadmin,
    isAdmin,
    canManageTerminals,
    canManageUsers,
    canViewAllTerminals,
    hasRole
  };
};