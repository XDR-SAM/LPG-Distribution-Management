import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageToggle } from '../common/LanguageToggle';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Flame,
  Calendar,
  ChevronDown,
  LogOut,
  ShoppingBag,
  ArrowDownLeft,
  Receipt,
  RotateCcw,
  CheckCheck,
  AlertTriangle,
  Info,
  Sliders,
  PanelLeftClose,
  PanelLeft,
  Database,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Bot
} from 'lucide-react';
import { canPerform, getRoleConfig, getRoleDisplayName } from '../../utils/rbac';
import { isSupabaseConfigured } from '../../lib/supabase';
import { UserRole } from '../../types';

interface TopBarProps {
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
  setMobileOpen?: (o: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  collapsed = false,
  setCollapsed = (_c?: boolean) => {},
  setMobileOpen = (_o?: boolean) => {},
}) => {
  const {
    activeView,
    settings,
    currentUser,
    setCurrentUser,
    users,
    logout,
    notifications,
    markNotificationRead,
    setActiveView,
    setIsSearchOpen,
    setIsAdjustStockModalOpen,
    setIsReceiveEmptyModalOpen,
    t,
    formatDisplayDate,
    language,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcherSubmenu, setShowRoleSwitcherSubmenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentRole = currentUser?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);
  const supabaseActive = isSupabaseConfigured();

  const getViewBreadcrumbs = (): { section: string; page: string } => {
    switch (activeView) {
      case 'dashboard':
        return { section: language === 'bn' ? 'হোম' : 'Home', page: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard' };
      case 'sales_pos':
      case 'sales_new':
        return { section: language === 'bn' ? 'বিক্রয়' : 'Sales', page: language === 'bn' ? 'নতুন বিক্রয় (POS)' : 'New POS Order' };
      case 'sales_list':
      case 'sales_invoice':
      case 'sales_invoices':
      case 'sales':
      case 'invoices':
        return { section: language === 'bn' ? 'বিক্রয়' : 'Sales', page: language === 'bn' ? 'ইনভয়েস তালিকা' : 'Invoices' };
      case 'sales_challan':
      case 'sales_challans':
      case 'delivery_list':
        return { section: language === 'bn' ? 'লজিস্টিকস' : 'Logistics', page: language === 'bn' ? 'ডেলিভারি চালান' : 'Delivery Challans' };
      case 'sales_returns':
        return { section: language === 'bn' ? 'বিক্রয়' : 'Sales', page: language === 'bn' ? 'সিলিন্ডার ফেরত' : 'Returns' };
      case 'purchase_new':
        return { section: language === 'bn' ? 'ক্রয়' : 'Purchases', page: language === 'bn' ? 'ডিপো থেকে ক্রয়' : 'Depot Purchase' };
      case 'purchase_list':
      case 'purchases':
        return { section: language === 'bn' ? 'ক্রয়' : 'Purchases', page: language === 'bn' ? 'ক্রয় রেজিস্টার' : 'Purchase Invoices' };
      case 'inventory_stock':
      case 'inventory':
      case 'stock':
        return { section: language === 'bn' ? 'ইনভেন্টরি' : 'Inventory', page: language === 'bn' ? 'সিলিন্ডার স্টক' : 'Godown Stock' };
      case 'inventory_movements':
        return { section: language === 'bn' ? 'ইনভেন্টরি' : 'Inventory', page: language === 'bn' ? 'স্টক মুভমেন্ট' : 'Stock Movements' };
      case 'inventory_damaged':
        return { section: language === 'bn' ? 'নিরাপত্তা' : 'Safety', page: language === 'bn' ? 'ত্রুটিপূর্ণ সিলিন্ডার' : 'Quarantine Cylinders' };
      case 'customer_list':
      case 'customer_directory':
      case 'customers':
      case 'customer':
        return { section: language === 'bn' ? 'গ্রাহক' : 'Customers', page: language === 'bn' ? 'গ্রাহক ডিরেক্টরি' : 'Customer Directory' };
      case 'customer_cylinder_due':
      case 'cylinder_due':
        return { section: language === 'bn' ? 'গ্রাহক' : 'Customers', page: language === 'bn' ? 'সিলিন্ডার বাকি' : 'Cylinder Receivables' };
      case 'customer_ledger':
      case 'customer_ledgers':
        return { section: language === 'bn' ? 'গ্রাহক' : 'Customers', page: language === 'bn' ? 'গ্রাহক খতিয়ান' : 'Customer Ledger' };
      case 'supplier_list':
      case 'supplier_directory':
      case 'suppliers':
      case 'supplier':
        return { section: language === 'bn' ? 'সরবরাহকারী' : 'Suppliers', page: language === 'bn' ? 'রিফাইনারি ডিপো' : 'Refineries & Depots' };
      case 'supplier_ledger':
      case 'supplier_ledgers':
        return { section: language === 'bn' ? 'সরবরাহকারী' : 'Suppliers', page: language === 'bn' ? 'কোম্পানি লেজার' : 'Company Ledger' };
      case 'accounts_cashbook':
      case 'cashbook':
        return { section: language === 'bn' ? 'হিসাব' : 'Accounts', page: language === 'bn' ? 'দৈনিক ক্যাশবুক' : 'Daily Cashbook' };
      case 'accounts_receive':
        return { section: language === 'bn' ? 'হিসাব' : 'Accounts', page: language === 'bn' ? 'টাকা আদায়' : 'Receive Payment' };
      case 'accounts_pay':
        return { section: language === 'bn' ? 'হিসাব' : 'Accounts', page: language === 'bn' ? 'কোম্পানি পেমেন্ট' : 'Supplier Payment' };
      case 'accounts_expenses':
        return { section: language === 'bn' ? 'হিসাব' : 'Accounts', page: language === 'bn' ? 'গুদাম খরচ' : 'Godown Expenses' };
      case 'accounts_summary':
        return { section: language === 'bn' ? 'হিসাব' : 'Accounts', page: language === 'bn' ? 'আর্থিক বিবরণী' : 'Financial Summary' };
      case 'report_daily':
      case 'reports_center':
      case 'daily_report':
      case 'reports':
        return { section: language === 'bn' ? 'রিপোর্ট' : 'Reports', page: language === 'bn' ? 'দৈনিক বিবরণী' : 'Daily Statement' };
      case 'report_cylinder_audit':
        return { section: language === 'bn' ? 'অডিট' : 'Audit', page: language === 'bn' ? 'সিলিন্ডার অডিট' : 'Cylinder Audit' };
      case 'ai_agent':
        return { section: language === 'bn' ? 'এআই' : 'AI Copilot', page: language === 'bn' ? 'গোডাউন এজেন্ট' : 'Godown Assistant' };
      case 'users_roles':
        return { section: language === 'bn' ? 'প্রশাসন' : 'Admin', page: language === 'bn' ? 'ইউজার ও রোলস' : 'Users & Roles' };
      case 'supabase_sync':
        return { section: language === 'bn' ? 'ডাটাবেজ' : 'Database', page: language === 'bn' ? 'সুপাবেজ সিঙ্ক' : 'Supabase Sync' };
      case 'settings':
        return { section: language === 'bn' ? 'সেটিংস' : 'Settings', page: language === 'bn' ? 'সিস্টেম ও রেট' : 'Godown Settings' };
      default:
        return { section: 'LPG BD', page: 'Dashboard' };
    }
  };

  const breadcrumbs = getViewBreadcrumbs();

  const handleSwitchUserRole = (targetRole: UserRole) => {
    const targetUser = users.find(u => u.role === targetRole);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      // Fallback
      setCurrentUser({
        id: `mock-${targetRole}`,
        name: `${targetRole.toUpperCase()} Staff`,
        email: `${targetRole}@demo.com`,
        username: targetRole,
        phone: '01700-000000',
        role: targetRole,
        status: 'active',
        lastLogin: 'Just now',
      });
    }
    setShowUserMenu(false);
    setShowRoleSwitcherSubmenu(false);
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-3 md:px-5 select-none shadow-2xs">
      {/* Left section: Toggle & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden shrink-0 transition-colors"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hidden lg:flex items-center justify-center transition-colors shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Dynamic Breadcrumbs & Location */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100 shrink-0"
            title="Dashboard Overview"
          >
            <Flame className="w-4 h-4 text-orange-600" />
          </button>
          <span className="text-slate-300 font-light hidden sm:inline">/</span>
          <span className="text-xs font-semibold text-slate-500 hidden md:inline truncate max-w-[120px]">
            {breadcrumbs.section}
          </span>
          <span className="text-slate-300 font-light hidden md:inline">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[280px]">
              {breadcrumbs.page}
            </span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200/80 hidden xl:inline-flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Mohammadpur Godown
            </span>
          </div>
        </div>
      </div>

      {/* Center section: Global Search (Ctrl + K) */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="text-slate-400">{t('app.search_placeholder')}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            {t('app.ctrl_k')}
          </kbd>
        </button>
      </div>

      {/* Right section: Mobile Search, Language Toggle, Supabase Status, Date, Quick Actions, User Profile */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
          title={t('app.search_placeholder')}
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Language Toggle Switch */}
        <LanguageToggle variant="pill" />

        {/* AI Agent Quick Trigger Button */}
        <button
          onClick={() => setActiveView('ai_agent')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors shadow-2xs"
          title="Open AI Godown Operations Agent"
        >
          <Bot className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline">AI Agent</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Supabase Status Pill */}
        <button
          onClick={() => setActiveView('supabase_sync')}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
            supabaseActive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title="Supabase Database Status & Sync"
        >
          <Database className={`w-3.5 h-3.5 ${supabaseActive ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>{supabaseActive ? t('app.supabase_connected') : t('app.supabase_local')}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${supabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        </button>

        {/* Current Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span>{formatDisplayDate('2026-09-15')}</span>
        </div>

        {/* Quick Action Button (RBAC-Filtered) */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">{t('app.quick_action')}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showQuickActions && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowQuickActions(false)} />
              <div className="absolute right-0 mt-1.5 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Quick Actions ({roleConfig.title})
                </div>

                {canPerform(currentRole, 'create_sale') && (
                  <button
                    onClick={() => {
                      setActiveView('sales_new');
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-950 font-medium"
                  >
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span>+ New Sale (POS / Exchange)</span>
                  </button>
                )}

                {canPerform(currentRole, 'create_purchase') && (
                  <button
                    onClick={() => {
                      setActiveView('purchase_new');
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-900 font-medium"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span>+ New Purchase from Depot</span>
                  </button>
                )}

                {canPerform(currentRole, 'receive_payment') && (
                  <button
                    onClick={() => {
                      setActiveView('accounts_receive');
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <span>Receive Customer Payment</span>
                  </button>
                )}

                {canPerform(currentRole, 'record_expense') && (
                  <button
                    onClick={() => {
                      setActiveView('accounts_expenses');
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                  >
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>Add Godown Expense</span>
                  </button>
                )}

                {canPerform(currentRole, 'receive_empty') && (
                  <button
                    onClick={() => {
                      setIsReceiveEmptyModalOpen(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-900 font-medium"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-600" />
                    <span>Receive Empty Cylinders</span>
                  </button>
                )}

                {canPerform(currentRole, 'adjust_stock') && (
                  <button
                    onClick={() => {
                      setIsAdjustStockModalOpen(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium border-t border-slate-100"
                  >
                    <Sliders className="w-4 h-4 text-slate-600" />
                    <span>Stock Adjustment</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-30 text-xs max-h-96 overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Godown Alerts</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                    {unreadCount} Unread
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !n.read ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        {n.type === 'success' && <CheckCheck className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-orange-400 flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser?.name.split(' ')[0] || 'User'}
              </div>
              <div className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                {roleConfig.title.split(' ')[0]}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs">
                {/* Active User Header */}
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] ${roleConfig.badgeColor.bg} ${roleConfig.badgeColor.text} border ${roleConfig.badgeColor.border}`}>
                      Role: {roleConfig.title}
                    </span>
                  </div>
                </div>

                {/* Instant Role Simulator / Switcher */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-orange-600" />
                      <span>Switch Role (Test RBAC)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['admin', 'manager', 'accountant', 'sales', 'storekeeper', 'delivery'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => handleSwitchUserRole(r)}
                        className={`px-1.5 py-1 rounded text-[10px] font-bold text-center capitalize transition-colors ${
                          currentRole === r
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Switch Option */}
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span className="text-xs">🌐</span>
                    <span>{t('app.switch_language')}</span>
                  </span>
                  <LanguageToggle variant="pill" />
                </div>

                <button
                  onClick={() => {
                    setActiveView('users_roles');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Users & Permissions Matrix</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('supabase_sync');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supabase Database & SQL</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Godown Settings</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
