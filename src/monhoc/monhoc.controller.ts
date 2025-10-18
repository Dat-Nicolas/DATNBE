import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MonhocService } from './monhoc.service';
import { CreateMonhocDto } from './dto/create-monhoc.dto';
import { UpdateMonhocDto } from './dto/update-monhoc.dto';

@Controller('monhoc')
export class MonhocController {
  constructor(private readonly service: MonhocService) {}

  @Post() create(@Body() dto: CreateMonhocDto) { return this.service.create(dto); }
  @Get() findAll(@Query() p: PaginationDto) { return this.service.findAll(p); }
  @Get(':Mamon') findOne(@Param('Mamon') Mamon: string) { return this.service.findOne(Mamon); }
  @Patch(':Mamon') update(@Param('Mamon') Mamon: string, @Body() dto: UpdateMonhocDto) { return this.service.update(Mamon, dto); }
  @Delete(':Mamon') remove(@Param('Mamon') Mamon: string) { return this.service.remove(Mamon); }
}
