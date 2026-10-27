import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import { Textarea } from '@client/src/components/ui/textarea';
import { Badge } from '@client/src/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@client/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Switch } from '@client/src/components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@client/src/components/ui/alert-dialog';
import { useTranslation } from '@client/src/i18n/useTranslation';
import { useAdmin } from '@client/src/admin/AdminContext';
import { allBooks, levelNames } from '@client/src/data/books';
import type { Book } from '@shared/api.interface';
import { Image } from '@client/src/components/ui/image';
import { extractPagesFromPdf } from '@client/src/utils/pdf-extract';
import { getBookImageUrl } from '@client/src/utils/book-image';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';

const BOOKS_OVERRIDE_KEY = 'bigapple-books-override';

interface BookOverride {
  title?: string;
  pinyin?: string;
  level?: number;
  levelName?: string;
  price?: number;
  description?: string;
  published?: boolean;
  deleted?: boolean;
  coverColor?: string;
  coverImage?: string;
  pdfUrl?: string;
  pageImages?: string[];
  totalPages?: number;
}

type OverridesMap = Record<string, BookOverride>;

function loadOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(BOOKS_OVERRIDE_KEY);
    if (raw) return JSON.parse(raw) as OverridesMap;
  } catch {
    // ignore
  }
  return {};
}

function saveOverrides(overrides: OverridesMap): void {
  localStorage.setItem(BOOKS_OVERRIDE_KEY, JSON.stringify(overrides));
}

function mergeBooks(): (Book & { published?: boolean })[] {
  const overrides = loadOverrides();
  const overrideIds = new Set(Object.keys(overrides));
  const baseBooks = allBooks
    .map((book) => {
      const ov = overrides[book.id];
      if (!ov) return { ...book, published: true };
      return { ...book, ...ov, published: ov.published !== false };
    })
    .filter((b) => !overrides[b.id]?.deleted);

  const newBooks: (Book & { published?: boolean })[] = [];
  for (const [id, ov] of Object.entries(overrides)) {
    if (ov.deleted) continue;
    const baseExists = allBooks.some((b) => b.id === id);
    if (!baseExists) {
      newBooks.push({
        id,
        title: ov.title || '',
        pinyin: ov.pinyin || '',
        level: ov.level ?? 0,
        levelName: ov.levelName || levelNames[ov.level ?? 0] || '',
        price: ov.price ?? 0,
        description: ov.description || '',
        coverImage: ov.coverImage || '',
        pdfUrl: ov.pdfUrl || '',
        pageImages: ov.pageImages || [],
        coverColor: ov.coverColor || 'from-rose-300 to-pink-400',
        totalPages: ov.pageImages?.length || ov.totalPages || 12,
        previewPages: 3,
        author: 'Huali Xiong',
        illustrator: 'Wenpei Lin',
        category: 'Children',
        publisher: 'Big Apple Chinese',
        published: ov.published !== false,
      });
    }
    overrideIds.add(id);
  }

  return [...baseBooks, ...newBooks];
}

