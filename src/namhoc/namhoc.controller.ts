import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { NamHocService } from './namhoc.service';
import { CreateNamHocDto } from './dto/create-namhoc.dto';
import { UpdateNamHocDto } from './dto/update-namhoc.dto';

@Controller('namhoc')
export class NamHocController {
  constructor(private readonly service: NamHocService) {}

  @Post()
  create(@Body() dto: CreateNamHocDto) {
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
  update(@Param('code') code: string, @Body() dto: UpdateNamHocDto) {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}
