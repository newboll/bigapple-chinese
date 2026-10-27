import { useState, useMemo } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { getRoles, saveRoles } from '../admin-data';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import { Checkbox } from '@client/src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@client/src/components/ui/alert-dialog';
import type { AdminRole, PermissionResource, PermissionAction } from '@shared/api.interface';

const RESOURCES: PermissionResource[] = ['dashboard', 'books', 'orders', 'members', 'admins', 'roles', 'auditLogs', 'loginAudits'];
const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const resourceTranslationKeys: Record<PermissionResource, string> = {
  dashboard: 'admin.resourceDashboard',
  books: 'admin.resourceBooks',
  orders: 'admin.resourceOrders',
  members: 'admin.resourceMembers',
  admins: 'admin.resourceAdmins',
  roles: 'admin.resourceRoles',
  auditLogs: 'admin.resourceAuditLogs',
  loginAudits: 'admin.resourceLoginAudits',
};

const actionLabels: Record<PermissionAction, string> = {
  view: 'admin.view',
  create: 'admin.create',
  edit: 'admin.edit',
  delete: 'admin.deleteAction',
};

export default function AdminRolesPage() {
  const { hasPermission, refresh } = useAdmin();
  const { t, language } = useTranslation();
  const [roles, setRoles] = useState<AdminRole[]>(() => getRoles());
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<AdminRole[]>(() => getRoles());
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);

  const canCreate = hasPermission('roles', 'create');
  const canEdit = hasPermission('roles', 'edit');
  const canDelete = hasPermission('roles', 'delete');

  const hasAction = (role: AdminRole, resource: PermissionResource, action: PermissionAction): boolean => {
    const perm = role.permissions.find((p) => p.resource === resource);
    return perm?.actions.includes(action) ?? false;
  };

  const togglePermission = (roleId: string, resource: PermissionResource, action: PermissionAction) => {
    if (!canEdit) return;
    setEditingRoleId(roleId);
    setPendingRoles((prev) =>
      prev.map((role) => {
        if (role.id !== roleId) return role;
        const existing = role.permissions.find((p) => p.resource === resource);
        let newPerms;
        if (existing) {
          const hasIt = existing.actions.includes(action);
          if (hasIt) {
            const newActions = existing.actions.filter((a) => a !== action);
            if (newActions.length === 0) {
              newPerms = role.permissions.filter((p) => p.resource !== resource);
            } else {
              newPerms = role.permissions.map((p) =>
                p.resource === resource ? { ...p, actions: newActions } : p,
              );
            }
          } else {
            newPerms = role.permissions.map((p) =>
              p.resource === resource ? { ...p, actions: [...p.actions, action] } : p,
            );
          }
        } else {
          newPerms = [...role.permissions, { resource, actions: [action] }];
        }
        return { ...role, permissions: newPerms };
      }),
    );
  };

  const handleSave = (roleId: string) => {
    const role = pendingRoles.find((r) => r.id === roleId);
    if (!role) return;
    setRoles(pendingRoles);
    saveRoles(pendingRoles);
    setEditingRoleId(null);
    refresh();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newRole: AdminRole = {
      id: `role-${Date.now()}`,
      name: newName.trim(),
      nameEn: newNameEn.trim() || newName.trim(),
      description: newDesc.trim(),
      descriptionEn: newDescEn.trim() || newDesc.trim(),
      permissions: [],
    };
    const updated = [...pendingRoles, newRole];
    setRoles(updated);
    setPendingRoles(updated);
    saveRoles(updated);
    setNewDialogOpen(false);
    setNewName('');
    setNewNameEn('');
    setNewDesc('');
    setNewDescEn('');
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updated = pendingRoles.filter((r) => r.id !== deleteTarget.id);
    setRoles(updated);
    setPendingRoles(updated);
    saveRoles(updated);
    setDeleteTarget(null);
    refresh();
  };

  if (!hasPermission('roles', 'view')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('admin.noPermission')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.roles')}</h1>
        {canCreate && (
          <Button onClick={() => setNewDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('admin.addRole')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {pendingRoles.map((role) => {
          const isEditing = editingRoleId === role.id;
          const isSuperAdmin = role.id === 'super-admin';
          const displayName = language === 'zh' ? role.name : role.nameEn;
          return (
            <div
              key={role.id}
              className="bg-white rounded-lg border border-border shadow-sm p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground">
                      {displayName}
                    </h3>
                    {isSuperAdmin && (
                      <Badge className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {t('admin.systemRole')}
                      </Badge>
                    )}
                    {isEditing && (
                      <Badge className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                        {t('admin.unsaved')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'zh' ? role.description : role.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Permission table */}
              <div className="mt-2 border border-border rounded-md overflow-hidden">
                <div className="grid grid-cols-5 gap-1 px-3 py-2 bg-muted/30 border-b border-border text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  <div>{t('admin.rolePermissions')}</div>
                  {ACTIONS.map((action) => (
                    <div key={action} className="text-center">
                      {t(actionLabels[action])}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-border">
                  {RESOURCES.map((resource) => (
                    <div
                      key={resource}
                      className="grid grid-cols-5 gap-1 px-3 py-2 items-center hover:bg-muted/10"
                    >
                      <div className="text-sm font-medium text-foreground">
                        {t(resourceTranslationKeys[resource])}
                      </div>
                      {ACTIONS.map((action) => (
                        <div key={action} className="flex justify-center">
                          <Checkbox
                            checked={hasAction(role, resource, action)}
                            disabled={!canEdit || isSuperAdmin}
                            onCheckedChange={() => togglePermission(role.id, resource, action)}
                            aria-label={`${resource} ${action}`}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {(canEdit || canDelete) && (
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
                  {canEdit && !isSuperAdmin && isEditing && (
                    <Button size="sm" onClick={() => handleSave(role.id)}>
                      <Save className="w-4 h-4" />
                      {t('admin.save')}
                    </Button>
                  )}
                  <div className="flex-1" />
                  {canDelete && !isSuperAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(role)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('admin.delete')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-lg shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            {t('admin.confirmDelete')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.deleteRoleConfirm', { name: displayName })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                            {t('admin.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            {t('admin.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New role dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {t('admin.addRole')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('admin.roleNameZh')}
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('admin.roleNamePlaceholderZh')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('admin.roleNameEn')}
              </label>
              <Input
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder={t('admin.roleNamePlaceholderEn')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('admin.roleDescZh')}
              </label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('admin.roleDescPlaceholderZh')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('admin.roleDescEn')}
              </label>
              <Input
                value={newDescEn}
                onChange={(e) => setNewDescEn(e.target.value)}
                placeholder={t('admin.roleDescPlaceholderEn')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              {t('admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
