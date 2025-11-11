import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHocKyDto } from './dto/create-hocky.dto';
import { UpdateHocKyDto } from './dto/update-hocky.dto';

@Injectable()
export class HocKyService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHocKyDto) {
    // Prisma/DB sẽ báo lỗi nếu yearCode không tồn tại
    return this.prisma.hocKy.create({ data: dto });
  }

  findAll() {
    return this.prisma.hocKy.findMany({
      orderBy: { code: 'asc' },
      include: { year: true }, // trả về cả thông tin năm học
    });
  }

  async findOne(code: string) {
    const data = await this.prisma.hocKy.findUnique({
      where: { code },
      include: { year: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy học kỳ');
    return data;
  }

  async update(code: string, dto: UpdateHocKyDto) {
    try {
      return await this.prisma.hocKy.update({
        where: { code },
        data: dto,
      });
    } catch {
      throw new NotFoundException('Không tìm thấy học kỳ');
    }
  }

  async remove(code: string) {
    try {
      return await this.prisma.hocKy.delete({ where: { code } });
    } catch {
      throw new NotFoundException('Không tìm thấy học kỳ');
    }
  }
}
