import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { HocKyService } from './hocky.service';
import { CreateHocKyDto } from './dto/create-hocky.dto';
import { UpdateHocKyDto } from './dto/update-hocky.dto';

@Controller('hocky')
export class HocKyController {
  constructor(private readonly service: HocKyService) {}

  @Post()
  create(@Body() dto: CreateHocKyDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.service.findOne(code);
  }

  @Patch(':code')
  update(@Param('code') code: string, @Body() dto: UpdateHocKyDto) {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}
