import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { Book } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';
import { getBookImageUrl } from '@client/src/utils/book-image';

interface BookCardProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
}

const levelBadgeClassMap: Record<number, string> = {
  0: 'bg-pink-50 text-pink-600',
  1: 'bg-rose-50 text-rose-600',
  2: 'bg-amber-50 text-amber-700',
  3: 'bg-emerald-50 text-emerald-700',
  4: 'bg-sky-50 text-sky-700',
  5: 'bg-violet-50 text-violet-700',
  6: 'bg-slate-100 text-slate-700',
};

export default function BookCard({ book, size = 'md' }: BookCardProps) {
  const coverUrl = getBookImageUrl(book.coverImage);

  return (
    <Link
      to={`/book/${book.id}`}
      className="group block"
      data-ai-section-type="card-list"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm border border-border/40 bg-white group-hover:shadow-md group-hover:border-border transition-all duration-200">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} opacity-80`}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white/90">
              <BookOpen className="w-10 h-10 mb-2 opacity-40" />
              <div className="text-center">
                <div className="text-sm font-semibold mb-1">{book.title}</div>
                <div className="text-xs opacity-70">{book.pinyin}</div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span className={`${levelBadgeClassMap[book.level] ?? 'bg-rose-50 text-rose-600'} text-[10px] font-medium px-2 py-0.5 rounded-md`}>
            {book.levelName}
          </span>
        </div>
        {book.isNew && (
          <div className="absolute top-2 left-2">
            <span className="bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
              NEW
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5 space-y-1">
        <h3 className="font-medium text-sm text-foreground leading-snug truncate">{book.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{book.pinyin}</p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] text-muted-foreground/80">{book.levelName}</span>
          <span className="text-sm font-semibold text-primary tabular-nums">S${book.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
