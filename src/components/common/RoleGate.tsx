import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActionPermission } from '../../types/rbac';
import { canPerform } from '../../utils/rbac';
import { UserRole } from '../../types';

interface RoleGateProps {
  action?: ActionPermission;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  action,
  allowedRoles,
  fallback = null,
  children
}) => {
  const { currentUser } = useApp();
  const role = currentUser?.role || 'admin';

  if (role === 'admin') {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (allowedRoles.includes(role)) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  if (action && !canPerform(role, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
