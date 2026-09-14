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
  SlidersHorizontal,
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
  PackageCheck,
  Flame,
  UserCheck
} from 'lucide-react';

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
  const { activeView, setActiveView } = useApp();

  // Track expanded submenus
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: true,
    inventory: true,
    customers: true,
    accounts: true,
    suppliers: false,
    delivery: false,
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0F172A] text-slate-200 border-r border-slate-800 flex flex-col transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-slate-950">
          <div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            onClick={() => navigateTo('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0 font-black">
              <Flame className="w-5 h-5 fill-white text-orange-600" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  LPG Manager <span className="text-orange-500 text-[11px] font-mono px-1 py-0.2 bg-orange-950/80 rounded border border-orange-800/60">BD</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  Rahman LPG Distribution
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-xs select-none">
          {/* Dashboard */}
          <button
            onClick={() => navigateTo('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-semibold transition-colors ${
              isNavActive('dashboard')
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Dashboard</span>}
          </button>

          {/* Sales Section */}
          <div className="pt-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('sales')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sales & Orders</span>
                </div>
                {openSections.sales ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-800 my-2" />
            )}

            {(openSections.sales || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('sales_new')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('sales_new')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="New Sale (POS)"
                >
                  <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!collapsed && <span>New Sale (POS)</span>}
                </button>

                <button
                  onClick={() => navigateTo('sales_list')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('sales_list')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Sales List"
                >
                  <ListOrdered className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Sales List</span>}
                </button>

                <button
                  onClick={() => navigateTo('sales_challan')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('sales_challan')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Delivery Challans"
                >
                  <Truck className="w-4 h-4 shrink-0 text-amber-400" />
                  {!collapsed && <span>Delivery Challan</span>}
                </button>

                <button
                  onClick={() => navigateTo('sales_returns')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('sales_returns')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Sale Returns"
                >
                  <RotateCcw className="w-4 h-4 shrink-0 text-rose-400" />
                  {!collapsed && <span>Sale Returns</span>}
                </button>
              </div>
            )}
          </div>

          {/* Purchases Section */}
          <div className="pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection('purchases')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Purchases</span>
                </div>
                {openSections.purchases ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {(openSections.purchases || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('purchase_new')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('purchase_new')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="New Purchase"
                >
                  <PlusCircle className="w-4 h-4 shrink-0 text-blue-400" />
                  {!collapsed && <span>New Purchase</span>}
                </button>
                <button
                  onClick={() => navigateTo('purchase_list')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('purchase_list')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Purchase List"
                >
                  <ListOrdered className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Purchase List</span>}
                </button>
              </div>
            )}
          </div>

          {/* Cylinders & Inventory */}
          <div className="pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection('inventory')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cylinders & Stock</span>
                </div>
                {openSections.inventory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {(openSections.inventory || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('inventory_stock')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('inventory_stock')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Current Cylinder Stock"
                >
                  <PackageCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!collapsed && <span>Current Stock (Full/Empty)</span>}
                </button>

                <button
                  onClick={() => navigateTo('inventory_movements')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('inventory_movements')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Stock Movement Ledger"
                >
                  <Activity className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!collapsed && <span>Stock Movements</span>}
                </button>

                <button
                  onClick={() => navigateTo('inventory_adjustment')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('inventory_adjustment')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Cylinder Adjustment"
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0 text-amber-400" />
                  {!collapsed && <span>Stock Adjustment</span>}
                </button>

                <button
                  onClick={() => navigateTo('inventory_damaged')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('inventory_damaged')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Damaged / Lost Cylinders"
                >
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                  {!collapsed && <span>Damaged & Lost</span>}
                </button>
              </div>
            )}
          </div>

          {/* Customers & Dealers */}
          <div className="pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection('customers')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Customers / Dealers</span>
                </div>
                {openSections.customers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {(openSections.customers || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('customer_list')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('customer_list')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Customer List"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Customer List</span>}
                </button>

                <button
                  onClick={() => navigateTo('customer_cylinder_due')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('customer_cylinder_due')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Customer Cylinder Due"
                >
                  <Flame className="w-4 h-4 shrink-0 text-orange-400" />
                  {!collapsed && <span>Cylinder Due Account</span>}
                </button>

                <button
                  onClick={() => navigateTo('customer_ledger')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('customer_ledger')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Customer Ledger Statement"
                >
                  <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                  {!collapsed && <span>Customer Ledger</span>}
                </button>
              </div>
            )}
          </div>

          {/* Suppliers */}
          <div className="pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection('suppliers')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Suppliers</span>
                </div>
                {openSections.suppliers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {(openSections.suppliers || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('supplier_list')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('supplier_list')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Supplier List"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Supplier List</span>}
                </button>

                <button
                  onClick={() => navigateTo('supplier_ledger')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('supplier_ledger')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Supplier Ledger & Cylinders"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Supplier Ledger</span>}
                </button>
              </div>
            )}
          </div>

          {/* Accounts & Cashbook */}
          <div className="pt-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection('accounts')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accounts & Cash</span>
                </div>
                {openSections.accounts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}

            {(openSections.accounts || collapsed) && (
              <div className="space-y-0.5 mt-0.5">
                <button
                  onClick={() => navigateTo('accounts_cashbook')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('accounts_cashbook')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Cashbook & Bank"
                >
                  <Wallet className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!collapsed && <span>Cashbook & Balances</span>}
                </button>

                <button
                  onClick={() => navigateTo('accounts_receive')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('accounts_receive')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Receive Payment"
                >
                  <ArrowDownLeft className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!collapsed && <span>Receive Payment</span>}
                </button>

                <button
                  onClick={() => navigateTo('accounts_pay')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('accounts_pay')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Supplier Payment"
                >
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-rose-400" />
                  {!collapsed && <span>Make Payment</span>}
                </button>

                <button
                  onClick={() => navigateTo('accounts_expenses')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('accounts_expenses')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Expenses"
                >
                  <Receipt className="w-4 h-4 shrink-0 text-amber-400" />
                  {!collapsed && <span>Expenses</span>}
                </button>

                <button
                  onClick={() => navigateTo('accounts_summary')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                    isNavActive('accounts_summary')
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Profit & Loss Statement"
                >
                  <BarChart3 className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!collapsed && <span>Profit & Loss / Balance</span>}
                </button>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="pt-1">
            <button
              onClick={() => navigateTo('delivery_list')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isNavActive('delivery_list')
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Delivery & Transport"
            >
              <Truck className="w-4 h-4 shrink-0 text-amber-400" />
              {!collapsed && <span>Delivery & Transport</span>}
            </button>
          </div>

          {/* Reports Center */}
          <div className="pt-1">
            <button
              onClick={() => navigateTo('reports_center')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isNavActive('reports_center')
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Reports Center"
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-indigo-400" />
              {!collapsed && <span className="font-semibold">Reports Center</span>}
            </button>
          </div>

          {/* Audit Log */}
          <div className="pt-1">
            <button
              onClick={() => navigateTo('audit_log')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isNavActive('audit_log')
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="System Audit Log"
            >
              <ClipboardList className="w-4 h-4 shrink-0 text-slate-400" />
              {!collapsed && <span>Audit Log</span>}
            </button>
          </div>

          {/* Users & Roles */}
          <div className="pt-1">
            <button
              onClick={() => navigateTo('users_roles')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isNavActive('users_roles')
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Users & Roles"
            >
              <UserCheck className="w-4 h-4 shrink-0 text-slate-400" />
              {!collapsed && <span>Users & Permissions</span>}
            </button>
          </div>

          {/* Settings & BERC */}
          <div className="pt-1 pb-4">
            <button
              onClick={() => navigateTo('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors ${
                isNavActive('settings')
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Settings & Mushak 6.3"
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-400" />
              {!collapsed && <span>Settings & BERC</span>}
            </button>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-orange-400 shrink-0">
                M
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-white truncate">Al-Haj Mizanur Rahman</div>
                <div className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> Admin (Full Access)
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-orange-400 text-xs">
                M
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
