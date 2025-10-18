import { Module } from '@nestjs/common';
import { ChitietdiemService } from './chitietdiem.service';
import { ChitietdiemController } from './chitietdiem.controller';

@Module({
  controllers: [ChitietdiemController],
  providers: [ChitietdiemService],
})
export class ChitietdiemModule {}
