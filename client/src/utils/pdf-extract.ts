import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;

export interface PdfExtractResult {
  totalPages: number;
  pageImages: string[];
  coverImage: string;
  pdfDataUrl: string;
}

export async function extractPagesFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void,
  maxWidth: number = 900,
  quality: number = 0.7,
): Promise<PdfExtractResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pageImages: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    pageImages.push(dataUrl);

    if (onProgress) {
      onProgress(i, totalPages);
    }
  }

  const pdfDataUrl = await fileToDataUrl(file);

  return {
    totalPages,
    pageImages,
    coverImage: pageImages[0] || '',
    pdfDataUrl,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
