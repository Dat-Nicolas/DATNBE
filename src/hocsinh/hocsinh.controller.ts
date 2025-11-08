import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { HocsinhService } from './hocsinh.service';
import { CreateHocsinhDto } from './dto/create-hocsinh.dto';
import { UpdateHocsinhDto } from './dto/update-hocsinh.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from 'src/common/dto/search.dto';

@Controller('hocsinh')
export class HocsinhController {
  constructor(private readonly service: HocsinhService) {}

  @Post()
  create(@Body() dto: CreateHocsinhDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() p: PaginationDto) {
    return this.service.findAll(p);
  }

  @Get('search')
  search(@Query() dto: SearchDto) {
    return this.service.search(dto);
  }

  @Get(':Mahs')
  findOne(@Param('Mahs') Mahs: string) {
    return this.service.findOne(Mahs);
  }

  @Patch(':Mahs')
  update(@Param('Mahs') Mahs: string, @Body() dto: UpdateHocsinhDto) {
    return this.service.update(Mahs, dto);
  }

  @Delete(':Mahs')
  remove(@Param('Mahs') Mahs: string) {
    return this.service.remove(Mahs);
  }
}
