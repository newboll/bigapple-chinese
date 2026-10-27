const STORAGE_KEY = 'bigapple-reading-stats';

export interface BookReadingStats {
  bookId: string;
  totalSeconds: number;
  lastReadAt: string;
}

export interface ReadingStatsData {
  [userId: string]: {
    [bookId: string]: BookReadingStats;
  };
}

function loadAll(): ReadingStatsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ReadingStatsData;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveAll(data: ReadingStatsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBookReadingTime(userId: string, bookId: string): number {
  const all = loadAll();
  return all[userId]?.[bookId]?.totalSeconds || 0;
}

export function getAllUserReadingStats(userId: string): BookReadingStats[] {
  const all = loadAll();
  const userStats = all[userId] || {};
  return Object.values(userStats);
}

export function accumulateReadingTime(userId: string, bookId: string, seconds: number): void {
  if (seconds <= 0) return;
  const all = loadAll();
  if (!all[userId]) all[userId] = {};
  const prev = all[userId][bookId];
  all[userId][bookId] = {
    bookId,
    totalSeconds: (prev?.totalSeconds || 0) + seconds,
    lastReadAt: new Date().toISOString(),
  };
  saveAll(all);
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} 小时 ${mins} 分`;
  }
  return `${mins} 分钟`;
}

export function formatDurationEn(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min`;
}

export function formatSessionTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${String(hrs).padStart(2, '0')}:${String(remainMins).padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function getTotalReadingTime(userId: string): number {
  const stats = getAllUserReadingStats(userId);
  return stats.reduce((sum, s) => sum + s.totalSeconds, 0);
}

export function getRecentBooks(userId: string, limit: number = 3): BookReadingStats[] {
  const stats = getAllUserReadingStats(userId);
  return stats
    .filter((s) => s.totalSeconds > 0)
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, limit);
}
