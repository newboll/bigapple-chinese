import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogIn, Play, Clock, TrendingUp, BookMarked, Download } from 'lucide-react';
import { readingProgress } from '@client/src/api';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
} from '@client/src/components/ui/card';
import { useApp } from '@client/src/store/AppContext';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { allBooks, getBookById } from '@client/src/data/books';
import BookCard from '@client/src/components/BookCard';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';
import {
  getAllUserReadingStats,
  formatDuration,
  formatDurationEn,
} from '@client/src/utils/reading-stats';
import type { BookReadingStats } from '@client/src/utils/reading-stats';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

export default function MyBooksPage() {
  const { user } = useApp();
  const { t, language } = useTranslation();
  const [serverStatsLoading, setServerStatsLoading] = useState(false);
  const [mergedStats, setMergedStats] = useState<BookReadingStats[] | null>(null);

  useEffect(() => {
    if (!user) return;
    const localStats = getAllUserReadingStats(user.id);
    setMergedStats(localStats);

    setServerStatsLoading(true);
    readingProgress.getUserReadingProgress(user.id)
      .then((serverItems) => {
        const localMap = new Map<string, BookReadingStats>();
        for (const s of localStats) localMap.set(s.bookId, s);

        const merged = new Map<string, BookReadingStats>();
        for (const s of localStats) merged.set(s.bookId, { ...s });

        for (const item of serverItems) {
          const existing = merged.get(item.bookId);
          if (!existing) {
            merged.set(item.bookId, {
              bookId: item.bookId,
              totalSeconds: item.totalSeconds,
              lastReadAt: item.lastReadAt,
            });
          } else {
            merged.set(item.bookId, {
              bookId: item.bookId,
              totalSeconds: Math.max(existing.totalSeconds, item.totalSeconds),
              lastReadAt:
                new Date(existing.lastReadAt) > new Date(item.lastReadAt)
                  ? existing.lastReadAt
                  : item.lastReadAt,
            });
          }
        }

        setMergedStats(Array.from(merged.values()));
      })
      .catch((error) => {
        logger.error('获取服务端阅读进度失败，使用本地数据', error);
      })
      .finally(() => {
        setServerStatsLoading(false);
      });
  }, [user]);

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

  const levelColors: Record<number, string> = {
    0: 'from-pink-400 to-pink-600',
    1: 'from-rose-400 to-rose-600',
    2: 'from-amber-400 to-orange-500',
    3: 'from-emerald-400 to-teal-600',
    4: 'from-sky-400 to-blue-600',
    5: 'from-violet-400 to-purple-600',
    6: 'from-slate-500 to-slate-800',
  };

  void getBookById;

  const purchasedBooks = allBooks.filter((b) =>
    user.purchasedBookIds.includes(b.id),
  );

  const displayStats = mergedStats ?? getAllUserReadingStats(user.id);

  const totalTime = displayStats.reduce((sum, s) => sum + s.totalSeconds, 0);
  const recentStats = [...displayStats]
    .filter((s) => s.totalSeconds > 0)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, 3);
  const recentBooks = recentStats
    .map((s) => allBooks.find((b) => b.id === s.bookId))
    .filter((b) => b !== undefined);

  const fmt = (secs: number): string =>
    language === 'zh' ? formatDuration(secs) : formatDurationEn(secs);

  const getBookTime = (bookId: string): number => {
    const found = displayStats.find((s) => s.bookId === bookId);
    return found?.totalSeconds || 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
       <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">{t('account.myBooks')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('account.booksEmptyDesc')}
          </p>
       </div>

      {/* Reading Stats Overview */}
      {purchasedBooks.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <Card className="border border-border rounded-lg shadow-sm overflow-hidden">
             <CardContent className="p-5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-md flex items-center justify-center">
                   <Clock className="w-5 h-5 text-rose-500" />
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground mb-0.5">{t('account.totalReadingTime')}</p>
                   <p className="text-xl font-semibold text-foreground tabular-nums">{fmt(totalTime)}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border border-border rounded-lg shadow-sm overflow-hidden">
             <CardContent className="p-5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center">
                   <TrendingUp className="w-5 h-5 text-amber-500" />
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground mb-0.5">{t('account.myBooks')}</p>
                   <p className="text-xl font-semibold text-foreground tabular-nums">{purchasedBooks.length} <span className="text-sm font-normal text-muted-foreground">{language === 'zh' ? '本' : 'books'}</span></p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border border-border rounded-lg shadow-sm overflow-hidden">
             <CardContent className="p-5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center">
                   <BookMarked className="w-5 h-5 text-blue-500" />
                 </div>
                 <div className="min-w-0">
                   <p className="text-xs text-muted-foreground mb-0.5">{t('account.recentBooks')}</p>
                   <p className="text-base font-semibold text-foreground truncate">
                     {recentBooks.length > 0 ? recentBooks[0]?.title || '' : language === 'zh' ? '暂无' : 'None'}
                   </p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
      )}

      {/* Recently read */}
      {recentBooks.length > 0 && (
         <div className="mb-10">
           <h2 className="text-base font-semibold text-foreground mb-4">
             {t('account.recentBooks')}
           </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {recentBooks.slice(0, 3).map((book) => {
              const seconds = getBookTime(book!.id);
              return (
                <Link
                  key={book!.id}
                  to={`/reader/${book!.id}`}
                  className="block"
                >
                   <Card className="border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                     <CardContent className="p-4 flex gap-3">
                      <div className={`w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br ${levelColors[book!.level] || 'from-slate-400 to-slate-600'} flex items-center justify-center relative shadow-sm`}>
                        {book!.coverImage ? (
                          <Image
                            src={getBookImageUrl(book!.coverImage)}
                            alt={book!.title}
                            className="w-full h-full object-cover"
                            width={64}
                            height={80}
                          />
                        ) : (
                          <span className="text-white font-bold text-xs px-1 text-center leading-tight">
                            {book!.title}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground truncate">{book!.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">{book!.pinyin}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Clock className="w-3 h-3" />
                          {t('account.readTime', { time: fmt(seconds) })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {purchasedBooks.length === 0 ? (
         <Card className="border border-border rounded-lg shadow-sm">
           <CardContent className="py-16 text-center">
             <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
               <BookOpen className="w-7 h-7 text-muted-foreground" />
             </div>
              <h2 className="text-lg font-semibold text-foreground mb-2 tracking-tight">{t('account.booksEmpty')}</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-xs mx-auto">
                {t('account.booksEmptyDesc')}
              </p>
              <Link to="/books">
                <Button size="default" className="rounded-md font-medium">
                  {t('account.goBrowse')}
                </Button>
              </Link>
           </CardContent>
         </Card>
      ) : (
        <>
           <h2 className="text-base font-semibold text-foreground mb-4">
             {t('account.myBooks')} ({purchasedBooks.length})
           </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {purchasedBooks.map((book) => {
              const seconds = getBookTime(book.id);
              return (
                <div key={book.id} className="flex flex-col">
                  <BookCard book={book} />
                   <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground px-0.5">
                     <Clock className="w-3 h-3" />
                     {t('account.readTime', { time: fmt(seconds) })}
                   </div>
                   <Link to={`/reader/${book.id}`} className="mt-1.5">
                      <Button
                        size="sm"
                        className="w-full rounded-md"
                      >
                         <Play className="w-3.5 h-3.5" />
                         {seconds > 0
                           ? (language === 'zh' ? '继续阅读' : 'Continue')
                           : t('orderSuccess.startReading')}
                      </Button>
                   </Link>
                   {book.pdfUrl && (
                     <UniversalLink
                       to={book.pdfUrl}
                       download={`${book.title}.pdf`}
                       className="mt-1.5"
                     >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full rounded-md"
                        >
                         <Download className="w-3.5 h-3.5 mr-1" />
                         {language === 'zh' ? '下载 PDF' : 'Download PDF'}
                       </Button>
                     </UniversalLink>
                   )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
