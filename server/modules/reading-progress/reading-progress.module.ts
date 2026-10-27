import { Module } from '@nestjs/common';

import { ReadingProgressController, ReadingProgressAdminController } from './reading-progress.controller';
import { ReadingProgressService } from './reading-progress.service';

@Module({
  controllers: [ReadingProgressController, ReadingProgressAdminController],
  providers: [ReadingProgressService],
  exports: [ReadingProgressService],
})
export class ReadingProgressModule {}
