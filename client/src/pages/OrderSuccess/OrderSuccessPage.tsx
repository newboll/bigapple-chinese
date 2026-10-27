import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, BookOpen, ShoppingBag, Home } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { useApp } from '@client/src/store/AppContext';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const { orders } = useApp();
  const { t } = useTranslation();

  const order = orders.find((o) => o.id === orderId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
       <div className="mb-8">
         <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5">
           <CheckCircle className="w-8 h-8 text-emerald-600" />
         </div>
         <h1 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">{t('orderSuccess.title')}</h1>
         <p className="text-muted-foreground text-sm">
           {t('orderSuccess.subtitle')}
         </p>
       </div>

      {order && (
         <div className="bg-white rounded-lg border border-border p-6 shadow-sm text-left mb-8">
           <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
             <div>
               <div className="text-xs text-muted-foreground mb-0.5">{t('orderSuccess.orderId')}</div>
               <div className="font-mono font-medium text-sm">{order.id}</div>
             </div>
             <div className="text-right">
               <div className="text-xs text-muted-foreground mb-0.5">{t('orderSuccess.totalPaid')}</div>
               <div className="text-lg font-semibold text-primary tabular-nums">S${order.total.toFixed(2)}</div>
             </div>
           </div>

          <div className="mb-4">
             <div className="text-sm font-medium mb-3 text-muted-foreground">购买的书籍 ({order.items.length} 本)</div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <Link
                  key={item.bookId}
                  to={`/reader/${item.bookId}`}
                   className="flex items-center gap-3 p-2.5 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                   <div className={`w-9 h-12 rounded-md bg-gradient-to-br ${item.book.coverColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                     {item.book.title.slice(0, 2)}
                   </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.book.title}</div>
                    <div className="text-xs text-muted-foreground">{item.book.levelName}</div>
                  </div>
                    <Button size="sm" variant="default" className="flex-shrink-0 rounded-md">
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {t('orderSuccess.startReading')}
                    </Button>
                </Link>
              ))}
            </div>
          </div>

           <div className="text-xs text-muted-foreground pt-3 border-t border-border mt-3">
             <div>{t('orderSuccess.orderDate')}：{new Date(order.createdAt).toLocaleString('zh-CN')}</div>
             <div className="mt-1">{t('checkout.paymentMethod')}：{order.paymentMethod === 'stripe' ? 'Stripe' : t('checkout.creditCard')}</div>
           </div>
        </div>
      )}

       <div className="flex flex-col sm:flex-row gap-3 justify-center">
         <Link to="/account/books">
           <Button className="w-full sm:w-auto rounded-md h-10">
              <BookOpen className="w-4 h-4 mr-1.5" />
              {t('orderSuccess.viewMyBooks')}
           </Button>
         </Link>
         <Link to="/books">
           <Button variant="outline" className="w-full sm:w-auto rounded-md h-10">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              {t('orderSuccess.continueShopping')}
           </Button>
         </Link>
       </div>
    </div>
  );
}
