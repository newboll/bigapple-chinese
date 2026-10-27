import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  BookOpen,
  ArrowLeft,
  Share2,
  Plus,
  Minus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@client/src/components/ui/button';

import BookCard from '@client/src/components/BookCard';
import { getBookById, getBooksByLevel } from '@client/src/data/books';
import { useApp } from '@client/src/store/AppContext';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { toast } from 'sonner';

// Level 浅色底 + 彩色文字样式（克制版）
const levelSoftStyles: Record<number, string> = {
  0: 'bg-pink-50 text-pink-600',
  1: 'bg-rose-50 text-rose-600',
  2: 'bg-amber-50 text-amber-600',
  3: 'bg-emerald-50 text-emerald-600',
  4: 'bg-blue-50 text-blue-600',
  5: 'bg-violet-50 text-violet-600',
  6: 'bg-slate-100 text-slate-700',
};

export default function BookDetail() {
  const { t } = useTranslation();
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isPurchased, user } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const book = getBookById(id);

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white">
        <h2 className="text-xl font-semibold text-gray-900">{t('common.error')}</h2>
        <p className="text-gray-500">{t('books.noResultsDesc')}</p>
        <Button onClick={() => navigate('/books')} className="rounded-md">
          {t('nav.bookstore')}
        </Button>
      </div>
    );
  }

  const purchased = isPurchased(book.id);
  const relatedBooks = getBooksByLevel(book.level)
    .filter((b) => b.id !== book.id)
    .slice(0, 6);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(book);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast.success(t('bookDetail.addedToCart'));
    logger.info('添加到购物车', { bookId: book.id, quantity });
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(book);
    }
    navigate('/checkout');
  };

  const handleStartReading = () => {
    navigate(`/reader/${book.id}`);
  };

  const handleFreePreview = () => {
    navigate(`/reader/${book.id}?preview=1`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: book.title,
          text: `《${book.title}》- ${book.levelName}`,
          url: window.location.href,
        })
        .catch(() => {
          // 用户取消分享
        });
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {
        // 复制失败
      });
    }
  };

  const increment = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-10 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>

        {/* 主内容区 */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* 左侧封面 */}
          <div className="md:w-2/5 flex justify-center md:justify-start">
            <div
              className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden shadow-sm bg-white border border-gray-100"
              data-ai-section-type="card-list"
            >
              {book.coverImage ? (
                <Image
                  src={getBookImageUrl(book.coverImage)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor}`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                    <BookOpen className="w-16 h-16 mb-5 opacity-40" />
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {book.title}
                      </div>
                      <div className="text-sm opacity-80">{book.pinyin}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${levelSoftStyles[book.level]}`}
                >
                  {book.levelName}
                </span>
              </div>
              {book.isNew && (
                <div className="absolute top-4 right-4">
                  <span className="bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                    NEW
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="md:w-3/5 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 leading-tight">
                  {book.title}
                </h1>
                <p className="text-gray-500 text-base">{book.pinyin}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                aria-label={t('common.share')}
                className="shrink-0 rounded-md border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 标签行 */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${levelSoftStyles[book.level]}`}>
                {book.levelName}
              </span>
              {book.isNew && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-50 text-rose-600">
                  {t('common.newBadge')}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-50 text-gray-600">
                {book.totalPages} {t('bookDetail.pagesUnit')}
              </span>
            </div>

            {/* 价格 */}
            <div className="text-rose-600 text-3xl font-bold mb-8 tabular-nums">
              S${book.price.toFixed(2)}
            </div>

            {/* 描述 */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {t('bookDetail.description')}
              </h3>
              <p className="text-gray-600 leading-7 text-sm">
                {book.description}
              </p>
            </div>

            {/* 元信息 */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm border-t border-gray-100 pt-6">
              <div>
                <span className="text-gray-400">{t('bookDetail.author')}</span>
                <div className="text-gray-900 mt-0.5">{book.author}</div>
              </div>
              <div>
                <span className="text-gray-400">{t('bookDetail.illustrator')}</span>
                <div className="text-gray-900 mt-0.5">{book.illustrator}</div>
              </div>
            </div>

            {/* 数量选择 */}
            {!purchased && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-gray-500">{t('cart.quantity')}</span>
                <div className="flex items-center border border-gray-200 rounded-md">
                  <button
                    onClick={decrement}
                    className="p-2 hover:bg-gray-50 transition-colors text-gray-500"
                    aria-label={t('cart.decreaseQty')}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium text-gray-900 tabular-nums">{quantity}</span>
                  <button
                    onClick={increment}
                    className="p-2 hover:bg-gray-50 transition-colors text-gray-500"
                    aria-label={t('cart.increaseQty')}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {purchased ? (
                <Button
                  size="lg"
                  onClick={handleStartReading}
                  className="flex-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
                >
                  <BookOpen className="w-4 h-4" />
                  {t('bookDetail.startReading')}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 rounded-md border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added ? `✓ ${t('bookDetail.addToCart')}` : t('bookDetail.addToCart')}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    className="flex-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
                  >
                    {t('bookDetail.buyNow')}
                  </Button>
                </>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={handleFreePreview}
                className="sm:w-auto rounded-md border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                {t('bookDetail.trySample')}
              </Button>
            </div>

            {!user && !purchased && (
              <p className="text-xs text-gray-400">
                {t('bookDetail.purchaseBenefit')}
                <Link
                  to="/account/login"
                  className="text-rose-600 hover:underline ml-1"
                >
                  {t('nav.login')}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* 相关推荐 */}
        {relatedBooks.length > 0 && (
          <section className="mt-20 md:mt-24 border-t border-gray-100 pt-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-8">
              {t('bookDetail.relatedBooks')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} size="sm" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
