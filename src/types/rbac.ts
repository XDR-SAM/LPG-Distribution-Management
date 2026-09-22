import { UserRole } from './index';

export type ActionPermission = 
  | 'view_cost_price'
  | 'view_profit_margin'
  | 'create_sale'
  | 'cancel_sale'
  | 'delete_sale'
  | 'create_purchase'
  | 'adjust_stock'
  | 'receive_empty'
  | 'record_damage'
  | 'receive_payment'
  | 'make_supplier_payment'
  | 'record_expense'
  | 'manage_users'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'export_data'
  | 'sync_database';

export interface RoleConfig {
  role: UserRole;
  title: string;
  banglaTitle: string;
  description: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  allowedViews: string[];
  allowedActions: ActionPermission[];
}

export const ROLE_CONFIGURATIONS: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    title: 'Super Admin',
    banglaTitle: 'প্রধান প্রশাসক',
    description: 'Full unrestricted access to all modules, financial margins, settings, user permissions, and Supabase database.',
    badgeColor: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500'
    },
    allowedViews: [
      'dashboard',
      'sales_pos',
      'sales_new',
      'sales_list',
      'sales_challans',
      'sales_returns',
      'purchase_new',
      'purchase_list',
      'inventory_stock',
      'inventory_movements',
      'inventory_damaged',
      'customer_list',
      'customer_cylinder_due',
      'customer_ledger',
      'supplier_list',
      'supplier_ledger',
      'accounts_cashbook',
      'accounts_receive',
      'accounts_pay',
      'accounts_expenses',
      'accounts_summary',
      'report_daily',
      'report_cylinder_audit',
      'reports_center',
      'settings',
      'audit_logs',
      'users_roles',
      'supabase_sync'
    ],
    allowedActions: [
      'view_cost_price',
      'view_profit_margin',
      'create_sale',
      'cancel_sale',
      'delete_sale',
      'create_purchase',
      'adjust_stock',
      'receive_empty',
      'record_damage',
      'receive_payment',
      'make_supplier_payment',
      'record_expense',
      'manage_users',
      'manage_settings',
      'view_audit_logs',
      'export_data',
      'sync_database'
    ]
  },
  manager: {
    role: 'manager',
    title: 'Operations Manager',
    banglaTitle: 'পরিচালন ব্যবস্থাপক',
    description: 'Oversees daily sales, purchases, stock inventory, customers, and operations. Cannot change core trade license or admin permissions.',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    },
    allowedViews: [
      'dashboard',
      'sales_pos',
      'sales_new',
      'sales_list',
      'sales_challans',
      'sales_returns',
      'purchase_new',
      'purchase_list',
      'inventory_stock',
      'inventory_movements',
      'inventory_damaged',
      'customer_list',
      'customer_cylinder_due',
      'customer_ledger',
      'supplier_list',
      'supplier_ledger',
      'accounts_summary',
      'report_daily',
      'report_cylinder_audit',
      'reports_center',
      'audit_logs'
    ],
    allowedActions: [
      'view_cost_price',
      'view_profit_margin',
      'create_sale',
      'cancel_sale',
      'create_purchase',
      'adjust_stock',
      'receive_empty',
      'record_damage',
      'receive_payment',
      'make_supplier_payment',
      'record_expense',
      'view_audit_logs',
      'export_data'
    ]
  },
  accountant: {
    role: 'accountant',
    title: 'Financial Accountant',
    banglaTitle: 'হিসাবরক্ষক',
    description: 'Dedicated to cashbook, money receipts, supplier payables, operational expenses, customer ledgers, and profit & loss.',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500'
    },
    allowedViews: [
      'dashboard',
      'sales_list',
      'sales_challans',
      'purchase_list',
      'customer_list',
      'customer_cylinder_due',
      'customer_ledger',
      'supplier_list',
      'supplier_ledger',
      'accounts_cashbook',
      'accounts_receive',
      'accounts_pay',
      'accounts_expenses',
      'accounts_summary',
      'report_daily',
      'reports_center'
    ],
    allowedActions: [
      'view_cost_price',
      'view_profit_margin',
      'receive_payment',
      'make_supplier_payment',
      'record_expense',
      'export_data'
    ]
  },
  sales: {
    role: 'sales',
    title: 'Sales Representative / Cashier',
    banglaTitle: 'বিক্রয় প্রতিনিধি / ক্যাশিয়ার',
    description: 'Authorized for POS order billing, issuing delivery challans, checking customer cylinder dues, and receiving payments. Cost prices hidden.',
    badgeColor: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500'
    },
    allowedViews: [
      'dashboard',
      'sales_pos',
      'sales_new',
      'sales_list',
      'sales_challans',
      'customer_list',
      'customer_cylinder_due',
      'customer_ledger',
      'accounts_receive'
    ],
    allowedActions: [
      'create_sale',
      'receive_payment'
    ]
  },
  storekeeper: {
    role: 'storekeeper',
    title: 'Godown Storekeeper',
    banglaTitle: 'গুদাম রক্ষক',
    description: 'Controls physical cylinder stocks, godown movements, receiving empty returns, and recording defective cylinders. Financial prices hidden.',
    badgeColor: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500'
    },
    allowedViews: [
      'dashboard',
      'inventory_stock',
      'inventory_movements',
      'inventory_damaged',
      'purchase_list',
      'sales_challans',
      'customer_cylinder_due',
      'report_cylinder_audit'
    ],
    allowedActions: [
      'adjust_stock',
      'receive_empty',
      'record_damage'
    ]
  },
  delivery: {
    role: 'delivery',
    title: 'Delivery Driver / Logistics',
    banglaTitle: 'ডেলিভারি চালক / পরিবহন',
    description: 'View delivery challans, destination customer phone and locations, and track empty cylinder pickups on vehicle routes.',
    badgeColor: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dot: 'bg-slate-500'
    },
    allowedViews: [
      'dashboard',
      'sales_challans',
      'customer_list',
      'customer_cylinder_due'
    ],
    allowedActions: [
      'receive_empty'
    ]
  },
  owner: {
    role: 'owner',
    title: 'Business Owner',
    banglaTitle: 'মালিক / সত্ত্বাধিকারী',
    description: 'Full strategic, commercial, and financial ownership over all operations, margins, and audits.',
    badgeColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-500'
    },
    allowedViews: [
      'dashboard', 'sales_pos', 'sales_new', 'sales_list', 'sales_challans', 'sales_returns',
      'purchase_new', 'purchase_list', 'inventory_stock', 'inventory_movements', 'inventory_damaged',
      'customer_list', 'customer_cylinder_due', 'customer_ledger', 'supplier_list', 'supplier_ledger',
      'accounts_cashbook', 'accounts_receive', 'accounts_pay', 'accounts_expenses', 'accounts_summary',
      'report_daily', 'report_cylinder_audit', 'reports_center', 'settings', 'audit_logs', 'users_roles', 'supabase_sync'
    ],
    allowedActions: [
      'view_cost_price', 'view_profit_margin', 'create_sale', 'cancel_sale', 'delete_sale',
      'create_purchase', 'adjust_stock', 'receive_empty', 'record_damage', 'receive_payment',
      'make_supplier_payment', 'record_expense', 'manage_users', 'manage_settings', 'view_audit_logs',
      'export_data', 'sync_database'
    ]
  },
  sales_operator: {
    role: 'sales_operator',
    title: 'Sales Operator',
    banglaTitle: 'বিক্রয় অপারেটর',
    description: 'Front-desk point-of-sale, invoices, delivery challans, and customer money receipts.',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500'
    },
    allowedViews: [
      'dashboard', 'sales_pos', 'sales_new', 'sales_list', 'sales_challans', 'sales_returns',
      'customer_list', 'customer_cylinder_due', 'customer_ledger', 'accounts_receive',
      'inventory_stock'
    ],
    allowedActions: [
      'create_sale', 'receive_empty', 'receive_payment'
    ]
  },
  store_keeper: {
    role: 'store_keeper',
    title: 'Store Keeper / Godown Manager',
    banglaTitle: 'গুদাম রক্ষক',
    description: 'Manages physical godown inventory, receiving supplier purchases, cylinder audits, and stock movements.',
    badgeColor: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500'
    },
    allowedViews: [
      'dashboard', 'inventory_stock', 'inventory_movements', 'inventory_damaged',
      'purchase_new', 'purchase_list', 'sales_challans', 'customer_cylinder_due', 'report_cylinder_audit'
    ],
    allowedActions: [
      'create_purchase', 'adjust_stock', 'receive_empty', 'record_damage'
    ]
  },
  delivery_staff: {
    role: 'delivery_staff',
    title: 'Delivery Staff / Transport',
    banglaTitle: 'ডেলিভারি ও পরিবহন কর্মী',
    description: 'View delivery routes, challan status, vehicle cylinder loads, and empty returns.',
    badgeColor: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      dot: 'bg-slate-500'
    },
    allowedViews: [
      'dashboard', 'sales_challans', 'customer_list', 'customer_cylinder_due'
    ],
    allowedActions: [
      'receive_empty'
    ]
  }
};
