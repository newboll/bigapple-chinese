import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type {
  AuditLogListParams,
  CreateAuditLogRequest,
} from '@shared/api.interface';

export class AuditLogListDto implements AuditLogListParams {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  adminUsername?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateAuditLogDto implements CreateAuditLogRequest {
  @IsString()
  adminUsername!: string;

  @IsOptional()
  @IsString()
  adminName?: string;

  @IsArray()
  @IsString({ each: true })
  adminRoles!: string[];

  @IsString()
  module!: string;

  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  targetName?: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  beforeValues?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  afterValues?: Record<string, unknown>;
}
