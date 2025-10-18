import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  list() {
    return this.newsService.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser() user: any, @Body() dto: CreateNewsDto) {
    return this.newsService.create(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: any,
    @Body() dto: UpdateNewsDto,
  ) {
    return this.newsService.update(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: any) {
    return this.newsService.remove(id, user.userId);
  }
}
