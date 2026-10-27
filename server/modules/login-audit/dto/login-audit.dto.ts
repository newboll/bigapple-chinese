import {
  IsString,
  IsBoolean,
  IsOptional,
  IsIn,
  Max,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  CreateLoginAuditRequest,
  LoginAuditListParams,
} from '@shared/api.interface';

export class LoginAuditListDto implements LoginAuditListParams {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'member'])
  accountType?: 'admin' | 'member';

  @IsOptional()
  @IsString()
  accountIdentifier?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  success?: boolean;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateLoginAuditDto implements CreateLoginAuditRequest {
  @IsString()
  @IsIn(['admin', 'member'])
  accountType!: 'admin' | 'member';

  @IsString()
  accountIdentifier!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsBoolean()
  success!: boolean;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
