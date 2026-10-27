export function getBookImageUrl(src: string | undefined): string {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return `${import.meta.env.BASE_URL}${src}`;
}
