import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChitietdiemService } from './chitietdiem.service';
import { CreateChitietdiemDto } from './dto/create-chitietdiem.dto';
import { UpdateChitietdiemDto } from './dto/update-chitietdiem.dto';

@Controller('chitietdiem')
export class ChitietdiemController {
  constructor(private readonly chitietdiemService: ChitietdiemService) {}

  @Post()
  create(@Body() createChitietdiemDto: CreateChitietdiemDto) {
    return this.chitietdiemService.create(createChitietdiemDto);
  }

  @Get()
  findAll() {
    return this.chitietdiemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chitietdiemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChitietdiemDto: UpdateChitietdiemDto) {
    return this.chitietdiemService.update(+id, updateChitietdiemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chitietdiemService.remove(+id);
  }
}
