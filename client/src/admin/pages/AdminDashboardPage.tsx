import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { useAdmin } from '@client/src/admin/AdminContext';
import { allBooks } from '@client/src/data/books';
import { readingProgress } from '@client/src/api';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { formatDuration, formatDurationEn } from '@client/src/utils/reading-stats';
import type { User, Order } from '@shared/api.interface';

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
}

function StatCard({ icon: Icon, iconColor, iconBg, value, label }: StatCardProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-foreground tabular-nums truncate">{value}</p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('bigapple-users') || '[]') as User[];
  } catch {
    return [];
  }
}

function getOrders(): Order[] {
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

function getStatusBadgeClass(status: Order['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'paid':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'cancelled':
      return 'bg-muted text-muted-foreground border-border';
  }
}

function getStatusKey(status: Order['status']): string {
  switch (status) {
    case 'pending': return 'admin.statusPending';
    case 'paid': return 'admin.statusPaid';
    case 'completed': return 'admin.statusCompleted';
    case 'cancelled': return 'admin.statusCancelled';
  }
}

function getUserNameFromOrder(order: Order, users: User[], guestLabel: string): string {
  const matchingUser = users.find((u) =>
    order.items.every((item) => u.purchasedBookIds.includes(item.bookId)),
  );
  return matchingUser?.name || (order as unknown as { customerName?: string }).customerName || guestLabel;
}

function formatDate(dateStr: string, language: 'en' | 'zh'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  if (language === 'zh') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminDashboardPage() {
  const { t, language } = useTranslation();
  const { admin } = useAdmin();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    members: 0,
    books: allBooks.length,
    readingSeconds: 0,
    activeReaders: 0,
    totalBooksRead: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentMembers, setRecentMembers] = useState<User[]>([]);

  useEffect(() => {
    const orders = getOrders();
    const users = getUsers();
    const revenue = orders
      .filter((o) => o.status === 'paid' || o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    setStats((prev) => ({
      ...prev,
      revenue,
      orders: orders.length,
      members: users.length,
      books: allBooks.length,
    }));

    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setRecentOrders(sortedOrders.slice(0, 5));

    const sortedUsers = [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setRecentMembers(sortedUsers.slice(0, 5));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadReadingStats() {
      try {
        const data = await readingProgress.getDashboardReadingStats();
        if (!cancelled) {
          setStats((prev) => ({
            ...prev,
            readingSeconds: data.totalSeconds,
            activeReaders: data.activeReaders,
            totalBooksRead: data.totalBooks,
          }));
        }
      } catch (e) {
        logger.error('加载看板阅读统计失败', e);
      }
    }
    loadReadingStats();
    return () => { cancelled = true; };
  }, []);

  const statCards: StatCardProps[] = [
    {
      icon: DollarSign,
      iconColor: 'text-rose-600',
      iconBg: 'bg-muted/50',
      value: `S$${stats.revenue.toFixed(2)}`,
      label: t('admin.totalRevenue'),
    },
    {
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      iconBg: 'bg-muted/50',
      value: String(stats.orders),
      label: t('admin.totalOrders'),
    },
    {
      icon: Users,
      iconColor: 'text-violet-600',
      iconBg: 'bg-muted/50',
      value: String(stats.members),
      label: t('admin.totalMembers'),
    },
    {
      icon: BookOpen,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-muted/50',
      value: String(stats.books),
      label: t('admin.totalBooks'),
    },
    {
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-muted/50',
      value: language === 'zh' ? formatDuration(stats.readingSeconds) : formatDurationEn(stats.readingSeconds),
      label: t('admin.totalReadingTime'),
    },
    {
      icon: Users,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-muted/50',
      value: String(stats.activeReaders),
      label: t('admin.activeReaders'),
    },
    {
      icon: BookOpen,
      iconColor: 'text-pink-600',
      iconBg: 'bg-muted/50',
      value: String(stats.totalBooksRead),
      label: t('admin.totalBooksRead'),
    },
  ];

  const users = getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t('admin.dashboard')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin.welcomeBack', { name: admin?.name || '' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Recent Orders & Recent Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">
              {t('admin.recentOrders')}
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noData')}</p>
            ) : (
              <div className="space-y-0">
                <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider font-medium text-muted-foreground px-2 pb-2 border-b border-border bg-muted/30 -mx-5 px-5">
                  <div className="col-span-4">{t('admin.orderId')}</div>
                  <div className="col-span-3">{t('admin.customer')}</div>
                  <div className="col-span-2">{t('admin.orderAmount')}</div>
                  <div className="col-span-2">{t('admin.orderStatus')}</div>
                  <div className="col-span-1 text-right">{t('admin.orderDate')}</div>
                </div>
                <div className="divide-y divide-border mt-2">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="grid grid-cols-12 gap-2 items-center text-sm px-2 py-2.5 hover:bg-muted/20 rounded-md">
                      <div className="col-span-4 font-medium text-foreground truncate">{order.id}</div>
                      <div className="col-span-3 text-muted-foreground truncate">{getUserNameFromOrder(order, users, t('admin.guest'))}</div>
                      <div className="col-span-2 text-foreground font-medium tabular-nums text-rose-600">S${order.total.toFixed(2)}</div>
                      <div className="col-span-2">
                        <Badge className={`${getStatusBadgeClass(order.status)} border-0`}>
                          {t(getStatusKey(order.status))}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-right text-xs text-muted-foreground">
                        {formatDate(order.createdAt, language)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">
              {t('admin.recentMembers')}
            </h3>
            {recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noData')}</p>
            ) : (
              <div className="space-y-0">
                <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider font-medium text-muted-foreground px-2 pb-2 border-b border-border bg-muted/30 -mx-5 px-5">
                  <div className="col-span-4">{t('admin.memberName')}</div>
                  <div className="col-span-4">{t('admin.memberEmail')}</div>
                  <div className="col-span-2">{t('admin.memberBooks')}</div>
                  <div className="col-span-2 text-right">{t('admin.joinedAt')}</div>
                </div>
                <div className="divide-y divide-border mt-2">
                  {recentMembers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-2 items-center text-sm px-2 py-2.5 hover:bg-muted/20 rounded-md">
                      <div className="col-span-4 font-medium text-foreground truncate">{user.name}</div>
                      <div className="col-span-4 text-muted-foreground truncate">{user.email}</div>
                      <div className="col-span-2 text-foreground tabular-nums">{user.purchasedBookIds.length}</div>
                      <div className="col-span-2 text-right text-xs text-muted-foreground">
                        {formatDate(user.createdAt, language)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
