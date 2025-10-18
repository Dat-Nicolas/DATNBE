import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLopDto } from './dto/create-lop.dto';
import { UpdateLopDto } from './dto/update-lop.dto';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';

@Injectable()
export class LopService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLopDto) {
    return this.prisma.lop.create({ data: dto });
  }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.lop.findMany({
        skip, take,
        include: { GVCN: true, Hocsinhs: true },
        orderBy: { Malop: 'asc' },
      }),
      this.prisma.lop.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(Malop: string) {
    const data = await this.prisma.lop.findUnique({
      where: { Malop },
      include: { GVCN: true, Hocsinhs: true, Giangdays: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy lớp');
    return data;
  }

  async update(Malop: string, dto: UpdateLopDto) {
    try {
      return await this.prisma.lop.update({ where: { Malop }, data: dto });
    } catch {
      throw new NotFoundException('Không tìm thấy lớp');
    }
  }

  async remove(Malop: string) {
    try {
      return await this.prisma.lop.delete({ where: { Malop } });
    } catch {
      throw new NotFoundException('Không tìm thấy lớp');
    }
  }
}
