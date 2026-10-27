import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
import * as loginAudit from '@client/src/api/login-audit';
import type { LoginAudit } from '@shared/api.interface';

const PAGE_SIZE = 20;

export default function AdminLoginAuditsPage() {
  const { hasPermission } = useAdmin();
  const { t, language } = useTranslation();

  const [accountType, setAccountType] = useState('');
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [items, setItems] = useState<LoginAudit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await loginAudit.getAdminLoginAudits({
        page: currentPage,
        pageSize: PAGE_SIZE,
        accountType: (accountType as 'admin' | 'member') || undefined,
        accountIdentifier: accountIdentifier || undefined,
        success: status === '' ? undefined : status === 'success',
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
  }, [accountType, accountIdentifier, status, startDate, endDate]);

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

  const getStatusBadgeClass = (success: boolean): string =>
    success
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      : 'bg-rose-50 text-rose-700 border border-rose-100';

  const getStatusLabel = (success: boolean): string =>
    success ? t('admin.success') : t('admin.failed');

  if (!hasPermission('loginAudits', 'view')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('admin.noPermission')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.loginAudits')}</h1>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.accountType')}</label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('admin.all')}</SelectItem>
                  <SelectItem value="admin">{t('admin.accountAdmin')}</SelectItem>
                  <SelectItem value="member">{t('admin.accountMember')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.account')}</label>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                  className="pl-9"
                  placeholder={t('admin.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t('admin.status')}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('admin.all')}</SelectItem>
                  <SelectItem value="success">{t('admin.success')}</SelectItem>
                  <SelectItem value="failure">{t('admin.failed')}</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="col-span-2">{t('admin.loginTime')}</div>
          <div className="col-span-1">{t('admin.accountType')}</div>
          <div className="col-span-2">{t('admin.account')}</div>
          <div className="col-span-1">{t('admin.status')}</div>
          <div className="col-span-2">{t('admin.failureReason')}</div>
          <div className="col-span-2">{t('admin.ipAddress')}</div>
          <div className="col-span-2">{t('admin.device')}</div>
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
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors"
              >
                <div className="col-span-2 text-xs text-muted-foreground">
                  {formatTime(log.createdAt)}
                </div>
                <div className="col-span-1 text-sm">
                  <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                    {log.accountType === 'admin' ? t('admin.accountAdmin') : t('admin.accountMember')}
                  </Badge>
                </div>
                <div className="col-span-2 font-medium text-foreground truncate">
                  {log.accountIdentifier}
                </div>
                <div className="col-span-1">
                  <Badge className={getStatusBadgeClass(log.success)}>
                    {getStatusLabel(log.success)}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground truncate">
                  {log.failureReason || '-'}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground font-mono truncate">
                  {log.ipAddress || '-'}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground truncate">
                  {log.deviceInfo || '-'}
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
    </div>
  );
}
