import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, Clock } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { allBooks } from '@client/src/data/books';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';
import { formatDuration, formatDurationEn } from '@client/src/utils/reading-stats';
import { readingProgress } from '@client/src/api';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { User, Order, Book, MemberReadingDetailResponse } from '@shared/api.interface';
import type { ReadingStatsData } from '@client/src/utils/reading-stats';

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem('bigapple-users');
    if (raw) return JSON.parse(raw) as User[];
  } catch {
    // ignore
  }
  return [];
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem('bigapple-app-state');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.orders || [];
    }
  } catch {
    // ignore
  }
  return [];
}

function loadReadingStats(): ReadingStatsData {
  try {
    const raw = localStorage.getItem('bigapple-reading-stats');
    if (raw) return JSON.parse(raw) as ReadingStatsData;
  } catch {
    // ignore
  }
  return {};
}

function getUserTotalSeconds(userId: string, stats: ReadingStatsData): number {
  const userStats = stats[userId] || {};
  return Object.values(userStats).reduce((sum, s) => sum + (s.totalSeconds || 0), 0);
}

const STATUS_BADGE_CLASS: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-100',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const STATUS_KEY: Record<Order['status'], string> = {
  pending: 'admin.statusPending',
  paid: 'admin.statusPaid',
  completed: 'admin.statusCompleted',
  cancelled: 'admin.statusCancelled',
};

