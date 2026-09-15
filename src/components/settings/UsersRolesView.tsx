import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  ShieldAlert, 
  Plus, 
  Check, 
  X, 
  Lock, 
  RefreshCw, 
  Eye, 
  Sliders, 
  Wallet, 
  Boxes, 
  Flame, 
  FileText,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { ROLE_CONFIGURATIONS, ActionPermission } from '../../types/rbac';
import { getRoleConfig, getRoleDisplayName } from '../../utils/rbac';

export const UsersRolesView: React.FC = () => {
  const { users, currentUser, setCurrentUser, setUsers } = useApp();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('sales');

  const handleRoleSwitch = (selectedUser: User) => {
    setCurrentUser(selectedUser);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase() || email.split('@')[0],
      phone: phone.trim() || '01700-000000',
      role: role,
      status: 'active',
      lastLogin: 'Just now',
    };

    setUsers([...users, newUser]);
    setIsAddUserModalOpen(false);
    setName('');
    setEmail('');
    setUsername('');
    setPhone('');
    setRole('sales');
  };

  const permissionsList: { action: ActionPermission; label: string; category: string }[] = [
    { action: 'create_sale', label: 'Create POS Sales & Orders', category: 'Sales' },
    { action: 'cancel_sale', label: 'Cancel & Void Invoices', category: 'Sales' },
    { action: 'view_cost_price', label: 'View Cylinder Purchase Costs', category: 'Financials' },
    { action: 'view_profit_margin', label: 'View Gross Margins & Profit/Loss', category: 'Financials' },
    { action: 'receive_payment', label: 'Issue Money Receipts / Receive Dues', category: 'Financials' },
    { action: 'make_supplier_payment', label: 'Pay Depot Suppliers', category: 'Financials' },
    { action: 'record_expense', label: 'Record Godown Expenses', category: 'Financials' },
    { action: 'create_purchase', label: 'Record Refinery Deliveries / Purchases', category: 'Inventory' },
    { action: 'adjust_stock', label: 'Manual Cylinder Stock Reconciliation', category: 'Inventory' },
    { action: 'receive_empty', label: 'Receive Customer Empty Cylinders', category: 'Inventory' },
    { action: 'record_damage', label: 'Log Damaged / Defective Cylinders', category: 'Inventory' },
    { action: 'manage_users', label: 'Manage User Accounts & Roles', category: 'Administration' },
    { action: 'manage_settings', label: 'Configure Trade License & BERC Rates', category: 'Administration' },
    { action: 'view_audit_logs', label: 'Inspect Security Audit Logs', category: 'Administration' },
    { action: 'sync_database', label: 'Sync / Configure Supabase Database', category: 'Administration' },
  ];

  const rolesOrder: UserRole[] = ['admin', 'manager', 'accountant', 'sales', 'storekeeper', 'delivery'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Role-Based Access Control (RBAC)</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 rounded border border-orange-200">
              Active Security Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforce strict role separation across cashiers, storekeepers, accountants, managers, and system administrators.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Role Simulator / Live Switcher Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xs border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Interactive Role Simulator (Test RBAC Live)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Currently logged in: <strong className="text-orange-400 font-bold">{currentUser?.name}</strong> ({getRoleDisplayName(currentUser?.role)})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {rolesOrder.map(r => {
            const roleUser = users.find(u => u.role === r) || {
              id: `mock-${r}`,
              name: `${r.toUpperCase()} User`,
              email: `${r}@demo.com`,
              username: r,
              phone: '01700-000000',
              role: r,
              status: 'active' as const,
              lastLogin: 'Today',
            };
            const isActive = currentUser?.role === r;
            const config = ROLE_CONFIGURATIONS[r];

            return (
              <button
                key={r}
                onClick={() => handleRoleSwitch(roleUser)}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  isActive 
                    ? 'bg-orange-600/30 border-orange-500 text-white ring-2 ring-orange-500/40' 
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <div className="text-[11px] font-bold truncate">{config.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{config.banglaTitle}</div>
                <div className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/60 inline-block">
                  {roleUser.name.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Configured Users & Accounts</h2>
            <p className="text-xs text-slate-500">Authorized personnel registered in the local and Supabase databases</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{users.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">User Details</th>
                <th className="px-3 py-2.5">Username / Email</th>
                <th className="px-3 py-2.5">Assigned Role</th>
                <th className="px-3 py-2.5">Contact Phone</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Switch Active Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const config = getRoleConfig(u.role);
                const isSelected = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/80 ${isSelected ? 'bg-orange-50/40 font-semibold' : ''}`}>
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-slate-400">@{u.username}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${config.badgeColor.bg} ${config.badgeColor.text} ${config.badgeColor.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.badgeColor.dot}`} />
                        <span>{config.title}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{u.phone}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => handleRoleSwitch(u)}
                        disabled={isSelected}
                        className={`px-2.5 py-1 text-xs rounded font-bold transition-colors ${
                          isSelected 
                            ? 'bg-slate-100 text-slate-400 cursor-default' 
                            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-2xs'
                        }`}
                      >
                        {isSelected ? 'Current User' : 'Login As User'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900">Role Permissions Matrix</h2>
          <p className="text-xs text-slate-500">Comprehensive breakdown of actions permitted or prohibited per role</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 min-w-[220px]">System Capability / Action</th>
                {rolesOrder.map(r => (
                  <th key={r} className="px-3 py-2.5 text-center font-bold capitalize border-l border-slate-200">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2 font-medium text-slate-800">
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block">{item.category}</span>
                  </td>
                  {rolesOrder.map(r => {
                    const isAllowed = r === 'admin' || ROLE_CONFIGURATIONS[r].allowedActions.includes(item.action);
                    return (
                      <td key={r} className="px-3 py-2 text-center border-l border-slate-100">
                        {isAllowed ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-400">
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New System User</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@demo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="mahfuz"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="01711-XXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-medium bg-slate-50"
                >
                  <option value="sales">Sales Representative / Cashier</option>
                  <option value="storekeeper">Godown Storekeeper</option>
                  <option value="accountant">Financial Accountant</option>
                  <option value="manager">Operations Manager</option>
                  <option value="delivery">Delivery Driver / Logistics</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 rounded text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-white bg-orange-600 hover:bg-orange-700 font-bold shadow-2xs"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
