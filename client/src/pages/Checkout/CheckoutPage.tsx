import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Check, Shield, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { useApp } from '@client/src/store/AppContext';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, checkout, user, login } = useApp();
  const [step, setStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const total = Math.round(subtotal * 100) / 100;

  if (cart.length === 0) {
    return (
       <div className="max-w-md mx-auto px-4 py-16 text-center">
         <h1 className="text-xl font-semibold mb-2 tracking-tight">{t('cart.empty')}</h1>
          <p className="text-muted-foreground mb-6 text-sm">{t('cart.emptyDesc')}</p>
         <Link to="/books">
            <Button className="rounded-md">{t('cart.goShopping')}</Button>
         </Link>
       </div>
    );
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && email) {
      await login(email, 'demo');
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => {
      const order = checkout(paymentMethod);
      if (order) {
        navigate(`/order-success?orderId=${order.id}`);
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

        <h1 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">{t('checkout.title')}</h1>
        <p className="text-muted-foreground mb-8 text-sm">{t('checkout.subtitle')}</p>

      {/* Steps indicator */}
       <div className="flex items-center gap-2 mb-8">
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${step === 'info' ? 'bg-primary text-white' : step === 'payment' || step === 'processing' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
           {step === 'info' ? '1' : <Check className="w-3.5 h-3.5" />}
           {t('checkout.step1')}
         </div>
         <ChevronRight className="w-4 h-4 text-muted-foreground" />
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${step === 'payment' ? 'bg-primary text-white' : step === 'processing' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
           {step === 'payment' || step === 'processing' ? '2' : '2'}
           {t('checkout.step2')}
         </div>
         <ChevronRight className="w-4 h-4 text-muted-foreground" />
         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${step === 'processing' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
           3
           {t('checkout.step3')}
         </div>
       </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left - form */}
        <div className="md:col-span-2">
          {step === 'info' && (
             <form onSubmit={handleInfoSubmit} className="bg-white rounded-lg border border-border p-6 shadow-sm">
               <h2 className="text-base font-semibold mb-4">{t('checkout.contactInfo')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.name')}</label>
                   <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder={t('checkout.namePlaceholder')}
                     required
                     className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('checkout.email')}</label>
                   <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder={t('checkout.emailPlaceholder')}
                     required
                     className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                   />
                  <p className="text-xs text-muted-foreground mt-1">{t('checkout.orderConfirmNote')}</p>
                </div>
              </div>

               <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                 <Shield className="w-3.5 h-3.5 text-emerald-500" />
                 {t('checkout.securityNote')}
               </div>

               <Button type="submit" className="w-full mt-5 rounded-md h-10 text-sm font-medium">
                  {t('checkout.continueToPayment')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </form>
          )}

          {step === 'payment' && (
             <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg border border-border p-6 shadow-sm">
               <h2 className="text-base font-semibold mb-4">{t('checkout.paymentMethod')}</h2>

              <div className="space-y-3 mb-6">
                 <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${paymentMethod === 'credit' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={() => setPaymentMethod('credit')}
                    className="hidden"
                  />
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit' ? 'border-primary' : 'border-muted-foreground'}`}>
                     {paymentMethod === 'credit' && <div className="w-2 h-2 rounded-full bg-primary" />}
                   </div>
                   <CreditCard className="w-5 h-5 text-primary" />
                   <span className="text-sm font-medium">{t('checkout.creditCard')}</span>
                </label>

                 <label className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                   <input
                     type="radio"
                     name="payment"
                     value="stripe"
                     checked={paymentMethod === 'stripe'}
                     onChange={() => setPaymentMethod('stripe')}
                     className="hidden"
                   />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-primary' : 'border-muted-foreground'}`}>
                     {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                   <Zap className="w-5 h-5 text-[#635BFF]" />
                   <span className="text-sm font-semibold text-[#635BFF]">Stripe</span>
                 </label>
              </div>

              {paymentMethod === 'credit' && (
                 <div className="space-y-3 p-4 bg-muted/30 rounded-md">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('checkout.cardNumber')}</label>
                     <input
                       type="text"
                       value={cardNumber}
                       onChange={(e) => setCardNumber(e.target.value)}
                       placeholder={t('checkout.cardNumberPlaceholder')}
                       maxLength={19}
                       className="w-full px-3 py-2 rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('checkout.expiry')}</label>
                       <input
                         type="text"
                         value={expiry}
                         onChange={(e) => setExpiry(e.target.value)}
                         placeholder={t('checkout.expiryPlaceholder')}
                         maxLength={5}
                         className="w-full px-3 py-2 rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                       />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('checkout.cvv')}</label>
                       <input
                         type="text"
                         value={cvv}
                         onChange={(e) => setCvv(e.target.value)}
                         placeholder={t('checkout.cvvPlaceholder')}
                         maxLength={4}
                         className="w-full px-3 py-2 rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                       />
                    </div>
                  </div>
                     <p className="text-xs text-muted-foreground">
                       💡 {t('account.demoModeHint')}
                     </p>
                </div>
              )}

               <div className="flex gap-3 mt-5">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => setStep('info')}
                   className="flex-1 rounded-md h-10"
                 >
                   {t('common.back')}
                 </Button>
                 <Button type="submit" className="flex-1 rounded-md h-10">
                   {t('checkout.payNow')} S${total.toFixed(2)}
                 </Button>
               </div>
            </form>
          )}

          {step === 'processing' && (
             <div className="bg-white rounded-lg border border-border p-12 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-muted border-t-primary animate-spin" />
              <h2 className="text-xl font-semibold mb-2">{t('checkout.processing')}</h2>
              <p className="text-muted-foreground">{t('checkout.securePaymentDesc')}</p>
            </div>
          )}
        </div>

        {/* Right - order summary */}
        <div className="md:col-span-1">
           <div className="bg-white rounded-lg border border-border p-5 shadow-sm sticky top-20">
             <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wide">{t('checkout.orderSummary')}</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.bookId} className="flex gap-3">
                  {item.book.coverImage ? (
                    <Image
                      src={getBookImageUrl(item.book.coverImage)}
                      alt={item.book.title}
                      className="w-10 h-14 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-10 h-14 rounded bg-gradient-to-br ${item.book.coverColor} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
                      {item.book.title.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.book.title}</div>
                    <div className="text-xs text-muted-foreground">{t('checkout.totalItems')}: {item.quantity}</div>
                    <div className="text-sm font-semibold text-primary">
                      S${(item.book.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span>S${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                 <span className="text-green-600">{t('checkout.free')}</span>
              </div>
               <div className="flex justify-between text-base font-semibold pt-3 border-t border-border">
                 <span className="text-foreground">{t('cart.total')}</span>
                 <span className="text-primary tabular-nums">S${total.toFixed(2)}</span>
               </div>
            </div>

             <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
               <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
               {t('checkout.securePayment')}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
