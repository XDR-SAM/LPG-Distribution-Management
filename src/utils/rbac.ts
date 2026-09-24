import { UserRole } from '../types';
import { ActionPermission, ROLE_CONFIGURATIONS, RoleConfig } from '../types/rbac';

export const getRoleConfig = (role: UserRole = 'admin'): RoleConfig => {
  return ROLE_CONFIGURATIONS[role] || ROLE_CONFIGURATIONS.admin;
};

export const canAccessView = (role: UserRole = 'admin', view: string): boolean => {
  if (role === 'admin' || view === 'ai_agent' || view === 'dashboard') return true;
  const config = getRoleConfig(role);

  const aliasMap: Record<string, string> = {
    sales_pos: 'sales_new',
    sales: 'sales_list',
    sales_invoice: 'sales_list',
    sales_invoices: 'sales_list',
    invoices: 'sales_list',
    sales_challan: 'sales_challans',
    delivery_list: 'sales_challans',
    customer_directory: 'customer_list',
    customers: 'customer_list',
    cylinder_due: 'customer_cylinder_due',
    customer_ledgers: 'customer_ledger',
    supplier_directory: 'supplier_list',
    suppliers: 'supplier_list',
    supplier_ledgers: 'supplier_ledger',
    inventory: 'inventory_stock',
    stock: 'inventory_stock',
    purchases: 'purchase_list',
    cashbook: 'accounts_cashbook',
    daily_report: 'report_daily',
    reports: 'report_daily',
    reports_center: 'report_daily',
    audit_log: 'audit_logs',
  };

  const normalized = aliasMap[view] || view;
  return config.allowedViews.includes(normalized);
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
