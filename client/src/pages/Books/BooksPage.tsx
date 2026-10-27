import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';
import { allBooks, levels, searchBooks } from '@client/src/data/books';
import BookCard from '@client/src/components/BookCard';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { useTranslation } from '@client/src/i18n/useTranslation';

const levelNavKeys: string[] = [
  'nav.levelAB',
  'nav.level1',
  'nav.level2',
  'nav.level3',
  'nav.level4',
  'nav.level5',
  'nav.level6',
];

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

const levelDotStyles: Record<number, string> = {
  0: 'bg-pink-500',
  1: 'bg-rose-500',
  2: 'bg-amber-500',
  3: 'bg-emerald-500',
  4: 'bg-blue-500',
  5: 'bg-violet-500',
  6: 'bg-slate-700',
};

export default function BooksPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const levelParam = searchParams.get('level');
  const qParam = searchParams.get('q') ?? '';

  const selectedLevel = levelParam ? Number(levelParam) : null;

  const filteredBooks = useMemo(() => {
    let books = allBooks;

    if (qParam.trim()) {
      books = searchBooks(qParam.trim());
    }

    if (selectedLevel !== null) {
      books = books.filter((b) => b.level === selectedLevel);
    }

    return books;
  }, [qParam, selectedLevel]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const handleLevelClick = (level: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (level === null) {
      next.delete('level');
    } else {
      next.set('level', String(level));
    }
    setSearchParams(next);
  };

  const activeLevelName = selectedLevel !== null
    ? t(levelNavKeys[selectedLevel] ?? 'books.allLevels')
    : t('books.allLevels');

  return (
    <div className="min-h-screen bg-white">
      {/* 页面标题区 */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-20">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('nav.bookstore')}
          </h1>
          <p className="text-gray-500 text-base max-w-xl">
            {t('books.subtitle') || '精选分级汉语读物，从入门到进阶，陪伴孩子的阅读成长之路。'}
          </p>
        </div>
      </div>

      {/* 搜索 + 筛选栏 */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={qParam}
                onChange={handleSearchChange}
                className="pl-9 h-10 rounded-md border-gray-200 bg-white text-sm focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
              />
            </div>

            {/* 级别筛选 chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <button
                onClick={() => handleLevelClick(null)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  selectedLevel === null
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {t('books.allLevels')}
              </button>
              {levels.map((lvl) => (
                <button
                  key={lvl.level}
                  onClick={() => handleLevelClick(lvl.level)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 ${
                    selectedLevel === lvl.level
                      ? 'bg-rose-600 text-white border-rose-600'
                      : `bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900`
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedLevel === lvl.level ? 'bg-white' : levelDotStyles[lvl.level]
                    }`}
                  />
                  {t(levelNavKeys[lvl.level])}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧级别导航 - 仅桌面端显示 */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-32">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                {t('books.filterByLevel')}
              </h2>
              <nav className="space-y-0.5">
                <button
                  onClick={() => handleLevelClick(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedLevel === null
                      ? 'bg-gray-50 text-rose-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{t('books.allLevels')}</span>
                    <span className={`text-xs tabular-nums ${selectedLevel === null ? 'text-rose-500' : 'text-gray-400'}`}>
                      {allBooks.length}
                    </span>
                  </div>
                </button>
                {levels.map((lvl) => (
                  <button
                    key={lvl.level}
                    onClick={() => handleLevelClick(lvl.level)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedLevel === lvl.level
                        ? 'bg-gray-50 text-rose-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${levelDotStyles[lvl.level]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{t(levelNavKeys[lvl.level])}</div>
                      </div>
                      <span className={`text-xs tabular-nums shrink-0 ${selectedLevel === lvl.level ? 'text-rose-500' : 'text-gray-400'}`}>
                        {lvl.count}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {/* 结果计数 */}
            <div className="flex items-center justify-between mb-8">
              <div className="text-sm text-gray-500">
                {qParam ? (
                  <span>
                    {t('books.searchResults')} "<span className="font-semibold text-gray-900">{qParam}</span>"
                    {selectedLevel !== null && ` · ${activeLevelName}`}
                    {' · '}
                    <span className="font-semibold text-gray-900 tabular-nums">{filteredBooks.length}</span>
                  </span>
                ) : (
                  <span>
                    {activeLevelName}
                    {' · '}
                    {t('books.showingCount', { count: filteredBooks.length })}
                  </span>
                )}
              </div>
            </div>

            {/* 空态 */}
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-lg border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {t('books.noResults')}
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  {t('books.noResultsDesc')}
                </p>
                {(qParam || selectedLevel !== null) && (
                  <Button
                    variant="outline"
                    className="mt-5 rounded-md border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setSearchParams({})}
                  >
                    {t('books.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              /* 书籍网格 */
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                data-ai-section-type="card-list"
              >
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
