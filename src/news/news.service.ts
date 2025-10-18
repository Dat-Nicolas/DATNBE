import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.news.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  get(id: number) {
    return this.prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async create(authorId: number, dto: CreateNewsDto) {
    return this.prisma.news.create({
      data: {
        title: dto.title,
        content: dto.content,
        slug: dto.slug,
        published: dto.published ?? false,
        authorId,
      },
    });
  }

  async update(id: number, authorId: number, dto: UpdateNewsDto) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news || news.authorId !== authorId)
      throw new ForbiddenException('Not allowed');
    return this.prisma.news.update({ where: { id }, data: dto });
  }

  async remove(id: number, authorId: number) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news || news.authorId !== authorId)
      throw new ForbiddenException('Not allowed');
    return this.prisma.news.delete({ where: { id } });
  }
}
