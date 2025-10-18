import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { MailModule } from './mailer/mailer.module';
import { LopModule } from './lop/lop.module';
import { HocsinhModule } from './hocsinh/hocsinh.module';
import { GiaovienModule } from './giaovien/giaovien.module';
import { MonhocModule } from './monhoc/monhoc.module';
import { GiangdayModule } from './giangday/giangday.module';
import { DiemModule } from './diem/diem.module';
import { ChitietdiemModule } from './chitietdiem/chitietdiem.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,
    NewsModule,
    MailModule,
    LopModule,
    HocsinhModule,
    GiaovienModule,
    MonhocModule,
    GiangdayModule,
    DiemModule,
    ChitietdiemModule,
    TeacherModule,
  ],
})
export class AppModule {}
