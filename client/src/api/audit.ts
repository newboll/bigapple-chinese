import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  AuditLogListParams,
  AuditLogListResponse,
  CreateAuditLogRequest,
  AuditLog,
} from '@shared/api.interface';

export async function getAuditLogs(
  params: AuditLogListParams,
): Promise<AuditLogListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.pageSize !== undefined)
      searchParams.set('pageSize', String(params.pageSize));
    if (params.adminUsername) searchParams.set('adminUsername', params.adminUsername);
    if (params.module) searchParams.set('module', params.module);
    if (params.action) searchParams.set('action', params.action);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const response = await axiosForBackend.get(
      `/api/admin/audit-logs?${searchParams.toString()}`,
    );
    return response.data as AuditLogListResponse;
  } catch (error) {
    logger.error('获取操作日志失败', error);
    throw error;
  }
}

export async function createAuditLog(data: CreateAuditLogRequest): Promise<AuditLog> {
  try {
    const response = await axiosForBackend.post('/api/admin/audit-logs', data);
    return response.data as AuditLog;
  } catch (error) {
    logger.error('记录操作日志失败', error);
    throw error;
  }
}
