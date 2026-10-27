import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  LoginAuditListParams,
  LoginAuditListResponse,
  CreateLoginAuditRequest,
  LoginAudit,
} from '@shared/api.interface';

export async function getAdminLoginAudits(
  params: LoginAuditListParams,
): Promise<LoginAuditListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.pageSize !== undefined)
      searchParams.set('pageSize', String(params.pageSize));
    if (params.accountType) searchParams.set('accountType', params.accountType);
    if (params.accountIdentifier)
      searchParams.set('accountIdentifier', params.accountIdentifier);
    if (params.success !== undefined)
      searchParams.set('success', String(params.success));
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const response = await axiosForBackend.get(
      `/api/admin/login-audits?${searchParams.toString()}`,
    );
    return response.data as LoginAuditListResponse;
  } catch (error) {
    logger.error('获取登录审计失败', error);
    throw error;
  }
}

export async function getMyLoginAudits(userId: string): Promise<LoginAudit[]> {
  try {
    const response = await axiosForBackend.get(
      `/api/member/login-audits/my?userId=${encodeURIComponent(userId)}`,
    );
    return (response.data as { items: LoginAudit[] }).items;
  } catch (error) {
    logger.error('获取我的登录记录失败', error);
    throw error;
  }
}

export async function createLoginAudit(
  data: CreateLoginAuditRequest,
): Promise<LoginAudit> {
  try {
    const response = await axiosForBackend.post('/api/login-audits', data);
    return response.data as LoginAudit;
  } catch (error) {
    logger.error('记录登录审计失败', error);
    throw error;
  }
}
