import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { and, count, desc, eq, gte, lt } from 'drizzle-orm';
import { auditLogs } from '@server/database/schema';
import type { AuditLogListParams, AuditLogListResponse, AuditLog, CreateAuditLogRequest } from '@shared/api.interface';

@Injectable()
export class AuditLogService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findList(params: AuditLogListParams): Promise<AuditLogListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (params.adminUsername) {
      conditions.push(eq(auditLogs.adminUsername, params.adminUsername));
    }
    if (params.module) {
      conditions.push(eq(auditLogs.module, params.module));
    }
    if (params.action) {
      conditions.push(eq(auditLogs.action, params.action));
    }
    if (params.startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(params.startDate)));
    }
    if (params.endDate) {
      conditions.push(lt(auditLogs.createdAt, new Date(params.endDate)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ count: count() }).from(auditLogs).where(where),
    ]);

    const items: AuditLog[] = rows.map((row) => ({
      id: row.id,
      adminUsername: row.adminUsername,
      adminName: row.adminName ?? undefined,
      adminRoles: row.adminRoles ?? [],
      module: row.module,
      action: row.action,
      targetType: row.targetType ?? undefined,
      targetId: row.targetId ?? undefined,
      targetName: row.targetName ?? undefined,
      beforeValues: (row.beforeValues as Record<string, unknown> | undefined) ?? undefined,
      afterValues: (row.afterValues as Record<string, unknown> | undefined) ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      createdAt: row.createdAt.toISOString(),
    }));

    return {
      items,
      total: Number(countResult[0]?.count ?? 0),
      page,
      pageSize,
    };
  }

  async create(
    dto: CreateAuditLogRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const [row] = await this.db
      .insert(auditLogs)
      .values({
        adminUsername: dto.adminUsername,
        adminName: dto.adminName,
        adminRoles: dto.adminRoles,
        module: dto.module,
        action: dto.action,
        targetType: dto.targetType,
        targetId: dto.targetId,
        targetName: dto.targetName,
        beforeValues: dto.beforeValues,
        afterValues: dto.afterValues,
        ipAddress,
        userAgent,
      })
      .returning();

    return {
      id: row.id,
      adminUsername: row.adminUsername,
      adminName: row.adminName ?? undefined,
      adminRoles: row.adminRoles ?? [],
      module: row.module,
      action: row.action,
      targetType: row.targetType ?? undefined,
      targetId: row.targetId ?? undefined,
      targetName: row.targetName ?? undefined,
      beforeValues: (row.beforeValues as Record<string, unknown> | undefined) ?? undefined,
      afterValues: (row.afterValues as Record<string, unknown> | undefined) ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