function getLevelBadgeClass(level: number): string {
  const colorMap: Record<number, string> = {
    0: 'bg-pink-50 text-pink-700 border-pink-100',
    1: 'bg-rose-50 text-rose-700 border-rose-100',
    2: 'bg-amber-50 text-amber-700 border-amber-100',
    3: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    4: 'bg-blue-50 text-blue-700 border-blue-100',
    5: 'bg-violet-50 text-violet-700 border-violet-100',
    6: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return colorMap[level] || colorMap[1];
}

export default function AdminBooksPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAdmin();
  const [books, setBooks] = useState<(Book & { published?: boolean })[]>([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [editingBook, setEditingBook] = useState<(Book & { published?: boolean }) | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<(Book & { published?: boolean }) | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPinyin, setFormPinyin] = useState('');
  const [formLevel, setFormLevel] = useState('0');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formPageImages, setFormPageImages] = useState<string[]>([]);
  const [formCoverImage, setFormCoverImage] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);

  const canCreate = hasPermission('books', 'create');
  const canEdit = hasPermission('books', 'edit');
  const canDelete = hasPermission('books', 'delete');

  const refreshBooks = () => {
    setBooks(mergeBooks());
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        !search ||
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.pinyin.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = levelFilter === 'all' || String(book.level) === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [books, search, levelFilter]);

  const openCreateDialog = () => {
    setEditingBook(null);
    setFormTitle('');
    setFormPinyin('');
    setFormLevel('0');
    setFormPrice('19.9');
    setFormDescription('');
    setFormPublished(true);
    setFormPdfUrl('');
    setFormPageImages([]);
    setFormCoverImage('');
    setPdfUploading(false);
    setPdfProgress(0);
    setPdfTotalPages(0);
    setIsDialogOpen(true);
  };

  const openEditDialog = (book: Book & { published?: boolean }) => {
    setEditingBook(book);
    setFormTitle(book.title);
    setFormPinyin(book.pinyin);
    setFormLevel(String(book.level));
    setFormPrice(String(book.price));
    setFormDescription(book.description);
    setFormPublished(book.published !== false);
    setFormPdfUrl(book.pdfUrl || '');
    setFormPageImages(book.pageImages || []);
    setFormCoverImage(book.coverImage || '');
    setPdfUploading(false);
    setPdfProgress(0);
    setPdfTotalPages(book.pageImages?.length || book.totalPages || 0);
    setIsDialogOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast(t('admin.pleaseUploadPdf'));
      return;
    }

    setPdfUploading(true);
    setPdfProgress(0);
    setPdfTotalPages(0);

    try {
      const result = await extractPagesFromPdf(file, (current, total) => {
        setPdfProgress(Math.round((current / total) * 100));
        setPdfTotalPages(total);
      });

      setFormPdfUrl(result.pdfDataUrl);
      setFormPageImages(result.pageImages);
      if (!formCoverImage) {
        setFormCoverImage(result.coverImage);
      }
    } catch (err) {
      logger.error('PDF upload failed', String(err));
      toast(t('admin.pdfParsingFailed'));
    } finally {
      setPdfUploading(false);
    }
    e.target.value = '';
  };

  const handleRemovePdf = () => {
    setFormPdfUrl('');
    setFormPageImages([]);
    setPdfProgress(0);
    setPdfTotalPages(0);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;

    const overrides = loadOverrides();
    const level = parseInt(formLevel, 10);
    const price = parseFloat(formPrice) || 0;

    const coverColors = [
      'from-pink-300 to-rose-400',
      'from-rose-300 to-red-400',
      'from-amber-300 to-orange-400',
      'from-emerald-300 to-teal-400',
      'from-sky-300 to-blue-400',
      'from-violet-300 to-purple-400',
      'from-slate-500 to-slate-700',
    ];

    if (editingBook) {
      const prev = overrides[editingBook.id] || {};
      overrides[editingBook.id] = {
        ...prev,
        title: formTitle,
        pinyin: formPinyin,
        level,
        levelName: levelNames[level],
        price,
        description: formDescription,
        published: formPublished,
        ...(formPdfUrl ? { pdfUrl: formPdfUrl } : {}),
        ...(formPageImages.length > 0 ? { pageImages: formPageImages, totalPages: formPageImages.length } : {}),
        ...(formCoverImage ? { coverImage: formCoverImage } : {}),
      };
    } else {
      const newId = `book-${Date.now()}`;
      const coverColor = coverColors[level % coverColors.length];
      overrides[newId] = {
        title: formTitle,
        pinyin: formPinyin,
        level,
        levelName: levelNames[level],
        price,
        description: formDescription,
        published: formPublished,
        coverColor,
        ...(formPdfUrl ? { pdfUrl: formPdfUrl } : {}),
        ...(formPageImages.length > 0 ? { pageImages: formPageImages, totalPages: formPageImages.length } : {}),
        ...(formCoverImage ? { coverImage: formCoverImage } : {}),
      };
    }

    saveOverrides(overrides);
    setIsDialogOpen(false);
    refreshBooks();
  };

  const handleDelete = () => {
    if (!deletingBook) return;
    const overrides = loadOverrides();
    overrides[deletingBook.id] = {
      ...(overrides[deletingBook.id] || {}),
      deleted: true,
    };
    saveOverrides(overrides);
    setDeletingBook(null);
    refreshBooks();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-foreground">{t('admin.books')}</h1>
        {canCreate && (
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4" />
            {t('admin.addBook')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchBooksPlaceholder')}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('books.allLevels')}</SelectItem>
                {levelNames.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          {filteredBooks.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {t('admin.noData')}
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs uppercase tracking-wider font-medium text-muted-foreground border-b border-border bg-muted/30">
                <div className="col-span-1">{t('admin.bookCover')}</div>
                <div className="col-span-3">{t('admin.bookTitle')}</div>
                <div className="col-span-2">{t('admin.bookPinyin')}</div>
                <div className="col-span-1">{t('admin.bookLevel')}</div>
                <div className="col-span-1">{t('admin.bookPrice')}</div>
                <div className="col-span-2">{t('admin.bookStatus')}</div>
                <div className="col-span-2 text-right">{t('admin.actions')}</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-border">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20 text-sm"
                  >
                    <div className="col-span-1">
                      {book.coverImage ? (
                        <div className="w-10 h-14 rounded-md overflow-hidden bg-muted border border-border">
                          <Image
                            src={getBookImageUrl(book.coverImage)}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-14 rounded-md bg-gradient-to-br ${book.coverColor || 'from-pink-200 to-rose-300'} flex items-center justify-center`}>
                          <span className="text-white text-[10px] font-bold">{book.levelName}</span>
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 font-medium text-foreground truncate">{book.title}</div>
                    <div className="col-span-2 text-muted-foreground text-xs truncate">{book.pinyin}</div>
                    <div className="col-span-1">
                      <Badge className={`${getLevelBadgeClass(book.level)} border-0`}>
                        {book.levelName}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-foreground font-medium tabular-nums text-rose-600">S${book.price.toFixed(2)}</div>
                    <div className="col-span-2">
                      <Badge className={book.published !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 border-0'
                        : 'bg-muted text-muted-foreground border-border border-0'}>
                        {book.published !== false ? t('admin.published') : t('admin.unpublished')}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(book)}
                          aria-label={t('admin.edit')}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <AlertDialog open={!!deletingBook} onOpenChange={(o) => !o && setDeletingBook(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingBook(book)}
                              aria-label={t('admin.deleteAction')}
                              className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-border shadow-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('admin.confirmDelete')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('admin.confirmDeleteBook', { title: book.title })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                {t('admin.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg border-border shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? t('admin.editBook') : t('admin.addBook')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('admin.bookTitle')}
              </label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('admin.bookPinyin')}
              </label>
              <Input value={formPinyin} onChange={(e) => setFormPinyin(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('admin.bookLevel')}
                </label>
                <Select value={formLevel} onValueChange={setFormLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levelNames.map((name, idx) => (
                      <SelectItem key={idx} value={String(idx)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  {t('admin.bookPrice')} (S$)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {t('admin.bookDescription')}
              </label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* PDF Upload Section */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span className="text-sm font-medium text-foreground">
                    {t('admin.ebookPdf')}
                  </span>
                </div>
                {formPdfUrl && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('admin.uploaded')}
                  </span>
                )}
              </div>

              {pdfUploading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('admin.parsingPdf')}
                    </span>
                    <span>{pdfProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600 transition-all duration-300 rounded-full"
                      style={{ width: `${pdfProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.pageXOfY', {
                      current: Math.round((pdfProgress / 100) * pdfTotalPages),
                      total: pdfTotalPages,
                    })}
                  </p>
                </div>
              ) : formPdfUrl ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {formCoverImage && (
                      <div className="w-12 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border">
                        <Image src={formCoverImage} alt="cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-foreground font-medium truncate">
                        {t('admin.pdfEbook')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formPageImages.length > 0
                          ? t('admin.pageCount', { count: formPageImages.length })
                          : t('admin.uploaded')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePdf}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                  >
                    {t('admin.remove')}
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      {t('admin.clickToUploadPdf')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('admin.pdfUploadHint')}
                    </p>
                  </div>
                </label>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t('admin.bookStatus')}</p>
                <p className="text-xs text-muted-foreground">
                  {formPublished ? t('admin.published') : t('admin.unpublished')}
                </p>
              </div>
              <Switch checked={formPublished} onCheckedChange={setFormPublished} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('admin.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {t('admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
