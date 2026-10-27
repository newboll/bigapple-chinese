import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuditLogListDto, CreateAuditLogDto } from './dto/audit-log.dto';
import type {
  AuditLog,
  AuditLogListResponse,
} from '@shared/api.interface';

@Controller('api/admin/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findList(
    @Query() query: AuditLogListDto,
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.findList(query);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() body: CreateAuditLogDto,
  ): Promise<AuditLog> {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor ?? req.ip;
    const userAgent = req.headers['user-agent'];
    return this.auditLogService.create(body, ipAddress, userAgent);
  }
}
