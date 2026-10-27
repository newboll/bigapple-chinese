import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AdminUser, PermissionResource, PermissionAction } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { loginAudit } from '@client/src/api';
import {
  getCurrentAdmin,
  adminLogin as doLogin,
  adminLogout as doLogout,
  getAdminPermissions,
  hasPermission as checkPerm,
  getAdmins,
  getAdminById,
  ensureMockMembersAndOrders,
} from './admin-data';

interface AdminContextValue {
  admin: AdminUser | null;
  permissions: Record<PermissionResource, PermissionAction[]>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: PermissionResource, action?: PermissionAction) => boolean;
  refresh: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => getCurrentAdmin());
  const [permissions, setPermissions] = useState<Record<PermissionResource, PermissionAction[]>>(
    {} as Record<PermissionResource, PermissionAction[]>,
  );

  useEffect(() => {
    if (admin) {
      setPermissions(getAdminPermissions(admin));
    } else {
      setPermissions({} as Record<PermissionResource, PermissionAction[]>);
    }
  }, [admin]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = doLogin(username, password);
    try {
      await loginAudit.createLoginAudit({
        accountType: 'admin',
        accountIdentifier: username,
        userId: result?.id,
        success: !!result,
        failureReason: result ? undefined : 'invalid_credentials',
        deviceInfo: navigator.userAgent.slice(0, 500),
      });
    } catch (e) {
      logger.error('上报管理员登录审计失败', e);
    }
    if (result) {
      ensureMockMembersAndOrders();
      setAdmin(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setAdmin(null);
  }, []);

  const hasPermission = useCallback(
    (resource: PermissionResource, action: PermissionAction = 'view'): boolean => {
      return checkPerm(permissions, resource, action);
    },
    [permissions],
  );

  const refresh = useCallback(() => {
    if (admin) {
      const fresh = getAdminById(admin.id);
      if (fresh) {
        setAdmin(fresh);
      } else {
        setAdmin(null);
      }
    }
  }, [admin]);

  return (
    <AdminContext.Provider
      value={{ admin, permissions, login, logout, hasPermission, refresh }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

export { getAdmins };
