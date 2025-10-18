import { Module } from '@nestjs/common';
import { HocsinhService } from './hocsinh.service';
import { HocsinhController } from './hocsinh.controller';

@Module({
  controllers: [HocsinhController],
  providers: [HocsinhService],
})
export class HocsinhModule {}
