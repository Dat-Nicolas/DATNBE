import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';
import { CreateHocsinhDto } from './dto/create-hocsinh.dto';
import { UpdateHocsinhDto } from './dto/update-hocsinh.dto';

@Injectable()
export class HocsinhService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHocsinhDto) {
    const { Ngaysinh, ...rest } = dto;
    return this.prisma.hocsinh.create({
      data: { ...rest, Ngaysinh: new Date(Ngaysinh) },
    });
  }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.hocsinh.findMany({
        skip, take,
        include: { Lop: true, Diems: true },
        orderBy: { Mahs: 'asc' },
      }),
      this.prisma.hocsinh.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(Mahs: string) {
    const data = await this.prisma.hocsinh.findUnique({
      where: { Mahs },
      include: { Lop: true, Diems: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy học sinh');
    return data;
  }

  async update(Mahs: string, dto: UpdateHocsinhDto) {
    try {
      const { Ngaysinh, ...rest } = dto;
      return await this.prisma.hocsinh.update({
        where: { Mahs },
        data: { ...rest, ...(Ngaysinh ? { Ngaysinh: new Date(Ngaysinh) } : {}) },
      });
    } catch {
      throw new NotFoundException('Không tìm thấy học sinh');
    }
  }

  async remove(Mahs: string) {
    try {
      return await this.prisma.hocsinh.delete({ where: { Mahs } });
    } catch {
      throw new NotFoundException('Không tìm thấy học sinh');
    }
  }
}
