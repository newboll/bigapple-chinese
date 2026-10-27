import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import type { Request } from 'express';
import { LoginAuditService } from './login-audit.service';
import { LoginAuditListDto, CreateLoginAuditDto } from './dto/login-audit.dto';
import type {
  LoginAudit,
  LoginAuditListResponse,
} from '@shared/api.interface';

@Controller('api/admin/login-audits')
export class LoginAuditAdminController {
  constructor(private readonly loginAuditService: LoginAuditService) {}

  @Get()
  async getAdminList(
    @Query() query: LoginAuditListDto,
  ): Promise<LoginAuditListResponse> {
    return this.loginAuditService.findAdminList(query);
  }
}

@Controller('api/member/login-audits')
export class LoginAuditMemberController {
  constructor(private readonly loginAuditService: LoginAuditService) {}

  @Get('my')
  async getMyLoginRecords(
    @Query('userId') userId: string,
  ): Promise<{ items: LoginAudit[] }> {
    return this.loginAuditService.findMemberList(userId, 20);
  }
}

@Controller('api/login-audits')
export class LoginAuditController {
  constructor(private readonly loginAuditService: LoginAuditService) {}

  @Post()
  async create(
    @Body() dto: CreateLoginAuditDto,
    @Req() req: Request,
    @Headers('x-forwarded-for') xForwardedFor?: string,
  ): Promise<LoginAudit> {
    const ip = xForwardedFor?.split(',')[0]?.trim() ?? req.ip ?? '';
    const userAgent = req.headers['user-agent'] ?? '';
    return this.loginAuditService.create(dto, ip, userAgent);
  }
}
