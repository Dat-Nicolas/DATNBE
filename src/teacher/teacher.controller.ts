import { Controller, Get, Param, Post, Put, Delete, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TeacherService } from './teacher.service';

@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('TEACHER')
@Controller('teacher/me')
export class TeacherController {
  constructor(private readonly svc: TeacherService) {}

  // Lớp chủ nhiệm
  @Get('homerooms') homerooms(@Req() req) { return this.svc.getHomerooms(req.user.email); }
  @Get('homerooms/:malop/students') homeroomStudents(@Req() req, @Param('malop') malop: string) {
    return this.svc.getHomeroomStudents(req.user.email, malop);
  }
  @Post('homerooms/:malop/students') addStudent(@Req() req, @Param('malop') malop: string, @Body() dto: any) {
    return this.svc.addStudentToHomeroom(req.user.email, malop, dto);
  }
  @Put('homerooms/:malop/students/:mahs') updateStudent(@Req() req, @Param('malop') malop: string, @Param('mahs') mahs: string, @Body() dto: any) {
    return this.svc.updateStudentInHomeroom(req.user.email, malop, mahs, dto);
  }
  @Delete('homerooms/:malop/students/:mahs') removeStudent(@Req() req, @Param('malop') malop: string, @Param('mahs') mahs: string) {
    return this.svc.removeStudentFromHomeroom(req.user.email, malop, mahs);
  }

  // Lớp phụ trách (giảng dạy)
  @Get('teachings') teachings(@Req() req) { return this.svc.getTeachings(req.user.email); }
  @Get('classes/:malop/students') teachingStudents(@Req() req, @Param('malop') malop: string) {
    return this.svc.getTeachingStudents(req.user.email, malop);
  }

  // Điểm rèn luyện
  @Get('drl') getDRL(@Req() req, @Query('Malop') Malop: string, @Query('Namhoc') Namhoc: string, @Query('Hocky') Hocky: string) {
    return this.svc.getDRLByClass(req.user.email, { Malop, Namhoc: +Namhoc, Hocky: Hocky as any });
  }
  @Post('drl') createDRL(@Req() req, @Body() dto: any) { return this.svc.createDRL(req.user.email, dto); }
  @Put('drl/:id') updateDRL(@Req() req, @Param('id') id: string, @Body() dto: any) { return this.svc.updateDRL(req.user.email, +id, dto); }
  @Delete('drl/:id') deleteDRL(@Req() req, @Param('id') id: string) { return this.svc.deleteDRL(req.user.email, +id); }
  @Get('drl/student/:mahs') getDRLByStudent(@Req() req, @Param('mahs') mahs: string) {
    return this.svc.getDRLByStudent(req.user.email, mahs);
  }
}
