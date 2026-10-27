import { eq, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { Inject, Injectable } from '@nestjs/common';

import { readingProgress } from '@server/database/schema';
import type {
  DashboardReadingStats,
  MemberReadingDetailResponse,
  ReadingProgressItem,
  UserReadingProgressResponse,
} from '@shared/api.interface';

@Injectable()
export class ReadingProgressService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async reportProgress(
    userId: string,
    bookId: string,
    totalSeconds: number,
    lastReadAt: string,
  ): Promise<ReadingProgressItem> {
    const [result] = await this.db
      .insert(readingProgress)
      .values({
        userId,
        bookId,
        totalSeconds,
        lastReadAt: new Date(lastReadAt),
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.bookId],
        set: {
          totalSeconds: sql<number>`${readingProgress.totalSeconds} + excluded.total_seconds`,
          lastReadAt: sql<Date>`GREATEST(${readingProgress.lastReadAt}, excluded.last_read_at)`,
        },
      })
      .returning({
        userId: readingProgress.userId,
        bookId: readingProgress.bookId,
        totalSeconds: readingProgress.totalSeconds,
        lastReadAt: readingProgress.lastReadAt,
      });

    return {
      userId: result.userId,
      bookId: result.bookId,
      totalSeconds: result.totalSeconds,
      lastReadAt: result.lastReadAt.toISOString(),
    };
  }

  async getUserProgress(userId: string): Promise<UserReadingProgressResponse> {
    const rows = await this.db
      .select({
        userId: readingProgress.userId,
        bookId: readingProgress.bookId,
        totalSeconds: readingProgress.totalSeconds,
        lastReadAt: readingProgress.lastReadAt,
      })
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .orderBy(readingProgress.lastReadAt);

    const items: ReadingProgressItem[] = rows.map((row) => ({
      userId: row.userId,
      bookId: row.bookId,
      totalSeconds: row.totalSeconds,
      lastReadAt: row.lastReadAt.toISOString(),
    }));

    return { items };
  }

  async getMemberDetail(userId: string): Promise<MemberReadingDetailResponse> {
    const rows = await this.db
      .select({
        bookId: readingProgress.bookId,
        totalSeconds: readingProgress.totalSeconds,
        lastReadAt: readingProgress.lastReadAt,
      })
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .orderBy(readingProgress.lastReadAt);

    let totalSeconds = 0;
    const items = rows.map((row) => {
      totalSeconds += row.totalSeconds;
      return {
        bookId: row.bookId,
        bookTitle: '',
        totalSeconds: row.totalSeconds,
        lastReadAt: row.lastReadAt.toISOString(),
      };
    });

    return { items, totalSeconds };
  }

  async getDashboardStats(): Promise<DashboardReadingStats> {
    const [result] = await this.db
      .select({
        totalSeconds: sql<number>`COALESCE(SUM(${readingProgress.totalSeconds}), 0)`,
        activeReaders: sql<number>`COUNT(DISTINCT ${readingProgress.userId})`,
        totalBooks: sql<number>`COUNT(DISTINCT ${readingProgress.bookId})`,
      })
      .from(readingProgress);

    return {
      totalSeconds: Number(result.totalSeconds),
      activeReaders: Number(result.activeReaders),
      totalBooks: Number(result.totalBooks),
    };
  }
}
