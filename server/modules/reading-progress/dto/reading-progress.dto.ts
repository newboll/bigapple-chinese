import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

import type { ReportReadingProgressRequest } from '@shared/api.interface';

export class ReportReadingProgressDto implements ReportReadingProgressRequest {
  @IsString()
  @IsNotEmpty()
  bookId!: string;

  @IsInt()
  @Min(0)
  totalSeconds!: number;

  @IsDateString()
  lastReadAt!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class UserProgressQueryDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
