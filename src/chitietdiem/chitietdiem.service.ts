import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';
import { CreateChitietdiemDto } from './dto/create-chitietdiem.dto';
import { UpdateChitietdiemDto } from './dto/update-chitietdiem.dto';

@Injectable()
export class ChitietdiemService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChitietdiemDto) {
    try { return await this.prisma.chitietdiem.create({ data: dto }); }
    catch { throw new BadRequestException('FK không hợp lệ'); }
  }

  async findAll(p: PaginationDto = new PaginationDto()) {   
  const { skip, take } = toSkipTake(p);
  const [items, total] = await this.prisma.$transaction([
    this.prisma.chitietdiem.findMany({ skip, take, include: { DiemRef: true } }),
    this.prisma.chitietdiem.count(),
  ]);
  return { items, total, page: p.page, limit: p.limit };
}

  async findOne(Machitietdiem: number) {
    const data = await this.prisma.chitietdiem.findUnique({ where: { Machitietdiem }, include: { DiemRef: true } });
    if (!data) throw new NotFoundException('Không tìm thấy chi tiết điểm');
    return data;
  }

  async update(Machitietdiem: number, dto: UpdateChitietdiemDto) {
    try { return await this.prisma.chitietdiem.update({ where: { Machitietdiem }, data: dto }); }
    catch { throw new NotFoundException('Không tìm thấy chi tiết điểm'); }
  }

  async remove(Machitietdiem: number) {
    try { return await this.prisma.chitietdiem.delete({ where: { Machitietdiem } }); }
    catch { throw new NotFoundException('Không tìm thấy chi tiết điểm'); }
  }
}
