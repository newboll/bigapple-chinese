import { useState, useEffect, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@client/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { useAdmin } from '@client/src/admin/AdminContext';
import type { Order, User } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';

const APP_STATE_KEY = 'bigapple-app-state';

function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.orders || [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveOrders(orders: Order[]): void {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    const current = raw ? JSON.parse(raw) : {};
    current.orders = orders;
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem('bigapple-users') || '[]') as User[];
  } catch {
    return [];
  }
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

function formatDateTime(dateStr: string, language: 'en' | 'zh'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  if (language === 'zh') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getUserNameFromOrder(order: Order, users: User[], guestLabel: string): { name: string; email: string } {
  const matchingUser = users.find((u) =>
    order.items.length > 0 && order.items.every((item) => u.purchasedBookIds.includes(item.bookId)),
  );
  if (matchingUser) {
    return { name: matchingUser.name, email: matchingUser.email };
  }
  const o = order as unknown as { customerName?: string; customerEmail?: string };
  return {
    name: o.customerName || guestLabel,
    email: o.customerEmail || '',
  };
}

const statusFilterValues = ['all', 'pending', 'completed', 'cancelled'] as const;

export default function AdminOrdersPage() {
  const { t, language } = useTranslation();
  const { hasPermission } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const canEdit = hasPermission('orders', 'edit');

  const refreshOrders = () => {
    const data = getOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setOrders(data);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const users = getUsers();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter ||
        (statusFilter === 'completed' && order.status === 'paid');
      if (!matchesStatus) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      const { name, email } = getUserNameFromOrder(order, users, t('admin.guest'));
      return (
        order.id.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
  }, [orders, search, statusFilter, users, t]);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    if (!selectedOrder) return;
    const all = getOrders();
    const updated = all.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: newStatus } : o,
    );
    saveOrders(updated);
    setSelectedOrder({ ...selectedOrder, status: newStatus });
    refreshOrders();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.orders')}</h1>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchOrdersPlaceholder')}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label={t('admin.filterStatus')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilterValues.map((val) => (
                  <SelectItem key={val} value={val}>
                    {val === 'all' ? t('admin.all') : t(`admin.status${val.charAt(0).toUpperCase() + val.slice(1)}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {t('admin.noData')}
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium text-muted-foreground border-b border-border bg-muted/30">
                <div className="col-span-3">{t('admin.orderId')}</div>
                <div className="col-span-3">{t('admin.customer')}</div>
                <div className="col-span-2">{t('admin.orderAmount')}</div>
                <div className="col-span-2">{t('admin.orderStatus')}</div>
                <div className="col-span-1">{t('admin.orderDate')}</div>
                <div className="col-span-1 text-right">{t('admin.actions')}</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const customer = getUserNameFromOrder(order, users, t('admin.guest'));
                  return (
                    <div
                      key={order.id}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20 text-sm"
                    >
                      <div className="col-span-3 font-medium text-foreground truncate font-mono text-xs">
                        {order.id}
                      </div>
                      <div className="col-span-3">
                        <p className="text-foreground truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                      </div>
                      <div className="col-span-2 text-rose-600 font-semibold tabular-nums">
                        S${order.total.toFixed(2)}
                      </div>
                      <div className="col-span-2">
                        <Badge className={`${getStatusBadgeClass(order.status)} border-0`}>
                          {t(getStatusKey(order.status))}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-xs text-muted-foreground truncate">
                        {formatDateTime(order.createdAt, language)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(order)}
                          aria-label={t('admin.viewDetails')}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg border-border shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {t('admin.orderDetails')}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <>
              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.orderId')}</p>
                    <p className="font-mono text-foreground">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.orderDate')}</p>
                    <p className="text-foreground">{formatDateTime(selectedOrder.createdAt, language)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.customer')}</p>
                    <p className="text-foreground">
                      {getUserNameFromOrder(selectedOrder, users, t('admin.guest')).name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('admin.paymentMethod')}
                    </p>
                    <p className="text-foreground">
                       {(() => {
                         const m = selectedOrder.paymentMethod;
                         if (m === 'stripe') return 'Stripe';
                         if (m === 'credit' || m === 'credit_card') return language === 'zh' ? '信用卡' : 'Credit Card';
                         return m;
                       })()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('admin.itemsLabel')}
                  </p>
                  <div className="border border-border rounded-lg divide-y divide-border">
                    {selectedOrder.items.map((item) => (
                      <div key={item.bookId} className="flex items-center gap-3 p-3 text-sm">
                        {item.book.coverImage ? (
                          <div className="w-8 h-10 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
                            <Image
                              src={getBookImageUrl(item.book.coverImage)}
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-10 rounded-md bg-gradient-to-br from-pink-200 to-rose-300 flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">
                              {item.book.levelName}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">{item.book.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('admin.quantityLabel', { qty: item.quantity })}
                          </p>
                        </div>
                        <p className="text-foreground font-medium tabular-nums">
                          S${(item.book.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {t('admin.total')}
                  </span>
                  <span className="text-xl font-semibold text-rose-600 tabular-nums">
                    S${selectedOrder.total.toFixed(2)}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('admin.orderStatus')}</span>
                  <Badge className={`${getStatusBadgeClass(selectedOrder.status)} border-0 text-sm px-3 py-1`}>
                    {t(getStatusKey(selectedOrder.status))}
                  </Badge>
                </div>

                {/* Status Actions */}
                {canEdit && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm text-foreground font-medium mb-2">
                      {t('admin.updateStatus')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(['pending', 'paid', 'completed', 'cancelled'] as Order['status'][]).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={selectedOrder.status === s ? 'default' : 'outline'}
                          onClick={() => handleStatusChange(s)}
                          className={selectedOrder.status === s ? '' : ''}
                        >
                          {t(getStatusKey(s))}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t('common.close')}</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
