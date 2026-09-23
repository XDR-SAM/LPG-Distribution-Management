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
  RefreshCw
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
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-3 md:px-5 select-none shadow-2xs">
      {/* Left section: Toggle & Business Info */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 lg:hidden shrink-0 transition-colors"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hidden lg:flex items-center justify-center transition-colors shrink-0"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Business and Godown Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="leading-tight min-w-0">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 min-w-0">
              <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">{settings.profile.businessName}</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline-block shrink-0">
                Mohammadpur Godown
              </span>
            </div>
            <div className="text-[11px] text-slate-500 hidden md:block truncate">
              Dhaka, Bangladesh · Reg: {settings.profile.tradeLicense.slice(0, 15)}...
            </div>
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
