import { Module } from '@nestjs/common';
import {
  LoginAuditAdminController,
  LoginAuditMemberController,
  LoginAuditController,
} from './login-audit.controller';
import { LoginAuditService } from './login-audit.service';

@Module({
  controllers: [
    LoginAuditAdminController,
    LoginAuditMemberController,
    LoginAuditController,
  ],
  providers: [LoginAuditService],
  exports: [LoginAuditService],
})
export class LoginAuditModule {}
