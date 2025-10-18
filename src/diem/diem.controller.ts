import { Controller, Get, Post, Body, Param, Query, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DiemService } from './diem.service';
import { CreateDiemDto } from './dto/create-diem.dto';
import { UpdateDiemDto } from './dto/update-diem.dto';

@Controller('diem')
export class DiemController {
  constructor(private readonly diemService: DiemService) {}

  @Post()
  create(@Body() dto: CreateDiemDto) {
    return this.diemService.create(dto);
  }

  @Get()
  findAll(@Query() p: PaginationDto) {           
    return this.diemService.findAll(p);       
  }

  @Get(':Madiem')
  findOne(@Param('Madiem', ParseIntPipe) Madiem: number) {
    return this.diemService.findOne(Madiem);
  }

  @Patch(':Madiem')
  update(@Param('Madiem', ParseIntPipe) Madiem: number, @Body() dto: UpdateDiemDto) {
    return this.diemService.update(Madiem, dto);
  }

  @Delete(':Madiem')
  remove(@Param('Madiem', ParseIntPipe) Madiem: number) {
    return this.diemService.remove(Madiem);
  }
}
