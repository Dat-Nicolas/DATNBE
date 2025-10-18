import { Module } from '@nestjs/common';
import { GiangdayService } from './giangday.service';
import { GiangdayController } from './giangday.controller';

@Module({
  controllers: [GiangdayController],
  providers: [GiangdayService],
})
export class GiangdayModule {}
