import { Controller, Get, Post, Body, Param, Query, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GiangdayService } from './giangday.service';
import { CreateGiangdayDto } from './dto/create-giangday.dto';
import { UpdateGiangdayDto } from './dto/update-giangday.dto';

@Controller('giangday')
export class GiangdayController {
  constructor(private readonly service: GiangdayService) {}

  @Post()
  create(@Body() dto: CreateGiangdayDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() p: PaginationDto) {
    return this.service.findAll(p);
  }

  @Get(':STT')
  findOne(@Param('STT', ParseIntPipe) STT: number) {
    return this.service.findOne(STT);
  }

  @Patch(':STT')
  update(@Param('STT', ParseIntPipe) STT: number, @Body() dto: UpdateGiangdayDto) {
    return this.service.update(STT, dto);
  }

  @Delete(':STT')
  remove(@Param('STT', ParseIntPipe) STT: number) {
    return this.service.remove(STT);
  }
}
