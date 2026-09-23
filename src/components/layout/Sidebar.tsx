import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  ListOrdered,
  Truck,
  RotateCcw,
  ShoppingBag,
  Boxes,
  Activity,
  AlertOctagon,
  Users,
  Building2,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileText,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  PackageCheck,
  Flame,
  UserCheck,
  Database,
  RefreshCw,
  Globe,
  X
} from 'lucide-react';
import { canAccessView, getRoleConfig } from '../../utils/rbac';
import { LanguageToggle } from '../common/LanguageToggle';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  setCollapsed = (_c?: boolean) => {},
  mobileOpen = false,
  setMobileOpen = (_o?: boolean) => {},
}) => {
  const { activeView, setActiveView, currentUser, settings, t, language } = useApp();
  const currentRole = currentUser?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  // Track expanded submenus
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    inventory: true,
    customers: true,
    accounts: true,
    suppliers: false,
    reports: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navigateTo = (view: string) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  const isNavActive = (view: string) => activeView === view;
  const isCompact = collapsed && !mobileOpen;
  const showExpanded = !isCompact;

  // RBAC Filter checks
  const canView = (view: string) => canAccessView(currentRole, view);

  // Check section visibility
  const showSalesSection = canView('sales_new') || canView('sales_list') || canView('sales_challans') || canView('sales_returns');
  const showPurchasesSection = canView('purchase_new') || canView('purchase_list');
  const showInventorySection = canView('inventory_stock') || canView('inventory_movements') || canView('inventory_damaged');
  const showCustomersSection = canView('customer_list') || canView('customer_cylinder_due') || canView('customer_ledger');
  const showSuppliersSection = canView('supplier_list') || canView('supplier_ledger');
  const showAccountsSection = canView('accounts_cashbook') || canView('accounts_receive') || canView('accounts_pay') || canView('accounts_expenses') || canView('accounts_summary');
  const showReportsSection = canView('report_daily') || canView('report_cylinder_audit');

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:static lg:z-auto lg:h-full shrink-0 ${
          isCompact ? 'w-16' : 'w-72 sm:w-80 lg:w-64 max-w-[85vw]'
        } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-14 lg:h-16 flex items-center justify-between px-3.5 border-b border-slate-800 shrink-0 bg-slate-950">
          <div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden min-w-0"
            onClick={() => navigateTo('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0 font-black">
              <Flame className="w-5 h-5 fill-white text-orange-600" />
            </div>
            {showExpanded && (
              <div className="truncate min-w-0">
                <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  LPG Manager <span className="text-orange-500 text-[10px] font-mono px-1 py-0.2 bg-orange-950/80 rounded border border-orange-800/60">BD</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  {settings.profile.businessName}
                </div>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          {setCollapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(showExpanded)}
              className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-xs select-none">
          {/* Dashboard (All roles) */}
          <button
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-semibold transition-colors ${
              isNavActive('dashboard')
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
            title={t('nav.dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {showExpanded && <span className="truncate">{t('nav.dashboard')}</span>}
          </button>

          {/* Sales Section */}
          {showSalesSection && (
            <div className="pt-1">
              {showExpanded ? (
                <button
                  onClick={() => toggleSection('sales')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
                    <span>{t('nav.sales_section')}</span>
                  </div>
                  {openSections.sales ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="h-px bg-slate-800 my-2" />
              )}

              {(openSections.sales || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('sales_new') && (
                    <button
                      onClick={() => navigateTo('sales_new')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('sales_new') || isNavActive('sales_pos')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.new_sale')}
                    >
                      <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      {showExpanded && <span>{t('nav.new_sale')}</span>}
                    </button>
                  )}

                  {canView('sales_list') && (
                    <button
                      onClick={() => navigateTo('sales_list')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('sales_list')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.sales_list')}
                    >
                      <ListOrdered className="w-4 h-4 shrink-0" />
                      {showExpanded && <span>{t('nav.sales_list')}</span>}
                    </button>
                  )}

                  {canView('sales_challans') && (
                    <button
                      onClick={() => navigateTo('sales_challans')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('sales_challans')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.challans')}
                    >
                      <Truck className="w-4 h-4 shrink-0 text-amber-400" />
                      {showExpanded && <span>{t('nav.challans')}</span>}
                    </button>
                  )}

                  {canView('sales_returns') && (
                    <button
                      onClick={() => navigateTo('sales_returns')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('sales_returns')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.returns')}
                    >
                      <RotateCcw className="w-4 h-4 shrink-0 text-rose-400" />
                      {showExpanded && <span>{t('nav.returns')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Purchases Section */}
          {showPurchasesSection && (
            <div className="pt-1">
              {showExpanded && (
                <button
                  onClick={() => toggleSection('purchases')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t('nav.purchases_section')}</span>
                  </div>
                  {openSections.purchases ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}

              {(openSections.purchases || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('purchase_new') && (
                    <button
                      onClick={() => navigateTo('purchase_new')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('purchase_new')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.new_purchase')}
                    >
                      <PlusCircle className="w-4 h-4 shrink-0 text-blue-400" />
                      {showExpanded && <span>{t('nav.new_purchase')}</span>}
                    </button>
                  )}
                  {canView('purchase_list') && (
                    <button
                      onClick={() => navigateTo('purchase_list')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('purchase_list')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.purchase_list')}
                    >
                      <ListOrdered className="w-4 h-4 shrink-0" />
                      {showExpanded && <span>{t('nav.purchase_list')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cylinders & Inventory */}
          {showInventorySection && (
            <div className="pt-1">
              {showExpanded && (
                <button
                  onClick={() => toggleSection('inventory')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('nav.inventory_section')}</span>
                  </div>
                  {openSections.inventory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}

              {(openSections.inventory || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('inventory_stock') && (
                    <button
                      onClick={() => navigateTo('inventory_stock')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('inventory_stock')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.current_stock')}
                    >
                      <PackageCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                      {showExpanded && <span>{t('nav.current_stock')}</span>}
                    </button>
                  )}

                  {canView('inventory_movements') && (
                    <button
                      onClick={() => navigateTo('inventory_movements')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('inventory_movements')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.stock_movements')}
                    >
                      <Activity className="w-4 h-4 shrink-0 text-cyan-400" />
                      {showExpanded && <span>{t('nav.stock_movements')}</span>}
                    </button>
                  )}

                  {canView('inventory_damaged') && (
                    <button
                      onClick={() => navigateTo('inventory_damaged')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('inventory_damaged')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.damaged')}
                    >
                      <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                      {showExpanded && <span>{t('nav.damaged')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customers & Dealers */}
          {showCustomersSection && (
            <div className="pt-1">
              {showExpanded && (
                <button
                  onClick={() => toggleSection('customers')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t('nav.customers_section')}</span>
                  </div>
                  {openSections.customers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}

              {(openSections.customers || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('customer_list') && (
                    <button
                      onClick={() => navigateTo('customer_list')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('customer_list')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.customer_list')}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      {showExpanded && <span>{t('nav.customer_list')}</span>}
                    </button>
                  )}

                  {canView('customer_cylinder_due') && (
                    <button
                      onClick={() => navigateTo('customer_cylinder_due')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('customer_cylinder_due')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.cylinder_due')}
                    >
                      <Flame className="w-4 h-4 shrink-0 text-orange-400" />
                      {showExpanded && <span>{t('nav.cylinder_due')}</span>}
                    </button>
                  )}

                  {canView('customer_ledger') && (
                    <button
                      onClick={() => navigateTo('customer_ledger')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('customer_ledger')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.customer_ledger')}
                    >
                      <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                      {showExpanded && <span>{t('nav.customer_ledger')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Suppliers */}
          {showSuppliersSection && (
            <div className="pt-1">
              {showExpanded && (
                <button
                  onClick={() => toggleSection('suppliers')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('nav.suppliers_section')}</span>
                  </div>
                  {openSections.suppliers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}

              {(openSections.suppliers || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('supplier_list') && (
                    <button
                      onClick={() => navigateTo('supplier_list')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('supplier_list')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.supplier_list')}
                    >
                      <Building2 className="w-4 h-4 shrink-0" />
                      {showExpanded && <span>{t('nav.supplier_list')}</span>}
                    </button>
                  )}

                  {canView('supplier_ledger') && (
                    <button
                      onClick={() => navigateTo('supplier_ledger')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('supplier_ledger')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.supplier_ledger')}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      {showExpanded && <span>{t('nav.supplier_ledger')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Accounts & Cashbook */}
          {showAccountsSection && (
            <div className="pt-1">
              {showExpanded && (
                <button
                  onClick={() => toggleSection('accounts')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('nav.accounts_section')}</span>
                  </div>
                  {openSections.accounts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}

              {(openSections.accounts || isCompact) && (
                <div className="space-y-0.5 mt-0.5">
                  {canView('accounts_cashbook') && (
                    <button
                      onClick={() => navigateTo('accounts_cashbook')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('accounts_cashbook')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.cashbook')}
                    >
                      <Wallet className="w-4 h-4 shrink-0 text-emerald-400" />
                      {showExpanded && <span>{t('nav.cashbook')}</span>}
                    </button>
                  )}

                  {canView('accounts_receive') && (
                    <button
                      onClick={() => navigateTo('accounts_receive')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('accounts_receive')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.money_receipt')}
                    >
                      <ArrowDownLeft className="w-4 h-4 shrink-0 text-emerald-400" />
                      {showExpanded && <span>{t('nav.money_receipt')}</span>}
                    </button>
                  )}

                  {canView('accounts_pay') && (
                    <button
                      onClick={() => navigateTo('accounts_pay')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('accounts_pay')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.supplier_payment')}
                    >
                      <ArrowUpRight className="w-4 h-4 shrink-0 text-rose-400" />
                      {showExpanded && <span>{t('nav.supplier_payment')}</span>}
                    </button>
                  )}

                  {canView('accounts_expenses') && (
                    <button
                      onClick={() => navigateTo('accounts_expenses')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('accounts_expenses')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.expenses')}
                    >
                      <Receipt className="w-4 h-4 shrink-0 text-amber-400" />
                      {showExpanded && <span>{t('nav.expenses')}</span>}
                    </button>
                  )}

                  {canView('accounts_summary') && (
                    <button
                      onClick={() => navigateTo('accounts_summary')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                        isNavActive('accounts_summary')
                          ? 'bg-orange-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={t('nav.financial_summary')}
                    >
                      <BarChart3 className="w-4 h-4 shrink-0 text-cyan-400" />
                      {showExpanded && <span>{t('nav.financial_summary')}</span>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reports Center */}
          {showReportsSection && (
            <div className="pt-1">
              <button
                onClick={() => navigateTo('report_daily')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isNavActive('report_daily') || isNavActive('report_cylinder_audit')
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={t('nav.reports_section')}
              >
                <BarChart3 className="w-4 h-4 shrink-0 text-indigo-400" />
                {showExpanded && <span className="font-semibold">{t('nav.reports_section')}</span>}
              </button>
            </div>
          )}

          {/* Audit Log (Admin / Manager) */}
          {canView('audit_logs') && (
            <div className="pt-1">
              <button
                onClick={() => navigateTo('audit_logs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isNavActive('audit_logs')
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title="System Audit Log"
              >
                <ClipboardList className="w-4 h-4 shrink-0 text-slate-400" />
                {showExpanded && <span>System Audit Log</span>}
              </button>
            </div>
          )}

          {/* Users & RBAC Permissions (Admin & Manager) */}
          {canView('users_roles') && (
            <div className="pt-1">
              <button
                onClick={() => navigateTo('users_roles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isNavActive('users_roles')
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={t('nav.users_roles')}
              >
                <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                {showExpanded && <span>{t('nav.users_roles')}</span>}
              </button>
            </div>
          )}

          {/* Supabase Database Integration (Admin) */}
          {canView('supabase_sync') && (
            <div className="pt-1">
              <button
                onClick={() => navigateTo('supabase_sync')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isNavActive('supabase_sync')
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={t('nav.supabase_database')}
              >
                <Database className="w-4 h-4 shrink-0 text-emerald-400" />
                {showExpanded && <span className="font-bold">{t('nav.supabase_database')}</span>}
              </button>
            </div>
          )}

          {/* Settings & BERC */}
          {canView('settings') && (
            <div className="pt-1 pb-4">
              <button
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                  isNavActive('settings')
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={t('nav.settings')}
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                {showExpanded && <span>{t('nav.settings')}</span>}
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Language Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 shrink-0 space-y-2">
          {showExpanded && (
            <div className="flex items-center justify-between px-1 py-1 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>{language === 'bn' ? 'ভাষা' : 'Language'}</span>
              </span>
              <LanguageToggle variant="pill" />
            </div>
          )}

          {showExpanded ? (
            <div 
              onClick={() => navigateTo('users_roles')}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-900/60 p-1 rounded-md transition-colors"
              title="Click to Switch Role or View Permissions"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-orange-400 shrink-0 text-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Authorized User'}
                </div>
                <div className="text-[11px] text-orange-400 font-medium flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 inline shrink-0" />
                  <span className="truncate">{roleConfig.title}</span>
                </div>
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500 hover:text-orange-400 shrink-0" />
            </div>
          ) : (
            <div 
              onClick={() => navigateTo('users_roles')}
              className="flex justify-center cursor-pointer"
              title={`Logged in as ${currentUser?.name} (${roleConfig.title})`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-orange-400 text-xs">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
