import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGiangdayDto } from './dto/create-giangday.dto';
import { UpdateGiangdayDto } from './dto/update-giangday.dto';
import { PaginationDto, toSkipTake } from '../common/dto/pagination.dto';

@Injectable()
export class GiangdayService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGiangdayDto) {
    // Tôn trọng @@unique([Namhoc, Hocky, Magv, Malop, Mamon])
    try {
      return await this.prisma.giangday.create({ data: dto });
    } catch (e) {
      throw new BadRequestException('Bản ghi giảng dạy trùng khóa duy nhất hoặc FK không hợp lệ');
    }
  }

  async findAll(p: PaginationDto) {
    const { skip, take } = toSkipTake(p);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.giangday.findMany({
        skip, take,
        include: { Giaovien: true, Lop: true, Monhoc: true },
        orderBy: [{ Namhoc: 'desc' }, { Hocky: 'asc' }],
      }),
      this.prisma.giangday.count(),
    ]);
    return { items, total, page: p.page, limit: p.limit };
  }

  async findOne(STT: number) {
    const data = await this.prisma.giangday.findUnique({
      where: { STT },
      include: { Giaovien: true, Lop: true, Monhoc: true, Diems: true },
    });
    if (!data) throw new NotFoundException('Không tìm thấy giảng dạy');
    return data;
  }

  async update(STT: number, dto: UpdateGiangdayDto) {
    try { return await this.prisma.giangday.update({ where: { STT }, data: dto }); }
    catch { throw new NotFoundException('Không tìm thấy giảng dạy'); }
  }

  async remove(STT: number) {
    try { return await this.prisma.giangday.delete({ where: { STT } }); }
    catch { throw new NotFoundException('Không tìm thấy giảng dạy'); }
  }
}
