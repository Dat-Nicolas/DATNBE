import { Module } from '@nestjs/common';
import { DiemService } from './diem.service';
import { DiemController } from './diem.controller';

@Module({
  controllers: [DiemController],
  providers: [DiemService],
  exports: [DiemService],
})
export class DiemModule {}
