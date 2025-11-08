// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchDto } from 'src/common/dto/search.dto';
import { buildPaginationMeta, PaginatedResult } from 'src/common/dto/pagination.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async create(dto: CreateUserDto) {
    const password = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: { ...dto, password },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = { ...dto };
    if (dto.password) data.password = await argon2.hash(dto.password);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async search(dto: SearchDto): Promise<PaginatedResult<any>> {
    const {
      q = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = dto;

    const qUpper = q.toUpperCase().trim();
    const qRole = (Object.values(Role) as string[]).includes(qUpper) ? (qUpper as Role) : undefined;

    const where: Prisma.UserWhereInput =
      q
        ? {
            OR: [
              { name:  { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              ...(qRole ? [{ role: qRole }] : []),
            ],
          }
        : {};

    // Whitelist các field cho sort
    const sortable: Array<keyof Prisma.UserOrderByWithRelationInput> = [
      'createdAt', 'email', 'name', 'role',
    ];
    const sortKey = (sortable as string[]).includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder: Prisma.SortOrder = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (Math.max(page, 1) - 1) * Math.max(limit, 1),
        take: Math.max(limit, 1),
        orderBy: { [sortKey]: sortOrder },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, Number(page), Number(limit), sortKey as string, sortOrder),
    };
  }
}
