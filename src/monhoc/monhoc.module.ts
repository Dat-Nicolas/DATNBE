import { Module } from '@nestjs/common';
import { MonhocService } from './monhoc.service';
import { MonhocController } from './monhoc.controller';

@Module({
  controllers: [MonhocController],
  providers: [MonhocService],
})
export class MonhocModule {}
