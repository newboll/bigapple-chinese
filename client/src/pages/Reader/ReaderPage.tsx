import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Lock, Home, ZoomIn, ZoomOut, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { getBookById } from '@client/src/data/books';
import { useApp } from '@client/src/store/AppContext';
import { Image } from '@client/src/components/ui/image';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { accumulateReadingTime, formatSessionTime } from '@client/src/utils/reading-stats';
import { readingProgress } from '@client/src/api';
import { logger } from '@lark-apaas/client-toolkit/logger';

export default function ReaderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPurchased, user } = useApp();
  const book = id ? getBookById(id) : undefined;

  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scale, setScale] = useState(1);
  const [nextImgLoaded, setNextImgLoaded] = useState(false);
  const [prevImgLoaded, setPrevImgLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  const [flipAngle, setFlipAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const flipDirectionRef = useRef<'next' | 'prev'>('next');

  const purchased = isPurchased(id || '');
  const totalPages = book?.pageImages?.length || book?.totalPages || 12;
  const maxPage = purchased ? totalPages : (book?.previewPages || 4);
  const isLocked = !purchased && pageNumber >= maxPage;

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(Date.now());
  const lastReportRef = useRef<number>(Date.now());
  const isPageVisible = useRef<boolean>(true);

  const reportReading = useCallback(async (incrementSeconds: number) => {
    if (!user || !book || isLocked || incrementSeconds <= 0) return;
    if (!purchased) return;
    try {
      await readingProgress.reportReadingProgress(user.id, {
        bookId: book.id,
        totalSeconds: incrementSeconds,
        lastReadAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('阅读时长上报失败', error);
    }
  }, [user, book, isLocked, purchased]);

  useEffect(() => {
    if (!user || !book) return;

      const tick = () => {
        if (document.hidden) return;
        setSessionSeconds(() => Math.floor((Date.now() - sessionStartRef.current) / 1000));

        const now = Date.now();
        if (now - lastSaveRef.current >= 5000) {
          const elapsed = Math.floor((now - lastSaveRef.current) / 1000);
          if (elapsed > 0 && user && book && !isLocked) {
            accumulateReadingTime(user.id, book.id, elapsed);
          }
          lastSaveRef.current = now;
        }

        if (now - lastReportRef.current >= 30000) {
          const reportElapsed = Math.floor((now - lastReportRef.current) / 1000);
          if (reportElapsed > 0 && user && book && !isLocked && purchased) {
            void reportReading(reportElapsed);
          }
          lastReportRef.current = now;
        }
      };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [user, book, isLocked]);

  useEffect(() => {
    if (!user || !book) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPageVisible.current = false;
        const now = Date.now();
        const elapsed = Math.floor((now - lastSaveRef.current) / 1000);
        if (elapsed > 0 && !isLocked) {
          accumulateReadingTime(user.id, book.id, elapsed);
        }
        const reportElapsed = Math.floor((now - lastReportRef.current) / 1000);
        if (reportElapsed > 0 && !isLocked && purchased) {
          void reportReading(reportElapsed);
          lastReportRef.current = now;
        }
      } else {
        isPageVisible.current = true;
        sessionStartRef.current = Date.now() - sessionSeconds * 1000;
        lastSaveRef.current = Date.now();
        lastReportRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, book, isLocked, sessionSeconds]);

  useEffect(() => {
    if (!user || !book) return;

    const handleBeforeUnload = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastSaveRef.current) / 1000);
      if (elapsed > 0 && !isLocked) {
        accumulateReadingTime(user.id, book.id, elapsed);
      }
      const reportElapsed = Math.floor((now - lastReportRef.current) / 1000);
      if (reportElapsed > 0 && !isLocked && purchased) {
        try {
          const payload = JSON.stringify({
            userId: user.id,
            bookId: book.id,
            totalSeconds: reportElapsed,
            lastReadAt: new Date().toISOString(),
          });
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/reading-progress/report', blob);
        } catch {
          // sendBeacon not available, fall through silently
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, book, isLocked]);

  const getPageUrl = (page: number): string => {
    if (!book) return '';
    const img = book.pageImages?.[page - 1];
    if (!img) return '';
    if (img.startsWith('data:')) return img;
    return `${import.meta.env.BASE_URL}${img}`;
  };

  const currentPageUrl = getPageUrl(pageNumber);
  const nextPageUrl = pageNumber < maxPage ? getPageUrl(pageNumber + 1) : '';
  const prevPageUrl = pageNumber > 1 ? getPageUrl(pageNumber - 1) : '';

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setContainerWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    setNextImgLoaded(false);
    setPrevImgLoaded(false);
  }, [pageNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'Escape') {
        navigate(-1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale((s) => Math.min(s + 0.1, 2));
      } else if (e.key === '-') {
        e.preventDefault();
        setScale((s) => Math.max(s - 0.1, 0.5));
      } else if (e.key === '0') {
        e.preventDefault();
        setScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, isAnimating, isLocked]);

  const animateToAngle = useCallback((targetAngle: number, duration: number = 500) => {
    setIsAnimating(true);
    const startTime = performance.now();
    const startAngle = flipAngle;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const current = startAngle + (targetAngle - startAngle) * eased;
      setFlipAngle(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
        if (targetAngle <= -180) {
          setPageNumber((p) => p + 1);
          setFlipAngle(0);
        } else if (targetAngle >= 0 && flipDirectionRef.current === 'prev') {
          setPageNumber((p) => p - 1);
          setFlipAngle(-180);
        }
      }
    };
    requestAnimationFrame(step);
  }, [flipAngle]);

  const goToNext = useCallback(() => {
    if (isAnimating || isDragging || isLocked) return;
    if (pageNumber >= maxPage) return;
    flipDirectionRef.current = 'next';
    animateToAngle(-180, 650);
  }, [pageNumber, isAnimating, isDragging, isLocked, maxPage, animateToAngle]);

  const goToPrev = useCallback(() => {
    if (isAnimating || isDragging) return;
    if (pageNumber <= 1) return;
    flipDirectionRef.current = 'prev';
    setFlipAngle(-180);
    requestAnimationFrame(() => {
      animateToAngle(0, 650);
    });
  }, [pageNumber, isAnimating, isDragging, animateToAngle]);

  const handleDragStart = useCallback((clientX: number) => {
    if (isAnimating || isLocked) return;
    setIsDragging(true);
    dragStartX.current = clientX;

    if (flipDirectionRef.current === 'next' && flipAngle === 0) {
      dragStartAngle.current = 0;
    } else if (flipDirectionRef.current === 'prev') {
      dragStartAngle.current = flipAngle;
    } else {
      dragStartAngle.current = flipAngle;
    }
  }, [isAnimating, isLocked, flipAngle]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !bookRef.current) return;

    const bookWidth = bookRef.current.offsetWidth;
    const deltaX = clientX - dragStartX.current;
    const anglePerPixel = 180 / bookWidth;
    let newAngle = dragStartAngle.current + deltaX * anglePerPixel;

    if (pageNumber <= 1) {
      newAngle = Math.min(newAngle, 0);
    }
    if (pageNumber >= maxPage) {
      newAngle = Math.max(newAngle, -180);
    }

    newAngle = Math.max(-180, Math.min(0, newAngle));
    setFlipAngle(newAngle);
  }, [isDragging, pageNumber, maxPage]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = -90;

    if (flipDirectionRef.current === 'next') {
      if (flipAngle < threshold && pageNumber < maxPage && !isLocked) {
        animateToAngle(-180, 400);
      } else {
        animateToAngle(0, 400);
      }
    } else {
      if (flipAngle > threshold && pageNumber > 1) {
        animateToAngle(0, 400);
      } else {
        animateToAngle(-180, 400);
      }
    }
  }, [isDragging, flipAngle, pageNumber, maxPage, isLocked, animateToAngle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (isDragging || Math.abs(flipAngle) > 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      goToNext();
    } else {
      goToPrev();
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleZoomReset = () => setScale(1);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">书籍不存在</p>
          <Link to="/books">
            <Button>返回书城</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bookWidth = Math.min(containerWidth - 40, 460);
  const isFlipping = Math.abs(flipAngle) > 0.1 && Math.abs(flipAngle) < 179.9;

  const shadowIntensity = Math.abs(Math.sin((flipAngle * Math.PI) / 180));

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-zinc-900/60 backdrop-blur border-b border-zinc-800 text-zinc-100">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-zinc-300 hover:text-white hover:bg-white/5 shrink-0 rounded-md" aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
          <div className="min-w-0 max-w-[200px]">
            <h1 className="font-medium text-sm truncate text-zinc-100">{book.title}</h1>
            <p className="text-xs text-zinc-500 truncate">{book.pinyin} · {book.levelName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 mr-2 tabular-nums">
            {user && !isLocked && (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span title={t('reader.sessionTime')}>{t('reader.sessionTime')} {formatSessionTime(sessionSeconds)}</span>
              </>
            )}
          </div>
          <div className="text-sm text-zinc-400 hidden sm:block w-24 text-right font-mono">
             <span className="text-zinc-500">{t('reader.page')}</span> {pageNumber} <span className="text-zinc-600">/</span> {maxPage}
           </div>
          <div className="hidden sm:flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-md" aria-label={t('reader.zoomOut')}>
              <ZoomOut className="w-4 h-4" />
            </Button>
             <span className="text-xs text-zinc-500 w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
             <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-md" aria-label={t('reader.zoomIn')}>
              <ZoomIn className="w-4 h-4" />
            </Button>
             <Button variant="ghost" size="icon" onClick={handleZoomReset} className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-md" aria-label={t('reader.resetZoom')}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <Link to="/">
             <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-md" aria-label="Home">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Book Reader */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
      >
        <div
          className="relative perspective-[2500px]"
          style={{ width: bookWidth > 0 ? bookWidth : 400 }}
        >
          {/* Book drop shadow on table */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-6 bg-black/50 blur-2xl rounded-full transition-all duration-300"
            style={{
              width: '85%',
              transform: `translateX(-50%) scaleX(${1 - shadowIntensity * 0.1})`,
            }}
          />

          {/* Book */}
          <div
            ref={bookRef}
            className="relative mx-auto cursor-pointer select-none"
            style={{
              aspectRatio: '3/4',
              maxWidth: '460px',
              transformStyle: 'preserve-3d',
            }}
            onClick={handlePageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Page stack thickness - right side (unread pages) */}
            <div
              className="absolute top-0 right-0 bottom-0 pointer-events-none"
              style={{
                width: '6px',
                background: 'linear-gradient(to right, #e5e7eb 0%, #f3f4f6 40%, #f9fafb 100%)',
                borderRadius: '0 4px 4px 0',
                boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.08), 2px 0 8px rgba(0,0,0,0.15)',
                transform: `translateX(100%) scaleX(${Math.min((maxPage - pageNumber) / maxPage, 1) * 0.8 + 0.2})`,
                transformOrigin: 'left center',
                opacity: 0.8,
              }}
            />
            {/* Page stack thickness - left side (read pages) */}
            <div
              className="absolute top-0 left-0 bottom-0 pointer-events-none"
              style={{
                width: '6px',
                background: 'linear-gradient(to left, #e5e7eb 0%, #f3f4f6 40%, #f9fafb 100%)',
                borderRadius: '4px 0 0 4px',
                boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.08), -2px 0 8px rgba(0,0,0,0.15)',
                transform: `translateX(-100%) scaleX(${Math.min(pageNumber / maxPage, 1) * 0.8 + 0.2})`,
                transformOrigin: 'right center',
                opacity: 0.8,
              }}
            />

            {/* 3D Flip container */}
            <div
              className="relative w-full h-full"
              style={{
                transform: `scale(${scale})`,
                transition: isDragging || isAnimating ? 'none' : 'transform 0.3s ease',
                transformOrigin: 'center center',
              }}
            >
              {/* Bottom layer: the page underneath the flipping page */}
              <div
                className="absolute inset-0 bg-white rounded-r-lg overflow-hidden shadow-xl"
                style={{
                  backfaceVisibility: 'hidden',
                }}
              >
                {flipDirectionRef.current === 'next' ? (
                  nextPageUrl ? (
                    <Image
                      src={nextPageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex flex-col items-center justify-center text-white p-8`}>
                      <h2 className="text-3xl font-bold text-center mb-3 drop-shadow-lg">{book.title}</h2>
                      <p className="text-lg opacity-80">{book.pinyin}</p>
                      <div className="mt-6 px-4 py-1.5 bg-white/20 rounded-full text-sm">
                        第 {pageNumber + 1} 页
                      </div>
                    </div>
                  )
                ) : (
                  currentPageUrl ? (
                    <Image
                      src={currentPageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex flex-col items-center justify-center text-white p-8`}>
                      <h2 className="text-3xl font-bold text-center mb-3 drop-shadow-lg">{book.title}</h2>
                      <p className="text-lg opacity-80">{book.pinyin}</p>
                      <div className="mt-6 px-4 py-1.5 bg-white/20 rounded-full text-sm">
                        第 {pageNumber} 页
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Flipping page */}
              <div
                className="absolute inset-0 origin-left"
                style={{
                  transform: `rotateY(${flipAngle}deg)`,
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'none',
                }}
              >
                {/* Front of flipping page */}
                <div
                  className="absolute inset-0 bg-white rounded-r-lg overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    boxShadow: `
                      inset 8px 0 16px -8px rgba(0,0,0,${0.15 + shadowIntensity * 0.1}),
                      ${8 * shadowIntensity}px 0 ${24 * shadowIntensity}px rgba(0,0,0,${0.15 + shadowIntensity * 0.15})
                    `,
                  }}
                >
                  <Image
                    src={flipDirectionRef.current === 'next' ? currentPageUrl : (prevPageUrl || currentPageUrl)}
                    alt=""
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                  {/* Spine shadow gradient (left edge) */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-4 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, rgba(0,0,0,${0.25 + shadowIntensity * 0.15}), transparent)`,
                    }}
                  />
                </div>

                {/* Back of flipping page */}
                <div
                  className="absolute inset-0 bg-white rounded-l-lg overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    boxShadow: `
                      inset -8px 0 16px -8px rgba(0,0,0,${0.15 + shadowIntensity * 0.1}),
                      ${-8 * shadowIntensity}px 0 ${24 * shadowIntensity}px rgba(0,0,0,${0.15 + shadowIntensity * 0.15})
                    `,
                  }}
                >
                  <Image
                    src={flipDirectionRef.current === 'next' ? nextPageUrl : currentPageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                    draggable={false}
                  />
                  {/* Reverse spine shadow gradient (right edge from back view) */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 pointer-events-none"
                    style={{
                      background: `linear-gradient(to left, rgba(0,0,0,${0.25 + shadowIntensity * 0.15}), transparent)`,
                    }}
                  />
                  {/* Page back side subtle texture */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to right, rgba(245,245,245,0.3) 0%, transparent 15%)',
                    }}
                  />
                </div>
              </div>

              {/* Book spine permanent shadow */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2 pointer-events-none rounded-l-lg"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
                }}
              />
              <div
                className="absolute left-2 top-0 bottom-0 w-px pointer-events-none"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                }}
              />

              {/* Page edge highlight on right */}
              <div className="absolute right-0 top-0 bottom-0 w-px pointer-events-none bg-gradient-to-b from-transparent via-white/40 to-transparent opacity-60" />

              {/* Click zone hints (hover) */}
              <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white">
                  <ChevronLeft className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* Locked overlay */}
              {isLocked && (
                 <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 rounded-r-lg">
                   <Lock className="w-12 h-12 mb-4 text-zinc-500" />
                    <h3 className="text-lg font-semibold mb-2 text-zinc-100">{t('reader.sampleEnded')}</h3>
                    <p className="text-sm text-zinc-400 mb-6 text-center px-8 max-w-xs">
                      {t('reader.sampleEndedDesc')}
                    </p>
                   <div className="flex gap-3">
                     <Link to={`/book/${book.id}`}>
                        <Button variant="outline" className="rounded-md border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                          {t('reader.backToDetail')}
                        </Button>
                     </Link>
                     <Link to={`/book/${book.id}`}>
                        <Button className="bg-rose-600 hover:bg-rose-700 rounded-md text-white">
                          {t('reader.unlockNow')}
                        </Button>
                     </Link>
                   </div>
                 </div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            disabled={pageNumber <= 1 || isAnimating || isDragging}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-16 w-9 h-9 rounded-md bg-zinc-800/80 backdrop-blur border border-zinc-700 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all z-20"
             aria-label={t('reader.prevPage')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            disabled={isLocked || pageNumber >= maxPage || isAnimating || isDragging}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-16 w-9 h-9 rounded-md bg-zinc-800/80 backdrop-blur border border-zinc-700 text-zinc-300 flex items-center justify-center hover:bg-zinc-700 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all z-20"
             aria-label={t('reader.nextPage')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer - progress */}
      <footer className="px-5 py-3 bg-zinc-900/60 backdrop-blur border-t border-zinc-800">
        <div className="max-w-2xl mx-auto">
           <div className="flex items-center gap-3 mb-1.5">
             <span className="text-[11px] text-zinc-500 w-6 text-right tabular-nums">1</span>
             <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
               <div
                 className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                 style={{ width: `${((pageNumber - 1) / (maxPage - 1)) * 100}%` }}
               />
             </div>
             <span className="text-[11px] text-zinc-500 w-6 tabular-nums">{maxPage}</span>
           </div>
           <div className="flex items-center justify-between text-[11px] text-zinc-600">
              <span>{t('reader.keyboardHint')}</span>
            {!purchased && (
               <span className="text-amber-500/80 flex items-center gap-1">
                 <Lock className="w-3 h-3" />
                  {t('reader.trialPages', { count: book.previewPages })}
               </span>
             )}
             {purchased && (
               <span className="text-emerald-500/80">已购买 · 全书解锁</span>
             )}
           </div>
        </div>
      </footer>
    </div>
  );
}
