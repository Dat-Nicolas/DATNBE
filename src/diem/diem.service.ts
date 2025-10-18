import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';
import { CreateDiemDto } from './dto/create-diem.dto';
import { UpdateDiemDto } from './dto/update-diem.dto';

@Injectable()
export class DiemService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiemDto) {
    try {
      return await this.prisma.diem.create({ data: dto });
    } catch {
      // vi phạm @@unique([Mahs, Mamon, Namhoc, Hocky]) hoặc FK
      throw new BadRequestException('Điểm trùng khóa duy nhất hoặc FK không hợp lệ');
    }
  }

  async findAll(p: PaginationDto = new PaginationDto()) {  
  const { skip, take } = toSkipTake(p);
  const [items, total] = await this.prisma.$transaction([
    this.prisma.diem.findMany({
      skip, take,
      include: { Hocsinh: true, Monhoc: true, Giangday: true, Chitietdiems: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'asc' }],
    }),
    this.prisma.diem.count(),
  ]);
  return { items, total, page: p.page, limit: p.limit };
}

  async findOne(Madiem: number) {
    const data = await this.prisma.diem.findUnique({
      where: { Madiem },
      include: { Hocsinh: true, Monhoc: true, Giangday: true, Chitietdiems: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy điểm');
    return data;
  }

  async update(Madiem: number, dto: UpdateDiemDto) {
    try { return await this.prisma.diem.update({ where: { Madiem }, data: dto }); }
    catch { throw new NotFoundException('Không tìm thấy điểm'); }
  }

  async remove(Madiem: number) {
    try { return await this.prisma.diem.delete({ where: { Madiem } }); }
    catch { throw new NotFoundException('Không tìm thấy điểm'); }
  }
}
