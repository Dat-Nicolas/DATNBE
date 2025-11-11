import { Module } from '@nestjs/common';
import { NamHocService } from './namhoc.service';
import { NamHocController } from './namhoc.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NamHocController],
  providers: [NamHocService, PrismaService],
  exports: [NamHocService],
})
export class NamHocModule {}
