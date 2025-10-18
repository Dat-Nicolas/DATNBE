import { Module } from '@nestjs/common';
import { LopService } from './lop.service';
import { LopController } from './lop.controller';

@Module({
  controllers: [LopController],
  providers: [LopService],
})
export class LopModule {}
