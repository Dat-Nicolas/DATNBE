import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationMeta,
  PaginationDto,
  toSkipTake,
} from '../common/dto/pagination.dto';
import { CreateGiaovienDto } from './dto/create-giaovien.dto';
import { UpdateGiaovienDto } from './dto/update-giaovien.dto';
import { SearchDto } from 'src/common/dto/search.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GiaovienService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGiaovienDto) {
    const { Ngaysinh, ...rest } = dto;
    return this.prisma.giaovien.create({
      data: { ...rest, ...(Ngaysinh ? { Ngaysinh: new Date(Ngaysinh) } : {}) },
    });
  }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.giaovien.findMany({
        skip,
        take,
        include: { ChuNhiem: true, MonPhuTrach: true },
      }),
      this.prisma.giaovien.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(Magv: string) {
    const data = await this.prisma.giaovien.findUnique({
      where: { Magv },
      include: { ChuNhiem: true, MonPhuTrach: true, Giangdays: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy giáo viên');
    return data;
  }

  async update(Magv: string, dto: UpdateGiaovienDto) {
    const { Ngaysinh, ChuNhiemMalop, MonPhuTrachMamon, ...rest } = dto;

    const exists = await this.prisma.giaovien.findUnique({ where: { Magv } });
    if (!exists) throw new NotFoundException('Không tìm thấy giáo viên');

    return this.prisma.$transaction(async (tx) => {
      const gv = await tx.giaovien.update({
        where: { Magv },
        data: {
          ...rest,
          ...(Ngaysinh ? { Ngaysinh: new Date(Ngaysinh) } : {}),
        },
      });

      if (typeof ChuNhiemMalop !== 'undefined') {
        await tx.lop.updateMany({ where: { Magv }, data: { Magv: null } });

        if (ChuNhiemMalop.length > 0) {
          await tx.lop.updateMany({
            where: { Malop: { in: ChuNhiemMalop } },
            data: { Magv },
          });
        }
      }

      if (typeof MonPhuTrachMamon !== 'undefined') {
        await tx.monhoc.updateMany({ where: { Magv }, data: { Magv: null } });

        if (MonPhuTrachMamon.length > 0) {
          await tx.monhoc.updateMany({
            where: { Mamon: { in: MonPhuTrachMamon } },
            data: { Magv },
          });
        }
      }

      return tx.giaovien.findUnique({
        where: { Magv },
        include: { ChuNhiem: true, MonPhuTrach: true, Giangdays: true },
      });
    });
  }

  async remove(Magv: string) {
  const exists = await this.prisma.giaovien.findUnique({ where: { Magv } });
  if (!exists) throw new NotFoundException('Không tìm thấy giáo viên');

  try {
    return await this.prisma.$transaction(async (tx) => {
      await tx.lop.updateMany({ where: { Magv }, data: { Magv: null } });

      await tx.monhoc.updateMany({ where: { Magv }, data: { Magv: null } });

      await tx.giangday.deleteMany({ where: { Magv } }); 

      return tx.giaovien.delete({ where: { Magv } });
    });
  } catch (e: any) {
    throw new ConflictException('Không thể xóa do còn ràng buộc dữ liệu (lớp/môn/giảng dạy).');
  }
}

  async search(dto: SearchDto) {
    const {
      q = '',
      page = 1,
      limit = 10,
      sortBy = 'Magv',
      order = 'asc',
    } = dto;

    const where: Prisma.GiaovienWhereInput = q
      ? {
          OR: [
            { Magv: { contains: q, mode: 'insensitive' } },
            { Hotengv: { contains: q, mode: 'insensitive' } },
            { Email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const sortable: Array<keyof Prisma.GiaovienOrderByWithRelationInput> = [
      'Magv',
      'Hotengv',
      'Email',
    ];
    const sortKey = (sortable as string[]).includes(sortBy) ? sortBy : 'Magv';
    const sortOrder: Prisma.SortOrder =
      order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.giaovien.count({ where }),
      this.prisma.giaovien.findMany({
        where,
        skip: (Math.max(page, 1) - 1) * Math.max(limit, 1),
        take: Math.max(limit, 1),
        orderBy: { [sortKey]: sortOrder },
        include: { ChuNhiem: true, MonPhuTrach: true, Giangdays: true },
      }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(
        total,
        Number(page),
        Number(limit),
        sortKey,
        sortOrder,
      ),
    };
  }
}
