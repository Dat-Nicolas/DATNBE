import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';
import { CreateGiaovienDto } from './dto/create-giaovien.dto';
import { UpdateGiaovienDto } from './dto/update-giaovien.dto';

@Injectable()
export class GiaovienService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGiaovienDto) {
    const { Ngaysinh, ...rest } = dto;
    return this.prisma.giaovien.create({ data: { ...rest, ...(Ngaysinh ? { Ngaysinh: new Date(Ngaysinh) } : {}) } });
  }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.giaovien.findMany({ skip, take, include: { ChuNhiem: true, MonPhuTrach: true } }),
      this.prisma.giaovien.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(Magv: string) {
    const data = await this.prisma.giaovien.findUnique({ where: { Magv }, include: { ChuNhiem: true, MonPhuTrach: true, Giangdays: true } });
    if (!data) throw new NotFoundException('Không tìm thấy giáo viên');
    return data;
  }

  async update(Magv: string, dto: UpdateGiaovienDto) {
    try {
      const { Ngaysinh, ...rest } = dto;
      return await this.prisma.giaovien.update({ where: { Magv }, data: { ...rest, ...(Ngaysinh ? { Ngaysinh: new Date(Ngaysinh) } : {}) } });
    } catch {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }
  }

  async remove(Magv: string) {
    try { return await this.prisma.giaovien.delete({ where: { Magv } }); }
    catch { throw new NotFoundException('Không tìm thấy giáo viên'); }
  }
}
