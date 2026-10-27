import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import BookCard from '@client/src/components/BookCard';
import { featuredBooks, newBooks, levels } from '@client/src/data/books';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  const levelBadgeColors = [
    'bg-pink-50 text-pink-600 border-pink-100',
    'bg-rose-50 text-rose-600 border-rose-100',
    'bg-amber-50 text-amber-700 border-amber-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
    'bg-sky-50 text-sky-700 border-sky-100',
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-slate-100 text-slate-700 border-slate-200',
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Big Apple Chinese
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 tracking-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/books">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-md font-semibold px-8">
                  {t('home.heroCta')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/books?level=1">
                <Button size="lg" variant="outline" className="rounded-md font-medium">
                  {t('home.heroSecondary')}
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-10 mt-16 pt-10 border-t border-border">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">200+</div>
                <div className="text-xs text-muted-foreground mt-1">{t('home.statsBooks')}</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">7</div>
                <div className="text-xs text-muted-foreground mt-1">{t('home.statsLevels')}</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">100K+</div>
                <div className="text-xs text-muted-foreground mt-1">{t('home.statsReaders')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Level Entry */}
      <section className="bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2 tracking-tight">
              {t('home.levelsSection')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('home.levelsSubtitle')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {levels.map((lvl) => (
              <Link
                key={lvl.level}
                to={`/books?level=${lvl.level}`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-all hover:shadow-sm hover:-translate-y-px ${levelBadgeColors[lvl.level] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                <span className="font-semibold">
                  {lvl.level === 0 ? 'LAB' : `L${lvl.level}`}
                </span>
                <span className="text-xs opacity-80">{lvl.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
              {t('common.recommended')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t('common.bestSellers')}</p>
          </div>
          <Link to="/books" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {featuredBooks.slice(0, 6).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* New Books */}
      <section className="bg-muted/20 border-y border-border/50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {t('home.newBooks')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t('home.newBooksSubtitle')}</p>
            </div>
            <Link to="/books" className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              {t('home.browseAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {newBooks.slice(0, 8).map((book) => (
              <BookCard key={book.id} book={book} size="sm" />
            ))}
          </div>
        </div>
      </section>

      {/* About Author */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-white border border-border rounded-lg p-8 md:p-12">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4 tracking-tight">
                {t('home.aboutAuthor')}
              </h2>
              <p className="text-muted-foreground mb-3 leading-relaxed">
                {t('home.authorBio')}
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('common.illustrator')}
              </p>
              <Link to="/books">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-md font-semibold px-6">
                  {t('home.heroCta')}
                </Button>
              </Link>
            </div>
            <div className="md:col-span-2 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-muted/40 flex items-center justify-center">
                <span className="text-5xl">📚</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
