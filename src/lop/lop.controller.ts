import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { LopService } from './lop.service';
import { CreateLopDto } from './dto/create-lop.dto';
import { UpdateLopDto } from './dto/update-lop.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from 'src/auth/roles.decorator';
import { SearchDto } from 'src/common/dto/search.dto';

@Controller('lop')
// @Roles('ADMIN')
export class LopController {
  constructor(private readonly service: LopService) {}

  @Post()
  create(@Body() dto: CreateLopDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() p: PaginationDto) {
    return this.service.findAll(p);
  }

  @Get(':Malop')
  findOne(@Param('Malop') Malop: string) {
    return this.service.findOne(Malop);
  }

  @Patch(':Malop')
  update(@Param('Malop') Malop: string, @Body() dto: UpdateLopDto) {
    return this.service.update(Malop, dto);
  }

  @Delete(':Malop')
  remove(@Param('Malop') Malop: string) {
    return this.service.remove(Malop);
  }

  @Get('search')
  search(@Query() dto: SearchDto) {
    return this.service.search(dto);
  }
}
