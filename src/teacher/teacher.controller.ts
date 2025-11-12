import {
Controller,
Get,
Param,
Post,
Put,
Delete,
Body,
Query,
Req,
Res,
UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TeacherService } from './teacher.service';
import type { Response as ExpressResponse } from 'express'; 

@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('TEACHER')
@Controller('teacher/me')
export class TeacherController {
  constructor(private readonly svc: TeacherService) {}

  @Get('homerooms')
  homerooms(@Req() req) {
    return this.svc.getHomerooms(req.user.email);
  }

  @Get('homerooms/:malop/students')
  homeroomStudents(@Req() req, @Param('malop') malop: string) {
    return this.svc.getHomeroomStudents(req.user.email, malop);
  }

  @Post('homerooms/:malop/students')
  addStudent(@Req() req, @Param('malop') malop: string, @Body() dto: any) {
    return this.svc.addStudentToHomeroom(req.user.email, malop, dto);
  }

  @Put('homerooms/:malop/students/:mahs')
  updateStudent(
    @Req() req,
    @Param('malop') malop: string,
    @Param('mahs') mahs: string,
    @Body() dto: any,
  ) {
    return this.svc.updateStudentInHomeroom(req.user.email, malop, mahs, dto);
  }

  @Delete('homerooms/:malop/students/:mahs')
  removeStudent(
    @Req() req,
    @Param('malop') malop: string,
    @Param('mahs') mahs: string,
  ) {
    return this.svc.removeStudentFromHomeroom(req.user.email, malop, mahs);
  }

  // ----------------- LỚP PHỤ TRÁCH (GIẢNG DẠY) -----------------
  @Get('teachings')
  teachings(@Req() req) {
    return this.svc.getTeachings(req.user.email);
  }

  @Get('classes/:malop/students')
  teachingStudents(@Req() req, @Param('malop') malop: string) {
    return this.svc.getTeachingStudents(req.user.email, malop);
  }

  // ----------------- ĐIỂM RÈN LUYỆN -----------------
  @Get('drl')
  getDRL(
    @Req() req,
    @Query('Malop') Malop: string,
    @Query('Namhoc') Namhoc: string,
    @Query('Hocky') Hocky: string,
  ) {
    return this.svc.getDRLByClass(req.user.email, {
      Malop,
      Namhoc: +Namhoc,
      Hocky: Hocky as any,
    });
  }

  @Post('drl')
  createDRL(@Req() req, @Body() dto: any) {
    return this.svc.createDRL(req.user.email, dto);
  }

  @Put('drl/:id')
  updateDRL(@Req() req, @Param('id') id: string, @Body() dto: any) {}
  @Get('drl/summary')
  getDRLSummary(
    @Req() req,
    @Query('Malop') Malop: string,
    @Query('Namhoc') Namhoc?: string,
    @Query('Hocky') Hocky?: 'HK1' | 'HK2' | 'HK_HE',
  ) {
    return this.svc.getDRLSummary(req.user.email, {
      Malop,
      Namhoc: Namhoc !== undefined ? +Namhoc : undefined,
      Hocky: Hocky as any,
    });
  }

  @Get('drl/summary/yearly')
  getDRLYearly(
    @Req() req,
    @Query('Malop') Malop: string,
    @Query('Hocky') Hocky?: 'HK1' | 'HK2' | 'HK_HE',
  ) {
    return this.svc.getDRLYearly(req.user.email, {
      Malop,
      Hocky: Hocky as any,
    });
  }

  // ---------- EXPORT ----------
  @Get('drl/export/excel')
  async exportDRLExcel(
    @Req() req,
    @Res() res: ExpressResponse,
    @Query('Malop') Malop: string,
    @Query('Namhoc') Namhoc?: string,
    @Query('Hocky') Hocky?: 'HK1' | 'HK2' | 'HK_HE',
  ) {
    const buf = await this.svc.exportDRLExcel(req.user.email, {
      Malop,
      Namhoc: Namhoc !== undefined ? +Namhoc : undefined,
      Hocky: Hocky as any,
    });

    const filename = `DRL_${Malop}${Namhoc ? '_' + Namhoc : ''}${Hocky ? '_' + Hocky : ''}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.end(buf);
  }

  @Get('drl/export/csv')
  async exportDRLCSV(
    @Req() req,
    @Res() res: ExpressResponse,
    @Query('Malop') Malop: string,
    @Query('Namhoc') Namhoc?: string,
    @Query('Hocky') Hocky?: 'HK1' | 'HK2' | 'HK_HE',
  ) {
    const { stream, filename } = await this.svc.exportDRLCSV(req.user.email, {
      Malop,
      Namhoc: Namhoc !== undefined ? +Namhoc : undefined,
      Hocky: Hocky as any,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }
}
