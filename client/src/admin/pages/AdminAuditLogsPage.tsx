import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import * as audit from '@client/src/api/audit';
import type { AuditLog } from '@shared/api.interface';

const MODULE_OPTIONS: Array<'books' | 'orders' | 'members' | 'admins' | 'roles'> = ['books', 'orders', 'members', 'admins', 'roles'];
const PAGE_SIZE = 20;

const moduleTranslationKeys: Record<string, string> = {
  books: 'admin.resourceBooks',
  orders: 'admin.resourceOrders',
  members: 'admin.resourceMembers',
  admins: 'admin.resourceAdmins',
  roles: 'admin.resourceRoles',
};

export default function AdminAuditLogsPage() {
  const { hasPermission } = useAdmin();
  const { t, language } = useTranslation();

  const [adminUsername, setAdminUsername] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchData = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await audit.getAuditLogs({
        page: currentPage,
        pageSize: PAGE_SIZE,
        adminUsername: adminUsername || undefined,
        module: module || undefined,
        action: action || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch {
      // error handled by api layer logger
    } finally {
      setLoading(false);
    }
  }, [adminUsername, module, action, startDate, endDate]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleSearch = () => {
    fetchData(1);
  };

  const handlePrevPage = () => {
    if (page > 1) fetchData(page - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (page < totalPages) fetchData(page + 1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatTime = (dateStr: string): string =>
    new Date(dateStr).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');

  const formatJson = (value: Record<string, unknown> | undefined): string => {
    if (!value) return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  if (!hasPermission('auditLogs', 'view')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('admin.noPermission')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.auditLogs')}</h1>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.admin')}</label>
              <div className="relative w-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="pl-9"
                  placeholder={t('admin.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.module')}</label>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('admin.all')}</SelectItem>
                  {MODULE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(moduleTranslationKeys[m] || m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.actionLabel')}</label>
              <div className="relative w-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="pl-9"
                  placeholder={t('admin.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.startDate')}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.endDate')}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4" />
              {t('admin.search')}
            </Button>
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium text-muted-foreground border-b border-border bg-muted/30">
          <div className="col-span-2">{t('admin.time')}</div>
          <div className="col-span-2">{t('admin.admin')}</div>
          <div className="col-span-1">{t('admin.module')}</div>
          <div className="col-span-2">{t('admin.actionLabel')}</div>
          <div className="col-span-2">{t('admin.target')}</div>
          <div className="col-span-2">{t('admin.ipAddress')}</div>
          <div className="col-span-1 text-right">{t('admin.details')}</div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t('admin.loading')}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t('admin.noData')}</div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="col-span-2 text-xs text-muted-foreground">
                  {formatTime(log.createdAt)}
                </div>
                <div className="col-span-2 font-medium text-foreground truncate">
                  {log.adminUsername}
                </div>
                <div className="col-span-1 text-sm">
                  <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                    {t(moduleTranslationKeys[log.module] || log.module)}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground truncate">{log.action}</div>
                <div className="col-span-2 text-sm text-muted-foreground truncate">
                  {log.targetName || log.targetId || '-'}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground font-mono truncate">
                  {log.ipAddress || '-'}
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('admin.details')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <div className="text-sm text-muted-foreground tabular-nums">
            {t('admin.totalOfPage', { total, page, totalPages })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground font-medium min-w-[60px] text-center tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {t('admin.auditLogDetails')}
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-md border border-border">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.time')}</div>
                  <div className="font-medium text-foreground">
                    {formatTime(selectedLog.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.admin')}</div>
                  <div className="font-medium text-foreground">
                    {selectedLog.adminName
                      ? `${selectedLog.adminName} (${selectedLog.adminUsername})`
                      : selectedLog.adminUsername}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.module')}</div>
                  <div className="font-medium text-foreground">
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                      {t(moduleTranslationKeys[selectedLog.module] || selectedLog.module)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.actionLabel')}</div>
                  <div className="font-medium text-foreground">{selectedLog.action}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.target')}</div>
                  <div className="font-medium text-foreground">
                    {selectedLog.targetName || selectedLog.targetId || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">{t('admin.ipAddress')}</div>
                  <div className="font-medium text-foreground font-mono">
                    {selectedLog.ipAddress || '-'}
                  </div>
                </div>
              </div>

              {selectedLog.beforeValues && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1.5 font-medium">
                    {t('admin.beforeValues')}
                  </div>
                  <pre className="bg-muted/30 rounded-md p-3 text-xs font-mono overflow-x-auto text-foreground whitespace-pre-wrap break-all border border-border">
                    {formatJson(selectedLog.beforeValues)}
                  </pre>
                </div>
              )}

              {selectedLog.afterValues && (
                <div>
                  <div className="text-muted-foreground text-xs mb-1.5 font-medium">
                    {t('admin.afterValues')}
                  </div>
                  <pre className="bg-muted/30 rounded-md p-3 text-xs font-mono overflow-x-auto text-foreground whitespace-pre-wrap break-all border border-border">
                    {formatJson(selectedLog.afterValues)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
