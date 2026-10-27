import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag, LogIn } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { useApp } from '@client/src/store/AppContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import type { Order } from '@shared/api.interface';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/50',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  completed: 'bg-blue-50 text-blue-700 border border-blue-200/50',
  cancelled: 'bg-gray-50 text-gray-600 border border-gray-200/50',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderItem({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const statusColor = statusColors[order.status] || statusColors.pending;
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return t('account.statusPending');
      case 'completed':
        return t('account.statusCompleted');
      case 'cancelled':
        return t('account.statusCancelled');
      default:
        return t('account.statusPending');
    }
  };

  return (
    <Card className="border border-border shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
       <CardHeader className="pb-3">
         <div className="flex items-start justify-between">
           <div>
             <div className="flex items-center gap-2">
               <Package className="w-4 h-4 text-primary" />
               <span className="font-medium text-foreground text-sm">{order.id}</span>
             </div>
             <p className="text-xs text-muted-foreground mt-1">
               {formatDate(order.createdAt)}
             </p>
           </div>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${statusColor}`}>
              {getStatusLabel(order.status)}
            </span>
         </div>
       </CardHeader>
      <CardContent className="pb-4">
         <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {t('account.orderItems')}: <span className="font-medium text-foreground">{totalQuantity}</span>
            </div>
           <div className="text-base font-semibold text-primary tabular-nums">
             S${order.total.toFixed(2)}
           </div>
         </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
           <span>{t('account.orderItems')}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 pt-2">
            {order.items.map((item) => (
              <div
                key={item.bookId}
                 className="flex items-center justify-between py-2 px-2.5 bg-muted/20 rounded-md"
              >
                <div className="flex items-center gap-3">
                   <div className={`w-9 h-12 rounded-md bg-gradient-to-br ${item.book.coverColor} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold px-1 text-center leading-tight">
                      {item.book.title.slice(0, 4)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-xs text-foreground">
                      {item.book.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.book.levelName}
                    </div>
                  </div>
                </div>
                  <div className="text-right">
                   <div className="font-medium text-xs text-foreground tabular-nums">
                     S${item.book.price.toFixed(2)}
                   </div>
                  <div className="text-xs text-muted-foreground">
                    × {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const { user, orders } = useApp();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
         <Card className="w-full max-w-md text-center border border-border rounded-lg shadow-sm">
           <CardContent className="pt-10 pb-8">
             <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
               <LogIn className="w-7 h-7 text-muted-foreground" />
             </div>
              <h2 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('account.login')}</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                {t('account.loginDesc')}
              </p>
              <Link to="/account/login">
                <Button size="default" className="rounded-md font-medium">
                  {t('account.signInNow')}
                </Button>
              </Link>
           </CardContent>
         </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
       <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">{t('account.myOrders')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('account.ordersEmptyDesc')}</p>
       </div>

      {orders.length === 0 ? (
         <Card className="border border-border rounded-lg shadow-sm">
           <CardContent className="py-16 text-center">
             <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
               <ShoppingBag className="w-7 h-7 text-muted-foreground" />
             </div>
              <h2 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('account.ordersEmpty')}</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-xs mx-auto">
                {t('account.ordersEmptyDesc')}
              </p>
              <Link to="/books">
                <Button size="default" className="rounded-md font-medium">
                  {t('account.goBrowse')}
                </Button>
              </Link>
           </CardContent>
         </Card>
      ) : (
         <div className="space-y-3">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
