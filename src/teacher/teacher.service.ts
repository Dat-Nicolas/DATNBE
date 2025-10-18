import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getMagvFromUserEmail } from './teacher.helper';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // ----------- LỚP CHỦ NHIỆM -----------
  async getHomerooms(userEmail: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const list = await this.prisma.lop.findMany({
      where: { Magv }, // Lop.GVCN ~ Lop.Magv
      select: { Malop: true, Tenlop: true },
      orderBy: { Malop: 'asc' },
    });
    return list;
  }

  async getHomeroomStudents(userEmail: string, Malop: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    return this.prisma.hocsinh.findMany({
      where: { Malop },
      orderBy: { Mahs: 'asc' },
    });
  }

  async addStudentToHomeroom(userEmail: string, Malop: string, dto: any) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    // Ngaysinh trong schema là bắt buộc => yêu cầu client gửi
    return this.prisma.hocsinh.create({
      data: {
        Mahs: dto.Mahs,
        Hotenhs: dto.Hotenhs,
        Gioitinh: dto.Gioitinh,
        Ngaysinh: new Date(dto.Ngaysinh),
        Diachi: dto.Diachi ?? null,
        Malop,
      },
    });
  }

  async updateStudentInHomeroom(userEmail: string, Malop: string, Mahs: string, dto: any) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs } });
    if (!hs || hs.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.hocsinh.update({
      where: { Mahs },
      data: {
        Hotenhs: dto.Hotenhs,
        Gioitinh: dto.Gioitinh,
        Ngaysinh: dto.Ngaysinh ? new Date(dto.Ngaysinh) : hs.Ngaysinh,
        Diachi: dto.Diachi ?? hs.Diachi,
      },
    });
  }

  async removeStudentFromHomeroom(userEmail: string, Malop: string, Mahs: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs } });
    if (!hs || hs.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.hocsinh.delete({ where: { Mahs } });
  }

  // ----------- LỚP PHỤ TRÁCH (DẠY LỚP/MÔN) -----------
  async getTeachings(userEmail: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const list = await this.prisma.giangday.findMany({
      where: { Magv },
      include: { Lop: true, Monhoc: true },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }],
    });
    // Trả về unique theo lớp + môn (có thể latest), hoặc để FE filter theo năm/học kỳ
    return list.map(g => ({
      Malop: g.Malop,
      Tenlop: g.Lop?.Tenlop ?? g.Malop,
      Mamon: g.Mamon,
      Tenmon: g.Monhoc?.Tenmon ?? g.Mamon,
      Namhoc: g.Namhoc,
      Hocky: g.Hocky,
    }));
  }

  async getTeachingStudents(userEmail: string, Malop: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const has = await this.prisma.giangday.findFirst({ where: { Magv, Malop } });
    if (!has) throw new ForbiddenException('Bạn không dạy lớp này');
    return this.prisma.hocsinh.findMany({ where: { Malop }, orderBy: { Mahs: 'asc' } });
  }

  // ----------- ĐIỂM RÈN LUYỆN (DRL) -----------
  async getDRLByClass(userEmail: string, q: { Malop: string; Namhoc: number; Hocky: 'HK1'|'HK2'|'HK_HE' }) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop: q.Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const list = await this.prisma.diemRL.findMany({
      where: { Malop: q.Malop, Namhoc: q.Namhoc, Hocky: q.Hocky },
      include: { Hocsinh: true },
      orderBy: { id: 'desc' },
    });
    return list.map(d => ({
      id: d.id, Mahs: d.Mahs, Hotenhs: d.Hocsinh?.Hotenhs, Malop: d.Malop,
      Nam: d.Namhoc, Hocky: d.Hocky, Diem: d.Diem, Note: d.Note,
    }));
  }

  async createDRL(userEmail: string, dto: { Mahs: string; Malop: string; Namhoc: number; Hocky: 'HK1'|'HK2'|'HK_HE'; Diem: number; Note?: string }) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const lop = await this.prisma.lop.findUnique({ where: { Malop: dto.Malop } });
    if (!lop) throw new NotFoundException('Lớp không tồn tại');
    if (lop.Magv !== Magv) throw new ForbiddenException('Không phải lớp chủ nhiệm của bạn');

    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs: dto.Mahs } });
    if (!hs || hs.Malop !== dto.Malop) throw new ForbiddenException('HS không thuộc lớp này');

    return this.prisma.diemRL.create({
      data: {
        Mahs: dto.Mahs,
        Malop: dto.Malop,
        Namhoc: dto.Namhoc,
        Hocky: dto.Hocky,
        Diem: dto.Diem,
        Note: dto.Note ?? null,
        createdBy: Magv,
      },
    });
  }

  async updateDRL(userEmail: string, id: number, dto: Partial<{ Mahs: string; Malop: string; Namhoc: number; Hocky: 'HK1'|'HK2'|'HK_HE'; Diem: number; Note: string }>) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const rec = await this.prisma.diemRL.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('DRL not found');

    // xác thực quyền theo lớp chủ nhiệm hiện tại của teacher
    const lop = await this.prisma.lop.findUnique({ where: { Malop: rec.Malop } });
    if (!lop || lop.Magv !== Magv) throw new ForbiddenException();

    // nếu đổi Mahs/Malop/Năm/HK, vẫn cần đảm bảo HS thuộc lớp và lớp thuộc GV
    let Mahs = rec.Mahs;
    let Malop = rec.Malop;
    let Namhoc = rec.Namhoc;
    let Hocky = rec.Hocky;

    if (dto.Malop && dto.Malop !== Malop) {
      const lop2 = await this.prisma.lop.findUnique({ where: { Malop: dto.Malop } });
      if (!lop2 || lop2.Magv !== Magv) throw new ForbiddenException('Không phải lớp CN của bạn');
      Malop = dto.Malop;
    }
    if (dto.Mahs && dto.Mahs !== Mahs) {
      const hs2 = await this.prisma.hocsinh.findUnique({ where: { Mahs: dto.Mahs } });
      if (!hs2 || hs2.Malop !== Malop) throw new ForbiddenException('HS không thuộc lớp');
      Mahs = dto.Mahs;
    }
    if (dto.Namhoc) Namhoc = dto.Namhoc;
    if (dto.Hocky)  Hocky  = dto.Hocky;

    return this.prisma.diemRL.update({
      where: { id },
      data: {
        Mahs, Malop, Namhoc, Hocky,
        Diem: dto.Diem ?? rec.Diem,
        Note: dto.Note ?? rec.Note,
      },
    });
  }

  async deleteDRL(userEmail: string, id: number) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const rec = await this.prisma.diemRL.findUnique({ where: { id } });
    if (!rec) throw new NotFoundException('DRL not found');
    const lop = await this.prisma.lop.findUnique({ where: { Malop: rec.Malop } });
    if (!lop || lop.Magv !== Magv) throw new ForbiddenException();
    return this.prisma.diemRL.delete({ where: { id } });
  }

  async getDRLByStudent(userEmail: string, Mahs: string) {
    const Magv = await getMagvFromUserEmail(this.prisma, userEmail);
    const hs = await this.prisma.hocsinh.findUnique({ where: { Mahs }, include: { Lop: true } });
    if (!hs) return [];
    if (!hs.Lop || hs.Lop.Magv !== Magv) throw new ForbiddenException('HS không thuộc lớp CN của bạn');

    const list = await this.prisma.diemRL.findMany({
      where: { Mahs },
      orderBy: [{ Namhoc: 'desc' }, { Hocky: 'desc' }],
    });
    return list;
  }
}
