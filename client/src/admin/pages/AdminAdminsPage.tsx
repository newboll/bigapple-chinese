import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { getAdmins, saveAdmins, getRoles } from '../admin-data';
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
import type { AdminUser, AdminRole } from '@shared/api.interface';

export default function AdminAdminsPage() {
  const { hasPermission, refresh } = useAdmin();
  const { t, language } = useTranslation();
  const [admins, setAdmins] = useState<AdminUser[]>(() => getAdmins());
  const [roles, setRoles] = useState<AdminRole[]>(() => getRoles());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoleIds, setFormRoleIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const canCreate = hasPermission('admins', 'create');
  const canEdit = hasPermission('admins', 'edit');
  const canDelete = hasPermission('admins', 'delete');

  const roleMap = useMemo(() => {
    const m: Record<string, AdminRole> = {};
    for (const r of roles) m[r.id] = r;
    return m;
  }, [roles]);

  const openCreate = () => {
    setEditing(null);
    setFormUsername('');
    setFormName('');
    setFormRoleIds([]);
    setDialogOpen(true);
  };

  const openEdit = (admin: AdminUser) => {
    setEditing(admin);
    setFormUsername(admin.username);
    setFormName(admin.name);
    setFormRoleIds([...admin.roleIds]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formUsername.trim() || !formName.trim()) return;

    if (editing) {
      const updated = admins.map((a) =>
        a.id === editing.id
          ? { ...a, username: formUsername.trim(), name: formName.trim(), roleIds: formRoleIds }
          : a,
      );
      setAdmins(updated);
      saveAdmins(updated);
    } else {
      const newAdmin: AdminUser = {
        id: `admin-${Date.now()}`,
        username: formUsername.trim(),
        name: formName.trim(),
        roleIds: formRoleIds,
        createdAt: new Date().toISOString(),
      };
      const updated = [...admins, newAdmin];
      setAdmins(updated);
      saveAdmins(updated);
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updated = admins.filter((a) => a.id !== deleteTarget.id);
    setAdmins(updated);
    saveAdmins(updated);
    setDeleteTarget(null);
    refresh();
  };

  const toggleRole = (roleId: string) => {
    setFormRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  if (!hasPermission('admins', 'view')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('admin.noPermission')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.admins')}</h1>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t('admin.addAdmin')}
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium text-muted-foreground border-b border-border bg-muted/30">
          <div className="col-span-2">{t('admin.adminAccount')}</div>
          <div className="col-span-2">{t('admin.adminName')}</div>
          <div className="col-span-4">{t('admin.adminRoles')}</div>
          <div className="col-span-2">{t('admin.createdAt')}</div>
          {(canEdit || canDelete) && (
            <div className="col-span-2 text-right">{t('admin.actions')}</div>
          )}
        </div>

        {admins.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t('admin.noData')}</div>
        ) : (
          <div className="divide-y divide-border">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors"
              >
                <div className="col-span-2 font-mono text-sm text-foreground">
                  {admin.username}
                  {admin.isSuperAdmin && (
                    <Badge className="ml-2 text-[10px] bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                      {t('admin.superAdmin')}
                    </Badge>
                  )}
                </div>
                <div className="col-span-2 font-medium text-foreground">{admin.name}</div>
                <div className="col-span-4 flex flex-wrap gap-1">
                  {admin.roleIds.map((rid) => {
                    const role = roleMap[rid];
                    return (
                      <Badge key={rid} className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                        {language === 'zh' ? role?.name : role?.nameEn}
                      </Badge>
                    );
                  })}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(admin.createdAt).toLocaleDateString(
                    language === 'zh' ? 'zh-CN' : 'en-US',
                  )}
                </div>
                {(canEdit || canDelete) && (
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('admin.edit')}
                        onClick={() => openEdit(admin)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && !admin.isSuperAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={t('admin.deleteAction')}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(admin)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-lg shadow-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">
                              {t('admin.confirmDelete')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('admin.deleteAdminConfirm', { name: admin.name })}
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
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {editing ? t('admin.editAdmin') : t('admin.addAdmin')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('admin.username')}
              </label>
              <Input
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder={t('admin.enterUsername')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('admin.adminName')}</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('admin.enterName')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('admin.adminRoles')}</label>
              <div className="border border-border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto bg-muted/10">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 py-1.5 cursor-pointer rounded-md hover:bg-muted/30 px-2 -mx-2"
                    onClick={() => toggleRole(role.id)}
                  >
                    <Checkbox checked={formRoleIds.includes(role.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {language === 'zh' ? role.name : role.nameEn}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {language === 'zh' ? role.description : role.descriptionEn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!formUsername.trim() || !formName.trim()}>
              {t('admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
