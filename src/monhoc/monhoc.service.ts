import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';
import { CreateMonhocDto } from './dto/create-monhoc.dto';
import { UpdateMonhocDto } from './dto/update-monhoc.dto';

@Injectable()
export class MonhocService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMonhocDto) { return this.prisma.monhoc.create({ data: dto }); }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.monhoc.findMany({ skip, take, include: { Giaovien: true } }),
      this.prisma.monhoc.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(Mamon: string) {
    const data = await this.prisma.monhoc.findUnique({ where: { Mamon }, include: { Giaovien: true } });
    if (!data) throw new NotFoundException('Không tìm thấy môn học');
    return data;
  }

  async update(Mamon: string, dto: UpdateMonhocDto) {
    try { return await this.prisma.monhoc.update({ where: { Mamon }, data: dto }); }
    catch { throw new NotFoundException('Không tìm thấy môn học'); }
  }

  async remove(Mamon: string) {
    try { return await this.prisma.monhoc.delete({ where: { Mamon } }); }
    catch { throw new NotFoundException('Không tìm thấy môn học'); }
  }
}
