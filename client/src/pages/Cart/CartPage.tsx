import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { useApp } from '@client/src/store/AppContext';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity } = useApp();

  const total = cart.reduce(
    (sum: number, item) => sum + item.book.price * item.quantity,
    0,
  );
  const totalItems = cart.reduce((sum: number, item) => sum + item.quantity, 0);

  const handleIncrement = (bookId: string, currentQty: number) => {
    updateCartQuantity(bookId, currentQty + 1);
  };

  const handleDecrement = (bookId: string, currentQty: number) => {
    updateCartQuantity(bookId, currentQty - 1);
  };

  const handleRemove = (bookId: string) => {
    removeFromCart(bookId);
    logger.info('从购物车移除', { bookId });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  // 空态
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24">
         <div className="text-center">
           <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
             <ShoppingCart className="w-8 h-8 text-muted-foreground" />
           </div>
            <h2 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
              {t('cart.empty')}
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {t('cart.emptyDesc')}
            </p>
           <Button
             size="default"
             onClick={() => navigate('/books')}
             className="rounded-md"
           >
              {t('cart.goShopping')}
            </Button>
         </div>
       </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 pb-32 md:pb-16">
       <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 tracking-tight">
         {t('cart.title')}
         <span className="text-base font-normal text-muted-foreground ml-2">
           ({t('cart.itemsCount', { count: totalItems })})
         </span>
       </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* 商品列表 */}
        <div className="flex-1 space-y-3">
          {cart.map((item) => {
            const subtotal = item.book.price * item.quantity;
            return (
               <div
                 key={item.bookId}
                 className="bg-white rounded-lg border border-border p-4 flex gap-4 items-center"
               >
                {/* 小封面 */}
                 <Link
                   to={`/book/${item.bookId}`}
                   className="shrink-0 w-14 h-[4.5rem] rounded-md overflow-hidden"
                   aria-label={item.book.title}
                 >
                  {item.book.coverImage ? (
                    <Image
                      src={getBookImageUrl(item.book.coverImage)}
                      alt={item.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${item.book.coverColor} flex items-center justify-center`}
                    >
                      <BookOpen className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                </Link>

                {/* 中间信息 */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/book/${item.bookId}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mb-1">
                    {item.book.levelName}
                  </p>
                  <p className="text-primary font-bold">
                    S${item.book.price.toFixed(2)}
                  </p>
                </div>

                {/* 右侧数量和删除 */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                   <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => handleDecrement(item.bookId, item.quantity)}
                      className="p-1.5 hover:bg-secondary transition-colors"
                      aria-label={t('cart.decreaseQty')}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.bookId, item.quantity)}
                      className="p-1.5 hover:bg-secondary transition-colors"
                       aria-label={t('cart.increaseQty')}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      S${subtotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.bookId)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                       aria-label={`${t('cart.remove')} ${item.book.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 结算卡片 - 桌面端右侧 */}
         <div className="hidden lg:block w-80 shrink-0">
           <div className="bg-white rounded-lg border border-border p-6 sticky top-6">
             <h3 className="font-semibold text-base text-foreground mb-4">{t('cart.orderSummary')}</h3>
            <div className="space-y-3 mb-6 text-sm">
               <div className="flex justify-between text-muted-foreground">
                 <span>{t('cart.totalItems')}</span>
                 <span>{t('cart.itemsCount', { count: totalItems })}</span>
               </div>
               <div className="flex justify-between text-muted-foreground">
                 <span>{t('cart.subtotal')}</span>
                 <span>S${total.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-muted-foreground">
                 <span>{t('cart.shipping')}</span>
                 <span className="text-green-600">{t('cart.free')}</span>
               </div>
               <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                  <span className="text-foreground">{t('cart.total')}</span>
                  <span className="text-primary tabular-nums">S${total.toFixed(2)}</span>
                </div>
            </div>
             <Button
                size="default"
                className="w-full rounded-md"
                onClick={handleCheckout}
              >
                {t('cart.checkout')}
              </Button>
             <Button
               variant="outline"
               size="default"
               className="w-full mt-2 rounded-md"
               onClick={() => navigate('/books')}
             >
               {t('cart.continueShopping')}
             </Button>
           </div>
         </div>
       </div>

       {/* 移动端底部固定结算栏 */}
       <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-sm px-4 py-3 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
             <div className="text-xs text-muted-foreground">
               {t('cart.itemsCount', { count: totalItems })}
             </div>
             <div className="text-lg font-semibold text-primary tabular-nums">
               S${total.toFixed(2)}
             </div>
          </div>
          <div className="flex gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={() => navigate('/books')}
               className="rounded-md"
             >
                {t('cart.continueShopping')}
              </Button>
               <Button size="sm" onClick={handleCheckout} className="rounded-md">
               {t('cart.checkout')}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
