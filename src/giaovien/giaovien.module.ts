import { Module } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';
import { GiaovienController } from './giaovien.controller';

@Module({
  controllers: [GiaovienController],
  providers: [GiaovienService],
})
export class GiaovienModule {}
