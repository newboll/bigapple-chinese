import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, desc, eq, and, gte, lt, like } from 'drizzle-orm';
import { loginAudits } from '@server/database/schema';
import type {
  LoginAudit,
  LoginAuditListParams,
  LoginAuditListResponse,
  CreateLoginAuditRequest,
} from '@shared/api.interface';

@Injectable()
export class LoginAuditService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAdminList(params: LoginAuditListParams): Promise<LoginAuditListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = this.buildConditions(params);

    const baseQuery = conditions.length > 0
      ? this.db.select().from(loginAudits).where(and(...conditions))
      : this.db.select().from(loginAudits);

    const [rows, countRows] = await Promise.all([
      baseQuery
        .orderBy(desc(loginAudits.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(loginAudits)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    const items: LoginAudit[] = rows.map((row) => this.toDto(row));

    return {
      items,
      total: countRows[0]?.value ?? 0,
      page,
      pageSize,
    };
  }

  async findMemberList(
    userId: string,
    limit: number = 20,
  ): Promise<{ items: LoginAudit[] }> {
    const rows = await this.db
      .select()
      .from(loginAudits)
      .where(eq(loginAudits.userId, userId))
      .orderBy(desc(loginAudits.createdAt))
      .limit(limit);

    const items: LoginAudit[] = rows.map((row) => this.toDto(row));
    return { items };
  }

  async create(
    dto: CreateLoginAuditRequest,
    ip: string,
    userAgent: string,
  ): Promise<LoginAudit> {
    const rows = await this.db
      .insert(loginAudits)
      .values({
        accountType: dto.accountType,
        accountIdentifier: dto.accountIdentifier,
        userId: dto.userId,
        success: dto.success,
        failureReason: dto.failureReason,
        ipAddress: ip,
        userAgent,
        deviceInfo: dto.deviceInfo,
      })
      .returning();

    return this.toDto(rows[0]);
  }

  private buildConditions(params: LoginAuditListParams) {
    const conditions = [];
    if (params.accountType) {
      conditions.push(eq(loginAudits.accountType, params.accountType));
    }
    if (params.accountIdentifier) {
      conditions.push(
        like(loginAudits.accountIdentifier, `%${params.accountIdentifier}%`),
      );
    }
    if (params.success !== undefined) {
      conditions.push(eq(loginAudits.success, params.success));
    }
    if (params.startDate) {
      conditions.push(gte(loginAudits.createdAt, new Date(params.startDate)));
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setDate(end.getDate() + 1);
      conditions.push(lt(loginAudits.createdAt, end));
    }
    return conditions;
  }

  private toDto(row: typeof loginAudits.$inferSelect): LoginAudit {
    return {
      id: row.id,
      accountType: row.accountType as 'admin' | 'member',
      accountIdentifier: row.accountIdentifier,
      userId: row.userId ?? undefined,
      success: row.success,
      failureReason: row.failureReason ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      deviceInfo: row.deviceInfo ?? undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