export default function AdminMembersPage() {
  const { hasPermission } = useAdmin();
  const { t, language } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [readingDetail, setReadingDetail] = useState<MemberReadingDetailResponse | null>(null);
  const [readingDetailLoading, setReadingDetailLoading] = useState(false);
  const [readingDetailError, setReadingDetailError] = useState(false);

  const users = useMemo(() => loadUsers(), [selectedUser]);
  const orders = useMemo(() => loadOrders(), [selectedUser]);
  const readingStats = useMemo(() => loadReadingStats(), [selectedUser]);
  const bookMap = useMemo(() => {
    const m: Record<string, Book> = {};
    for (const b of allBooks) m[b.id] = b;
    return m;
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const userOrders = useMemo(() => {
    if (!selectedUser) return [];
    return orders.filter((o) => o.items.some((it) => {
      // orders are linked to current user in mock; for admin view, match by user email fallback
      // Since mock orders don't store userId, we show all as demo
      return true;
    }));
  }, [selectedUser, orders]);

  const purchasedBooks = useMemo(() => {
    if (!selectedUser) return [];
    return selectedUser.purchasedBookIds
      .map((id) => bookMap[id])
      .filter((b): b is Book => !!b);
  }, [selectedUser, bookMap]);

  const levelColors: Record<number, string> = {
    0: 'from-pink-400 to-pink-600',
    1: 'from-rose-400 to-rose-600',
    2: 'from-amber-400 to-orange-500',
    3: 'from-emerald-400 to-teal-600',
    4: 'from-sky-400 to-blue-600',
    5: 'from-violet-400 to-purple-600',
    6: 'from-slate-500 to-slate-800',
  };

  useEffect(() => {
    if (!selectedUser) {
      setReadingDetail(null);
      setReadingDetailLoading(false);
      setReadingDetailError(false);
      return;
    }
    setReadingDetailLoading(true);
    setReadingDetailError(false);
    readingProgress.getMemberReadingDetail(selectedUser.id)
      .then((data) => {
        setReadingDetail(data);
      })
      .catch((error) => {
        logger.error('获取会员阅读详情失败', error);
        setReadingDetailError(true);
        setReadingDetail(null);
      })
      .finally(() => {
        setReadingDetailLoading(false);
      });
  }, [selectedUser]);

  const formatTime = (seconds: number): string =>
    language === 'zh' ? formatDuration(seconds) : formatDurationEn(seconds);

  if (!hasPermission('members', 'view')) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('admin.noPermission')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.members')}</h1>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium text-muted-foreground bg-muted/30 border-b border-border">
          <div className="col-span-2">{t('admin.memberName')}</div>
          <div className="col-span-3">{t('admin.memberEmail')}</div>
          <div className="col-span-2 text-center">{t('admin.memberBooks')}</div>
          <div className="col-span-2 text-center">{t('admin.memberReadingTime')}</div>
          <div className="col-span-2">{t('admin.joinedAt')}</div>
          <div className="col-span-1 text-right">{t('admin.actions')}</div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t('admin.noData')}</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="col-span-2 font-medium text-foreground truncate">
                  {user.name}
                </div>
                <div className="col-span-3 text-sm text-muted-foreground truncate">{user.email}</div>
                <div className="col-span-2 text-center text-sm tabular-nums text-foreground">
                  {user.purchasedBookIds.length}
                </div>
                <div className="col-span-2 text-center text-sm tabular-nums text-foreground">
                  {formatTime(getUserTotalSeconds(user.id, readingStats))}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString(
                    language === 'zh' ? 'zh-CN' : 'en-US',
                  )}
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('admin.details')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {t('admin.memberDetails')}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5">
              {/* Basic info */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {t('admin.basicInfo')}
                </h3>
                <div className="bg-muted/20 rounded-md p-4 grid grid-cols-2 gap-3 text-sm border border-border">
                  <div>
                    <div className="text-muted-foreground text-xs">{t('admin.memberName')}</div>
                    <div className="font-medium text-foreground">{selectedUser.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">{t('admin.memberEmail')}</div>
                    <div className="font-medium text-foreground">{selectedUser.email}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground text-xs">{t('admin.joinedAt')}</div>
                    <div className="font-medium text-foreground">
                      {new Date(selectedUser.createdAt).toLocaleString(
                        language === 'zh' ? 'zh-CN' : 'en-US',
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased books */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {t('admin.memberBooks')} ({purchasedBooks.length})
                </h3>
                {purchasedBooks.length === 0 ? (
                  <div className="bg-muted/20 rounded-md p-6 text-sm text-muted-foreground text-center border border-border">
                    {t('admin.noData')}
                  </div>
                ) : (
                  <div className="bg-muted/20 rounded-md divide-y divide-border border border-border">
                    {purchasedBooks.map((book) => (
                      <div key={book.id} className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">
                            {book.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {book.levelName}
                          </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-normal">S${book.price.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading time */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                  <span>{t('admin.readingDetail')}</span>
                  {readingDetail && (
                    <span className="text-xs font-normal text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      {formatTime(readingDetail.totalSeconds)}
                    </span>
                  )}
                </h3>
                {readingDetailLoading ? (
                  <div className="bg-muted/20 rounded-md p-6 text-sm text-muted-foreground text-center border border-border">
                    {t('admin.loading')}
                  </div>
                ) : readingDetailError ? (
                  <div className="bg-muted/20 rounded-md p-6 text-sm text-muted-foreground text-center border border-border">
                    {t('admin.noData')}
                  </div>
                ) : !readingDetail || readingDetail.items.length === 0 ? (
                  <div className="bg-muted/20 rounded-md p-6 text-sm text-muted-foreground text-center border border-border">
                    {t('admin.noData')}
                  </div>
                ) : (
                  <div className="bg-muted/20 rounded-md divide-y divide-border border border-border">
                    {readingDetail.items.map((item) => {
                      const book = bookMap[item.bookId];
                      const coverColor = book?.coverColor || 'from-slate-400 to-slate-600';
                      return (
                        <div key={item.bookId} className="p-3 flex items-center gap-3">
                          <div className={`w-10 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br ${coverColor} flex items-center justify-center shadow-sm`}>
                            {book?.coverImage ? (
                              <Image
                                src={getBookImageUrl(book.coverImage)}
                                alt={item.bookTitle || book.title}
                                className="w-full h-full object-cover"
                                width={40}
                                height={56}
                              />
                            ) : (
                              <span className="text-white font-bold text-[10px] px-0.5 text-center leading-tight">
                                {item.bookTitle || book?.title || item.bookId}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm truncate">
                              {item.bookTitle || book?.title || item.bookId}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t('admin.lastReadAt')}:&nbsp;
                              {new Date(item.lastReadAt).toLocaleDateString(
                                language === 'zh' ? 'zh-CN' : 'en-US',
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-emerald-700 font-medium tabular-nums">
                            {formatTime(item.totalSeconds)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Orders */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {t('admin.orderRecords')} ({userOrders.length})
                </h3>
                {userOrders.length === 0 ? (
                  <div className="bg-muted/20 rounded-md p-6 text-sm text-muted-foreground text-center border border-border">
                    {t('admin.noData')}
                  </div>
                ) : (
                  <div className="bg-muted/20 rounded-md divide-y divide-border border border-border">
                    {userOrders.map((order) => (
                      <div key={order.id} className="p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm font-mono truncate">
                            #{order.id}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.createdAt).toLocaleString(
                              language === 'zh' ? 'zh-CN' : 'en-US',
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-foreground font-medium tabular-nums">
                          S${order.total.toFixed(2)}
                        </div>
                        <Badge className={STATUS_BADGE_CLASS[order.status]}>
                          {t(STATUS_KEY[order.status])}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
