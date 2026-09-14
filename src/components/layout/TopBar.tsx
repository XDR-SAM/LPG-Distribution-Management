import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  PanelLeft
} from 'lucide-react';

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
    logout,
    notifications,
    markNotificationRead,
    setActiveView,
    setIsSearchOpen,
    setIsAdjustStockModalOpen,
    setIsReceiveEmptyModalOpen,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-3 md:px-5 select-none shadow-2xs">
      {/* Left section: Toggle & Business Info */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hidden lg:flex items-center justify-center transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Business Name Badge */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 bg-orange-500 rounded-full hidden sm:block"></div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
              <span>{settings.profile.businessName}</span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:inline-block">
                Mohammadpur Godown
              </span>
            </div>
            <div className="text-[11px] text-slate-500 hidden md:block">
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
            <span className="text-slate-400">Search invoice, customer, cylinder...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right section: Date, Quick Actions, Notifications, User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Current Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span>14 Sep 2026</span>
          <span className="text-slate-400 font-normal">| Dhaka Time</span>
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showQuickActions && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowQuickActions(false)} />
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Transaction Shortcuts
                </div>
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
                <button
                  onClick={() => {
                    setActiveView('accounts_expenses');
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-900 font-medium"
                >
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Add Daily Godown Expense</span>
                </button>
                <button
                  onClick={() => {
                    setIsReceiveEmptyModalOpen(true);
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-900 font-medium"
                >
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Receive Empty Cylinder</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdjustStockModalOpen(true);
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium border-t border-slate-100"
                >
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <span>Physical Stock Adjustment</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-30 overflow-hidden text-xs">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Bell className="w-3.5 h-3.5 text-orange-400" />
                    <span>Business Alerts & Notices</span>
                  </div>
                  <span className="text-[10px] bg-orange-500/30 text-orange-300 font-bold px-1.5 py-0.5 rounded">
                    {unreadCount} New
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 flex items-start gap-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
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

        {/* User Profile & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-orange-400 flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser?.name.split(' ')[0] || 'Admin'}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {currentUser?.role || 'Admin'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 inline-flex items-center px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-semibold text-[10px]">
                    Role: {currentUser?.role.toUpperCase()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Godown Settings
                </button>
                <button
                  onClick={() => {
                    setActiveView('users_roles');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Manage Users & Roles
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch User</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
