import { Module } from '@nestjs/common';
import { HocKyService } from './hocky.service';
import { HocKyController } from './hocky.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HocKyController],
  providers: [HocKyService, PrismaService],
})
export class HocKyModule {}
