import React from 'react';
import { ShieldAlert, ArrowLeft, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRoleConfig } from '../../utils/rbac';
import { UserRole } from '../../types';

interface RestrictedViewProps {
  viewName?: string;
  requiredRoles?: UserRole[];
}

export const RestrictedView: React.FC<RestrictedViewProps> = ({
  viewName = 'This Module',
  requiredRoles = ['admin']
}) => {
  const { currentUser, setActiveView, users, setCurrentUser } = useApp();
  const currentRole = currentUser?.role || 'admin';
  const roleConfig = getRoleConfig(currentRole);

  const availableAdminOrManager = users.find(u => u.role === 'admin') || users[0];

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
        Access Restricted (RBAC Policy)
      </span>

      <h2 className="text-xl font-black text-slate-900 mb-2">
        Permission Required for {viewName.replace(/_/g, ' ').toUpperCase()}
      </h2>

      <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto">
        Your current account is logged in as <strong className="text-slate-900 font-semibold">{currentUser?.name}</strong> with role{' '}
        <span className="font-bold text-orange-600">{roleConfig.title}</span>. This role does not have authorization to view or manipulate this module.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left text-xs">
        <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Authorized Roles for this feature:</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {requiredRoles.map(r => (
            <span key={r} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[11px] capitalize">
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveView('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        {currentUser?.role !== 'admin' && (
          <button
            onClick={() => {
              if (availableAdminOrManager) {
                setCurrentUser(availableAdminOrManager);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Switch to Admin for Testing</span>
          </button>
        )}
      </div>
    </div>
  );
};
