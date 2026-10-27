import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ReadingProgressService } from './reading-progress.service';
import { ReportReadingProgressDto, UserProgressQueryDto } from './dto/reading-progress.dto';
import type {
  DashboardReadingStats,
  MemberReadingDetailResponse,
  ReadingProgressItem,
  UserReadingProgressResponse,
} from '@shared/api.interface';

@Controller('api/reading-progress')
export class ReadingProgressController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Post('report')
  async reportProgress(
    @Body() dto: ReportReadingProgressDto,
  ): Promise<ReadingProgressItem> {
    return this.readingProgressService.reportProgress(
      dto.userId,
      dto.bookId,
      dto.totalSeconds,
      dto.lastReadAt,
    );
  }

  @Get('mine')
  async getMine(
    @Query() query: UserProgressQueryDto,
  ): Promise<UserReadingProgressResponse> {
    return this.readingProgressService.getUserProgress(query.userId);
  }
}

@Controller('api/admin/reading-progress')
export class ReadingProgressAdminController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Get('member/:userId')
  async getMemberDetail(
    @Param('userId') userId: string,
  ): Promise<MemberReadingDetailResponse> {
    return this.readingProgressService.getMemberDetail(userId);
  }

  @Get('dashboard/stats')
  async getDashboardStats(): Promise<DashboardReadingStats> {
    return this.readingProgressService.getDashboardStats();
  }
}
