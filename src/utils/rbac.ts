import { UserRole } from '../types';
import { ActionPermission, ROLE_CONFIGURATIONS, RoleConfig } from '../types/rbac';

export const getRoleConfig = (role: UserRole = 'admin'): RoleConfig => {
  return ROLE_CONFIGURATIONS[role] || ROLE_CONFIGURATIONS.admin;
};

export const canAccessView = (role: UserRole = 'admin', view: string): boolean => {
  if (role === 'admin' || view === 'ai_agent' || view === 'dashboard') return true;
  const config = getRoleConfig(role);
  if (['sales_invoice', 'sales_invoices', 'sales', 'invoices'].includes(view) && config.allowedViews.includes('sales_list')) {
    return true;
  }
  return config.allowedViews.includes(view);
};

export const canPerform = (role: UserRole = 'admin', action: ActionPermission): boolean => {
  const config = getRoleConfig(role);
  if (role === 'admin') return true;
  return config.allowedActions.includes(action);
};

export const getRoleBadge = (role: UserRole = 'admin') => {
  const config = getRoleConfig(role);
  return config.badgeColor;
};

export const getRoleDisplayName = (role: UserRole = 'admin') => {
  const config = getRoleConfig(role);
  return config.title;
};
