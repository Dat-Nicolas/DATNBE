import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  // list với optional filter published
  list(published?: boolean) {
    return this.prisma.news.findMany({
      where: published === undefined ? {} : { published },
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

  // THÊM MỚI: lấy theo slug
  async getBySlug(slug: string) {
    const item = await this.prisma.news.findUnique({
      where: { slug }, 
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    if (!item) throw new NotFoundException('News not found');
    return item;
  }

  async create(authorId: number, dto: CreateNewsDto) {
    return this.prisma.news.create({
      data: {
        title: dto.title,
        content: dto.content,
        slug: dto.slug, 
        published: dto.published ?? false,
        thumbnail: dto.thumbnail ?? null, 
        authorId,
      },
    });
  }

  async update(id: number, authorId: number, dto: UpdateNewsDto) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news || news.authorId !== authorId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.news.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, authorId: number) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news || news.authorId !== authorId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.news.delete({ where: { id } });
  }
}
