import { useState, useEffect } from 'react';
import { useApp } from '@client/src/store/AppContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { loginAudit } from '@client/src/api';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@client/src/components/ui/table';
import { Badge } from '@client/src/components/ui/badge';
import { Button } from '@client/src/components/ui/button';
import { ArrowLeft, Clock, Monitor, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LoginAudit } from '@shared/api.interface';

function formatDateTime(dateStr: string, language: 'zh' | 'en'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  if (language === 'zh') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getFailureReasonText(reason: string | undefined, language: 'zh' | 'en'): string {
  if (!reason) return '';
  if (language === 'zh') {
    const map: Record<string, string> = {
      invalid_credentials: '账号或密码错误',
      wrong_password: '密码错误',
      account_not_found: '账号不存在',
      account_locked: '账号已锁定',
    };
    return map[reason] || reason;
  }
  const map: Record<string, string> = {
    invalid_credentials: 'Invalid credentials',
    wrong_password: 'Wrong password',
    account_not_found: 'Account not found',
    account_locked: 'Account locked',
  };
  return map[reason] || reason;
}

export default function LoginHistoryPage() {
  const { t, language } = useTranslation();
  const { user } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<LoginAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      try {
        const data = await loginAudit.getMyLoginAudits(user.id);
        if (!cancelled) {
          setItems(data);
          setTotal(data.length);
        }
      } catch (e) {
        logger.error('加载登录记录失败', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user, page]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'zh' ? '请先登录以查看登录记录' : 'Please log in to view login history'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
       <div className="flex items-center gap-3 mb-6">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={language === 'zh' ? '返回' : 'Back'}>
           <ArrowLeft className="w-5 h-5" />
         </Button>
         <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t('account.loginHistory')}</h1>
       </div>

       <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === 'zh' ? '暂无登录记录' : 'No login records yet'}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'zh' ? '时间' : 'Time'}</TableHead>
                  <TableHead>{language === 'zh' ? '状态' : 'Status'}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {language === 'zh' ? 'IP 地址' : 'IP Address'}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {language === 'zh' ? '设备' : 'Device'}
                  </TableHead>
                  <TableHead>{language === 'zh' ? '失败原因' : 'Failure Reason'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {formatDateTime(item.createdAt, language)}
                    </TableCell>
                    <TableCell>
                      {item.success ? (
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-50">
                           <CheckCircle2 className="w-3 h-3 mr-1" />
                           {language === 'zh' ? '成功' : 'Success'}
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200/50 hover:bg-red-50">
                           <XCircle className="w-3 h-3 mr-1" />
                           {language === 'zh' ? '失败' : 'Failed'}
                         </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {item.ipAddress || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 max-w-xs truncate">
                        <Monitor className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate" title={item.deviceInfo || ''}>
                          {item.deviceInfo || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {item.failureReason
                        ? getFailureReasonText(item.failureReason, language)
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {total > pageSize && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {language === 'zh'
                    ? `共 ${total} 条记录`
                    : `${total} records total`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {language === 'zh' ? '上一页' : 'Previous'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * pageSize >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {language === 'zh' ? '下一页' : 'Next'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
