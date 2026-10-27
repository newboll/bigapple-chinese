import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  ReadingProgressItem,
  ReportReadingProgressRequest,
  UserReadingProgressResponse,
  MemberReadingDetailResponse,
  DashboardReadingStats,
} from '@shared/api.interface';

export async function reportReadingProgress(
  userId: string,
  data: ReportReadingProgressRequest,
): Promise<ReadingProgressItem> {
  try {
    const response = await axiosForBackend.post('/api/reading-progress/report', {
      userId,
      ...data,
    });
    return response.data as ReadingProgressItem;
  } catch (error) {
    logger.error('上报阅读进度失败', error);
    throw error;
  }
}

export async function getUserReadingProgress(
  userId: string,
): Promise<ReadingProgressItem[]> {
  try {
    const response = await axiosForBackend.get(
      `/api/reading-progress/mine?userId=${encodeURIComponent(userId)}`,
    );
    return (response.data as UserReadingProgressResponse).items;
  } catch (error) {
    logger.error('获取用户阅读进度失败', error);
    throw error;
  }
}

export async function getMemberReadingDetail(
  userId: string,
): Promise<MemberReadingDetailResponse> {
  try {
    const response = await axiosForBackend.get(
      `/api/admin/reading-progress/member/${encodeURIComponent(userId)}`,
    );
    return response.data as MemberReadingDetailResponse;
  } catch (error) {
    logger.error('获取会员阅读详情失败', error);
    throw error;
  }
}

export async function getDashboardReadingStats(): Promise<DashboardReadingStats> {
  try {
    const response = await axiosForBackend.get(
      '/api/admin/reading-progress/dashboard/stats',
    );
    return response.data as DashboardReadingStats;
  } catch (error) {
    logger.error('获取看板阅读统计失败', error);
    throw error;
  }
}
