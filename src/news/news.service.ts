import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { SearchDto } from 'src/common/dto/search.dto';
import { buildPaginationMeta } from 'src/common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

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

  async search(dto: SearchDto) {
    const {
      q = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = dto;

    // where đúng type theo Prisma
    const where: Prisma.NewsWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            // Cho phép tìm theo tác giả (quan hệ author)
            { author: { name: { contains: q, mode: 'insensitive' } } },
            { author: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {};

    // Whitelist các field được phép sort
    const sortable: Array<keyof Prisma.NewsOrderByWithRelationInput> = [
      'createdAt',
      'updatedAt',
      'title',
      'slug',
      'published',
    ];
    const sortKey = (sortable as string[]).includes(sortBy)
      ? (sortBy as keyof Prisma.NewsOrderByWithRelationInput)
      : 'createdAt';
    const sortOrder: Prisma.SortOrder =
      order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.max(Number(limit) || 10, 1);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { [sortKey]: sortOrder },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(
        total,
        safePage,
        safeLimit,
        String(sortKey),
        sortOrder,
      ),
    };
  }
}
