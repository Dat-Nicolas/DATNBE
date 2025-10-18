import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { GiaovienService } from './giaovien.service';
import { CreateGiaovienDto } from './dto/create-giaovien.dto';
import { UpdateGiaovienDto } from './dto/update-giaovien.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('giaovien')
// @Roles('ADMIN')
export class GiaovienController {
  constructor(private readonly service: GiaovienService) {}

  @Post() create(@Body() dto: CreateGiaovienDto) { return this.service.create(dto); }
  @Get() findAll(@Query() p: PaginationDto) { return this.service.findAll(p); }
  @Get(':Magv') findOne(@Param('Magv') Magv: string) { return this.service.findOne(Magv); }
  @Patch(':Magv') update(@Param('Magv') Magv: string, @Body() dto: UpdateGiaovienDto) { return this.service.update(Magv, dto); }
  @Delete(':Magv') remove(@Param('Magv') Magv: string) { return this.service.remove(Magv); }
}
