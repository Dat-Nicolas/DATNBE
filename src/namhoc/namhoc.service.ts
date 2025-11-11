import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNamHocDto } from './dto/create-namhoc.dto';
import { UpdateNamHocDto } from './dto/update-namhoc.dto';

@Injectable()
export class NamHocService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateNamHocDto) {
    return this.prisma.namHoc.create({ data: dto });
  }

  findAll() {
    return this.prisma.namHoc.findMany({
      orderBy: { code: 'desc' },
      include: { hocKys: true },
    });
  }

  async findOne(code: string) {
    const data = await this.prisma.namHoc.findUnique({
      where: { code },
      include: { hocKys: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy năm học');
    return data;
  }

  async update(code: string, dto: UpdateNamHocDto) {
    try {
      return await this.prisma.namHoc.update({
        where: { code },
        data: dto,
      });
    } catch {
      throw new NotFoundException('Không tìm thấy năm học');
    }
  }

  async remove(code: string) {
    try {
      // onDelete: Cascade ở HocKy → xóa năm học sẽ xóa học kỳ thuộc năm đó
      return await this.prisma.namHoc.delete({ where: { code } });
    } catch {
      throw new NotFoundException('Không tìm thấy năm học');
    }
  }
}
